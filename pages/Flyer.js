import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

const categories = [
  { key: "a", label: "肉" },
  { key: "b", label: "魚" },
  { key: "c", label: "野菜" },
  { key: "d", label: "特売" },
];

const Flyer = () => {
  const [storeName, setStoreName] = useState("");
  const [period, setPeriod] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("d");
  const [shoppingMemo, setShoppingMemo] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/getRuleData");
        const data = await res.json();
        setStoreName(data.storeName);
        setPeriod(data.period);
      } catch (error) {
        console.error("データの取得に失敗しました", error);
      }
    };
    fetchData();
  }, []);

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

  useEffect(() => {
    const savedMemo = JSON.parse(localStorage.getItem("shoppingMemo")) || [];
    setShoppingMemo(savedMemo);
  }, []);

  const toggleShoppingMemo = (file) => {
    const updatedMemo = shoppingMemo.includes(file)
      ? shoppingMemo.filter((item) => item !== file)
      : [...shoppingMemo, file];
    setShoppingMemo(updatedMemo);
    localStorage.setItem("shoppingMemo", JSON.stringify(updatedMemo));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <header style={{ flexShrink: 0 }}>
        <Image
          src="/images/hed/header.png"
          alt="ヘッダー"
          width={800}
          height={200}
          priority
          unoptimized
          style={{ objectFit: "contain", width: "100%" }}
        />
        <h2 style={{ textAlign: "center", fontSize: "20px", fontWeight: "bold", marginTop: "10px" }}>
          {storeName}
        </h2>
        <Image
          src="/images/Taitoru/Taitoru.jpg"
          alt="タイトル"
          width={800}
          height={100}
          priority
          unoptimized
          style={{ objectFit: "contain", width: "100%" }}
        />
        <p style={{ textAlign: "center", fontSize: "18px", fontWeight: "bold", marginTop: "10px", color: "#333" }}>
          {period}
        </p>

        {/* カテゴリ選択ボタン */}
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              style={{ margin: "5px", padding: "10px", fontSize: "16px" }}
            >
              {category.label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ flexGrow: 1, overflowY: "auto", padding: "10px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "10px",
          }}
        >
          {products.length > 0 ? (
            products.map((file, index) => (
              <div key={index} style={{ textAlign: "center" }}>
                <Image
                  src={file.toLowerCase()}
                  alt={file.split("/").pop().toLowerCase()}
                  width={200}
                  height={200}
                  priority
                  unoptimized
                  style={{ objectFit: "contain", maxWidth: "100%", height: "auto" }}
                />
                <button
                  onClick={() => toggleShoppingMemo(file)}
                  style={{ marginTop: "5px", padding: "5px 10px", fontSize: "14px" }}
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

      <footer
        style={{
          backgroundColor: "#f8f8f8",
          padding: "10px",
          textAlign: "center",
          borderTop: "1px solid #ddd",
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          zIndex: 50,
        }}
      >
        <button onClick={() => router.push("/Route")} style={{ margin: "0 10px", padding: "10px 20px" }}>
          ルート
        </button>
        <button onClick={() => window.open("/Coupon", "_blank")} style={{ margin: "0 10px", padding: "10px 20px" }}>
          クーポン
        </button>
        <button onClick={() => window.open("/ShoppingMemo", "_blank")} style={{ margin: "0 10px", padding: "10px 20px" }}>
          買物メモ
        </button>
      </footer>
    </div>
  );
};

export default Flyer;




