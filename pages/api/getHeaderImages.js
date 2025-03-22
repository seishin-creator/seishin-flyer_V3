import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { folder } = req.query;
  const directoryPath = path.join(process.cwd(), 'public', 'images', folder);

  try {
    const files = fs.readdirSync(directoryPath);
    const imageFiles = files.filter((file) =>
      /\.(jpe?g|png|webp)$/i.test(file)
    );
    res.status(200).json(imageFiles);
  } catch (error) {
    console.error('画像読み込みエラー:', error);
    res.status(500).json({ error: '画像読み込みに失敗しました' });
  }
}
