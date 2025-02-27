import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, memo } = req.body;

  if (!email || !memo) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Gmailを使う場合
    auth: {
      user: 'your-email@gmail.com', // 送信元メールアドレス
      pass: 'your-email-password'   // アプリパスワード
    }
  });

  try {
    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: email,
      subject: '買物メモ',
      text: memo
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error("メール送信エラー:", error);
    res.status(500).json({ message: 'Failed to send email' });
  }
}
