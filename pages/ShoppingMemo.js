import { useEffect, useState } from 'react';
import Image from 'next/image';

const ShoppingMemo = () => {
  const [shoppingMemo, setShoppingMemo] = useState([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const memo = JSON.parse(localStorage.getItem('shoppingMemo')) || [];
    const filtered = memo.filter(
      (f) =>
        f &&
        typeof f === 'string' &&
        !f.includes('tokubai') &&
        !f.includes('extracted')
    );
    console.log('🧾 shoppingMemo raw data:', filtered);
    setShoppingMemo(filtered);
  }, []);

  const sendEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('正しいメールアドレスを入力してください');
      return;
    }

    const memoText = shoppingMemo.join('\n');

    try {
      const response = await fetch('/api/sendMail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, memo: memoText }),
      });

      if (response.ok) {
        alert('買物メモを送信しました！');
      } else {
        alert('送信に失敗しました');
      }
    } catch (err) {
      console.error('送信エラー', err);
      alert('送信エラーが発生しました');
    }
  };

  const sizeMap = {
    A: { colSpan: 4, rowSpan: 4 },
    B: { colSpan: 2, rowSpan: 4 },
    C: { colSpan: 4, rowSpan: 2 },
    D: { colSpan: 2, rowSpan: 2 },
  };

  const extractSize = (file) => {
    const match = file.match(/_([ABCD])_/);
    return match ? match[1] : 'D';
  };

  const extractOrder = (file) => {
    const match = file.match(/_(\d+)\./);
    return match ? parseInt(match[1]) : Infinity;
  };

  const generateLayoutUnits = (files) => {
    const result = [];
    const used = new Set();
    const sorted = [...files].sort((a, b) => extractOrder(a) - extractOrder(b));

    for (let i = 0; i < sorted.length; i++) {
      if (used.has(sorted[i])) continue;

      const size = extractSize(sorted[i]);
      const unit = { files: [sorted[i]] };
      used.add(sorted[i]);

      if (size === 'B') {
        for (let j = i + 1; j < sorted.length; j++) {
          if (!used.has(sorted[j]) && extractSize(sorted[j]) === 'B') {
            unit.files.push(sorted[j]);
            used.add(sorted[j]);
            break;
          }
        }
      }

      result.push(unit);
    }

    return result;
  };

  const layoutUnits = generateLayoutUnits(shoppingMemo);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      maxWidth: '390px',
      margin: '0 auto',
      overflowX: 'hidden'
    }}>
      <header style={{ flexShrink: 0 }}>
        <Image
          src="/images/ShoppingMemohed/ShoppingMemo_hed.jpeg"
          alt="買物メモヘッダー"
          width={800}
          height={200}
          priority
          unoptimized
          style={{ objectFit: 'contain', width: '100%' }}
        />
      </header>

      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
        {layoutUnits.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '5px',
              paddingBottom: '60px',
            }}
          >
            {layoutUnits.map((unit, index) =>
              unit.files.map((file, i) => {
                const size = extractSize(file);
                const { colSpan, rowSpan } = sizeMap[size];
                const folder = file.split('_')[0];
                const imagePath = `/images/${folder}/${file}`;

                return (
                  <div
                    key={`${index}_${i}`}
                    style={{
                      gridColumn: `span ${colSpan}`,
                      gridRow: `span ${rowSpan}`,
                      textAlign: 'center',
                      position: 'relative',
                    }}
                  >
                    <Image
                      src={imagePath}
                      alt={file}
                      width={colSpan * 90}
                      height={rowSpan * 90}
                      priority
                      unoptimized
                      style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <p style={{ textAlign: 'center' }}>買物メモは空です</p>
        )}
      </div>
    </div>
  );
};

export default ShoppingMemo;
