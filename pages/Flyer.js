import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router'; // Keep useRouter for other buttons

const Flyer = () => {
  const [settings, setSettings] = useState([]);
  const [layout, setLayout] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('S2');
  const [shoppingMemo, setShoppingMemo] = useState([]);
  const [holidayDates, setHolidayDates] = useState({});
  const [imageExists, setImageExists] = useState({});
  const router = useRouter(); // Keep useRouter

  // --- Data Fetching useEffect Hooks (No changes) ---
  useEffect(() => {
    fetch('/data/settings.json')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('設定の取得に失敗', err));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetch(`/api/getProductImages?category=${selectedCategory}`)
        .then(res => res.json())
        .then(data => setLayout(data.layout || []))
        .catch(err => console.error("画像の取得に失敗", err));
    }
  }, [selectedCategory]);

  useEffect(() => {
    const savedMemo = JSON.parse(localStorage.getItem('shoppingMemo')) || [];
    setShoppingMemo(savedMemo);
  }, []);

  useEffect(() => {
    fetch('https://holidays-jp.github.io/api/v1/date.json')
      .then(res => res.json())
      .then(data => setHolidayDates(data))
      .catch(err => console.error("祝日の取得に失敗", err));
  }, []);

  useEffect(() => {
    const folders = ['D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'coupon', 'hed'];
    folders.forEach(folder => {
      const img = new window.Image();
      // Add timestamp to prevent cache issues when checking image existence
      const imageUrl = `/images/${folder}/only.jpeg?t=${Date.now()}`;
      img.onload = () => setImageExists(prev => ({ ...prev, [folder]: true }));
      img.onerror = () => setImageExists(prev => ({ ...prev, [folder]: false }));
      img.src = imageUrl;
    });
  }, []);

  // --- Helper Functions (No changes) ---
  const toggleMemo = (fileName) => {
    const updated = shoppingMemo.includes(fileName)
      ? shoppingMemo.filter(item => item !== fileName)
      : [...shoppingMemo, fileName];
    setShoppingMemo(updated);
    localStorage.setItem('shoppingMemo', JSON.stringify(updated));
  };

  // Function to get setting value
  const getSettingValue = (label) => {
    if (!settings || settings.length === 0) return '';
    return settings.find(s => s.label === label)?.text || '';
  }
  // Function to get dates
  const getDates = (label) => {
     if (!settings || settings.length === 0) return [];
     return settings.find(s => s.label === label)?.dates || [];
  }
  // Function to check show status
  const show = (label) => {
     if (!settings || settings.length === 0) return false;
     return settings.find(s => s.label === label)?.show;
  }


  const formatDate = (dateStr, withMonth = true) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const iso = date.toISOString().split('T')[0];
    const isHoliday = Object.keys(holidayDates).includes(iso);
    const weekday = `${days[date.getDay()]}${isHoliday ? '・祝' : ''}`;
    return `${withMonth ? `${date.getMonth() + 1}月` : ''}${date.getDate()}日（${weekday}）`;
  };

  const formatPeriod = () => {
    const start = getSettingValue('チラシ有効期間（開始）');
    const end = getSettingValue('チラシ有効期間（終了）');
    if (!start || !end) return '';
    const s = new Date(start), e = new Date(end);
    const sameMonth = s.getMonth() === e.getMonth();
    return `${formatDate(start)} ～ ${formatDate(end, !sameMonth)}`;
  };

  // --- Grid Layout Generation Function (No changes) ---
  const generateGridLayout = (layout) => {
    if (!layout || layout.length === 0) return null;
    const sortedLayout = [...layout].sort((a, b) => a["優先順位"] - b["優先順位"]);
    const grid = [], rowSize = 4;
    let currentRow = [], imagePosition = 0;
    const sizeMap = { A: { width: 4, height: 4 }, B: { width: 2, height: 4 }, C: { width: 4, height: 2 }, D: { width: 2, height: 2 } };

    sortedLayout.forEach((item, i) => {
      const size = item?.サイズ;
      const fileName = item?.ファイル名;
      const category = item?.カテゴリー;

      if (!size || !fileName || !category) {
          console.warn("Skipping item with missing properties:", item);
          return;
      }

      const { width, height } = sizeMap[size] || sizeMap.D;
      const path = `/images/${category}/${fileName}`;
      currentRow.push(
        <div key={`${i}_${fileName}`} className={`col-span-${width} row-span-${height}`}>
          <Image
            src={path}
            alt={fileName}
            width={width * 90}
            height={height * 90}
            unoptimized
            onClick={() => toggleMemo(fileName)}
            className={`cursor-pointer border ${shoppingMemo.includes(fileName) ? 'border-red-500' : 'border-transparent'}`}
             onError={(e) => {
               console.error(`Failed to load image: ${path}`);
             }}
          />
        </div>
      );
      imagePosition += width;
      if (imagePosition >= rowSize) {
        grid.push(<div key={`row_${i}`} className="grid grid-cols-4 gap-2 mb-2">{currentRow}</div>);
        currentRow = []; imagePosition = 0;
      }
    });
    if (currentRow.length > 0) {
      grid.push(<div key="lastRow" className="grid grid-cols-4 gap-2 mb-2">{currentRow}</div>);
    }
    return grid;
  };

  // --- Tokubai Buttons Rendering Function (No changes) ---
  const renderTokubaiButtons = () => {
    const buttons = [1, 2, 3, 4].map(n => {
      const label = `特売日ボタン${n}`;
      if (!settings.length) return null;
      const setting = settings.find(s => s.label === label);
      if (!setting || !setting.show) return null;
      return {
        folder: `D${n}`,
        dates: setting.dates || []
      };
    }).filter(Boolean);

    if (buttons.length === 0) {
      return null;
    }
    const useImages = buttons.some(btn => imageExists[btn.folder]);
    const fixedButtonHeight = 80;

    return (
      <div className="flex justify-center items-stretch gap-1 mb-1 w-full">
        {buttons.map(({ folder, dates }) => (
          <div
            key={folder}
            onClick={() => toggleMemo(folder)}
            className={`cursor-pointer flex-1 h-[${fixedButtonHeight}px] flex items-center justify-center min-w-0 border border-transparent`}
          >
            {useImages ? (
              imageExists[folder] ? (
                <Image
                  src={`/images/${folder}/only.jpeg?t=${Date.now()}`}
                  alt={folder}
                  width={500}
                  height={fixedButtonHeight}
                  unoptimized
                  className="object-contain w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400 text-xs p-1">
                  <span>画像なし</span>
                  <span>({folder})</span>
                </div>
              )
            ) : (
              <div className="text-center w-full p-1 overflow-hidden flex flex-col justify-center items-center h-full bg-gray-50">
                <div className="text-xs text-gray-600 truncate">
                  {dates && dates.length > 0 ? `${new Date(dates[0]).getMonth() + 1}/${new Date(dates[0]).getDate()}` : ''}
                </div>
                <div className="text-2xl font-bold">
                  {dates && dates.length > 0 ? `${new Date(dates[0]).getDate()}日` : ''}
                </div>
                <div className="bg-black text-white inline-block px-1 rounded text-xs">
                  {dates && dates.length > 0 ? ['日', '月', '火', '水', '木', '金', '土'][new Date(dates[0]).getDay()] : ''}
                </div>
                <div className="text-sm mt-1">限り</div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // --- ★ Function to handle Route button click ---
  const handleRouteClick = () => {
    const destinationAddress = getSettingValue('住所');
    if (!destinationAddress) {
      alert('店舗の住所が設定されていません。');
      return;
    }

    if (!navigator.geolocation) {
      alert('お使いのブラウザは現在地取得に対応していません。');
      return;
    }

    // 現在地を取得
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // 成功した場合
        const { latitude, longitude } = position.coords;
        const origin = `${latitude},${longitude}`;
        const encodedDestination = encodeURIComponent(destinationAddress);
        // Google Mapsの経路表示URLを生成
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${encodedDestination}`;
        // 新しいタブで開く
        window.open(mapsUrl, '_blank', 'noopener,noreferrer');
      },
      (error) => {
        // 失敗した場合
        console.error("Geolocation error:", error);
        let message = '現在地を取得できませんでした。';
        if (error.code === 1) { // PERMISSION_DENIED
          message = '現在地の利用が許可されていません。設定を確認してください。';
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
          message = '現在地情報を取得できませんでした。';
        } else if (error.code === 3) { // TIMEOUT
          message = '現在地の取得中にタイムアウトしました。';
        }
        alert(message);
      },
      {
        // オプション: 高精度な位置情報を要求、タイムアウト時間、キャッシュの有効期間
        enableHighAccuracy: true,
        timeout: 10000, // 10秒
        maximumAge: 0 // キャッシュを使用しない
      }
    );
  };


  // --- Main JSX Rendering ---
  return (
    <div className="max-w-md mx-auto p-4 pb-20 relative">
      {/* Header */}
      <div className="text-center">
        {imageExists['hed'] ? (
          <Image
            src="/images/hed/only.jpeg"
            alt="header"
            width={400}
            height={150}
            unoptimized
             onError={(e) => { console.error("Failed to load header image"); }}
          />
        ) : (
          <h1 className="text-2xl font-bold mt-2">{getSettingValue('ブランドタイトル')}</h1>
        )}
      </div>

      {/* Store Info & Period */}
      {show('店舗名') && (
        <div className="text-center my-1">
          <h2 className="text-xl font-bold">{getSettingValue('店舗名')}</h2>
          {show('住所') && <p className="text-sm">{getSettingValue('住所')}</p>}
          {show('チラシ有効期間（開始）') && (
            <p className="text-sm text-gray-600">{formatPeriod()}</p>
          )}
        </div>
      )}

      {/* Render Responsive Width Tokubai Buttons */}
      {renderTokubaiButtons()}

      {/* Other Buttons (企画, おススメ, クーポン - Consider removing if redundant) */}
      <div className="flex flex-wrap justify-center gap-2 my-4">
        {/* 企画ボタン1 */}
        {show('企画ボタン1') && (
             <div key="S1" className="text-center">
               {imageExists['S1'] ? (
                 <Image
                   src={`/images/S1/only.jpeg?t=${Date.now()}`}
                   alt="S1"
                   width={120}
                   height={50}
                   unoptimized
                   onClick={() => toggleMemo('S1')}
                   className="cursor-pointer"
                 />
               ) : (
                 <button
                   className="bg-pink-500 text-white rounded px-2 py-1"
                   onClick={() => toggleMemo('S1')}
                 >
                   {getSettingValue('企画ボタン1')}
                 </button>
               )}
             </div>
        )}
         {/* 企画ボタン2 */}
         {show('企画ボタン2') && (
             <div key="S2" className="text-center">
               {imageExists['S2'] ? (
                 <Image
                   src={`/images/S2/only.jpeg?t=${Date.now()}`}
                   alt="S2"
                   width={120}
                   height={50}
                   unoptimized
                   onClick={() => toggleMemo('S2')}
                   className="cursor-pointer"
                 />
               ) : (
                 <button
                   className="bg-pink-500 text-white rounded px-2 py-1"
                   onClick={() => toggleMemo('S2')}
                 >
                   {getSettingValue('企画ボタン2')}
                 </button>
               )}
             </div>
         )}
         {/* おススメボタン */}
         {show('おススメボタン') && (
             <div key="おススメボタン" className="text-center">
               <button
                 className="bg-green-500 text-white rounded px-2 py-1"
               >
                 {getSettingValue('おススメボタン')}
               </button>
             </div>
         )}
         {/* クーポンボタン (Footerのボタンと機能が重複) */}
         {/* Removed as it's handled by the footer */}
      </div>


      {/* Grid Layout */}
      {generateGridLayout(layout)}

      {/* Fixed Footer (★ Updated Route button onClick) */}
      <footer
        className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-2 z-50" // Full width footer bar
      >
        {/* Inner container matching content width and centering buttons */}
        <div className="max-w-md mx-auto flex justify-around items-center"> {/* Use justify-around or justify-between */}
           {/* ルートボタン */}
           {/* ★ Changed onClick to handleRouteClick */}
           {show('住所') ? (
               <button
                 onClick={handleRouteClick} // ★ Use the new handler
                 className="text-center text-xs px-2 py-1 rounded hover:bg-gray-100 flex flex-col items-center"
               >
                   {/* Icon placeholder */}
                   <span className="mt-1">ルート</span>
               </button>
           ) : (
                <button className="text-center text-xs px-2 py-1 rounded text-gray-400 flex flex-col items-center" disabled>
                   <span className="mt-1">ルート</span>
                </button>
           )}

           {/* クーポンボタン */}
           {show('クーポンボタン') ? (
              <button
                onClick={() => router.push('/Coupon')} // Keep navigation for Coupon
                className="text-center text-xs px-2 py-1 rounded hover:bg-gray-100 flex flex-col items-center"
              >
                {/* Icon placeholder */}
                <span className="mt-1">{getSettingValue('クーポンボタン') || 'クーポン'}</span>
              </button>
           ) : (
               <button className="text-center text-xs px-2 py-1 rounded text-gray-400 flex flex-col items-center" disabled>
                   <span className="mt-1">クーポン</span>
               </button>
           )}

           {/* 買物メモボタン */}
           <button
             onClick={() => router.push('/ShoppingMemo')} // Keep navigation for ShoppingMemo
             className="text-center text-xs px-2 py-1 rounded hover:bg-gray-100 flex flex-col items-center relative"
           >
             {/* Icon placeholder */}
             <span className="mt-1">買物メモ</span>
             {shoppingMemo && shoppingMemo.length > 0 && (
               <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                 {shoppingMemo.length}
               </span>
             )}
           </button>
        </div>
      </footer>
    </div>
  );
};

export default Flyer;
