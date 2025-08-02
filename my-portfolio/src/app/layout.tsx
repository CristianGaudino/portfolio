import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
    title: "Cristiano Gaudino",
    description: "",
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
            <body
                className="font-primary antialiased"
            >
                {children}
            </body>
        </html>
    );
}
