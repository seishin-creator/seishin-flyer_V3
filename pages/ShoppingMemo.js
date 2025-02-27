import { useEffect, useState } from 'react';
import Image from 'next/image';

const ShoppingMemo = () => {
  const [shoppingMemo, setShoppingMemo] = useState([]);
  const [email, setEmail] = useState('example@example.com'); // ダミーアドレス表示

  useEffect(() => {
    const memo = JSON.parse(localStorage.getItem('shoppingMemo')) || [];
    setShoppingMemo(memo);
  }, []);

  const sendEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('正しいメールアドレスを入力してください');
      return;
    }

    const memoText = shoppingMemo.join("\n");

    try {
      const response = await fetch('/api/sendMail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, memo: memoText })
      });

      if (response.ok) {
        alert('買物メモを送信しました！');
      } else {
        alert('送信に失敗しました');
      }
    } catch (error) {
      console.error("メール送信エラー:", error);
      alert('送信エラーが発生しました');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 買物メモリスト（スクロール可能） */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', textAlign: 'center' }}>
        <h2>買物メモ</h2>
        {shoppingMemo.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', justifyContent: 'center' }}>
            {shoppingMemo.map((file, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <Image 
                  src={`/images/tokubai/${file}`}  
                  alt={file} 
                  width={200} 
                  height={200} 
                  priority
                  style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p>買物メモは空です</p>
        )}
      </div>

      {/* フッター（固定） */}
      <footer style={{ flexShrink: 0, backgroundColor: '#f8f8f8', padding: '10px', textAlign: 'center', borderTop: '1px solid #ddd', position: 'sticky', bottom: 0 }}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '5px', marginRight: '10px', width: '250px' }}
        />
        <button onClick={sendEmail} style={{ padding: '10px 20px' }}>
          買物メモを送信
        </button>
      </footer>
    </div>
  );
};

export default ShoppingMemo;



  