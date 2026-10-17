import * as THREE from "three";

/**
 * 程序化生成高解析實木木紋貼圖（北美黑胡桃木、北美白橡木、台灣黃檜）
 */
function createWoodTexture(baseHex: string, grainHex: string, scale = 1): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = grainHex;
  ctx.globalAlpha = 0.24;
  for (let i = 0; i < 150; i++) {
    const y = (i / 150) * 512;
    ctx.lineWidth = (1 + (i % 3)) * scale;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) {
      const wave = Math.sin(x * 0.015 + i * 0.42) * 6 * scale;
      ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * 專為「7 尺實木電視櫃 (寬 212 cm / 7.0 台尺)」打造的三款高精度 3D 結構模型：
 * 1. preset:tv-floor-7ft    — 【主推款】7 尺北美黑胡桃木 × 白橡木橫柵燕尾榫落地電視櫃（含第5支中置防垂腳、格柵透氣門、檜木雙抽、走線槽）
 * 2. preset:tv-floating-7ft — 【懸空款】7 尺北美白橡木懸空壁掛極簡電視櫃（含法式斜劈重型吊掛橫條、下掀門緩衝桿、機上盒內格）
 * 3. preset:tv-tambour-7ft  — 【圓弧款】7 尺日式白橡木 × 台灣檜木直柵捲門電視櫃（含圓弧側板、直紋格柵門、內部活動隔板）
 */
export function buildProceduralWoodModel(presetId: string): THREE.Group {
  const root = new THREE.Group();

  const walnutTex = createWoodTexture("#5c3d28", "#321d10", 1.15);
  const oakTex = createWoodTexture("#cfa372", "#94663b", 1.0);
  const hinokiTex = createWoodTexture("#e3c696", "#b5915b", 0.8);

  const walnutMat = new THREE.MeshStandardMaterial({
    map: walnutTex,
    roughness: 0.42,
    metalness: 0.03,
    side: THREE.DoubleSide,
  });
  const oakMat = new THREE.MeshStandardMaterial({
    map: oakTex,
    roughness: 0.48,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  const hinokiMat = new THREE.MeshStandardMaterial({
    map: hinokiTex,
    roughness: 0.54,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.26,
    metalness: 0.85,
    side: THREE.DoubleSide,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x9aa2ad,
    roughness: 0.3,
    metalness: 0.8,
    side: THREE.DoubleSide,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x2c3036,
    roughness: 0.45,
    metalness: 0.7,
    side: THREE.DoubleSide,
  });

  const addBox = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.Material,
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat.clone());
    mesh.position.set(x, y, z);
    root.add(mesh);
    return mesh;
  };

  // ============================================================================
  // 款式 B：7 尺北美白橡木懸空壁掛極簡電視櫃 (212 cm / 7.0 台尺 × 深 42 cm × 高 36 cm)
  // ============================================================================
  if (presetId === "preset:tv-floating-7ft") {
    const W = 3.6, H = 0.62, D = 0.72, T = 0.055;
    // 頂板、底板、左右側板 (6分板 18mm + 45度斜接)
    addBox(W, T, D, 0, H / 2 - T / 2, 0, oakMat);
    addBox(W, T, D, 0, -H / 2 + T / 2, 0, oakMat);
    addBox(T, H, D, -W / 2 + T / 2, 0, 0, oakMat);
    addBox(T, H, D, W / 2 - T / 2, 0, 0, oakMat);

    // 頂部後方檯面黑胡桃木出線毛刷蓋板
    addBox(0.65, T + 0.008, 0.09, 0, H / 2 - T / 2 + 0.004, -D / 2 + 0.11, walnutMat);

    // 內部三等分立板 (左影音倉、中置 Soundbar 與抽屜倉、右遊戲機倉)
    addBox(T, H - T * 2, D - 0.08, -0.62, 0, -0.02, hinokiMat);
    addBox(T, H - T * 2, D - 0.08, 0.62, 0, -0.02, hinokiMat);

    // 背部 6分 (18mm) 法式斜劈重型壁掛結構樑 (French Cleat) + 背板
    addBox(W - T * 2, H - T * 2, 0.03, 0, 0, -D / 2 + 0.06, hinokiMat);
    addBox(W - 0.2, 0.14, 0.045, 0, 0.14, -D / 2 + 0.022, walnutMat);

    // 左右倉內部活動隔板 + 下掀式緩衝連桿 (Soft-close Flap Stay)
    addBox(1.08, 0.04, D - 0.14, -1.19, -0.02, -0.02, hinokiMat);
    addBox(1.08, 0.04, D - 0.14, 1.19, -0.02, -0.02, hinokiMat);
    addBox(0.025, 0.28, 0.22, -0.7, 0.02, 0.16, steelMat);
    addBox(0.025, 0.28, 0.22, 0.7, 0.02, 0.16, steelMat);

    // 中央：上方開放式 Soundbar 格 + 下方無把手斜角抽屜
    addBox(1.18, 0.04, D - 0.1, 0, 0.03, -0.01, oakMat);
    addBox(1.12, 0.22, D - 0.18, 0, -0.14, 0.0, hinokiMat);
    addBox(1.17, 0.25, 0.045, 0, -0.14, D / 2 - 0.02, walnutMat);

    // 左右兩側無把手 45° 斜切白橡木門片
    addBox(1.12, H - T * 2 - 0.02, 0.045, -1.19, 0, D / 2 - 0.02, oakMat);
    addBox(1.12, H - T * 2 - 0.02, 0.045, 1.19, 0, D / 2 - 0.02, oakMat);
    return root;
  }

  // ============================================================================
  // 款式 C：7 尺日式白橡木 × 台灣檜木直柵圓弧電視櫃
  // ============================================================================
  if (presetId === "preset:tv-tambour-7ft") {
    const W = 3.6, H = 0.86, D = 0.76, T = 0.055;
    const bodyY = 0.12;
    const bodyH = 0.58;

    addBox(W - 0.2, T, D, 0, bodyY + bodyH / 2 - T / 2, 0, oakMat);
    addBox(W - 0.2, T, D, 0, bodyY - bodyH / 2 + T / 2, 0, oakMat);
    addBox(T, bodyH, D, -W / 2 + 0.1, bodyY, 0, oakMat);
    addBox(T, bodyH, D, W / 2 - 0.1, bodyY, 0, oakMat);
    addBox(W - 0.3, bodyH - T * 2, 0.03, 0, bodyY, -D / 2 + 0.05, hinokiMat);

    // 中間兩道立板與內部檜木層板
    addBox(T, bodyH - T * 2, D - 0.08, -0.58, bodyY, -0.01, hinokiMat);
    addBox(T, bodyH - T * 2, D - 0.08, 0.58, bodyY, -0.01, hinokiMat);
    addBox(1.06, 0.04, D - 0.14, -1.14, bodyY, -0.02, hinokiMat);
    addBox(1.06, 0.04, D - 0.14, 1.14, bodyY, -0.02, hinokiMat);
    addBox(1.1, 0.04, D - 0.12, 0, bodyY + 0.02, -0.01, hinokiMat);

    // 直向格柵門條 (Tambour Slats)
    for (let sx = -1.62; sx <= -0.64; sx += 0.065) {
      addBox(0.042, bodyH - T * 2 - 0.02, 0.035, sx, bodyY, D / 2 - 0.02, walnutMat);
    }
    for (let sx = 0.64; sx <= 1.62; sx += 0.065) {
      addBox(0.042, bodyH - T * 2 - 0.02, 0.035, sx, bodyY, D / 2 - 0.02, walnutMat);
    }
    addBox(0.03, 0.16, 0.05, -0.7, bodyY, D / 2 + 0.01, brassMat);
    addBox(0.03, 0.16, 0.05, 0.7, bodyY, D / 2 + 0.01, brassMat);

    // 五支圓柱實木腳（含中央第 5 支防下垂支撐腳）
    [
      [-1.52, -0.34, -0.26],
      [-1.52, -0.34, 0.26],
      [1.52, -0.34, -0.26],
      [1.52, -0.34, 0.26],
      [0.0, -0.34, 0.0],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.034, 0.36, 20), oakMat.clone());
      leg.position.set(lx, ly, lz);
      root.add(leg);
    });
    return root;
  }

  // ============================================================================
  // 預設主推款 A (preset:tv-floor-7ft)：
  // 7 尺北美黑胡桃木 × 白橡木橫柵燕尾榫落地電視櫃
  // 實際規格：寬 212 cm (7.0 台尺) × 深 45 cm (1.5 台尺) × 高 50 cm (1.65 台尺)
  // ============================================================================
  const W = 3.6;      // 對應 212 cm (7.0 台尺)
  const bodyH = 0.58; // 櫃桶高 34 cm (含腳座總高 50 cm / 1.65 台尺)
  const D = 0.78;     // 對應 45 cm (1.5 台尺)
  const T = 0.058;    // 對應 6分半 (20mm) 足厚北美黑胡桃木實木拼板
  const bodyY = 0.12;

  // 1. 櫃體外框：頂板、底板、左右側板 (北美 FAS 級黑胡桃木)
  addBox(W, T, D, 0, bodyY + bodyH / 2 - T / 2, 0, walnutMat);
  addBox(W, T, D, 0, bodyY - bodyH / 2 + T / 2, 0, walnutMat);
  addBox(T, bodyH, D, -W / 2 + T / 2, bodyY, 0, walnutMat);
  addBox(T, bodyH, D, W / 2 - T / 2, bodyY, 0, walnutMat);

  // 2. 兩側頂角手工半隱燕尾榫跳色榫頭 (白橡木 × 黑胡桃木咬合細節)
  [-0.26, -0.08, 0.1, 0.28].forEach((dz) => {
    addBox(0.065, 0.062, 0.08, -W / 2 + 0.03, bodyY + bodyH / 2 - 0.028, dz, oakMat);
    addBox(0.065, 0.062, 0.08, W / 2 - 0.03, bodyY + bodyH / 2 - 0.028, dz, oakMat);
  });

  // 3. 頂板後方中央：黑胡桃木隱藏式走線毛刷線槽蓋 (方便電視電源線與 HDMI 穿入)
  addBox(0.58, T + 0.01, 0.085, 0, bodyY + bodyH / 2 - T / 2 + 0.005, -D / 2 + 0.1, darkMetalMat);

  // 4. 內部兩道 6分 (18mm) 結構中立板 (將 7 尺櫃體分為左、中、右三區)
  const divX = 0.62;
  addBox(0.05, bodyH - T * 2, D - 0.06, -divX, bodyY, -0.01, oakMat);
  addBox(0.05, bodyH - T * 2, D - 0.06, divX, bodyY, -0.01, oakMat);

  // 5. 背板：內退 2cm 嵌入溝槽的台灣檜木背板 + 左右機櫃散熱透氣圓孔/長槽
  addBox(1.08, bodyH - T * 2, 0.025, -1.18, bodyY, -D / 2 + 0.045, hinokiMat);
  addBox(1.18, bodyH - T * 2, 0.025, 0, bodyY, -D / 2 + 0.045, hinokiMat);
  addBox(1.08, bodyH - T * 2, 0.025, 1.18, bodyY, -D / 2 + 0.045, hinokiMat);
  // 背板出線走線孔飾環
  addBox(0.28, 0.09, 0.04, -1.18, bodyY - 0.1, -D / 2 + 0.045, darkMetalMat);
  addBox(0.32, 0.09, 0.04, 0, bodyY + 0.12, -D / 2 + 0.045, darkMetalMat);
  addBox(0.28, 0.09, 0.04, 1.18, bodyY - 0.1, -D / 2 + 0.045, darkMetalMat);

  // 6. 左右兩倉：內部活動隔板 + Blum 110° 緩衝西德鉸鏈 + 北美白橡木橫柵透氣紅外線門片
  addBox(1.06, 0.038, D - 0.14, -1.18, bodyY - 0.01, -0.02, hinokiMat);
  addBox(1.06, 0.038, D - 0.14, 1.18, bodyY - 0.01, -0.02, hinokiMat);

  // Blum 緩衝西德鉸鏈五金示意塊 (開啟 Z 軸剖面時清晰可見)
  [bodyY + 0.14, bodyY - 0.14].forEach((hy) => {
    addBox(0.045, 0.08, 0.075, -W / 2 + T + 0.02, hy, D / 2 - 0.09, steelMat);
    addBox(0.045, 0.08, 0.075, W / 2 - T - 0.02, hy, D / 2 - 0.09, steelMat);
  });

  // 左右兩扇「實木橫柵透氣視聽門片」(由上下門框 + 6 道實木格柵條構成，真正留有透氣與遙控器紅外線穿透縫隙)
  [-1.18, 1.18].forEach((doorCenterX, idx) => {
    const doorW = 1.08;
    const doorZ = D / 2 - 0.022;
    // 左右直立門框
    addBox(0.06, bodyH - T * 2 - 0.02, 0.04, doorCenterX - doorW / 2 + 0.03, bodyY, doorZ, oakMat);
    addBox(0.06, bodyH - T * 2 - 0.02, 0.04, doorCenterX + doorW / 2 - 0.03, bodyY, doorZ, oakMat);
    // 6 道橫向實木格柵條 (Slats)
    for (let s = -2.5; s <= 2.5; s += 1) {
      addBox(doorW - 0.02, 0.048, 0.042, doorCenterX, bodyY + s * 0.078, doorZ + 0.004, oakMat);
    }
    // 實心黃銅門把
    const handleX = idx === 0 ? doorCenterX + doorW / 2 - 0.09 : doorCenterX - doorW / 2 + 0.09;
    addBox(0.032, 0.14, 0.055, handleX, bodyY + 0.02, doorZ + 0.032, brassMat);
  });

  // 7. 中央區域：上方開放式 Soundbar / 機上盒層架 + 下方 5分板 (15mm) 台灣檜木大抽屜 + Blum 緩衝滑軌
  addBox(1.19, 0.042, D - 0.09, 0, bodyY + 0.04, -0.01, walnutMat);
  // 內部台灣檜木抽屜盒 (開啟 Z 軸剖面可見)
  addBox(1.1, 0.21, D - 0.18, 0, bodyY - 0.12, -0.02, hinokiMat);
  // 兩側奧地利 Blum 隱藏式三節緩衝滑軌
  addBox(0.028, 0.04, D - 0.16, -0.57, bodyY - 0.16, -0.01, steelMat);
  addBox(0.028, 0.04, D - 0.16, 0.57, bodyY - 0.16, -0.01, steelMat);
  // 抽屜胡桃木面板 + 實心黃銅長拉手
  addBox(1.18, 0.23, 0.042, 0, bodyY - 0.12, D / 2 - 0.022, walnutMat);
  addBox(0.28, 0.032, 0.055, 0, bodyY - 0.11, D / 2 + 0.015, brassMat);

  // 8. 底部實木承重底框 + 4 支斜角實木腳 + 中置第 5 支防下垂可調式支撐腳 (7 尺長跨距關鍵結構)
  addBox(W - 0.16, 0.065, D - 0.18, 0, -0.2, 0, walnutMat);
  const legCoords = [
    [-1.62, -0.36, -0.28],
    [-1.62, -0.36, 0.28],
    [1.62, -0.36, -0.28],
    [1.62, -0.36, 0.28],
  ];
  legCoords.forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.032, 0.34, 20), walnutMat.clone());
    leg.position.set(lx, ly, lz);
    root.add(leg);
    // 黃銅防潮腳套
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.031, 0.06, 20), brassMat.clone());
    cap.position.set(lx, ly - 0.15, lz);
    root.add(cap);
  });

  // 中置第 5 支防下垂支撐腳 + 水平微調螺母
  const centerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.038, 0.34, 20), walnutMat.clone());
  centerLeg.position.set(0, -0.36, 0);
  root.add(centerLeg);
  const leveler = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 20), brassMat.clone());
  leveler.position.set(0, -0.51, 0);
  root.add(leveler);

  return root;
}
