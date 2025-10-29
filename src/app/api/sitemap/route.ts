// app/api/sitemap/route.ts
import { NextResponse } from "next/server";

const BASE_URL = "https://cf-ladder-pro.vercel.app";

export async function GET() {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
  </url>
</urlset>`;

    return new NextResponse(xml, {
        headers: { "Content-Type": "text/xml" },
    });
}
