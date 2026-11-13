
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Buffer } from "buffer";

export const runtime = "nodejs";

const MAX_BODY = 6 * 1024 * 1024;
const attempts = new Map<string, number>();
async function buildAttachmentsFromForm(formData: FormData) {
    const files = [...formData.values()].filter((value): value is File => value instanceof File && value.size > 0);
    if (files.length > 3 || files.reduce((sum, f) => sum + f.size, 0) > 5 * 1024 * 1024 || files.some(f => !['image/png','image/jpeg','image/webp','image/gif','text/plain'].includes(f.type))) throw new Error('INVALID_FILES');
    return Promise.all(files.map(async f => ({ filename: f.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0,100), content: Buffer.from(await f.arrayBuffer()), contentType: f.type })));
}
async function boundedForm(req: Request) {
    if (!req.body) throw new Error('INVALID_BODY');
    const reader = req.body.getReader();
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BODY) { await reader.cancel(); throw new Error('TOO_LARGE'); }
        chunks.push(value);
    }
    return new Response(Buffer.concat(chunks), { headers: { 'Content-Type': req.headers.get('content-type') || '' } }).formData();
}

export async function POST(req: Request) {
    try {

        const origin = req.headers.get('origin');
        if (origin && origin !== new URL(req.url).origin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const now = Date.now();
        for (const [key, expires] of attempts) if (expires <= now) attempts.delete(key);
        if (attempts.has(ip) || attempts.size > 10000) return NextResponse.json({ error: 'Please wait a minute before sending another report.' }, { status: 429, headers: { 'Retry-After': '60' } });
        attempts.set(ip, now + 60000);
        const formData = await boundedForm(req);
        const text = String(formData.get("text") ?? "").trim();

        if (!text || text.length > 5000) return NextResponse.json({ error: 'Please provide a report between 1 and 5000 characters.' }, { status: 400 });
        // Build attachments
        const attachments = await buildAttachmentsFromForm(formData);

        // Validate environment
        const smtpUser = process.env.GMAIL_USER;
        const smtpPass = process.env.GMAIL_APP_PASSWORD;
        const target = process.env.GMAIL_TARGET || smtpUser;
        if (!smtpUser || !smtpPass) {
            console.error("Missing GMAIL_USER or GMAIL_APP_PASSWORD in env");
            return NextResponse.json(
                { error: "Bug reporting is temporarily unavailable." },
                { status: 503 }
            );
        }

        // Configure transporter (Gmail SMTP using App Password)
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user: smtpUser, pass: smtpPass },
            connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
        });

        // Build email HTML
        const escapeHtml = (unsafe = "") =>
            String(unsafe)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        const htmlBody = `
      <div style="font-family: system-ui, -apple-system, Roboto, Arial; padding: 16px;">
        <h2 style="color:#e63946; margin-bottom:8px;">🐞 New Bug Report</h2>
        <p><strong>Message:</strong></p>
        <div style="background:#f8f9fa;padding:10px;border-radius:6px;">
          ${text ? escapeHtml(text).replace(/\n/g, "<br/>") : "<em>(no message)</em>"}
        </div>
        <p style="font-size:12px;color:#666;margin-top:8px;">Sent from app</p>
      </div>
    `;

        // Send mail
        try {
            await transporter.sendMail({
                from: `"Bug Reporter" <${smtpUser}>`,
                to: target,
                subject: "🐞 New Bug Report with Attachments",
                html: htmlBody,
                attachments: attachments.map((a) => ({
                    filename: a.filename,
                    content: a.content,
                    contentType: a.contentType,
                })),
            });

            return NextResponse.json({ success: true });
        } catch (sendErr) {
            console.error("sendMail error:", sendErr);
            return NextResponse.json({ error: "Failed to send report. Please try again later." }, { status: 500 });
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : '';
        if (message === 'TOO_LARGE') return NextResponse.json({ error: 'Attachments are too large.' }, { status: 413 });
        return NextResponse.json({ error: 'Invalid report. Use up to 3 images or text files totaling at most 5 MB.' }, { status: 400 });
    }
}
