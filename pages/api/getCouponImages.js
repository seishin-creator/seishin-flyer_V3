import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const couponDir = path.join(process.cwd(), 'public', 'images', 'coupon');
    const files = fs.readdirSync(couponDir);
    res.status(200).json({ images: files });
  } catch (error) {
    console.error("クーポン画像の取得エラー:", error);
    res.status(500).json({ error: "クーポン画像を取得できませんでした。" });
  }
}
