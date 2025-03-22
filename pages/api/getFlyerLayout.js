import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

export default function handler(req, res) {
    try {
        const { category } = req.query; // 例: "D1", "S2" など
        if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }

        const layoutFilePath = path.join(process.cwd(), 'public', 'images', category, `item_${category}.csv`);
        
        if (!fs.existsSync(layoutFilePath)) {
            return res.status(404).json({ error: 'Layout file not found' });
        }

        const workbook = xlsx.readFile(layoutFilePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const layoutData = xlsx.utils.sheet_to_json(sheet);

        res.status(200).json({ layout: layoutData });
    } catch (error) {
        console.error('Error reading layout file:', error);
        res.status(500).json({ error: 'Failed to load layout data' });
    }
}
