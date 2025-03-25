import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

const Route = () => {
  const [storeNames, setStoreNames] = useState([]);
  const [storeAddresses, setStoreAddresses] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/getRuleData");
        const data = await res.json();

        if (data.storeNames && data.storeAddresses) {
          setStoreNames(data.storeNames);
          setStoreAddresses(data.storeAddresses);
        } else {
          alert("店舗情報の取得に失敗しました");
        }
      } catch (error) {
        console.error("店舗データ取得エラー:", error);
        alert("データの取得に失敗しました");
      }
    };

    fetchData();
  }, []);

  const handleSelectStore = (index) => {
    const address = storeAddresses[index];
    if (!address) {
      alert("店舗の住所が取得できませんでした。");
      return;
    }

    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(mapsUrl, "_blank");
  };

  return (
    <div 
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        height: "100vh", 
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h2>どちらのお店に行きますか？</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: storeNames.length > 4 ? "repeat(2, 1fr)" : "repeat(1, 1fr)",
          gap: "15px",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        {storeNames.map((name, index) => (
          <button
            key={index}
            onClick={() => handleSelectStore(index)}
            style={{
              width: "200px",
              height: "100px",
              border: "none",
              cursor: "pointer",
              backgroundColor: "#fff",
              padding: "5px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: "bold",
              borderRadius: "8px",
              boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Image
              src={`/images/mapbutton/${name}.jpg`}
              alt={name}
              width={180}
              height={90}
              style={{ objectFit: "contain", maxWidth: "100%", height: "auto" }}
            />
          </button>
        ))}
      </div>

      {/* 閉じるボタン */}
      <div style={{ marginTop: '30px' }}>
        <button
          onClick={() => router.push('/Flyer')}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#f00',
            color: '#fff',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default Route;
