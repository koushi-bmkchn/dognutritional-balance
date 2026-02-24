import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
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
                <Script
                    id="sitest-heatmap"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function(PID){
                                var dev = "";
                                var s_params = location.search.split("?")[1];
                                var param;
                                if(s_params){
                                    param = s_params.split("&").filter(function(it){ return it.match(/^u=/); }).join("&");
                                    if(!param){ param = ""; }
                                }
                                if (navigator.userAgent) {
                                    dev = navigator.userAgent.match(/(android.*mobile|iphone|ipod|mobile\\ssafari|iemobile|opera\\smini|windows\\sphone)/i)? "(sp)": "(pc)";
                                }else{ dev = ""; }
                                var name = dev + decodeURIComponent(location.hostname + location.pathname);
                                if (param){ name = name + "?" + param; }
                                var script = document.createElement("script");
                                script.src = "https://tracking.sitest.jp/tag?p=" + PID + "&u=" + encodeURIComponent(location.origin + location.pathname + location.search) + "&n=" + name;
                                script.async = true;
                                document.head.appendChild(script);
                            })("62e20ec10fed0");
                        `,
                    }}
                />
            </body>
        </html>
    );
}
