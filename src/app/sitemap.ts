import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://cf-ladder-pro.vercel.app";

    return [
        {
            url: baseUrl,
            lastModified: new Date().toISOString().split("T")[0],
            changeFrequency: "weekly",
            priority: 1.0,
        },
    ];
}
