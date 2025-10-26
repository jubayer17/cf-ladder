import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CF Ladder - Codeforces Competitive Programming Tracker",
  description:
    "Track your Codeforces progress, ladder ranking, and problem-solving history easily with CF Ladder.",
  keywords: `
    CF Ladder, Codeforces Ladder, CP Ladder, Competitive Programming Ladder,
    Codeforces Tracker, CP Tracker, Ladder Ranking, Programming Challenges,
    CF Rank, CF Progress, Codeforces Stats, Problem Solving Tracker
  `,
  authors: [{ name: "Jubayer Ahmed" }],
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "CF Ladder - Codeforces Competitive Programming Tracker",
    description:
      "Track your Codeforces progress, ladder ranking, and problem-solving history easily with CF Ladder.",
    url: "https://cf-ladder-pro.vercel.app/",
    siteName: "CF Ladder",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/ddysafn4k/image/upload/v1761489634/coding_8061324_p0o1nb.png",
        width: 1200,
        height: 630,
        alt: "CF Ladder - Competitive Programming Tracker",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="DkY7lbwjx25NBdwjWjmupzINAtZ7-cIT9RMnVV3Wy-c"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
          integrity="sha512-papb/0kqH9Yp+...=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
