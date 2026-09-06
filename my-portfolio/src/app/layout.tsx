import type { Metadata } from "next";
import "../styles/globals.css";
import { SITE_CONFIG } from "@/lib/config";

const DESCRIPTION =
    "Cristiano Gaudino — Irish software engineer building sleek, responsive web apps with Next.js, TypeScript and Tailwind. Portfolio as a terminal OS.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_CONFIG.siteUrl),
    title: "Cristiano Gaudino",
    description: DESCRIPTION,
    applicationName: "cgaudino.os",
    authors: [{ name: "Cristiano Gaudino", url: SITE_CONFIG.github.profileUrl }],
    keywords: ["Cristiano Gaudino", "software engineer", "Next.js", "TypeScript", "portfolio", "Ireland"],
    openGraph: {
        type: "website",
        siteName: "cgaudino.os",
        title: "Cristiano Gaudino",
        description: DESCRIPTION,
        url: SITE_CONFIG.siteUrl,
    },
    twitter: {
        card: "summary_large_image",
        title: "Cristiano Gaudino",
        description: DESCRIPTION,
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
                <meta name="apple-mobile-web-app-title" content="CGaudino" />
            </head>
            <body className="font-primary antialiased">{children}</body>
        </html>
    );
}
