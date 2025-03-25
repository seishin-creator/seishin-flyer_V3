import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

const Flyer = () => {
    const [storeNames, setStoreNames] = useState([]);
    const [period, setPeriod] = useState('');
    const [layout, setLayout] = useState([]);
    const [dailyButtons, setDailyButtons] = useState([]);
    const [specialButtons, setSpecialButtons] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('S2');
    const [shoppingMemo, setShoppingMemo] = useState([]);

    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/getRuleData');
                const data = await res.json();
                setStoreNames(data.storeNames || []);
                setPeriod(data.period || '');
            } catch (error) {
                console.error("データの取得に失敗しました", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchButtons = async () => {
            try {
                const res = await fetch('/api/getButtonDatas');
                const data = await res.json();
                setDailyButtons(data.dailyButtons || []);
                setSpecialButtons(data.specialButtons || []);
            } catch (error) {
                console.error("ボタン画像の取得に失敗しました", error);
            }
        };
        fetchButtons();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            const fetchImages = async () => {
                try {
                    const res = await fetch(`/api/getProductImages?category=${selectedCategory}`);
                    const data = await res.json();
                    setLayout(data.layout || []);
                } catch (error) {
                    console.error("画像の取得に失敗しました", error);
                }
            };
            fetchImages();
        }
    }, [selectedCategory]);

    useEffect(() => {
        const savedMemo = JSON.parse(localStorage.getItem('shoppingMemo')) || [];
        setShoppingMemo(savedMemo);
    }, []);

    const toggleMemo = (fileName) => {
        let updatedMemo;
        if (shoppingMemo.includes(fileName)) {
            updatedMemo = shoppingMemo.filter(item => item !== fileName);
        } else {
            updatedMemo = [...shoppingMemo, fileName];
        }
        setShoppingMemo(updatedMemo);
        localStorage.setItem('shoppingMemo', JSON.stringify(updatedMemo));
    };

    const generateGridLayout = (layout) => {
        if (layout.length === 0) return [];

        const sortedLayout = [...layout].sort((a, b) => a["優先順位"] - b["優先順位"]);

        const grid = [];
        const rowSize = 4;
        let currentRow = [];

        const sizeMapping = {
            "A": { width: 4, height: 4 },
            "B": { width: 2, height: 4 },
            "C": { width: 4, height: 2 },
            "D": { width: 2, height: 2 }
        };

        let imagePositions = [];

        sortedLayout.forEach((item) => {
            const { サイズ, ファイル名 } = item;
            const { width, height } = sizeMapping[サイズ];

            if (currentRow.length >= rowSize) {
                grid.push(currentRow);
                currentRow = [];
            }

            imagePositions.push({
                ファイル名,
                colSpan: width,
                rowSpan: height
            });

            currentRow.push(ファイル名);
        });

        if (currentRow.length > 0) {
            grid.push(currentRow);
        }

        return imagePositions;
    };

    const arrangedImages = generateGridLayout(layout);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '390px', margin: '0 auto', overflowX: 'hidden' }}>
            <header style={{ flexShrink: 0 }}>
                <Image src="/images/hed/header.png" alt="ヘッダー" width={800} height={200} priority unoptimized style={{ objectFit: 'contain', width: '100%' }} />

                <div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold', marginTop: '5px', color: '#333' }}>
                    {storeNames.map((name, index) => (
                        <span key={index}>{name} {(index + 1) % 4 === 0 ? <br /> : '\u3000'}</span>
                    ))}
                </div>

                {/* ✅ 期間表示を追加（センター揃え） */}
                {period && (
                    <div style={{ textAlign: 'center', fontSize: '14px', marginTop: '2px', color: '#666' }}>
                        {period}
                    </div>
                )}

                {/* ✅ ボタン間の余白縮小 */}
                <div style={{ textAlign: 'center', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2px' }}>
                        {dailyButtons.map((file, index) => (
                            <Image key={index} src={`/images/dailybutton/${file}`} alt={file} width={85} height={40} priority unoptimized onClick={() => setSelectedCategory(`D${index + 1}`)} style={{ cursor: 'pointer' }} />
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2px', gap: '2px' }}>
                        {specialButtons.map((file, index) => (
                            <Image key={index} src={`/images/specialbutton/${file}`} alt={file} width={115} height={40} priority unoptimized onClick={() => setSelectedCategory(`S${index + 1}`)} style={{ cursor: 'pointer' }} />
                        ))}
                    </div>
                </div>
            </header>

            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px', paddingBottom: '60px' }}>
                {arrangedImages.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => toggleMemo(item.ファイル名)}
                        style={{
                            gridColumn: `span ${item.colSpan}`,
                            gridRow: `span ${item.rowSpan}`,
                            textAlign: 'center',
                            position: 'relative',
                            cursor: 'pointer',
                            opacity: shoppingMemo.includes(item.ファイル名) ? 0.6 : 1
                        }}
                    >
                        <Image
                            src={`/images/${selectedCategory}/${item.ファイル名}`}
                            alt={item.ファイル名}
                            width={item.colSpan * 90}
                            height={item.rowSpan * 90}
                            priority
                            unoptimized
                            style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
                        />
                        {shoppingMemo.includes(item.ファイル名) && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                padding: '5px 10px',
                                borderRadius: '8px'
                            }}>
                                買物予定
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <footer style={{
                backgroundColor: '#f8f8f8',
                padding: '10px',
                textAlign: 'center',
                borderTop: '1px solid #ddd',
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                zIndex: 50
            }}>
                <button onClick={() => window.open('/Route', '_blank')} style={{ margin: '0 5px', padding: '8px 15px' }}>ルート</button>
                <button onClick={() => window.open('/Coupon', '_blank')} style={{ margin: '0 5px', padding: '8px 15px' }}>クーポン</button>
                <button onClick={() => window.open('/ShoppingMemo', '_blank')} style={{ margin: '0 5px', padding: '8px 15px' }}>買物メモ</button>
            </footer>
        </div>
    );
};

export default Flyer;
