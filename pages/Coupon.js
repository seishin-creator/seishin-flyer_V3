import { useState, useEffect } from 'react';

const Coupon = () => {
  const [isUsed, setIsUsed] = useState(false);
  const [couponImages, setCouponImages] = useState([]);

  useEffect(() => {
    // クーポン画像を取得
    fetch('/api/getCouponImages')
      .then(response => response.json())
      .then(data => setCouponImages(data.images || []))
      .catch(error => console.error("クーポン画像の取得に失敗しました", error));
  }, []);

  const handleUseCoupon = () => {
    if (!isUsed) {
      if (confirm("一度使用すると「使用済み」となり、使用できなくなります。今お会計中ですか？")) {
        setIsUsed(true);
      }
    }
  };

  const closeWindow = () => {
    window.open('', '_self');  // ブラウザの制限を回避するための対策
    window.close();
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {couponImages.length > 0 ? (
        couponImages.map((image, index) => (
          <img
            key={index}
            src={`/images/coupon/${image}`}
            alt="クーポン"
            style={{ maxWidth: '100%', marginBottom: '20px' }}
          />
        ))
      ) : (
        <p>クーポンが見つかりません</p>
      )}

      <button onClick={handleUseCoupon} disabled={isUsed} style={{ padding: '10px 20px', fontSize: '16px', marginBottom: '20px' }}>
        {isUsed ? "使用済み" : "使用する"}
      </button>

      <br />

      <button onClick={closeWindow} style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: 'red', color: 'white', marginTop: '20px' }}>
        閉じる
      </button>
    </div>
  );
};

export default Coupon;




  