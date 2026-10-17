import "./style.css";
import {
  PRESET_WOOD_PROJECTS,
  WOOD_CATEGORIES,
  type WoodCategory,
  type WoodHotspot,
  type WoodProject,
} from "./data/wood-presets";
import { WoodworkViewer } from "./three/viewer";

// DOM 節點
const presetTabsEl = document.getElementById("preset-tabs")!;
const glbInputEl = document.getElementById("glb-input") as HTMLInputElement;
const jsonInputEl = document.getElementById("json-input") as HTMLInputElement;
const btnExportJson = document.getElementById("btn-export-json")!;

const projCategoryEl = document.getElementById("proj-category")!;
const projPriceEl = document.getElementById("proj-price")!;
const projNameEl = document.getElementById("proj-name")!;
const projSubtitleEl = document.getElementById("proj-subtitle")!;
const projDescEl = document.getElementById("proj-desc")!;
const specCmEl = document.getElementById("spec-cm")!;
const specTaichiEl = document.getElementById("spec-taichi")!;
const specTimberEl = document.getElementById("spec-timber")!;
const specFinishEl = document.getElementById("spec-finish")!;

const hotspotCountEl = document.getElementById("hotspot-count")!;
const categoryFiltersEl = document.getElementById("category-filters")!;
const hotspotListEl = document.getElementById("hotspot-list")!;

const stageDropzoneEl = document.getElementById("stage-dropzone")!;
const stageEl = document.getElementById("stage")!;
const dropOverlayEl = document.getElementById("drop-overlay")!;
const loadingOverlayEl = document.getElementById("loading-overlay")!;
const loadingTextEl = document.getElementById("loading-text")!;

const authorBannerEl = document.getElementById("author-banner")!;
const authorCancelBtn = document.getElementById("author-cancel")!;

const calloutEl = document.getElementById("callout")!;
const calloutBadgeEl = document.getElementById("callout-badge")!;
const calloutTitleEl = document.getElementById("callout-title")!;
const calloutSpecEl = document.getElementById("callout-spec")!;
const calloutDetailEl = document.getElementById("callout-detail")!;
const calloutPriceEl = document.getElementById("callout-price")!;
const calloutCloseBtn = document.getElementById("callout-close")!;
const calloutDeleteBtn = document.getElementById("callout-delete")!;

const addModalEl = document.getElementById("add-modal")!;
const addFormEl = document.getElementById("add-form") as HTMLFormElement;
const modalCoordsEl = document.getElementById("modal-coords")!;
const inputCategoryEl = document.getElementById("input-category") as HTMLSelectElement;
const inputLabelEl = document.getElementById("input-label") as HTMLInputElement;
const inputSpecEl = document.getElementById("input-spec") as HTMLInputElement;
const inputDetailEl = document.getElementById("input-detail") as HTMLTextAreaElement;
const inputPriceEl = document.getElementById("input-price") as HTMLInputElement;
const modalCancelBtn = document.getElementById("modal-cancel")!;

const slicePanelEl = document.getElementById("slice-panel")!;
const sliceSliderEl = document.getElementById("slice-slider") as HTMLInputElement;
const sliceValEl = document.getElementById("slice-val")!;

const btnAuthor = document.getElementById("btn-author")!;
const btnCross = document.getElementById("btn-cross")!;
const btnWireframe = document.getElementById("btn-wireframe")!;
const btnAutoRotate = document.getElementById("btn-autorotate")!;
const btnIsolate = document.getElementById("btn-isolate")!;
const btnZoomIn = document.getElementById("btn-zoom-in")!;
const btnZoomOut = document.getElementById("btn-zoom-out")!;
const btnReset = document.getElementById("btn-reset")!;

const calcTaichiEl = document.getElementById("calc-taichi") as HTMLInputElement;
const calcCmEl = document.getElementById("calc-cm") as HTMLInputElement;
const calcMmEl = document.getElementById("calc-mm") as HTMLInputElement;
const calcInchEl = document.getElementById("calc-inch") as HTMLInputElement;
const quotePreviewEl = document.getElementById("quote-preview")!;
const btnCopyQuote = document.getElementById("btn-copy-quote")!;

// 狀態
const projects: WoodProject[] = structuredClone(PRESET_WOOD_PROJECTS);
let currentProject: WoodProject = projects[0];
let activeCategoryFilter: WoodCategory | "all" = "all";
let selectedHotspot: WoodHotspot | null = null;
let authoringActive = false;
let pendingPoint: [number, number, number] | null = null;
let crossActive = false;
let crossAxis: "x" | "y" | "z" = "z";
let autoRotate = false;

/**
 * 台灣台尺雙軌換算 (遵循 Woodcraft 3D Rules: 1 台尺 = 30.303 cm)
 */
function cmToTaichiText(cm: number): string {
  const taichi = cm / 30.303;
  return `${taichi.toFixed(2)} 台尺`;
}

// 初始化 3D WoodworkViewer
const viewer = new WoodworkViewer(stageEl, {
  onLoading(loading, progress) {
    loadingOverlayEl.hidden = !loading;
    if (loading) {
      const pct = Math.round(progress * 100);
      loadingTextEl.textContent = pct > 0 && pct < 100 ? `載入 7 尺電視櫃模型... ${pct}%` : "準備 3D 實木電視櫃模型...";
    }
  },
  onSelect(hotspot) {
    selectedHotspot = hotspot;
    renderHotspotSelection(hotspot);
  },
  onAuthorPoint(point) {
    pendingPoint = [point.x, point.y, point.z];
    modalCoordsEl.textContent = `座標 [${point.x}, ${point.y}, ${point.z}]`;
    inputLabelEl.value = "";
    inputSpecEl.value = "";
    inputDetailEl.value = "";
    inputPriceEl.value = "";
    addModalEl.hidden = false;
    inputLabelEl.focus();
  },
});

viewer.attachCallout(calloutEl);

function renderPresetTabs() {
  presetTabsEl.innerHTML = "";
  projects.forEach((proj, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `preset-tab ${proj.id === currentProject.id ? "active" : ""}`;
    const shortLabels = ["方案 A：落地橫柵款 (主推)", "方案 B：懸空壁掛款", "方案 C：圓弧直柵款"];
    btn.textContent = shortLabels[idx] ?? proj.name;
    btn.addEventListener("click", () => selectProject(proj));
    presetTabsEl.appendChild(btn);
  });
}

function renderCategoryFilters() {
  categoryFiltersEl.innerHTML = "";
  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = `cat-chip ${activeCategoryFilter === "all" ? "active" : ""}`;
  allBtn.textContent = `全部 (${currentProject.hotspots.length})`;
  allBtn.addEventListener("click", () => {
    activeCategoryFilter = "all";
    renderCategoryFilters();
    renderHotspotList();
  });
  categoryFiltersEl.appendChild(allBtn);

  (Object.keys(WOOD_CATEGORIES) as WoodCategory[]).forEach((catKey) => {
    const count = currentProject.hotspots.filter((h) => h.category === catKey).length;
    if (count === 0) return;
    const cat = WOOD_CATEGORIES[catKey];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `cat-chip ${activeCategoryFilter === catKey ? "active" : ""}`;
    btn.textContent = `${cat.icon} ${cat.label.split(" ")[0]} (${count})`;
    btn.addEventListener("click", () => {
      activeCategoryFilter = catKey;
      renderCategoryFilters();
      renderHotspotList();
    });
    categoryFiltersEl.appendChild(btn);
  });
}

function renderHotspotList() {
  hotspotListEl.innerHTML = "";
  const filtered =
    activeCategoryFilter === "all"
      ? currentProject.hotspots
      : currentProject.hotspots.filter((h) => h.category === activeCategoryFilter);

  hotspotCountEl.textContent = `共 ${currentProject.hotspots.length} 處標註`;

  filtered.forEach((spot) => {
    const cat = WOOD_CATEGORIES[spot.category];
    const li = document.createElement("li");
    li.className = `hotspot-item ${selectedHotspot?.id === spot.id ? "active" : ""}`;
    li.dataset.id = spot.id;
    li.innerHTML = `
      <div class="hotspot-left">
        <span class="hotspot-dot" style="background:${spot.color}"></span>
        <div class="hotspot-text">
          <strong>${cat.icon} ${spot.label}</strong>
          <small>${spot.spec}</small>
        </div>
      </div>
    `;
    li.addEventListener("click", () => viewer.selectById(spot.id));
    hotspotListEl.appendChild(li);
  });
}

function renderQuoteSummary() {
  const { w, d, h } = currentProject.dimensionsCm;
  const lines: string[] = [
    `【${currentProject.name}】3D 規格報價單`,
    `・雙軌尺寸：`,
    `  公分：寬 ${w} cm × 深 ${d} cm × 高 ${h} cm`,
    `  台尺：寬 ${cmToTaichiText(w)} × 深 ${cmToTaichiText(d)} × 高 ${cmToTaichiText(h)}`,
    `・主體板材：${currentProject.mainTimber}`,
    `・表面塗裝：${currentProject.finishType}`,
    `・專案報價：${currentProject.estimatedPrice}`,
    `────────────────────`,
    `【板材、榫卯與五金標註明細 (${currentProject.hotspots.length}項)】`,
  ];
  currentProject.hotspots.forEach((h, i) => {
    const cat = WOOD_CATEGORIES[h.category];
    const priceSuffix = h.priceNote ? ` [${h.priceNote}]` : "";
    lines.push(`${i + 1}. ${cat.icon} ${h.label}｜${h.spec}${priceSuffix}`);
  });
  quotePreviewEl.textContent = lines.join("\n");
}

async function selectProject(proj: WoodProject) {
  currentProject = proj;
  activeCategoryFilter = "all";
  selectedHotspot = null;
  renderPresetTabs();

  projCategoryEl.textContent = proj.categoryName;
  projPriceEl.textContent = proj.estimatedPrice;
  projNameEl.textContent = proj.name;
  projSubtitleEl.textContent = proj.subtitle;
  projDescEl.textContent = proj.description;

  const { w, d, h } = proj.dimensionsCm;
  specCmEl.textContent = `寬 ${w} cm × 深 ${d} cm × 高 ${h} cm`;
  specTaichiEl.textContent = `寬 ${cmToTaichiText(w)} × 深 ${cmToTaichiText(d)} × 高 ${cmToTaichiText(h)}`;
  specTimberEl.textContent = proj.mainTimber;
  specFinishEl.textContent = proj.finishType;

  renderCategoryFilters();
  renderHotspotList();
  renderQuoteSummary();

  await viewer.setModel(proj.modelUrl, proj.hotspots, proj.accent);
}

function renderHotspotSelection(hotspot: WoodHotspot | null) {
  hotspotListEl.querySelectorAll(".hotspot-item").forEach((el) => {
    el.classList.toggle("active", (el as HTMLElement).dataset.id === hotspot?.id);
  });

  if (!hotspot) {
    calloutEl.hidden = true;
    return;
  }

  const cat = WOOD_CATEGORIES[hotspot.category];
  calloutBadgeEl.textContent = `${cat.icon} ${cat.label}`;
  calloutBadgeEl.style.color = hotspot.color;
  calloutTitleEl.textContent = hotspot.label;
  calloutSpecEl.textContent = hotspot.spec;
  calloutDetailEl.textContent = hotspot.detail || "（無額外說明）";
  calloutPriceEl.textContent = hotspot.priceNote || "";
  calloutEl.hidden = false;
}

// 新增與刪除標註點
addFormEl.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!pendingPoint) return;

  const category = inputCategoryEl.value as WoodCategory;
  const newSpot: WoodHotspot = {
    id: `spot-${Date.now()}`,
    category,
    label: inputLabelEl.value.trim(),
    spec: inputSpecEl.value.trim(),
    detail: inputDetailEl.value.trim(),
    priceNote: inputPriceEl.value.trim() || undefined,
    position: pendingPoint,
    color: WOOD_CATEGORIES[category].color,
    exactSurface: true,
  };

  currentProject.hotspots.push(newSpot);
  addModalEl.hidden = true;
  pendingPoint = null;

  viewer.refreshHotspots(currentProject.hotspots);
  renderCategoryFilters();
  renderHotspotList();
  renderQuoteSummary();
  viewer.selectById(newSpot.id);
});

modalCancelBtn.addEventListener("click", () => {
  addModalEl.hidden = true;
  pendingPoint = null;
});

calloutCloseBtn.addEventListener("click", () => viewer.clearSelection());

calloutDeleteBtn.addEventListener("click", () => {
  if (!selectedHotspot) return;
  currentProject.hotspots = currentProject.hotspots.filter((h) => h.id !== selectedHotspot!.id);
  viewer.clearSelection();
  viewer.refreshHotspots(currentProject.hotspots);
  renderCategoryFilters();
  renderHotspotList();
  renderQuoteSummary();
});

// 拖放或上傳自訂 .glb 檔案
function loadCustomGlbFile(file: File) {
  const objectUrl = URL.createObjectURL(file);
  const baseName = file.name.replace(/\.(glb|gltf)$/i, "");
  const customProj: WoodProject = {
    id: `custom-${Date.now()}`,
    name: `${baseName} (7 尺客製模型)`,
    subtitle: "寬 212 cm (7.0 台尺) × 深 45 cm (1.5 台尺) × 高 50 cm (1.65 台尺)",
    categoryName: "自訂匯入 .GLB 模型",
    dimensionsCm: { w: 212, d: 45, h: 50 },
    mainTimber: "6分板 (18mm) / 5分板 (15mm) 實木與木心板",
    finishType: "待定塗裝",
    estimatedPrice: "待報價",
    description: `已載入模型「${file.name}」。點擊下方「➕ 點選模型新增標註」即可在 3D 表面標記五金與板材。`,
    modelUrl: objectUrl,
    accent: "#d48846",
    hotspots: [],
  };
  projects.push(customProj);
  void selectProject(customProj);
}

glbInputEl.addEventListener("change", () => {
  const file = glbInputEl.files?.[0];
  if (file) loadCustomGlbFile(file);
  glbInputEl.value = "";
});

stageDropzoneEl.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropOverlayEl.hidden = false;
});

stageDropzoneEl.addEventListener("dragleave", (e) => {
  if (e.relatedTarget && stageDropzoneEl.contains(e.relatedTarget as Node)) return;
  dropOverlayEl.hidden = true;
});

stageDropzoneEl.addEventListener("drop", (e) => {
  e.preventDefault();
  dropOverlayEl.hidden = true;
  const file = e.dataTransfer?.files?.[0];
  if (!file) return;
  if (file.name.endsWith(".json")) {
    importProjectJson(file);
  } else {
    loadCustomGlbFile(file);
  }
});

// 匯出與載入標註專案 JSON
btnExportJson.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(currentProject, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${currentProject.id}-7尺電視櫃3D標註.json`;
  a.click();
});

function importProjectJson(file: File) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(String(reader.result)) as WoodProject;
      if (!imported.hotspots || !imported.name) return;
      const existingIdx = projects.findIndex((p) => p.id === imported.id);
      if (existingIdx >= 0) projects[existingIdx] = imported;
      else projects.push(imported);
      void selectProject(imported);
    } catch {
      alert("JSON 格式不正確");
    }
  };
  reader.readAsText(file);
}

jsonInputEl.addEventListener("change", () => {
  const file = jsonInputEl.files?.[0];
  if (file) importProjectJson(file);
  jsonInputEl.value = "";
});

// 底部 3D 工具列與三軸無段剖面
function toggleAuthorMode(force?: boolean) {
  authoringActive = force ?? !authoringActive;
  viewer.setAuthoring(authoringActive);
  btnAuthor.classList.toggle("active", authoringActive);
  authorBannerEl.hidden = !authoringActive;
}

btnAuthor.addEventListener("click", () => toggleAuthorMode());
authorCancelBtn.addEventListener("click", () => toggleAuthorMode(false));

btnCross.addEventListener("click", () => {
  crossActive = !crossActive;
  btnCross.classList.toggle("active", crossActive);
  slicePanelEl.hidden = !crossActive;
  viewer.setCrossSection(crossActive, crossAxis, parseFloat(sliceSliderEl.value));
});

slicePanelEl.querySelectorAll(".axis-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    slicePanelEl.querySelectorAll(".axis-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    crossAxis = (btn as HTMLElement).dataset.axis as "x" | "y" | "z";
    viewer.setCrossSection(crossActive, crossAxis, parseFloat(sliceSliderEl.value));
  });
});

sliceSliderEl.addEventListener("input", () => {
  const val = parseFloat(sliceSliderEl.value);
  sliceValEl.textContent = val.toFixed(2);
  viewer.setCrossSection(crossActive, crossAxis, val);
});

btnWireframe.addEventListener("click", () => {
  const active = viewer.toggleLayers();
  btnWireframe.classList.toggle("active", active);
});

btnAutoRotate.addEventListener("click", () => {
  autoRotate = !autoRotate;
  viewer.setAutoRotate(autoRotate);
  btnAutoRotate.classList.toggle("active", autoRotate);
});

btnIsolate.addEventListener("click", () => {
  const active = viewer.toggleIsolate();
  btnIsolate.classList.toggle("active", active);
});

btnZoomIn.addEventListener("click", () => viewer.zoom(-1));
btnZoomOut.addEventListener("click", () => viewer.zoom(1));
btnReset.addEventListener("click", () => viewer.reset());

// 台灣木工台尺 ↔ 公分 ↔ 公釐 ↔ 英吋 雙向換算器
function updateFromCm(cm: number) {
  calcTaichiEl.value = (cm / 30.303).toFixed(2);
  calcCmEl.value = cm.toFixed(1);
  calcMmEl.value = Math.round(cm * 10).toString();
  calcInchEl.value = (cm / 2.54).toFixed(2);
}

calcTaichiEl.addEventListener("input", () => {
  const v = parseFloat(calcTaichiEl.value);
  if (!Number.isNaN(v)) {
    const cm = v * 30.303;
    calcCmEl.value = cm.toFixed(1);
    calcMmEl.value = Math.round(cm * 10).toString();
    calcInchEl.value = (cm / 2.54).toFixed(2);
  }
});

calcCmEl.addEventListener("input", () => {
  const v = parseFloat(calcCmEl.value);
  if (!Number.isNaN(v)) {
    calcTaichiEl.value = (v / 30.303).toFixed(2);
    calcMmEl.value = Math.round(v * 10).toString();
    calcInchEl.value = (v / 2.54).toFixed(2);
  }
});

calcMmEl.addEventListener("input", () => {
  const v = parseFloat(calcMmEl.value);
  if (!Number.isNaN(v)) updateFromCm(v / 10);
});

calcInchEl.addEventListener("input", () => {
  const v = parseFloat(calcInchEl.value);
  if (!Number.isNaN(v)) updateFromCm(v * 2.54);
});

document.querySelectorAll(".chip[data-mm]").forEach((chip) => {
  chip.addEventListener("click", () => {
    const mm = parseFloat((chip as HTMLElement).dataset.mm || "18");
    updateFromCm(mm / 10);
  });
});

btnCopyQuote.addEventListener("click", () => {
  void navigator.clipboard.writeText(quotePreviewEl.textContent || "");
  btnCopyQuote.textContent = "✓ 已複製報價單！";
  setTimeout(() => (btnCopyQuote.textContent = "複製報價單"), 1500);
});

// 啟動預設第一個 7 尺電視櫃方案
void selectProject(projects[0]);
