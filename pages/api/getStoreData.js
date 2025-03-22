import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'rule.xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheets = workbook.SheetNames;
    const stores = sheets.map(sheet => {
      const sheetData = workbook.Sheets[sheet];
      return {
        name: sheetData['B1'] ? sheetData['B1'].v : "不明",
        address: sheetData['B4'] ? sheetData['B4'].v : "住所なし"
      };
    });

    res.status(200).json({ stores });
  } catch (error) {
    console.error("店舗データ取得エラー:", error);
    res.status(500).json({ error: "サーバーエラー" });
  }
}

