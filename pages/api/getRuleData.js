import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

export default function handler(req, res) {
  try {
    // Excelファイルのパス
    const filePath = path.join(process.cwd(), 'public', 'rule.xlsx');
    
    // ファイルを読み込む
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

    // 最初のシートを取得
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // B1セル（店舗名）
    const storeName = sheet['B1'] ? sheet['B1'].v : "店舗名未設定";

    // B3セル（期間）
    const period = sheet['B3'] ? sheet['B3'].v : "期間未設定";

    // B4セル（住所）
    const address = sheet['B4'] ? sheet['B4'].v : "住所未設定";

    // レスポンスを返す
    res.status(200).json({ storeName, period, address });

  } catch (error) {
    console.error("Excelファイルの読み込みエラー:", error);
    res.status(500).json({ error: "データを取得できませんでした。" });
  }
}

