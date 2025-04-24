import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = new IncomingForm({
    multiples: true,
    uploadDir: path.join(process.cwd(), '/public/tmp'),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('formidable parse error:', err);
      return res.status(500).json({ message: 'アップロードエラー', error: err });
    }

    const targetFolder = fields.target?.[0] || 'misc';
    const savePath = path.join(process.cwd(), 'public', 'images', targetFolder);

    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, { recursive: true });
    }

    const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files];

    try {
      for (const file of uploadedFiles) {
        const fileName = 'only.jpeg'; // ← 固定名で保存
        const destPath = path.join(savePath, fileName);
        fs.renameSync(file.filepath, destPath);
        console.log(`✅ 保存完了: ${destPath}`);
      }
      res.status(200).json({ message: 'アップロード成功' });
    } catch (error) {
      console.error('ファイル保存エラー:', error);
      res.status(500).json({ message: '保存失敗', error });
    }
  });
}
