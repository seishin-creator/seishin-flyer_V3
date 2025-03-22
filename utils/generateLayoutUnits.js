// utils/generateLayoutUnits.js

export const extractSize = (filename) => {
    const match = filename.toUpperCase().match(/_([ABCD])_/);
    return match ? match[1] : null;
  };
  
  export const extractOrder = (filename) => {
    const matches = [...filename.matchAll(/_(\d+)\./g)].map(m => parseInt(m[1], 10));
    if (matches.length === 0) return Infinity;
    const sum = matches.reduce((a, b) => a + b, 0);
    return sum / matches.length;
  };
  
  export const generateLayoutUnits = (files) => {
    const result = [];
    const used = new Set();
  
    const useFile = (f) => {
      used.add(f);
      return f;
    };
  
    const findNext = (type) =>
      files.find((f) => !used.has(f) && extractSize(f) === type);
  
    while (used.size < files.length) {
      const remaining = files.filter((f) => !used.has(f));
      if (remaining.length === 0) break;
  
      const file = remaining[0];
      const size = extractSize(file);
      const unit = [];
  
      if (size === "A") {
        unit.push(useFile(file));
      } else if (size === "B") {
        const b2 = findNext("B");
        if (b2 && b2 !== file) {
          unit.push(useFile(file), useFile(b2));
        } else {
          const d1 = findNext("D");
          const d2 = findNext("D");
          if (d1 && d2 && d1 !== d2) {
            unit.push(useFile(file), useFile(d1), useFile(d2));
          } else {
            unit.push(useFile(file));
          }
        }
      } else if (size === "C") {
        unit.push(useFile(file));
      } else if (size === "D") {
        const d2 = findNext("D");
        if (d2 && d2 !== file) {
          unit.push(useFile(file), useFile(d2));
        } else {
          unit.push(useFile(file));
        }
      } else {
        used.add(file); // 不明なサイズはスキップ
      }
  
      const order = unit.map(extractOrder).reduce((a, b) => a + b, 0) / unit.length;
      result.push({ unit, order });
    }
  
    return result.sort((a, b) => a.order - b.order);
  };
  