import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

const Flyer = () => {
  const [storeName, setStoreName] = useState('');
  const [period, setPeriod] = useState('');
  const [products, setProducts] = useState([]); // 商品画像リスト
  const [selectedCategory, setSelectedCategory] = useState('tokubai');
  const [shoppingMemo, setShoppingMemo] = useState([]); // 買物メモ用リスト

  const router = useRouter();

  // 店舗名と期間を取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/getRuleData');
        const data = await res.json();
        setStoreName(data.storeName);
        setPeriod(data.period);
      } catch (error) {
        console.error("データの取得に失敗しました", error);
      }
    };

    fetchData();
  }, []);

  // 選択されたカテゴリの商品画像を取得
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/getProductImages?category=${selectedCategory}`);
        const data = await res.json();
        setProducts(data.images || []);
      } catch (error) {
        console.error("画像の取得に失敗しました", error);
      }
    };

    fetchImages();
  }, [selectedCategory]);

  // ローカルストレージから買物メモを取得
  useEffect(() => {
    const savedMemo = JSON.parse(localStorage.getItem('shoppingMemo')) || [];
    setShoppingMemo(savedMemo);
  }, []);

  // 買物メモの追加・削除
  const toggleShoppingMemo = (file) => {
    const updatedMemo = shoppingMemo.includes(file) 
      ? shoppingMemo.filter(item => item !== file) 
      : [...shoppingMemo, file];

    setShoppingMemo(updatedMemo);
    localStorage.setItem('shoppingMemo', JSON.stringify(updatedMemo)); // localStorage に保存
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* ヘッダー（固定） */}
      <header style={{ flexShrink: 0 }}>
        <Image 
          src="/images/hed/header.png" 
          alt="ヘッダー" 
          width={800} 
          height={200} 
          priority 
          style={{ objectFit: 'contain', width: '100%' }}
        />
        <h1 style={{ textAlign: 'center', margin: '10px 0' }}>{storeName}</h1>
        <p style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}>{period}</p>
        <Image 
          src="/images/Taitoru/Taitoru.jpg" 
          alt="タイトル" 
          width={800} 
          height={100} 
          priority 
          style={{ objectFit: 'contain', width: '100%' }}
        />
      </header>

      {/* 商品画像エリア（スクロール可能にする） */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
          {products.length > 0 ? (
            products.map((file, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <Image 
                  src={`/images/${selectedCategory}/${file}`} 
                  alt={file} 
                  width={200} 
                  height={200} 
                  priority
                  style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
                />
                <button 
                  onClick={() => toggleShoppingMemo(file)}
                  style={{ marginTop: '5px', padding: '5px 10px', fontSize: '14px' }}
                >
                  {shoppingMemo.includes(file) ? "削除" : "買物メモに入れる"}
                </button>
              </div>
            ))
          ) : (
            <p>商品が見つかりません</p>
          )}
        </div>
      </div>

      {/* フッター（固定） */}
      <footer style={{ flexShrink: 0, backgroundColor: '#f8f8f8', padding: '10px', textAlign: 'center', borderTop: '1px solid #ddd' }}>
        <button onClick={() => router.push('/Route')} style={{ margin: '0 10px', padding: '10px 20px' }}>ルート</button>
        <button onClick={() => window.open('/Coupon', '_blank')} style={{ margin: '0 10px', padding: '10px 20px' }}>クーポン</button>
        <button onClick={() => window.open('/ShoppingMemo', '_blank')} style={{ margin: '0 10px', padding: '10px 20px' }}>買物メモ</button>
      </footer>
    </div>
  );
};

export default Flyer;



