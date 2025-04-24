// pages/api/saveSettings.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const dataPath = path.join(process.cwd(), 'public', 'data', 'settings.json');

  try {
    const settings = req.body;
    fs.writeFileSync(dataPath, JSON.stringify(settings, null, 2), 'utf8');
    return res.status(200).json({ message: '設定が保存されました' });
  } catch (error) {
    console.error('設定保存失敗:', error);
    return res.status(500).json({ message: '設定保存に失敗しました' });
  }
}
