
import { NextRequest } from "next/server";
import { APPLAUSE_BASE_COUNT, APPLAUSE_COUNT_SCRIPT } from "@/lib/applause";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = UPSTASH_URL && UPSTASH_TOKEN ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN }) : null;

const KEY = "applause_count";
const IP_LIMIT = Number(process.env.APPLAUSE_IP_LIMIT ?? 30);
const IP_WINDOW_SEC = Number(process.env.APPLAUSE_IP_WINDOW_SEC ?? 60 * 60);

function safeNumber(v: unknown) {
    if (v === null || v === undefined) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}


function isPrivateIp(ip: string) {
    if (!ip) return true;

    if (ip === "::1" || ip === "127.0.0.1" || ip === "unknown") return true;
    if (/^10\./.test(ip)) return true;
    if (/^192\.168\./.test(ip)) return true;
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;

    if (/^fc|^fd/.test(ip)) return true;
    return false;
}

function pickClientIp(forwardedHeader: string | null) {
    if (!forwardedHeader) return null;
    const ips = forwardedHeader.split(",").map(s => s.trim()).filter(Boolean);
    if (ips.length === 0) return null;

    const publicIp = ips.find(ip => !isPrivateIp(ip));
    return publicIp ?? ips[0];
}

export async function GET() {
    try {
        if (!redis) return new Response(JSON.stringify({ error: "Applause is temporarily unavailable" }), { status: 503 });

        const val = await redis.eval(APPLAUSE_COUNT_SCRIPT, [KEY], [APPLAUSE_BASE_COUNT, 0]);
        const count = safeNumber(val);
        return new Response(JSON.stringify({ count }), { status: 200 });
    } catch (err: unknown) {
        console.error("GET /api/applause error:", err instanceof Error ? err.message : err);
        return new Response(JSON.stringify({ error: "Failed to load count" }), { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        if (!redis) return new Response(JSON.stringify({ error: "Applause is temporarily unavailable" }), { status: 503 });

        // Get potential client IP from headers
        const xf = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
        const ip = pickClientIp(xf) ?? null;


        if (!ip || isPrivateIp(ip)) {
            console.warn("Skipping IP rate-limit for dev/private IP:", ip);
        } else if (IP_LIMIT > 0) {
            const ipKey = `applause:ip:${ip}`;
            const ipCountRaw = await redis.eval(
                "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end; return n",
                [ipKey], [IP_WINDOW_SEC]
            );
            const ipCount = safeNumber(ipCountRaw);
            if (ipCount > IP_LIMIT) {
                return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429 });
            }
        }

        // canonical increment
        const newVal = await redis.eval(APPLAUSE_COUNT_SCRIPT, [KEY], [APPLAUSE_BASE_COUNT, 1]);
        const count = safeNumber(newVal);
        return new Response(JSON.stringify({ count }), { status: 200 });
    } catch (err: unknown) {
        console.error("POST /api/applause error:", err instanceof Error ? err.message : err);
        return new Response(JSON.stringify({ error: "Failed to increment" }), { status: 500 });
    }
}
