import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    try {
        const dailyButtonPath = path.join(process.cwd(), 'public', 'images', 'dailybutton');
        const specialButtonPath = path.join(process.cwd(), 'public', 'images', 'specialbutton');

        const dailyButtons = fs.readdirSync(dailyButtonPath).filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg'));
        const specialButtons = fs.readdirSync(specialButtonPath).filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg'));

        res.status(200).json({ dailyButtons, specialButtons });
    } catch (error) {
        console.error('Error reading button images:', error);
        res.status(500).json({ error: 'Failed to load button images' });
    }
}
