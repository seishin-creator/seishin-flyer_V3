// 修正済み general.js（表示/非表示制御＋注意文の位置調整）
import { useState, useRef, useEffect } from 'react';
import DatePicker from "react-multi-date-picker";
import Image from 'next/image';

const initialSettings = [
  { label: 'ブランドタイトル', text: '', show: null, folder: true, path: 'hed' },
  { label: '店舗名', text: '', show: true, folder: false },
  { label: '住所', text: '', show: true, folder: false },
  { label: 'チラシ有効期間（開始）', text: '', show: true, folder: false, type: 'date' },
  { label: 'チラシ有効期間（終了）', text: '', show: null, folder: false, type: 'date' },
  { label: '特売日ボタン1', dates: [], show: true, folder: true, path: 'D1', type: 'multi-date' },
  { label: '特売日ボタン2', dates: [], show: true, folder: true, path: 'D2', type: 'multi-date' },
  { label: '特売日ボタン3', dates: [], show: true, folder: true, path: 'D3', type: 'multi-date' },
  { label: '特売日ボタン4', dates: [], show: true, folder: true, path: 'D4', type: 'multi-date' },
  { label: '企画ボタン1', text: '', show: true, folder: true, path: 'S1' },
  { label: '企画ボタン2', text: '', show: true, folder: true, path: 'S2' },
  { label: 'おススメボタン', text: '', show: true, folder: false, clickable: true },
  { label: 'クーポンボタン', text: '', show: true, folder: false, clickable: true },
  { label: 'クーポン画像', text: null, show: null, folder: true, path: 'coupon' }
];

export default function GeneralSettings() {
  const [settings, setSettings] = useState(initialSettings);
  const [uploadStatus, setUploadStatus] = useState({});
  const fileInputs = useRef({});
  const fileBuffers = useRef({});

  useEffect(() => {
    fetch('/data/settings.json')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        const thumbnails = {};
        data.forEach((item) => {
          if (item.folder && item.path) {
            thumbnails[item.path] = `/images/${item.path}/only.jpeg`;
          }
        });
        setUploadStatus(thumbnails);
      })
      .catch(() => console.warn("設定読み込み失敗"));
  }, []);

  const handleTextChange = (index, value) => {
    const updated = [...settings];
    updated[index].text = value;
    setSettings(updated);
  };

  const handleDateChange = (index, dateArray) => {
    if (dateArray.length > 1) {
      alert("特売日は1日のみ選択可能です");
      const limitedDates = [dateArray[0]];
      const updated = [...settings];
      updated[index].dates = limitedDates;
      setSettings(updated);
    } else {
      const updated = [...settings];
      updated[index].dates = dateArray;
      setSettings(updated);
    }
  };

  const handleSingleDateChange = (index, value) => {
    const updated = [...settings];
    updated[index].text = value;
    setSettings(updated);
  };

  const handleToggle = (index) => {
    const updated = [...settings];
    updated[index].show = !updated[index].show;
    setSettings(updated);
  };

  const handleFileChange = async (path, files) => {
    const file = files[0];
    if (!file) return;
    fileBuffers.current[path] = file;

    const formData = new FormData();
    formData.append('target', path);
    formData.append('files', file);

    try {
      await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      setUploadStatus((prev) => ({
        ...prev,
        [path]: `/images/${path}/only.jpeg?${Date.now()}`
      }));
    } catch (err) {
      console.error("アップロード失敗", err);
    }
  };

  const handleDelete = async (path) => {
    if (!window.confirm("本当に削除しますか？")) return;

    try {
      const res = await fetch('/api/deleteImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: path })
      });

      const result = await res.json();
      if (res.ok) {
        fileInputs.current[path].value = null;
        delete fileBuffers.current[path];
        setUploadStatus((prev) => {
          const updated = { ...prev };
          delete updated[path];
          return updated;
        });
      } else {
        alert(`削除失敗: ${result.message}`);
      }
    } catch (err) {
      alert("削除処理中にエラーが発生しました");
      console.error(err);
    }
  };

  const handleDownload = (path) => {
    const url = `/images/${path}/only.jpeg`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${path}_only.jpeg`;
    link.click();
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/saveSettings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const result = await res.json();
      alert(result.message || '保存完了');
    } catch (error) {
      console.error('保存失敗:', error);
      alert('保存に失敗しました');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">一般設定</h1>
      <table className="w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">設定項目</th>
            <th className="border px-4 py-2">入力</th>
            <th className="border px-4 py-2">表示/非表示</th>
            <th className="border px-4 py-2">画像アップロード</th>
            <th className="border px-4 py-2">サムネイル</th>
            <th className="border px-4 py-2">DL</th>
          </tr>
        </thead>
        <tbody>
          {settings.map((item, index) => (
            <tr key={index}>
              <td className="border px-4 py-2 font-semibold whitespace-nowrap">{item.label}</td>
              <td className="border px-4 py-2">
                {item.text === null ? null : item.type === 'date' ? (
                  <DatePicker
                    value={item.text}
                    onChange={(value) => handleSingleDateChange(index, value?.format("YYYY-MM-DD"))}
                    format="YYYY-MM-DD"
                    className="w-full"
                  />
                ) : item.type === 'multi-date' ? (
                  <DatePicker
                    multiple
                    value={item.dates[0] ? [item.dates[0]] : []}
                    onChange={(value) => handleDateChange(index, Array.isArray(value) ? value : [value])}
                    format="YYYY/MM/DD"
                    className="w-full"
                  />
                ) : (
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    className="w-full border px-2 py-1 rounded"
                  />
                )}
              </td>
              <td className="border px-4 py-2 text-center">
                {item.show !== null && item.label !== 'チラシ有効期間（終了）' && (
                  <input
                    type="checkbox"
                    checked={item.show}
                    onChange={() => handleToggle(index)}
                  />
                )}
              </td>
              <td className="border px-4 py-2 text-center align-top">
                {item.folder && item.path && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(item.path, e.target.files)}
                      ref={(el) => fileInputs.current[item.path] = el}
                      className="border px-2 py-1"
                    />
                    <div>
                      <button onClick={() => handleDelete(item.path)} className="text-red-500 text-sm hover:underline mt-1">削除</button>
                    </div>
                    {item.label === "特売日ボタン1" && (
                      <div className="text-left text-xs text-gray-700 mt-1 whitespace-pre-line">
                        特売日ボタンの画像について
                        {"\n"}≪ 推奨画像サイズ ≫
                        {"\n"}●天地：80px固定（必ず満たしてください）
                        {"\n"}●左右（目安）：
                        {"\n"}　・4個表示時：240px　・3個表示時：320px
                        {"\n"}　・2個表示時：480px　・1個表示時：960px
                        {"\n"}※サイズに関わらず横一列に配置され、天地80pxで中央揃えされます。
                        {"\n"}※天地が80px未満の画像は拡大、超過した画像は上下が見切れます。
                        {"\n"}≪ 表示ルール ≫
                        {"\n"}画像ボタンが1つでも設定されていると、全ボタン画像表示となります（日付表示は無視されます）。
                        {"\n"}カレンダー入力のボタンと画像ボタンの混在はできません。
                      </div>
                    )}
                  </>
                )}
              </td>
              <td className="border px-4 py-2 text-center">
                {item.folder && item.path && (
                  <Image
                    src={uploadStatus[item.path] || `/images/no-image.png`}
                    alt="サムネイル"
                    width={60}
                    height={40}
                    className="mx-auto border"
                    onError={(e) => { e.target.src = "/images/no-image.png"; }}
                  />
                )}
              </td>
              <td className="border px-4 py-2 text-center">
                {(item.folder && item.path && (
                  item.label.includes("ボタン") ||
                  item.label === "ブランドタイトル" ||
                  item.label === "クーポン画像"
                )) && (
                  <button
                    onClick={() => handleDownload(item.path)}
                    className="text-blue-600 hover:underline"
                  >
                    DL
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-center mt-6">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          保存
        </button>
      </div>
    </div>
  );
}
