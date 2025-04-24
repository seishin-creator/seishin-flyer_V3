import { useState, useEffect } from 'react';
import Image from 'next/image';

const Flyer = () => {
  const [settings, setSettings] = useState([]);
  const [layout, setLayout] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('S2');
  const [shoppingMemo, setShoppingMemo] = useState([]);
  const [holidayDates, setHolidayDates] = useState({});
  const [imageExists, setImageExists] = useState({});

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
      img.onload = () => setImageExists(prev => ({ ...prev, [folder]: true }));
      img.onerror = () => setImageExists(prev => ({ ...prev, [folder]: false }));
      img.src = `/images/${folder}/only.jpeg`;
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

  const getSettingValue = (label) => settings.find(s => s.label === label)?.text || '';
  const getDates = (label) => settings.find(s => s.label === label)?.dates || [];
  const show = (label) => settings.find(s => s.label === label)?.show;

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
    const sortedLayout = [...layout].sort((a, b) => a["優先順位"] - b["優先順位"]);
    const grid = [], rowSize = 4;
    let currentRow = [], imagePosition = 0;
    const sizeMap = { A: { width: 4, height: 4 }, B: { width: 2, height: 4 }, C: { width: 4, height: 2 }, D: { width: 2, height: 2 } };

    sortedLayout.forEach((item, i) => {
      const { サイズ, ファイル名, カテゴリー } = item;
      const { width, height } = sizeMap[サイズ] || sizeMap.D;
      const path = `/images/${カテゴリー}/${ファイル名}`;
      currentRow.push(
        <div key={`${i}_${ファイル名}`} className={`col-span-${width} row-span-${height}`}>
          <Image
            src={path}
            alt={ファイル名}
            width={width * 90}
            height={height * 90}
            unoptimized
            onClick={() => toggleMemo(ファイル名)}
            className={`cursor-pointer border ${shoppingMemo.includes(ファイル名) ? 'border-red-500' : 'border-transparent'}`}
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

  // --- Tokubai Buttons Rendering Function (★ Modified) ---
  const renderTokubaiButtons = () => {
    // Get button info to display
    const buttons = [1, 2, 3, 4].map(n => {
      const label = `特売日ボタン${n}`;
      if (!show(label)) return null;
      return {
        folder: `D${n}`,
        dates: getDates(label)
      };
    }).filter(Boolean);

    // If no buttons to display, render nothing
    if (buttons.length === 0) {
      return null;
    }

    // Determine if images should be used
    const useImages = buttons.some(btn => imageExists[btn.folder]);

    // ★ Removed widthMap and buttonWidth calculation

    // ★ Adjusted container margin and gap
    return (
      // Use flex container to distribute space
      <div className="flex justify-center items-stretch gap-1 mb-1 w-full"> {/* items-stretch ensures buttons fill height */}
        {buttons.map(({ folder, dates }) => (
          <div
            key={folder}
            // ★ Use flex-1 for responsive width, h-[80px] for fixed height
            // Removed inline style for width
            onClick={() => toggleMemo(folder)}
            className="cursor-pointer flex-1 h-[80px] flex items-center justify-center flex-shrink-0" // flex-1 is key for responsiveness
          >
            {useImages ? (
              <Image
                src={`/images/${folder}/only.jpeg`}
                alt={folder}
                // Use layout="fill" and object-contain/object-fit for responsive images within the container
                // Or set width/height to 100% conceptually via Tailwind classes
                width={500} // Provide large base width for quality
                height={80} // Fixed height
                unoptimized
                // ★ Adjust className for image display within flex item
                className="object-contain w-full h-full" // Fill container, maintain aspect ratio
                // Consider 'object-fill' if stretching is acceptable/desired
              />
            ) : (
              // Text display (adjusted for flex container)
              <div className="text-center w-full p-1 overflow-hidden flex flex-col justify-center items-center h-full">
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

  // --- Main JSX Rendering (Adjusted margins) ---
  return (
    // max-w-md limits the overall width on larger screens. Remove or adjust if needed for native app context.
    <div className="max-w-md mx-auto p-4">
      {/* Header (No changes) */}
      <div className="text-center">
        {imageExists['hed'] ? (
          <Image
            src="/images/hed/only.jpeg"
            alt="header"
            width={400}
            height={150}
            unoptimized
          />
        ) : (
          <h1 className="text-2xl font-bold mt-2">{getSettingValue('ブランドタイトル')}</h1>
        )}
      </div>

      {/* Store Info & Period (Adjusted margin) */}
      {show('店舗名') && (
        <div className="text-center my-1"> {/* Adjusted vertical margin */}
          <h2 className="text-xl font-bold">{getSettingValue('店舗名')}</h2>
          {show('住所') && <p className="text-sm">{getSettingValue('住所')}</p>}
          {show('チラシ有効期間（開始）') && (
            <p className="text-sm text-gray-600">{formatPeriod()}</p>
          )}
        </div>
      )}

      {/* ★ Render Responsive Tokubai Buttons */}
      {renderTokubaiButtons()}

      {/* Other Buttons (Adjusted margin) */}
      <div className="flex flex-wrap justify-center gap-2 my-4"> {/* Adjusted vertical margin */}
        {['S1', 'S2'].map((folder, i) => {
          const label = getSettingValue(`企画ボタン${i + 1}`);
          if (!show(`企画ボタン${i + 1}`)) return null;
          return (
            <div key={folder} className="text-center">
              {imageExists[folder] ? (
                <Image
                  src={`/images/${folder}/only.jpeg`}
                  alt={folder}
                  width={120}
                  height={50}
                  unoptimized
                  onClick={() => toggleMemo(folder)}
                  className="cursor-pointer"
                />
              ) : (
                <button
                  className="bg-pink-500 text-white rounded px-2 py-1"
                  onClick={() => toggleMemo(folder)}
                >
                  {label}
                </button>
              )}
            </div>
          );
        })}
        {['おススメボタン', 'クーポンボタン'].map(labelKey => {
          const label = getSettingValue(labelKey);
          if (!show(labelKey)) return null;
          return (
            <div key={labelKey} className="text-center">
              <button
                className="bg-green-500 text-white rounded px-2 py-1"
                onClick={() => toggleMemo(labelKey)}
              >
                {label}
              </button>
            </div>
          );
        })}
      </div>

      {/* Grid Layout (No changes) */}
      {generateGridLayout(layout)}
    </div>
  );
};

export default Flyer;
