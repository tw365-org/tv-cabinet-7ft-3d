export type WoodCategory = "timber" | "hardware" | "joinery" | "finish" | "dimension";

export const WOOD_CATEGORIES: Record<
  WoodCategory,
  { label: string; icon: string; color: string; badgeBg: string }
> = {
  timber: {
    label: "木材 / 板材",
    icon: "🪵",
    color: "#d48846",
    badgeBg: "rgba(212, 136, 70, 0.16)",
  },
  hardware: {
    label: "五金配件",
    icon: "🔩",
    color: "#4a82bd",
    badgeBg: "rgba(74, 130, 189, 0.16)",
  },
  joinery: {
    label: "榫卯 / 結構",
    icon: "🧩",
    color: "#529460",
    badgeBg: "rgba(82, 148, 96, 0.16)",
  },
  finish: {
    label: "塗裝 / 貼皮",
    icon: "🖌️",
    color: "#c9624c",
    badgeBg: "rgba(201, 98, 76, 0.16)",
  },
  dimension: {
    label: "尺寸 / 報價備註",
    icon: "📏",
    color: "#8b63b5",
    badgeBg: "rgba(139, 99, 181, 0.16)",
  },
};

export type WoodHotspot = {
  id: string;
  category: WoodCategory;
  label: string;
  spec: string;
  detail: string;
  priceNote?: string;
  position: [number, number, number];
  color: string;
  exactSurface?: boolean;
};

export type WoodProject = {
  id: string;
  name: string;
  subtitle: string;
  categoryName: string;
  dimensionsCm: { w: number; d: number; h: number };
  mainTimber: string;
  finishType: string;
  estimatedPrice: string;
  description: string;
  modelUrl: string;
  accent: string;
  hotspots: WoodHotspot[];
};

export const PRESET_WOOD_PROJECTS: WoodProject[] = [
  {
    id: "tv-floor-7ft",
    name: "7 尺北美黑胡桃木 × 白橡木格柵實木電視櫃 (落地款)",
    subtitle: "寬 212 cm (7.0 台尺) × 深 45 cm (1.5 台尺) × 高 50 cm (1.65 台尺)",
    categoryName: "7 尺客製實木電視櫃 (主推方案 A)",
    dimensionsCm: { w: 212, d: 45, h: 50 },
    mainTimber: "北美 FAS 級黑胡桃木 6分半板 (20mm) + 白橡木格柵 + 台灣檜木 5分板 (15mm) 內抽",
    finishType: "德國 Osmo 3032 天然絲光木蠟油 (兩底兩面，無甲醛耐水漬)",
    estimatedPrice: "NT$ 48,800 (約 7.0 台尺 × $6,970/尺)",
    description:
      "專為 65–85 吋大電視設計的 7 尺 (212 cm) 全實木視聽櫃。左右兩側採用「北美白橡木橫柵透氣門片」，關門狀態下遙控器紅外線可直接穿透且 PS5 / 擴大機散熱無虞；中央配備 Soundbar 開放倉與台灣檜木緩衝大抽屜，底部設第 5 支中置可調支撐腳確保百年不塌陷。",
    modelUrl: "preset:tv-floor-7ft",
    accent: "#d48846",
    hotspots: [
      {
        id: "top-walnut-board",
        category: "timber",
        label: "北美 FAS 級黑胡桃木整版直拼頂板",
        spec: "寬 212 cm (7.0 台尺)｜足厚 6分半板 (20mm)",
        detail: "嚴選無白邊北美黑胡桃木長料直拼，承重力達 80kg，放置 75–85 吋大型液晶電視與重型擴大機穩如泰山。",
        priceNote: "主結構頂級實木",
        position: [0.35, 0.42, 0.05],
        color: WOOD_CATEGORIES.timber.color,
        exactSurface: true,
      },
      {
        id: "slatted-ir-door",
        category: "joinery",
        label: "北美白橡木橫柵透氣視聽門片",
        spec: "間距 8mm 實木格柵榫接｜紅外線穿透 & 高效散熱",
        detail: "解決傳統實木門阻擋遙控器訊號與遊戲機悶熱痛點；不需開門即可直接遙控 Apple TV / 第四台機上盒。",
        priceNote: "手工格柵門片 (左右雙門)",
        position: [-1.18, 0.12, 0.41],
        color: WOOD_CATEGORIES.joinery.color,
        exactSurface: true,
      },
      {
        id: "dovetail-corner",
        category: "joinery",
        label: "手工半隱燕尾榫櫃體轉角",
        spec: "1:7 硬木斜率跳色榫接 (白橡 × 胡桃)",
        detail: "櫃桶頂板與側板以傳統半隱燕尾榫緊密咬合，不靠鐵釘，展現職人工藝細節。",
        priceNote: "傳統榫卯工藝",
        position: [-1.78, 0.39, 0.15],
        color: WOOD_CATEGORIES.joinery.color,
        exactSurface: true,
      },
      {
        id: "hinoki-drawer",
        category: "timber",
        label: "台灣黃檜 5分板 (15mm) 實木內抽屜盒",
        spec: "寬 70 cm (2.31 台尺)｜5分板 (15mm) 燕尾榫抽盒",
        detail: "開啟 Z 軸剖面即可看見內部台灣檜木抽屜盒，開抽即散發天然檜木香氣，防潮防蟲。",
        priceNote: "標配檜木實木內抽",
        position: [0.0, -0.12, 0.39],
        color: WOOD_CATEGORIES.timber.color,
        exactSurface: true,
      },
      {
        id: "blum-slide-hinge",
        category: "hardware",
        label: "奧地利 Blum 全展隱藏滑軌 & 110° 緩衝鉸鏈",
        spec: "Blum Tandem 40kg 隱藏軌 + 快拆阻尼西德鉸鏈",
        detail: "抽屜與左右格柵門全面採用奧地利進口 Blum 頂級靜音緩衝五金，開啟 Z 軸剖面可見內部五金位置。",
        priceNote: "含全套進口五金保固",
        position: [0.58, -0.15, 0.1],
        color: WOOD_CATEGORIES.hardware.color,
        exactSurface: true,
      },
      {
        id: "cable-management",
        category: "hardware",
        label: "檯面鋁合金毛刷線槽蓋 + 背板內退 2cm 集線槽",
        spec: "寬 35 cm (1.15 台尺) 隱藏走線口 + 三區散熱出線孔",
        detail: "電視櫃可完全貼牆擺放，所有電源線、HDMI 與網路線皆從後側內退暗槽垂直穿入，視覺零雜亂。",
        priceNote: "含散熱與走線加工",
        position: [0.0, 0.43, -0.3],
        color: WOOD_CATEGORIES.hardware.color,
        exactSurface: true,
      },
      {
        id: "center-5th-leg",
        category: "dimension",
        label: "中置第 5 支防下垂實木支撐腳 + 掃地機友善淨高",
        spec: "底部淨高 16 cm (0.53 台尺)｜附黃銅水平微調腳墊",
        detail: "7 尺 (212 cm) 長跨距電視櫃必備中央第 5 支撐點，防止數十年後中央微彎；16 cm 離地高度讓市面上所有掃拖機器人輕鬆進出。",
        priceNote: "長跨距結構強化",
        position: [0.0, -0.45, 0.05],
        color: WOOD_CATEGORIES.dimension.color,
        exactSurface: true,
      },
      {
        id: "osmo-wax-oil",
        category: "finish",
        label: "德國 Osmo #3032 天然植物木蠟油塗裝",
        spec: "四道手工砂磨至 #400 番 + 兩底兩面擦塗",
        detail: "零甲醛、無塑化劑，保留北美黑胡桃木溫潤細膩的原木觸感，日常水漬咖啡一擦即淨。",
        priceNote: "環保無毒塗裝",
        position: [1.18, 0.42, 0.15],
        color: WOOD_CATEGORIES.finish.color,
        exactSurface: true,
      },
    ],
  },
  {
    id: "tv-floating-7ft",
    name: "7 尺北美白橡木懸空壁掛極簡電視櫃 (懸空款)",
    subtitle: "寬 212 cm (7.0 台尺) × 深 42 cm (1.39 台尺) × 高 36 cm (1.19 台尺)",
    categoryName: "7 尺懸空壁掛電視櫃 (對照方案 B)",
    dimensionsCm: { w: 212, d: 42, h: 36 },
    mainTimber: "北美 FAS 級白橡木 6分板 (18mm) + F1 低甲醛柳安木心板背牆掛條",
    finishType: "德國 Osmo 3041 本色白橡木蠟油 (防止木材黃化)",
    estimatedPrice: "NT$ 44,500 (含現場雷射水平壁掛安裝)",
    description:
      "喜愛現代極簡與無障礙地面空間的業主首選！採用 45° 斜切無把手門片與背部 6分板 (18mm) 法式斜劈 (French Cleat) 重型鎖牆結構，搭配 8 支重型膨脹螺絲鎖入 RC 實心牆，承重超過 120kg。",
    modelUrl: "preset:tv-floating-7ft",
    accent: "#cfa372",
    hotspots: [
      {
        id: "french-cleat",
        category: "joinery",
        label: "法式斜劈重型懸空鎖牆結構 (French Cleat)",
        spec: "6分板 (18mm) 實木 45° 對咬掛條 + 8 點膨脹螺栓",
        detail: "開啟 Z 軸剖面可見櫃體背部暗藏的斜劈鎖牆橫樑，將下壓力轉為貼牆拉力，絕對穩固不垂頭。",
        priceNote: "含現場專業壁掛施工",
        position: [0.0, 0.15, -0.34],
        color: WOOD_CATEGORIES.joinery.color,
        exactSurface: true,
      },
      {
        id: "flap-stay",
        category: "hardware",
        label: "日本 Sugatsune 緩衝下掀門連桿",
        spec: "無段緩降阻尼支撐器",
        detail: "左右兩側門片採用 45° 斜邊隱藏把手，輕拉即緩慢平順下掀開啟，不撞擊地板。",
        priceNote: "日本進口五金",
        position: [-0.72, 0.02, 0.18],
        color: WOOD_CATEGORIES.hardware.color,
        exactSurface: true,
      },
      {
        id: "soundbar-niche",
        category: "dimension",
        label: "中央開放式 Soundbar 聲霸與中置喇叭專區",
        spec: "內淨寬 72 cm (2.38 台尺) × 內高 14 cm (0.46 台尺)",
        detail: "上方開放格不遮擋全景聲 Soundbar 發聲，下方抽屜可收納遙控器、Switch 手把與線材。",
        position: [0.0, 0.06, 0.32],
        color: WOOD_CATEGORIES.dimension.color,
        exactSurface: true,
      },
    ],
  },
  {
    id: "tv-tambour-7ft",
    name: "7 尺日式白橡木 × 台灣檜木直柵圓弧電視櫃 (圓弧款)",
    subtitle: "寬 212 cm (7.0 台尺) × 深 45 cm (1.5 台尺) × 高 50 cm (1.65 台尺)",
    categoryName: "7 尺圓弧防撞電視櫃 (對照方案 C)",
    dimensionsCm: { w: 212, d: 45, h: 50 },
    mainTimber: "北美白橡木 6分板 (18mm) + 胡桃木直柵門 + 台灣檜木 5分板 (15mm) 內裝",
    finishType: "進口優麗旦平光開放漆 (PU Matt Open-Pore)",
    estimatedPrice: "NT$ 52,000 (約 7.0 台尺 × $7,420/尺)",
    description:
      "特別適合家有幼童與寵物的家庭！櫃體左右兩側採大圓弧倒角消弭銳利邊角，搭配高密度直向胡桃木格柵門與黃銅門把，兼具北歐侘寂 (Japandi) 美學與居家防撞安全。",
    modelUrl: "preset:tv-tambour-7ft",
    accent: "#529460",
    hotspots: [
      {
        id: "vertical-slats",
        category: "timber",
        label: "高密度北美黑胡桃木直向格柵門",
        spec: "4分板 (12mm) 實木格柵條陣列",
        detail: "立體直紋光影層次豐富，同時保有良好的機櫃內部空氣對流與遙控器訊號穿透性。",
        position: [-1.1, 0.12, 0.38],
        color: WOOD_CATEGORIES.timber.color,
        exactSurface: true,
      },
      {
        id: "hinoki-interior",
        category: "timber",
        label: "全室台灣檜木 5分板 (15mm) 活動隔板與背板",
        spec: "5分板 (15mm) 層板 + 銅製排孔層板粒",
        detail: "內部層板可依擴大機或 PS5 高度自由上下微調三段高度。",
        position: [1.14, 0.12, 0.0],
        color: WOOD_CATEGORIES.timber.color,
        exactSurface: true,
      },
    ],
  },
];
