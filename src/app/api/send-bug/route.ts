
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Buffer } from "buffer";

export const runtime = "nodejs";

async function buildAttachmentsFromForm(formData: FormData) {
    const attachments: {
        filename: string;
        content: Buffer;
        contentType?: string;
    }[] = [];

    for (const [, value] of formData.entries()) {

        if (value instanceof File) {
            const file = value as File;
            // read file into buffer
            const ab = await file.arrayBuffer();
            const buf = Buffer.from(ab);
            attachments.push({
                filename: file.name || `attachment-${Date.now()}`,
                content: buf,
                contentType: file.type || undefined,
            });
        }
    }

    return attachments;
}

export async function POST(req: Request) {
    try {

        const formData = await req.formData();
        const text = String(formData.get("text") ?? "").trim();

        // Build attachments
        const attachments = await buildAttachmentsFromForm(formData);

        // Validate environment
        const smtpUser = process.env.GMAIL_USER;
        const smtpPass = process.env.GMAIL_APP_PASSWORD;
        const target = process.env.GMAIL_TARGET || smtpUser;
        if (!smtpUser || !smtpPass) {
            console.error("Missing GMAIL_USER or GMAIL_APP_PASSWORD in env");
            return NextResponse.json(
                { error: "Missing mail credentials on server (GMAIL_USER / GMAIL_APP_PASSWORD)." },
                { status: 500 }
            );
        }

        // Configure transporter (Gmail SMTP using App Password)
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user: smtpUser, pass: smtpPass },
        });

        // verify to show early errors
        try {
            await transporter.verify();
            console.log("Nodemailer verify OK");
        } catch (vErr) {
            console.error("SMTP verify failed:", vErr);
            return NextResponse.json({ error: "SMTP verify failed", details: String(vErr) }, { status: 500 });
        }

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
            return NextResponse.json({ error: "Failed to send email", details: String(sendErr) }, { status: 500 });
        }
    } catch (err) {
        console.error("API error:", err);
        return NextResponse.json({ error: "Failed to process request", details: String(err) }, { status: 500 });
    }
}
