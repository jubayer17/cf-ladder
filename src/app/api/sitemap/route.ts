import { NextResponse } from 'next/server';
export function GET(req: Request) { return NextResponse.redirect(new URL('/sitemap.xml', req.url), 308); }
