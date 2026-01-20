import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                natural: {
                    white: '#ffffff',
                    pale: '#ffe2d7',
                    stone: '#d5d1cd',
                    black: '#333333',
                    'dark-grey': '#3f3f3f',
                    grey: '#595757',
                    'slate-green': '#4a5a63',
                    moss: '#68804f',
                    leaf: '#b9ce80',
                    terracotta: '#c8763d',
                    salmon: '#e08863',
                    sand: '#b8936a',
                }
            }
        },
    },
    plugins: [],
};
export default config;
