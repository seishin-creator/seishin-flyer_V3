import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

const SelectStore = () => {
  const [stores, setStores] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch('/api/getStoreData');
        const data = await res.json();
        setStores(data.stores || []);
      } catch (error) {
        console.error("店舗データの取得に失敗しました", error);
      }
    };

    fetchStores();
  }, []);

  // 店舗ボタンのクリック時にGoogleマップを開く
  const handleStoreSelect = (address) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>どちらのお店に行きますか？</h2>

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: stores.length > 4 ? 'repeat(2, 1fr)' : 'repeat(1, 1fr)', 
          gap: '10px', 
          justifyContent: 'center' 
        }}
      >
        {stores.map((store, index) => (
          <button 
            key={index} 
            onClick={() => handleStoreSelect(store.address)}
            style={{ border: 'none', background: 'none', padding: 0 }}
          >
            <Image 
              src={`/images/mapbutton/${store.name}.jpg`} 
              alt={store.name} 
              width={180} 
              height={100} 
              priority 
              unoptimized
              style={{ objectFit: 'contain', width: '100%' }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectStore;
