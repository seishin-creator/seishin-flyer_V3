import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Lp() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Image src="/icons/icon-192x192.png" alt="Logo" width={120} height={120} />
        </div>

        <h1 className="text-xl font-semibold mb-2">🔔 SEISHIN チラシアプリ 新登場！</h1>
        <p className="text-gray-700 mb-4">ホーム画面に追加して、最新チラシをいつでもチェック！</p>

        {/* ✅ 追加：画像を許される幅いっぱいに表示 */}
        <div className="mb-6">
          <Image
            src="/images/LP/forLP1.jpg"
            alt="LP画像"
            width={800}
            height={400}
            layout="responsive"
            objectFit="contain"
            unoptimized
          />
        </div>

        <Link href="/Flyer" className="text-lg text-blue-600 hover:underline">
          今すぐ使ってみる
        </Link>
      </div>
    </div>
  );
}
