import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const basePath = path.join(process.cwd(), 'public', 'images');

  const folders = ['D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'hed', 'coupon'];
  const counts = {};

  folders.forEach((folder) => {
    try {
      const fullPath = path.join(basePath, folder);
      const files = fs.existsSync(fullPath) ? fs.readdirSync(fullPath) : [];
      const imageFiles = files.filter((f) => /\.(jpg|jpeg|png|gif)$/i.test(f));
      counts[folder] = imageFiles.length;
    } catch (err) {
      counts[folder] = 0;
    }
  });

  res.status(200).json(counts);
}
