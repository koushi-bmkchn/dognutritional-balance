import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { ContentProtection } from "@/components/ContentProtection";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "愛犬栄養計算",
    description: "手作りご飯の栄養バランスをチェック",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body className={cn(inter.className, "min-h-screen")}>
                <ContentProtection>{children}</ContentProtection>
            </body>
        </html>
    );
}
