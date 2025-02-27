import { useEffect } from 'react';

const Route = () => {
  useEffect(() => {
    // ルート情報を取得
    fetch('/api/getRuleData')
      .then(response => response.json())
      .then(data => {
        const storeAddress = encodeURIComponent(data.address || '');
        if (!storeAddress) {
          alert("店舗の住所が取得できませんでした。");
          return;
        }

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${storeAddress}&travelmode=driving`;

              // 直接 Google マップを別タブで開く
              window.open(googleMapsUrl, '_blank');
              window.history.back(); // 元のページに戻る
            },
            (error) => {
              alert("現在地が取得できませんでした。位置情報を許可してください。");
              console.error("位置情報取得エラー:", error);
              window.history.back(); // 元のページに戻る
            }
          );
        } else {
          alert("お使いのブラウザでは現在地情報を取得できません。");
          window.history.back(); // 元のページに戻る
        }
      })
      .catch(error => {
        console.error("住所の取得に失敗しました", error);
        alert("ルート案内ができませんでした。");
        window.history.back(); // 元のページに戻る
      });
  }, []);

  return null; // 画面には何も表示しない
};

export default Route;
