import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { target } = req.body;
  if (!target) return res.status(400).json({ message: 'No target specified' });

  const filePath = path.join(process.cwd(), 'public', 'images', target, 'only.jpeg');

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.status(200).json({ message: '削除成功' });
    } else {
      return res.status(404).json({ message: 'ファイルが存在しません' });
    }
  } catch (err) {
    console.error('削除失敗:', err);
    return res.status(500).json({ message: '削除失敗', error: err });
  }
}
