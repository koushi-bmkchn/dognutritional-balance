/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    // basePath: '/inumeshi', // デプロイ用。ローカルプレビュー時はコメントアウト
    images: {
        unoptimized: true,
    },
};

module.exports = nextConfig;
