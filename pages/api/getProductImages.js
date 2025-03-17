import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    try {
        const categoryMap = {
            a: 'niku',
            b: 'sakana',
            c: 'yasai',
            d: 'tokubai'
        };

        const { category } = req.query;

        if (!category || !categoryMap[category]) {
            return res.status(400).json({ error: "無効なカテゴリ" });
        }

        // 正しいフォルダ名に変換
        const folderName = categoryMap[category];
        const dirPath = path.join(process.cwd(), 'public', 'images', folderName);

        if (!fs.existsSync(dirPath)) {
            return res.status(404).json({ error: "指定のフォルダが見つかりません" });
        }

        // フォルダ内のファイル一覧を取得し、小文字に統一
        const files = fs.readdirSync(dirPath)
            .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file)) // 大文字小文字を無視
            .map(file => file.toLowerCase()); // すべて小文字に変換

        console.log("取得した画像リスト:", files); // デバッグ用ログ

        res.status(200).json({ images: files.map(file => `/images/${folderName}/${file}`) });

    } catch (error) {
        console.error("商品画像取得エラー:", error);
        res.status(500).json({ error: "サーバーエラー" });
    }
}



