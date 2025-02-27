import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { category } = req.query; // クエリパラメータでカテゴリを取得
  const categoryPath = path.join(process.cwd(), 'public/images', category);

  try {
    const files = fs.readdirSync(categoryPath);
    res.status(200).json({ images: files });
  } catch (error) {
    res.status(500).json({ error: "画像の取得に失敗しました" });
  }
}
