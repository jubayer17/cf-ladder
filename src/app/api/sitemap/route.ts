// app/api/sitemap/route.ts
import { NextResponse } from "next/server";

const BASE_URL = "https://cf-ladder-pro.vercel.app";

export function GET() {
    const lastMod = new Date().toISOString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(xml, {
        headers: { "Content-Type": "text/xml" },
    });
}
