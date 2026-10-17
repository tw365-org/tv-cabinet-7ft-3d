# 7 尺實木電視櫃 (212 cm / 7.0 台尺) — 3D 結構剖面與互動報價單

🌐 **線上 3D 互動展示網址 (Cloudflare)**：**[https://tv-cabinet-7ft-3d.tw365ai.workers.dev](https://tv-cabinet-7ft-3d.tw365ai.workers.dev)**  
📦 **GitHub 專案儲存庫**：**[https://github.com/tw365-org/tv-cabinet-7ft-3d](https://github.com/tw365-org/tv-cabinet-7ft-3d)**

專為木工師傅與室內裝潢業主打造的 **7 尺實木電視櫃 3D 互動報價展示頁**，基於純 TypeScript `Three.js` + `GSAP` 輕量引擎打造，零後端依賴，可直接透過 **GitHub** 自動部署至 **Cloudflare Pages / Workers**。

## ✨ 專案特色（符合台灣木工產業規範）

1. **尺寸雙軌顯示 (`cm` + `台灣台尺`)**：
   - 主推規格：**寬 212 cm (`7.00 台尺`) × 深 45 cm (`1.49 台尺`) × 高 50 cm (`1.65 台尺`)**（`1 台尺 = 30.303 cm`）。
   - 板材厚度明確標註台灣木工俗稱：**`6分半板 (20mm)`** 北美 FAS 黑胡桃木頂底板、**`6分板 (18mm)`** 結構中立板、**`5分板 (15mm)`** 台灣黃檜燕尾榫內抽屜盒。
2. **內建 3 套 7 尺電視櫃方案可即時切換比較**：
   - **方案 A（主推落地款）**：7 尺北美黑胡桃木 × 白橡木橫柵透氣門電視櫃（含遙控器紅外線穿透格柵、Blum 緩衝滑軌、檯面隱藏毛刷走線槽、中置第 5 支防下垂支撐腳）。
   - **方案 B（懸空壁掛款）**：7 尺北美白橡木懸空壁掛極簡電視櫃（含 6分板 18mm 法式斜劈 French Cleat 重型鎖牆結構、日本 Sugatsune 下掀緩衝連桿）。
   - **方案 C（圓弧防撞款）**：7 尺日式白橡木 × 台灣檜木直柵圓弧電視櫃。
3. **3D 雙面渲染剖面透視 (`THREE.DoubleSide` + `clippingPlanes`)**：
   - 點擊底部 **「🪚 3D 剖面透視」**，支援 X (左右) / Y (上下) / Z (前後) 三軸無段滑桿推進，切開門片檢視內部檜木抽屜盒與五金時絕不出現背面透明穿幫。
4. **免寫程式「➕ 點選模型新增標註 (`Authoring Mode`)」**：
   - 木工師傅可直接拖放 SketchUp / CAD 匯出的 `.glb` 模型，或直接在現有模型上用滑鼠點選新增五金/板材標籤，並一鍵匯出/載入 JSON 設定檔與複製 LINE 報價單。

---

## 🚀 本地開發與建置

```powershell
cd D:\ps1\agy\tv-cabinet-7ft-3d
npm install
npm run dev
```

打包生產環境靜態檔案（輸出至 `dist/`）：

```powershell
npm run build
```

---

## ☁️ 上傳至 GitHub 並部署到 Cloudflare 完整教學

### 步驟一：推送到 GitHub

在專案目錄 `D:\ps1\agy\tv-cabinet-7ft-3d` 執行：

```powershell
git init
git add .
git commit -m "feat: 7ft solid wood TV cabinet 3D interactive quote showcase"
git branch -M main
git remote add origin https://github.com/<你的GitHub帳號>/tv-cabinet-7ft-3d.git
git push -u origin main
```

### 步驟二：部署到 Cloudflare（兩種方式任選）

#### 方式 A：透過 Cloudflare Dashboard 連接 GitHub 自動部署（最推薦，免指令）
1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/) -> 左側選單點選 **Workers & Pages** -> **Create**。
2. 選擇 **Pages** -> **Connect to Git**，選擇你剛才上傳的 `tv-cabinet-7ft-3d` 儲存庫。
3. 在建置設定 (Build settings) 填入：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 點擊 **Save and Deploy**，約 1 分鐘即可獲得全球 CDN 加速的 `https://tv-cabinet-7ft-3d.pages.dev` 網址，直接傳給朋友與業主用手機/平板/電腦打開即可 3D 互動！

#### 方式 B：使用內建 `wrangler.jsonc` 一行指令直接部署
本專案已內建設定好 [`wrangler.jsonc`](file:///D:/ps1/agy/tv-cabinet-7ft-3d/wrangler.jsonc)，只需在終端機執行：

```powershell
npx wrangler login
npm run deploy
```
