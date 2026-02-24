/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: '/inumeshi', // デプロイ用設定
    images: {
        unoptimized: true,
    },
};

module.exports = nextConfig;
