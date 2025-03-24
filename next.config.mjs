// next.config.mjs
import withPWA from 'next-pwa';

const nextConfig = {
  images: {
    unoptimized: true,
  },
  reactStrictMode: true, // ここに配置
  swcMinify: true, // swcMinifyを有効にする
};

const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // PWA機能を有効にする
  // exclude: [], // 必要に応じて除外するファイルを指定
};

const withPWAConfig = withPWA(pwaConfig);

export default () => {
  return withPWAConfig({
    ...nextConfig,
  });
};
