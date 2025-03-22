import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    try {
        const { category } = req.query;
        if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }

        const imageDir = path.join(process.cwd(), 'public', 'images', category);
        const csvFilePath = path.join(imageDir, `item_${category}.csv`);

        if (!fs.existsSync(imageDir)) {
            return res.status(404).json({ error: 'Image directory not found' });
        }

        // 画像ファイルリストを取得
        const imageFiles = fs.readdirSync(imageDir).filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

        let layoutData = [];
        if (fs.existsSync(csvFilePath)) {
            const csvData = fs.readFileSync(csvFilePath, 'utf-8').split('\n').map(line => line.split(','));
            const headers = csvData[0].map(h => h.replace(/\r/g, '').trim()); // **改行コード削除**
            layoutData = csvData.slice(1).map(row => {
                let obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index] ? row[index].replace(/\r/g, '').trim() : ''; // **改行コード削除**
                });

                // ** 優先順位を数値に変換 **
                if (obj["優先順位"]) {
                    obj["優先順位"] = parseInt(obj["優先順位"], 10);
                }

                return obj;
            }).filter(item => item['ファイル名']); // 空行を除去
        }

        // **優先順位順にソート**
        layoutData.sort((a, b) => a["優先順位"] - b["優先順位"]);

        // **デバッグ: layoutData の中身をログに出力**
        console.log("修正後のレイアウトデータ:", JSON.stringify(layoutData, null, 2));

        return res.status(200).json({ images: imageFiles, layout: layoutData });
    } catch (error) {
        console.error('Error in getProductImages API:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}





