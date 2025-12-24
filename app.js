
let elements = []; 
let screens = [];
let activeScreenId = null;
let selectedId = null;

let dispWidth = 240;
let dispHeight = 320;
let bgColor = "#000000";
let useSprite = false;
let zoomFactor = 0.75;

let snapToGrid = false;
let gridSize = 4;


let driverMode = "tft";

// Display settings state
let tftSettingsState = {
  rotation: 0,
  colorDepth: 16,
  backlight: "none",
  touch: "none"
};

let oledSettingsState = {
  rotation: 0,
  contrast: 127,
  flipMode: "none",
  fontMode: "transparent",
  powerSave: "off"
};
let u8g2PresetId = "ssd1306_128x64_i2c_f";

const DEFAULT_U8G2_FONT = "u8g2_font_6x10_tf";
const DEFAULT_TFT_FONT = "1";

function getCurrentDriverMode() {
  return String((displayDriverSelect && displayDriverSelect.value) || driverMode || "tft");
}


let history = [];
let historyIndex = -1;
let historyLocked = false; 

const preview = document.getElementById("preview");
const displayInfo = document.getElementById("displayInfo");


const dispWidthInput = document.getElementById("dispWidth");
const dispHeightInput = document.getElementById("dispHeight");
const applyResBtn = document.getElementById("applyRes");
const bgColorInput = document.getElementById("bgColor");
const clearAllBtn = document.getElementById("clearAll");
const useSpriteCheckbox = document.getElementById("useSpriteCheckbox");
const snapCheckbox = document.getElementById("snapCheckbox");
const gridSizeInput = document.getElementById("gridSize");

const displayDriverSelect = document.getElementById("displayDriver");
const tftSettings = document.getElementById("tftSettings");
const oledSettings = document.getElementById("oledSettings");

// TFT settings elements
const tftRotation = document.getElementById("tftRotation");
const tftColorDepth = document.getElementById("tftColorDepth");
const tftBacklight = document.getElementById("tftBacklight");
const tftTouch = document.getElementById("tftTouch");

// OLED settings elements
const oledRotation = document.getElementById("oledRotation");
const oledContrast = document.getElementById("oledContrast");
const oledContrastValue = document.getElementById("oledContrastValue");
const oledFlipMode = document.getElementById("oledFlipMode");
const oledFontMode = document.getElementById("oledFontMode");
const oledPowerSave = document.getElementById("oledPowerSave");
const u8g2PresetSelect = document.getElementById("u8g2Preset");

const addButtons = document.querySelectorAll("[data-add]");
const addImageBtn = document.getElementById("addImageBtn");
const imageInput = document.getElementById("imageInput");

const imgCanvas = document.createElement("canvas");
const imgCtx = imgCanvas.getContext("2d");


const screenSelect = document.getElementById("screenSelect");
const addScreenBtn = document.getElementById("addScreenBtn");
const deleteScreenBtn = document.getElementById("deleteScreenBtn");
const screenFnNameInput = document.getElementById("screenFnName");


const noSelection = document.getElementById("noSelection");
const propsPanel = document.getElementById("propsPanel");
const elementTypePill = document.getElementById("elementTypePill");
const propX = document.getElementById("propX");
const propY = document.getElementById("propY");
const propW = document.getElementById("propW");
const propH = document.getElementById("propH");
const propText = document.getElementById("propText");
const propTextSize = document.getElementById("propTextSize");
const propValue = document.getElementById("propValue");
const propFillColor = document.getElementById("propFillColor");
const propStrokeColor = document.getElementById("propStrokeColor");
const propTextColor = document.getElementById("propTextColor");
const deleteElementBtn = document.getElementById("deleteElement");
const valueGroup = document.getElementById("valueGroup");
const textGroup = document.getElementById("textGroup");
const fontGroup = document.getElementById("fontGroup");
const propFont = document.getElementById("propFont");
const propFontLabel = document.getElementById("propFontLabel");
const actionGroup = document.getElementById("actionGroup");
const propAction = document.getElementById("propAction");
const propActionTarget = document.getElementById("propActionTarget");
const iconTintGroup = document.getElementById("iconTintGroup");
const propIconTintEnabled = document.getElementById("propIconTintEnabled");
const propIconTintColor = document.getElementById("propIconTintColor");


const alignLeftBtn = document.getElementById("alignLeftBtn");
const alignHCenterBtn = document.getElementById("alignHCenterBtn");
const alignRightBtn = document.getElementById("alignRightBtn");
const alignTopBtn = document.getElementById("alignTopBtn");
const alignVCenterBtn = document.getElementById("alignVCenterBtn");
const alignBottomBtn = document.getElementById("alignBottomBtn");


const codeOutput = document.getElementById("codeOutput");
const copyCodeBtn = document.getElementById("copyCode");


const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const duplicateBtn = document.getElementById("duplicateBtn");
const zoomSlider = document.getElementById("zoomSlider");
const exportJsonBtn = document.getElementById("exportJsonBtn");
const importJsonBtn = document.getElementById("importJsonBtn");
const importJsonInput = document.getElementById("importJsonInput");
const bgColorChips = document.querySelectorAll("[data-bg-color]");
const bgColorCustomBtn = document.getElementById("bgColorCustom");

// Sidebar extras: UI examples + icon list
const uiExamplesList = document.getElementById("uiExamplesList");
const uiExamplesTabTft = document.getElementById("uiExamplesTabTft");
const uiExamplesTabOled = document.getElementById("uiExamplesTabOled");
const uiExamplesPrevBtn = document.getElementById("uiExamplesPrevBtn");
const uiExamplesNextBtn = document.getElementById("uiExamplesNextBtn");
const uiExamplesPagePill = document.getElementById("uiExamplesPagePill");
const iconSearchInput = document.getElementById("iconSearch");
const clearIconSearchBtn = document.getElementById("clearIconSearch");
const iconGrid = document.getElementById("iconGrid");
const iconHint = document.getElementById("iconHint");
const exportIconsTftBtn = document.getElementById("exportIconsTftBtn");
const exportIconsU8g2Btn = document.getElementById("exportIconsU8g2Btn");
const iconSizeFilterSelect = document.getElementById("iconSizeFilter");
const iconCountPill = document.getElementById("iconCountPill");
const refreshIconsBtn = document.getElementById("refreshIconsBtn");
const iconPrevBtn = document.getElementById("iconPrevBtn");
const iconNextBtn = document.getElementById("iconNextBtn");
const iconPagePill = document.getElementById("iconPagePill");

// Embedded tools overlay (PixelForge / BitCanvas Studio)
const toolOverlay = document.getElementById("toolOverlay");
const toolOverlayPill = document.getElementById("toolOverlayPill");
const toolOverlayName = document.getElementById("toolOverlayName");
const toolOverlayClose = document.getElementById("toolOverlayClose");
const toolOverlayAction = document.getElementById("toolOverlayAction");
const toolOverlayOpenNewTab = document.getElementById("toolOverlayOpenNewTab");
const toolFramePixelForge = document.getElementById("toolFrame_pixelforge");
const toolFrameBitCanvas = document.getElementById("toolFrame_bitcanvas");
const toolSwitchButtons = document.querySelectorAll("[data-switch-tool]");

const EMBEDDED_TOOLS = {
  pixelforge: {
    label: "PixelForge (Image Converter)",
    href: "tools/pixelforge/index.html"
  },
  bitcanvas: {
    label: "BitCanvas Studio (Animation)",
    href: "tools/bitcanvas-studio/index.html"
  }
};

let activeEmbeddedToolKey = null;
let pendingToolAction = null; // "importImage" | "copyExport" | null
const loadedToolFrames = new Set(); // toolKey strings

// Right sidebar (settings + selected element)
const propertiesSidebar = document.querySelector(".properties");
const settingsScreensTitle = document.getElementById("settingsScreensTitle");
const selectedElementTitle = document.getElementById("selectedElementTitle");

function scrollPropertiesTo(targetEl) {
  if (!propertiesSidebar || !targetEl) return;
  const pr = propertiesSidebar.getBoundingClientRect();
  const tr = targetEl.getBoundingClientRect();
  const top = (tr.top - pr.top) + propertiesSidebar.scrollTop;
  // Put the target right at the top (with a small padding)
  propertiesSidebar.scrollTo({ top: Math.max(0, top - 8), behavior: "smooth" });
}

function scrollToScreensSettings() {
  scrollPropertiesTo(settingsScreensTitle);
}

function scrollToSelectedElementSettings() {
  scrollPropertiesTo(selectedElementTitle);
}

function getToolFrameEl(toolKey) {
  if (toolKey === "pixelforge") return toolFramePixelForge;
  if (toolKey === "bitcanvas") return toolFrameBitCanvas;
  return null;
}

function hideAllToolFrames() {
  [toolFramePixelForge, toolFrameBitCanvas].forEach((f) => {
    if (f) f.classList.add("hidden");
  });
}

function setActiveToolSwitchUI(toolKey) {
  toolSwitchButtons.forEach((btn) => {
    const key = btn.getAttribute("data-switch-tool");
    const active = key === toolKey;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function refreshEmbeddedToolHrefs() {
  // Make right-click "Open in new tab" (and the overlay button) open the *embedded* themed variant.
  document.querySelectorAll("[data-open-tool]").forEach((el) => {
    const key = el.getAttribute("data-open-tool");
    const tool = EMBEDDED_TOOLS[key];
    if (!tool) return;
    el.setAttribute("href", buildEmbeddedToolUrl(tool.href));
  });

  if (toolOverlayOpenNewTab && activeEmbeddedToolKey && EMBEDDED_TOOLS[activeEmbeddedToolKey]) {
    toolOverlayOpenNewTab.href = buildEmbeddedToolUrl(EMBEDDED_TOOLS[activeEmbeddedToolKey].href);
  }
}

function getCurrentDisplayKitTheme() {
  return document.documentElement.getAttribute("data-theme")
    || localStorage.getItem("theme")
    || "dark";
}

function buildEmbeddedToolUrl(baseHref) {
  const theme = getCurrentDisplayKitTheme();
  try {
    const u = new URL(baseHref, window.location.href);
    u.searchParams.set("embed", "1");
    u.searchParams.set("theme", theme);
    return u.toString();
  } catch {
    // Fallback for edge cases: still try to pass params
    const join = baseHref.includes("?") ? "&" : "?";
    return `${baseHref}${join}embed=1&theme=${encodeURIComponent(theme)}`;
  }
}

function syncEmbeddedToolTheme(theme) {
  if (!toolOverlay) return;
  // Sync to any loaded frames; this keeps them consistent even while hidden.
  const frames = [toolFramePixelForge, toolFrameBitCanvas].filter(Boolean);
  frames.forEach((frame) => {
    try {
      frame.contentWindow?.postMessage({ type: "displaykitTheme", theme }, "*");
    } catch {
      // ignore
    }
  });
}

function requestToolExport(toolKey) {
  const frame = getToolFrameEl(toolKey);
  if (!frame?.contentWindow) return;
  try {
    frame.contentWindow.postMessage({ type: "requestExport", tool: toolKey }, "*");
  } catch {
    // ignore
  }
}

function setToolOverlayAction(toolKey) {
  activeEmbeddedToolKey = toolKey;
  pendingToolAction = null;
  if (!toolOverlayAction) return;

  if (toolKey === "pixelforge") {
    toolOverlayAction.style.display = "inline-flex";
    toolOverlayAction.textContent = "Import image to DisplayKit";
    pendingToolAction = "importImage";
  } else if (toolKey === "bitcanvas") {
    toolOverlayAction.style.display = "inline-flex";
    toolOverlayAction.textContent = "Copy export to clipboard";
    pendingToolAction = "copyExport";
  } else {
    toolOverlayAction.style.display = "none";
    toolOverlayAction.textContent = "Action";
  }
}

function parsePixelForgeHeaderToRgb565(text) {
  if (!text || typeof text !== "string") {
    throw new Error("No export text received from PixelForge. Click Convert first.");
  }

  const widthMatch = text.match(/const\s+uint16_t\s+([A-Za-z0-9_]+)_width\s*=\s*(\d+)\s*;/);
  const heightMatch = text.match(/const\s+uint16_t\s+([A-Za-z0-9_]+)_height\s*=\s*(\d+)\s*;/);
  if (!widthMatch || !heightMatch) {
    throw new Error("Couldn't find width/height in PixelForge export.");
  }

  const baseName = widthMatch[1];
  const w = parseInt(widthMatch[2], 10);
  const h = parseInt(heightMatch[2], 10);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    throw new Error("Invalid width/height in PixelForge export.");
  }

  // Prefer the base symbol if present; otherwise take the first uint16_t PROGMEM array.
  const preferredRe = new RegExp(
    `const\\s+uint16_t\\s+(${baseName}(?:_\\d+)?)\\s*\\[\\]\\s*PROGMEM\\s*=\\s*\\{([\\s\\S]*?)\\};`
  );
  let arrayMatch = text.match(preferredRe);
  if (!arrayMatch) {
    arrayMatch = text.match(/const\s+uint16_t\s+([A-Za-z0-9_]+)\s*\[\]\s*PROGMEM\s*=\s*\{([\s\S]*?)\};/);
  }
  if (!arrayMatch) {
    throw new Error("Couldn't find a uint16_t RGB565 array in PixelForge export (TFT mode only).");
  }

  const symbol = arrayMatch[1];
  const body = arrayMatch[2];
  const hexes = body.match(/0x[0-9A-Fa-f]{1,4}/g) || [];
  if (!hexes.length) {
    throw new Error("No pixel data found in PixelForge export.");
  }
  const rgb565 = hexes.map((hx) => parseInt(hx, 16) & 0xffff);

  return { symbol, baseName, w, h, rgb565 };
}

function rgb565ToDataUrl(w, h, rgb565) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(w, h);
  const d = img.data;

  const total = Math.min(rgb565.length, w * h);
  for (let p = 0; p < total; p++) {
    const v = rgb565[p] & 0xffff;
    const r5 = (v >> 11) & 0x1f;
    const g6 = (v >> 5) & 0x3f;
    const b5 = v & 0x1f;
    const r = (r5 << 3) | (r5 >> 2);
    const g = (g6 << 2) | (g6 >> 4);
    const b = (b5 << 3) | (b5 >> 2);
    const i = p * 4;
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
    d[i + 3] = 255;
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}

function importRgb565ImageToDisplayKit({ symbol, w, h, rgb565 }) {
  if (!Array.isArray(rgb565) || !rgb565.length) {
    throw new Error("No RGB565 data to import.");
  }

  const id = makeId();
  const x = Math.max(0, Math.round((dispWidth - w) / 2));
  const y = Math.max(0, Math.round((dispHeight - h) / 2));
  const previewUrl = rgb565ToDataUrl(w, h, rgb565);

  const el = {
    id,
    type: "image",
    x,
    y,
    w,
    h,
    text: "",
    textSize: 2,
    fillColor: "#ffffff",
    strokeColor: "#ffffff",
    textColor: "#000000",
    value: 0,
    imageName: symbol || ("img_" + id.replace(/[^a-zA-Z0-9_]/g, "_")),
    imageWidth: w,
    imageHeight: h,
    rgb565,
    previewUrl,
    font: getCurrentDriverMode() === "tft" ? DEFAULT_TFT_FONT : DEFAULT_U8G2_FONT
  };

  elements.push(el);
  syncActiveScreenElements();
  selectedId = id;
  updatePreviewSize();
  renderElements();
  updatePropsInputs();
  updateCode();
  pushHistory();
}

function openEmbeddedTool(toolKey) {
  if (!toolOverlay) return;
  const tool = EMBEDDED_TOOLS[toolKey];
  if (!tool) return;
  const embeddedUrl = buildEmbeddedToolUrl(tool.href);
  const frame = getToolFrameEl(toolKey);
  if (!frame) return;

  // Update header UI
  if (toolOverlayPill) toolOverlayPill.textContent = "Tools";
  if (toolOverlayOpenNewTab) toolOverlayOpenNewTab.href = embeddedUrl;
  frame.title = tool.label;

  // Keep tool state by loading each tool once and then only toggling visibility
  if (!loadedToolFrames.has(toolKey)) {
    frame.setAttribute("src", embeddedUrl);
    loadedToolFrames.add(toolKey);
  }

  toolOverlay.classList.add("open");
  toolOverlay.setAttribute("aria-hidden", "false");
  document.documentElement.classList.add("tool-open");
  setToolOverlayAction(toolKey);
  setActiveToolSwitchUI(toolKey);

  hideAllToolFrames();
  frame.classList.remove("hidden");

  // Ensure theme is synced even if the tool doesn't read query params
  syncEmbeddedToolTheme(getCurrentDisplayKitTheme());
}

function closeEmbeddedTool() {
  if (!toolOverlay) return;
  toolOverlay.classList.remove("open");
  toolOverlay.setAttribute("aria-hidden", "true");
  document.documentElement.classList.remove("tool-open");
  setToolOverlayAction(null);
  setActiveToolSwitchUI(null);
}

// Intercept tool links and open inside the app overlay
document.querySelectorAll("[data-open-tool]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    const key = el.getAttribute("data-open-tool");
    openEmbeddedTool(key);
  });
});

// Tool switcher tabs inside overlay
toolSwitchButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-switch-tool");
    openEmbeddedTool(key);
  });
});

// Ensure the default hrefs also point at the embedded/themed URLs
refreshEmbeddedToolHrefs();

if (toolOverlayClose) {
  toolOverlayClose.addEventListener("click", closeEmbeddedTool);
}

if (toolOverlayAction) {
  toolOverlayAction.addEventListener("click", () => {
    if (!activeEmbeddedToolKey || !pendingToolAction) return;
    requestToolExport(activeEmbeddedToolKey);
  });
}

// Click outside the inner panel closes the overlay
if (toolOverlay) {
  toolOverlay.addEventListener("mousedown", (e) => {
    if (e.target === toolOverlay) {
      closeEmbeddedTool();
    }
  });
}

if (toolFramePixelForge) {
  toolFramePixelForge.addEventListener("load", () => {
    syncEmbeddedToolTheme(getCurrentDisplayKitTheme());
  });
}
if (toolFrameBitCanvas) {
  toolFrameBitCanvas.addEventListener("load", () => {
    syncEmbeddedToolTheme(getCurrentDisplayKitTheme());
  });
}

// Receive exports from embedded tools
window.addEventListener("message", async (event) => {
  const data = event && event.data;
  if (!data || data.type !== "toolExport") return;
  const tool = data.tool;

  try {
    if (tool === "pixelforge") {
      const parsed = parsePixelForgeHeaderToRgb565(data.text || "");
      importRgb565ImageToDisplayKit(parsed);
      alert("Imported image into current screen.");
    } else if (tool === "bitcanvas") {
      const text = data.text || "";
      if (!text.trim()) throw new Error("No export text found. Click an Export button in BitCanvas first.");
      await navigator.clipboard.writeText(text);
      alert("Copied BitCanvas export to clipboard.");
    }
  } catch (err) {
    alert(err && err.message ? err.message : "Tool export failed.");
  }
});

// ESC closes the overlay
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && toolOverlay && toolOverlay.classList.contains("open")) {
    closeEmbeddedTool();
  }
});


function getTheme() {
  const saved = localStorage.getItem("theme");
  if (saved) return saved;
  return "dark";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  if (themeIcon) {
    themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  }
  syncEmbeddedToolTheme(theme);
  refreshEmbeddedToolHrefs();
}

function toggleTheme() {
  const currentTheme = getTheme();
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);
}


const savedTheme = getTheme();
setTheme(savedTheme);


if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}


if (window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      setTheme(e.matches ? "dark" : "light");
    }
  });
}



const U8G2_PRESETS = [
  {
    id: "ssd1306_128x64_i2c_f",
    label: "SSD1306 128x64 I2C (F_HW_I2C)",
    ctor: "U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0,  U8X8_PIN_NONE);"
  },
  {
    id: "ssd1306_128x64_spi_f",
    label: "SSD1306 128x64 SPI (F_4W_HW_SPI)",
    ctor: "U8G2_SSD1306_128X64_NONAME_F_4W_HW_SPI u8g2(U8G2_R0,  10,  9,  8);"
  },
  {
    id: "sh1106_128x64_i2c_f",
    label: "SH1106 128x64 I2C (F_HW_I2C)",
    ctor: "U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0,  U8X8_PIN_NONE);"
  },
  {
    id: "custom",
    label: "Custom (edit manually in code)",
    ctor: ""
  }
];

const U8G2_FONTS = [
  // Small / fixed-width fonts
  "u8g2_font_4x6_tf",
  "u8g2_font_5x7_tf",
  "u8g2_font_5x8_tf",
  "u8g2_font_6x10_tf",
  "u8g2_font_6x12_tf",
  "u8g2_font_6x13_tf",
  "u8g2_font_7x13_tf",
  "u8g2_font_7x14_tf",
  "u8g2_font_8x13_tf",
  "u8g2_font_8x13B_tf",
  "u8g2_font_9x15B_tf",
  "u8g2_font_9x18B_tf",
  "u8g2_font_10x20_tf",
  "u8g2_font_12x20_tf",

  // Helvetica (Sans-serif) fonts
  "u8g2_font_helvR08_tf",
  "u8g2_font_helvR10_tf",
  "u8g2_font_helvR12_tf",
  "u8g2_font_helvR14_tf",
  "u8g2_font_helvR18_tf",
  "u8g2_font_helvR24_tf",
  "u8g2_font_helvB08_tf",
  "u8g2_font_helvB10_tf",
  "u8g2_font_helvB12_tf",
  "u8g2_font_helvB14_tf",
  "u8g2_font_helvB18_tf",
  "u8g2_font_helvB24_tf",

  // Proportional fonts
  "u8g2_font_profont10_mf",
  "u8g2_font_profont12_mf",
  "u8g2_font_profont15_mf",
  "u8g2_font_profont17_mf",
  "u8g2_font_profont22_mf",
  "u8g2_font_profont29_mf",
  "u8g2_font_t0_11b_mf",
  "u8g2_font_t0_12b_mf",
  "u8g2_font_t0_14b_mf",
  "u8g2_font_t0_15b_mf",
  "u8g2_font_t0_17b_mf",
  "u8g2_font_t0_18b_mf",
  "u8g2_font_t0_22b_mf",

  // New Century Schoolbook (Serif)
  "u8g2_font_ncenB08_tr",
  "u8g2_font_ncenB10_tr",
  "u8g2_font_ncenB12_tr",
  "u8g2_font_ncenB14_tr",
  "u8g2_font_ncenB18_tr",
  "u8g2_font_ncenB24_tr",
  "u8g2_font_ncenR08_tr",
  "u8g2_font_ncenR10_tr",
  "u8g2_font_ncenR12_tr",
  "u8g2_font_ncenR14_tr",
  "u8g2_font_ncenR18_tr",
  "u8g2_font_ncenR24_tr",

  // Times (Serif)
  "u8g2_font_timR08_tr",
  "u8g2_font_timR10_tr",
  "u8g2_font_timR12_tr",
  "u8g2_font_timR14_tr",
  "u8g2_font_timR18_tr",
  "u8g2_font_timR24_tr",
  "u8g2_font_timB08_tr",
  "u8g2_font_timB10_tr",
  "u8g2_font_timB12_tr",
  "u8g2_font_timB14_tr",
  "u8g2_font_timB18_tr",
  "u8g2_font_timB24_tr",

  // Courier (Monospace)
  "u8g2_font_courR08_tf",
  "u8g2_font_courR10_tf",
  "u8g2_font_courR12_tf",
  "u8g2_font_courR14_tf",
  "u8g2_font_courR18_tf",
  "u8g2_font_courR24_tf",
  "u8g2_font_courB08_tf",
  "u8g2_font_courB10_tf",
  "u8g2_font_courB12_tf",
  "u8g2_font_courB14_tf",
  "u8g2_font_courB18_tf",
  "u8g2_font_courB24_tf",

  // Logisoso fonts
  "u8g2_font_logisoso16_tf",
  "u8g2_font_logisoso18_tf",
  "u8g2_font_logisoso20_tf",
  "u8g2_font_logisoso22_tf",
  "u8g2_font_logisoso24_tf",
  "u8g2_font_logisoso26_tf",
  "u8g2_font_logisoso28_tf",
  "u8g2_font_logisoso30_tf",
  "u8g2_font_logisoso32_tf",
  "u8g2_font_logisoso34_tf",
  "u8g2_font_logisoso38_tf",
  "u8g2_font_logisoso42_tf",
  "u8g2_font_logisoso46_tf",
  "u8g2_font_logisoso50_tf",
  "u8g2_font_logisoso54_tf",
  "u8g2_font_logisoso58_tf",
  "u8g2_font_logisoso62_tf",

  // Special purpose fonts
  "u8g2_font_8x8_mf",
  "u8g2_font_inr16_mf",
  "u8g2_font_inb16_mf",
  "u8g2_font_inr19_mf",
  "u8g2_font_inb19_mf",
  "u8g2_font_inr21_mf",
  "u8g2_font_inb21_mf",
  "u8g2_font_inr24_mf",
  "u8g2_font_inb24_mf",
  "u8g2_font_inr27_mf",
  "u8g2_font_inb27_mf",
  "u8g2_font_inr30_mf",
  "u8g2_font_inb30_mf",
  "u8g2_font_inr33_mf",
  "u8g2_font_inb33_mf",
  "u8g2_font_inr38_mf",
  "u8g2_font_inb38_mf",
  "u8g2_font_inr42_mf",
  "u8g2_font_inb42_mf",
  "u8g2_font_inr46_mf",
  "u8g2_font_inb46_mf",
  "u8g2_font_inr49_mf",
  "u8g2_font_inb49_mf",
  "u8g2_font_inr53_mf",
  "u8g2_font_inb53_mf",

  // Symbols and special characters
  "u8g2_font_unifont_t_symbols",
  "u8g2_font_open_iconic_all_1x",
  "u8g2_font_open_iconic_all_2x",
  "u8g2_font_open_iconic_all_4x",
  "u8g2_font_open_iconic_all_6x",
  "u8g2_font_open_iconic_all_8x",
  "u8g2_font_emoticons21_tr",
  "u8g2_font_battery19_tn",
  "u8g2_font_siji_t_6x10",

  // Additional fonts
  "u8g2_font_lubR08_tf",
  "u8g2_font_lubR10_tf",
  "u8g2_font_lubR12_tf",
  "u8g2_font_lubR14_tf",
  "u8g2_font_lubR18_tf",
  "u8g2_font_lubR19_tf",
  "u8g2_font_lubR24_tf",
  "u8g2_font_lubB08_tf",
  "u8g2_font_lubB10_tf",
  "u8g2_font_lubB12_tf",
  "u8g2_font_lubB14_tf",
  "u8g2_font_lubB18_tf",
  "u8g2_font_lubB19_tf",
  "u8g2_font_lubB24_tf",

  // Micro fonts
  "u8g2_font_micro_mf",
  "u8g2_font_micro_tr",
  "u8g2_font_chroma48medium8_8r",
  "u8g2_font_saikyosansbold8_8n",
  "u8g2_font_torussansbold8_8r"
];

// TFT_eSPI built-in fonts (for setTextFont). Keep these driver-specific.
const TFT_ESPI_FONTS = [
  // Built-in (setTextFont)
  { value: "1", label: "Built-in 1 (default)" },
  { value: "2", label: "Built-in 2" },
  { value: "3", label: "Built-in 3" },
  { value: "4", label: "Built-in 4" },
  { value: "5", label: "Built-in 5" },
  { value: "6", label: "Built-in 6" },
  { value: "7", label: "Built-in 7" },
  { value: "8", label: "Built-in 8" },

  // FreeFonts (GFXFF) — requires TFT_eSPI configured with LOAD_GFXFF enabled.
  // Value is the font symbol name (used as &<name> in generated code).
  { value: "FreeMono9pt7b", label: "FreeMono 9pt" },
  { value: "FreeMono12pt7b", label: "FreeMono 12pt" },
  { value: "FreeMono18pt7b", label: "FreeMono 18pt" },
  { value: "FreeMono24pt7b", label: "FreeMono 24pt" },
  { value: "FreeMonoBold9pt7b", label: "FreeMono Bold 9pt" },
  { value: "FreeMonoBold12pt7b", label: "FreeMono Bold 12pt" },
  { value: "FreeMonoBold18pt7b", label: "FreeMono Bold 18pt" },
  { value: "FreeMonoBold24pt7b", label: "FreeMono Bold 24pt" },

  { value: "FreeSans9pt7b", label: "FreeSans 9pt" },
  { value: "FreeSans12pt7b", label: "FreeSans 12pt" },
  { value: "FreeSans18pt7b", label: "FreeSans 18pt" },
  { value: "FreeSans24pt7b", label: "FreeSans 24pt" },
  { value: "FreeSansBold9pt7b", label: "FreeSans Bold 9pt" },
  { value: "FreeSansBold12pt7b", label: "FreeSans Bold 12pt" },
  { value: "FreeSansBold18pt7b", label: "FreeSans Bold 18pt" },
  { value: "FreeSansBold24pt7b", label: "FreeSans Bold 24pt" },

  { value: "FreeSerif9pt7b", label: "FreeSerif 9pt" },
  { value: "FreeSerif12pt7b", label: "FreeSerif 12pt" },
  { value: "FreeSerif18pt7b", label: "FreeSerif 18pt" },
  { value: "FreeSerif24pt7b", label: "FreeSerif 24pt" },
  { value: "FreeSerifBold9pt7b", label: "FreeSerif Bold 9pt" },
  { value: "FreeSerifBold12pt7b", label: "FreeSerif Bold 12pt" },
  { value: "FreeSerifBold18pt7b", label: "FreeSerif Bold 18pt" },
  { value: "FreeSerifBold24pt7b", label: "FreeSerif Bold 24pt" }
];

const TFT_FONT_VALUES = new Set(TFT_ESPI_FONTS.map((f) => f.value));
const U8G2_FONT_VALUES = new Set(U8G2_FONTS);

function sanitizeTftFontId(value) {
  const v = String(value || "").trim();
  return TFT_FONT_VALUES.has(v) ? v : DEFAULT_TFT_FONT;
}

function sanitizeU8g2FontName(value) {
  const v = String(value || "").trim();
  // Keep it strict so we don't generate invalid C++ identifiers.
  if (U8G2_FONT_VALUES.has(v)) return v;
  if (/^u8g2_font_[A-Za-z0-9_]+$/.test(v)) return v; // allow custom fonts user knows exist
  return DEFAULT_U8G2_FONT;
}

function getElementFontForMode(el, mode) {
  if (!el) return mode === "u8g2" ? DEFAULT_U8G2_FONT : DEFAULT_TFT_FONT;
  if (mode === "u8g2") {
    const candidate = el.u8g2Font || el.font;
    return sanitizeU8g2FontName(candidate);
  }
  const candidate = el.tftFont || el.font;
  return sanitizeTftFontId(candidate);
}

function setElementFontForMode(el, mode, value) {
  if (!el) return;
  if (mode === "u8g2") {
    const v = sanitizeU8g2FontName(value);
    el.u8g2Font = v;
    el.font = v; // backwards compat
    return;
  }
  const v = sanitizeTftFontId(value);
  el.tftFont = v;
  el.font = v; // backwards compat
}

function ensureElementFontFields(el) {
  if (!el) return;
  // Seed driver-specific fields from legacy el.font if possible.
  if (!el.u8g2Font) {
    if (typeof el.font === "string" && el.font.startsWith("u8g2_font_")) el.u8g2Font = el.font;
    else el.u8g2Font = DEFAULT_U8G2_FONT;
  }
  if (!el.tftFont) {
    if (TFT_FONT_VALUES.has(String(el.font))) el.tftFont = String(el.font);
    else el.tftFont = DEFAULT_TFT_FONT;
  }
  // Keep legacy `font` valid for the active mode.
  el.font = getElementFontForMode(el, driverMode);
}

function ensureAllElementsHaveFonts() {
  (screens || []).forEach((scr) => {
    (scr.elements || []).forEach((el) => ensureElementFontFields(el));
  });
}


function makeId() {
  return "el_" + Math.random().toString(36).substr(2, 9);
}

function deepCloneState() {
  return JSON.parse(
    JSON.stringify({
      screens,
      activeScreenId,
      dispWidth,
      dispHeight,
      bgColor,
      useSprite,
      snapToGrid,
      gridSize,
      driverMode,
      u8g2PresetId,
      tftSettingsState,
      oledSettingsState,
      // Element transparency is handled per element, no global state needed
    })
  );
}

function applyStateSnapshot(snap) {
  historyLocked = true;
  screens = snap.screens || [];
  activeScreenId = snap.activeScreenId || (screens[0] && screens[0].id) || null;
  dispWidth = snap.dispWidth || 240;
  dispHeight = snap.dispHeight || 320;
  bgColor = snap.bgColor || "#000000";
  useSprite = !!snap.useSprite;
  snapToGrid = !!snap.snapToGrid;
  gridSize = snap.gridSize || 4;
  driverMode = snap.driverMode || "tft";
  u8g2PresetId = snap.u8g2PresetId || "ssd1306_128x64_i2c_f";
  ensureAllElementsHaveFonts();
  initFontList();
  tftSettingsState = snap.tftSettingsState || {
    rotation: 0,
    colorDepth: 16,
    backlight: "none",
    touch: "none"
  };
  oledSettingsState = snap.oledSettingsState || {
    rotation: 0,
    contrast: 127,
    flipMode: "none",
    fontMode: "transparent",
    powerSave: "off"
  };

  dispWidthInput.value = dispWidth;
  dispHeightInput.value = dispHeight;
  bgColorInput.value = bgColor;
  useSpriteCheckbox.checked = useSprite;
  snapCheckbox.checked = snapToGrid;
  gridSizeInput.value = gridSize;
  displayDriverSelect.value = driverMode;
  u8g2PresetSelect.value = u8g2PresetId;

  refreshScreenUI();
  if (activeScreenId && screens.some((s) => s.id === activeScreenId)) {
    setActiveScreen(activeScreenId, false);
  } else if (screens[0]) {
    setActiveScreen(screens[0].id, false);
  }
  updateDisplaySettingsVisibility();
  updatePreviewSize();
  renderElements();
  updatePropsInputs();
  updateCode();
  historyLocked = false;
}

function pushHistory() {
  if (historyLocked) return;
  const snap = deepCloneState();
  history = history.slice(0, historyIndex + 1);
  history.push(snap);
  historyIndex = history.length - 1;
  updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
  undoBtn.disabled = historyIndex <= 0;
  redoBtn.disabled = historyIndex >= history.length - 1;
}

function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse the hex value
  let r, g, b;
  if (hex.length === 3) {
    // Short format (#RGB)
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else if (hex.length === 6) {
    // Long format (#RRGGBB)
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else {
    return null; // Invalid format
  }

  return { r, g, b };
}

function isLightColor(hex) {
  const rgb = hexToRgb(hex || "#000000");
  if (!rgb) return false;
  // Perceived luminance (0..1)
  const lum = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return lum > 0.62;
}

function getContrastingColor(hex) {
  return isLightColor(hex) ? "#111827" : "#FFFFFF";
}

function hexToRgb565(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const r5 = (r >> 3) & 0x1f;
  const g6 = (g >> 2) & 0x3f;
  const b5 = (b >> 3) & 0x1f;

  const rgb565 = (r5 << 11) | (g6 << 5) | b5;
  return "0x" + rgb565.toString(16).padStart(4, "0").toUpperCase();
}

function elementHasText(type) {
  return ["text", "label", "button", "header", "card"].includes(type);
}

function elementHasValue(type) {
  return ["progress", "slider", "toggle"].includes(type);
}

function elementHasFill(type) {
  return ["rect", "roundrect", "circle", "button", "card", "header", "progress", "slider", "toggle"].includes(type);
}

function elementSupportsAction(type) {
  return ["button", "card", "header", "label", "text"].includes(type);
}

function getPreviewFontFamily(u8g2FontName) {
  const f = String(u8g2FontName || "").toLowerCase();
  // Rough mapping: we don't have U8g2 fonts in the browser, so map to "similar" web families
  if (f.includes("helv")) return 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
  if (f.includes("ncen")) return 'Georgia, "Times New Roman", Times, serif';
  if (f.includes("profont") || f.includes("t0_") || f.includes("6x") || f.includes("5x") || f.includes("7x") || f.includes("8x") || f.includes("9x") || f.includes("10x")) {
    return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
  }
  return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
}

function getPreviewTftFontStyle(tftFontValue, textSize) {
  const v = String(tftFontValue || DEFAULT_TFT_FONT);
  const ts = Math.max(1, Number(textSize || 1));

  // Built-in bitmap fonts (1..8) — approximate sizes for browser preview.
  if (/^\d+$/.test(v)) {
    const n = Math.max(1, Math.min(8, parseInt(v, 10)));
    const basePxByFont = { 1: 12, 2: 14, 3: 16, 4: 18, 5: 20, 6: 24, 7: 28, 8: 32 };
    return {
      family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      sizePx: (basePxByFont[n] || 12) * (ts * 0.9),
      weight: "500",
    };
  }

  // FreeFonts (GFXFF) — infer family/weight/size from the name.
  const lower = v.toLowerCase();
  const ptMatch = lower.match(/(\d+)pt/);
  const pt = ptMatch ? Math.max(6, Math.min(48, parseInt(ptMatch[1], 10))) : 12;
  const isMono = lower.includes("mono");
  const isSerif = lower.includes("serif");
  const isBold = lower.includes("bold");

  const family = isMono
    ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    : (isSerif ? 'Georgia, "Times New Roman", Times, serif' : 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif');

  // 1pt ≈ 1.333px; apply textSize as a mild multiplier for preview only.
  return { family, sizePx: pt * 1.333 * (ts * 0.85), weight: isBold ? "700" : "500" };
}

function safeFnNameFromTitle(title) {
  const base = String(title || "Screen").replace(/[^a-zA-Z0-9]+/g, " ").trim();
  const camel = base
    .split(/\s+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  return "draw" + (camel || "Screen");
}

function createElementWithDefaults(type, overrides = {}) {
  const defaultStroke = getContrastingColor(bgColor);
  const defaultFill = defaultStroke;
  const defaultText = isLightColor(defaultFill) ? "#111827" : "#FFFFFF";
  const mode = getCurrentDriverMode();
  const isOled = mode === "u8g2";

  return {
    id: makeId(),
    type,
    x: 10,
    y: 10,
    w: isOled ? 48 : 80,
    h: isOled ? 16 : 30,
    text: "",
    textSize: isOled ? 1 : 2,
    fillColor: defaultFill,
    strokeColor: defaultStroke,
    textColor: defaultText,
    fillAlpha: 255,
    oledFill: true,
    value: 50,
    actionType: "",
    actionTargetScreenId: null,
    // Keep `font` aligned with active mode so preview + codegen behave correctly.
    font: mode === "tft" ? DEFAULT_TFT_FONT : DEFAULT_U8G2_FONT,
    // Seed driver-specific fields too (older projects may rely on these).
    tftFont: DEFAULT_TFT_FONT,
    u8g2Font: DEFAULT_U8G2_FONT,
    iconTintEnabled: false,
    iconTintColor: "#ffffff",
    ...overrides
  };
}

const UI_EXAMPLES = [
  {
    id: "simple_menu",
    icon: "📋",
    title: "Simple Menu",
    desc: "Header + 3 buttons",
    build: (w, h) => {
      const pad = 10;
      const headerH = 24;
      const btnH = 30;
      const gap = 10;
      const btnW = Math.min(170, Math.max(110, w - pad * 2));
      const x = Math.round((w - btnW) / 2);
      const y0 = pad + headerH + 18;
      return [
        createElementWithDefaults("header", { x: 0, y: 0, w, h: headerH, text: "Menu", textSize: 2 }),
        createElementWithDefaults("button", { x, y: y0 + (btnH + gap) * 0, w: btnW, h: btnH, text: "Start" }),
        createElementWithDefaults("button", { x, y: y0 + (btnH + gap) * 1, w: btnW, h: btnH, text: "Settings" }),
        createElementWithDefaults("button", { x, y: y0 + (btnH + gap) * 2, w: btnW, h: btnH, text: "About" })
      ];
    }
  },
  {
    id: "dashboard",
    icon: "📊",
    title: "Dashboard",
    desc: "Cards + progress",
    build: (w, h) => {
      const pad = 10;
      const headerH = 24;
      const contentY = headerH + pad;
      const cardW = Math.min(200, w - pad * 2);
      const cardH = 56;
      const x = Math.round((w - cardW) / 2);
      return [
        createElementWithDefaults("header", { x: 0, y: 0, w, h: headerH, text: "Dashboard", textSize: 2 }),
        createElementWithDefaults("card", { x, y: contentY, w: cardW, h: cardH, text: "CPU 42%", textSize: 2 }),
        createElementWithDefaults("progress", { x, y: contentY + cardH + 10, w: cardW, h: 16, value: 42 }),
        createElementWithDefaults("card", { x, y: contentY + cardH + 10 + 16 + 12, w: cardW, h: cardH, text: "RAM 68%", textSize: 2 }),
        createElementWithDefaults("progress", { x, y: contentY + cardH + 10 + 16 + 12 + cardH + 10, w: cardW, h: 16, value: 68 })
      ];
    }
  },
  {
    id: "media_player",
    icon: "🎵",
    title: "Media Player",
    desc: "Title + slider + controls",
    build: (w, h) => {
      const pad = 10;
      const headerH = 24;
      const contentY = headerH + pad;
      const cardW = Math.min(200, w - pad * 2);
      const x = Math.round((w - cardW) / 2);
      const controlsY = Math.min(h - 40 - pad, contentY + 86);
      return [
        createElementWithDefaults("header", { x: 0, y: 0, w, h: headerH, text: "Now Playing", textSize: 2 }),
        createElementWithDefaults("card", { x, y: contentY, w: cardW, h: 54, text: "Track Name", textSize: 2 }),
        createElementWithDefaults("slider", { x, y: contentY + 66, w: cardW, h: 18, value: 35 }),
        createElementWithDefaults("button", { x: x + 0, y: controlsY, w: Math.floor((cardW - 16) / 3), h: 30, text: "⏮" }),
        createElementWithDefaults("button", { x: x + Math.floor((cardW - 16) / 3) + 8, y: controlsY, w: Math.floor((cardW - 16) / 3), h: 30, text: "⏯" }),
        createElementWithDefaults("button", { x: x + (Math.floor((cardW - 16) / 3) + 8) * 2, y: controlsY, w: Math.floor((cardW - 16) / 3), h: 30, text: "⏭" })
      ];
    }
  }
  ,
  {
    id: "tft_settings_panel",
    icon: "⚙️",
    title: "Settings Panel",
    desc: "Header + labels + toggles",
    build: (w, h) => {
      const pad = 10;
      const headerH = 26;
      const x = pad;
      const rowW = Math.max(140, w - pad * 2);
      const rowH = 22;
      const y0 = headerH + 14;
      return [
        createElementWithDefaults("header", { x: 0, y: 0, w, h: headerH, text: "Settings", textSize: 2 }),
        createElementWithDefaults("text", { x, y: y0, w: rowW, h: rowH, text: "WiFi", textSize: 2 }),
        createElementWithDefaults("toggle", { x: w - pad - 56, y: y0 - 2, w: 56, h: 22, value: 100 }),
        createElementWithDefaults("text", { x, y: y0 + 34, w: rowW, h: rowH, text: "Bluetooth", textSize: 2 }),
        createElementWithDefaults("toggle", { x: w - pad - 56, y: y0 + 32, w: 56, h: 22, value: 0 }),
        createElementWithDefaults("text", { x, y: y0 + 68, w: rowW, h: rowH, text: "Brightness", textSize: 2 }),
        createElementWithDefaults("slider", { x: x, y: y0 + 92, w: rowW, h: 18, value: 70 })
      ];
    }
  },
  {
    id: "tft_now_playing_card",
    icon: "🎧",
    title: "Now Playing Card",
    desc: "Artwork + title + progress",
    build: (w, h) => {
      const pad = 12;
      const headerH = 26;
      const cardW = Math.min(240, w - pad * 2);
      const cardH = 110;
      const x = Math.round((w - cardW) / 2);
      const y = headerH + 14;
      const art = 64;
      return [
        createElementWithDefaults("header", { x: 0, y: 0, w, h: headerH, text: "Music", textSize: 2 }),
        createElementWithDefaults("card", { x, y, w: cardW, h: cardH, text: "", textSize: 2 }),
        createElementWithDefaults("roundrect", { x: x + 12, y: y + 12, w: art, h: art, fillAlpha: 80 }),
        createElementWithDefaults("text", { x: x + 12 + art + 12, y: y + 18, w: cardW - (12 + art + 24), h: 42, text: "Track Name\nArtist", textSize: 2 }),
        createElementWithDefaults("progress", { x: x + 12, y: y + cardH - 26, w: cardW - 24, h: 14, value: 35 })
      ];
    }
  },
  {
    id: "tft_two_cards",
    icon: "🧾",
    title: "Two Cards",
    desc: "Two stat cards + buttons",
    build: (w, h) => {
      const pad = 10;
      const headerH = 26;
      const cardW = Math.min(240, w - pad * 2);
      const x = Math.round((w - cardW) / 2);
      const cardH = 62;
      const y0 = headerH + 14;
      const btnW = Math.floor((cardW - 10) / 2);
      return [
        createElementWithDefaults("header", { x: 0, y: 0, w, h: headerH, text: "Overview", textSize: 2 }),
        createElementWithDefaults("card", { x, y: y0, w: cardW, h: cardH, text: "CPU 42%\nTemp 55°C", textSize: 2 }),
        createElementWithDefaults("card", { x, y: y0 + cardH + 10, w: cardW, h: cardH, text: "RAM 68%\nDisk 21%", textSize: 2 }),
        createElementWithDefaults("button", { x, y: y0 + (cardH + 10) * 2 + 4, w: btnW, h: 30, text: "Details" }),
        createElementWithDefaults("button", { x: x + btnW + 10, y: y0 + (cardH + 10) * 2 + 4, w: btnW, h: 30, text: "Refresh" })
      ];
    }
  },
  {
    id: "tft_login",
    icon: "🔐",
    title: "Login",
    desc: "Title + fields + button",
    build: (w, h) => {
      const pad = 12;
      const headerH = 26;
      const boxW = Math.min(220, w - pad * 2);
      const x = Math.round((w - boxW) / 2);
      const y0 = headerH + 18;
      return [
        createElementWithDefaults("header", { x: 0, y: 0, w, h: headerH, text: "Sign In", textSize: 2 }),
        createElementWithDefaults("text", { x, y: y0, w: boxW, h: 20, text: "Username", textSize: 2 }),
        createElementWithDefaults("roundrect", { x, y: y0 + 22, w: boxW, h: 28, fillAlpha: 40 }),
        createElementWithDefaults("text", { x, y: y0 + 60, w: boxW, h: 20, text: "Password", textSize: 2 }),
        createElementWithDefaults("roundrect", { x, y: y0 + 82, w: boxW, h: 28, fillAlpha: 40 }),
        createElementWithDefaults("button", { x, y: y0 + 124, w: boxW, h: 32, text: "Login" })
      ];
    }
  }
];

const UI_EXAMPLES_OLED = [
  {
    id: "oled_status",
    icon: "🟦",
    title: "OLED Status",
    desc: "Header + 2 lines + signal",
    build: (w, h) => {
      const pad = 4;
      const headerH = 12;
      const barW = Math.max(40, Math.min(60, w - pad * 2));
      return [
        createElementWithDefaults("header", { x: 0, y: 0, w, h: headerH, text: "STATUS", textSize: 1 }),
        createElementWithDefaults("text", { x: pad, y: headerH + 4, w: w - pad * 2, h: 24, text: "WiFi: OK\nBAT: 82%", textSize: 1 }),
        createElementWithDefaults("progress", { x: w - barW - pad, y: headerH + 4, w: barW, h: 10, value: 82 })
      ];
    }
  },
  {
    id: "oled_menu",
    icon: "📋",
    title: "OLED Menu",
    desc: "Title + list",
    build: (w, h) => {
      const pad = 4;
      const headerH = 12;
      return [
        createElementWithDefaults("header", { x: 0, y: 0, w, h: headerH, text: "MENU", textSize: 1 }),
        createElementWithDefaults("text", { x: pad, y: headerH + 4, w: w - pad * 2, h: h - headerH - 8, text: "> Start\n  Settings\n  About", textSize: 1 })
      ];
    }
  }
  ,
  {
    id: "oled_now_playing",
    icon: "🎵",
    title: "OLED Now Playing",
    desc: "Compact player",
    build: (w, h) => {
      const pad = 4;
      const headerH = 12;
      const barY = h - 10 - pad;
      return [
        createElementWithDefaults("header", { x: 0, y: 0, w, h: headerH, text: "PLAY", textSize: 1 }),
        createElementWithDefaults("text", { x: pad, y: headerH + 4, w: w - pad * 2, h: 26, text: "Track\nArtist", textSize: 1 }),
        createElementWithDefaults("progress", { x: pad, y: barY, w: w - pad * 2, h: 8, value: 35 })
      ];
    }
  },
  {
    id: "oled_sensor_grid",
    icon: "🌡️",
    title: "OLED Sensors",
    desc: "2x2 compact stats",
    build: (w, h) => {
      const pad = 3;
      const headerH = 12;
      const boxW = Math.floor((w - pad * 3) / 2);
      const boxH = Math.floor((h - headerH - pad * 3) / 2);
      const y0 = headerH + pad;
      return [
        createElementWithDefaults("header", { x: 0, y: 0, w, h: headerH, text: "SENS", textSize: 1 }),
        createElementWithDefaults("roundrect", { x: pad, y: y0, w: boxW, h: boxH, oledFill: false }),
        createElementWithDefaults("text", { x: pad + 2, y: y0 + 2, w: boxW - 4, h: boxH - 4, text: "T:25C", textSize: 1 }),
        createElementWithDefaults("roundrect", { x: pad * 2 + boxW, y: y0, w: boxW, h: boxH, oledFill: false }),
        createElementWithDefaults("text", { x: pad * 2 + boxW + 2, y: y0 + 2, w: boxW - 4, h: boxH - 4, text: "H:44%", textSize: 1 }),
        createElementWithDefaults("roundrect", { x: pad, y: y0 + boxH + pad, w: boxW, h: boxH, oledFill: false }),
        createElementWithDefaults("text", { x: pad + 2, y: y0 + boxH + pad + 2, w: boxW - 4, h: boxH - 4, text: "P:1.0", textSize: 1 }),
        createElementWithDefaults("roundrect", { x: pad * 2 + boxW, y: y0 + boxH + pad, w: boxW, h: boxH, oledFill: false }),
        createElementWithDefaults("text", { x: pad * 2 + boxW + 2, y: y0 + boxH + pad + 2, w: boxW - 4, h: boxH - 4, text: "V:3.9", textSize: 1 })
      ];
    }
  },
  {
    id: "oled_dialog",
    icon: "💬",
    title: "OLED Dialog",
    desc: "Message + buttons",
    build: (w, h) => {
      const pad = 4;
      const headerH = 12;
      const btnH = 12;
      const btnW = Math.floor((w - pad * 3) / 2);
      const yBtn = h - btnH - pad;
      return [
        createElementWithDefaults("header", { x: 0, y: 0, w, h: headerH, text: "ALERT", textSize: 1 }),
        createElementWithDefaults("text", { x: pad, y: headerH + 4, w: w - pad * 2, h: h - headerH - btnH - pad * 3, text: "Delete file?", textSize: 1 }),
        createElementWithDefaults("button", { x: pad, y: yBtn, w: btnW, h: btnH, text: "NO", textSize: 1 }),
        createElementWithDefaults("button", { x: pad * 2 + btnW, y: yBtn, w: btnW, h: btnH, text: "YES", textSize: 1 })
      ];
    }
  },
  {
    id: "oled_wifi",
    icon: "📶",
    title: "OLED WiFi",
    desc: "SSID + strength",
    build: (w, h) => {
      const pad = 4;
      const headerH = 12;
      return [
        createElementWithDefaults("header", { x: 0, y: 0, w, h: headerH, text: "WIFI", textSize: 1 }),
        createElementWithDefaults("text", { x: pad, y: headerH + 4, w: w - pad * 2, h: 28, text: "SSID: HomeNet\nIP: 192.168.0.5", textSize: 1 }),
        createElementWithDefaults("progress", { x: pad, y: h - 10 - pad, w: w - pad * 2, h: 8, value: 80 })
      ];
    }
  }
];

let FILE_ICONS = []; // { file, name, tags, url }
let ICON_SIZE_FILTER = "all"; // "all" | "16x16" | "32x32"
let ICON_ASSET_BUST = Date.now(); // cache-buster for icon PNG bytes (helps when files are replaced)
let ICON_AUTO_SCAN_ENABLED = true;
let LAST_ICON_SIGNATURE = "";
const ICONS_PER_PAGE = 30;
let iconPage = 0; // 0-based

function setIconHint(text) {
  if (!iconHint) return;
  iconHint.textContent = text;
  clearTimeout(setIconHint._t);
  setIconHint._t = setTimeout(() => {
    iconHint.textContent = "Click an icon to add it as an element. Shift+Click also copies its path.";
  }, 1400);
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function reloadIconManifestScript() {
  // `icons/manifest.js` is loaded once at page load; "Refresh" should be able to pick up changes.
  // We inject it again with a cache-busting query. This works for http(s) and typically for file:// too.
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = `icons/manifest.js?v=${Date.now()}`;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

function withCacheBust(url) {
  if (!url) return url;
  const join = url.includes("?") ? "&" : "?";
  return `${url}${join}v=${ICON_ASSET_BUST}`;
}

function bytesToHexByte(v) {
  return "0x" + (v & 0xff).toString(16).padStart(2, "0").toUpperCase();
}

function uint16ToHexWord(v) {
  return "0x" + (v & 0xffff).toString(16).padStart(4, "0").toUpperCase();
}

async function exportAllIconsTftRgb565() {
  if (!FILE_ICONS.length) {
    setIconHint("No icons loaded. Check your icon manifest.");
    return;
  }
  setIconHint("Exporting TFT RGB565…");

  let out = "";
  out += "// Auto-generated by DisplayKit (Icon List → Export TFT)\n";
  out += "#pragma once\n\n";
  out += "#include <Arduino.h>\n";
  out += "#include <pgmspace.h>\n\n";
  out += "// Note: any transparent pixels are mapped to the current DisplayKit background color.\n\n";

  for (let idx = 0; idx < FILE_ICONS.length; idx++) {
    const ic = FILE_ICONS[idx];
    const size = inferSizeFromPath(ic.file);
    const w = size?.w || undefined;
    const h = size?.h || undefined;
    try {
      const converted = await loadPngToRgb565(withCacheBust(ic.url), bgColor, w, h, null);
      const sym = safeSymbolFromPath(ic.file);
      const name = `icon_${sym}_${converted.w}x${converted.h}`;
      const total = converted.w * converted.h;
      out += `// ${ic.file}\n`;
      out += `const uint16_t ${name}[${total}] PROGMEM = {\n`;
      for (let i = 0; i < converted.rgb565.length; i++) {
        const isLast = i === converted.rgb565.length - 1;
        if (i % 12 === 0) out += "  ";
        out += uint16ToHexWord(converted.rgb565[i]);
        out += isLast ? "" : ", ";
        if (i % 12 === 11 || isLast) out += "\n";
      }
      out += "};\n\n";
    } catch (e) {
      out += `// ${ic.file}\n`;
      out += `// ERROR: ${e && e.message ? e.message : "conversion failed"}\n\n`;
    }
  }

  downloadText("displaykit_icons_rgb565.h", out);
  setIconHint("Exported: displaykit_icons_rgb565.h");
}

async function exportAllIconsU8g2Xbm() {
  if (!FILE_ICONS.length) {
    setIconHint("No icons loaded. Check your icon manifest.");
    return;
  }
  setIconHint("Exporting U8g2 XBM…");

  let out = "";
  out += "// Auto-generated by DisplayKit (Icon List → Export U8g2)\n";
  out += "#pragma once\n\n";
  out += "#include <Arduino.h>\n";
  out += "#include <pgmspace.h>\n\n";
  out += "// Use with: u8g2.drawXBMP(x, y, w, h, <name>);\n\n";

  for (let idx = 0; idx < FILE_ICONS.length; idx++) {
    const ic = FILE_ICONS[idx];
    const size = inferSizeFromPath(ic.file);
    const w = size?.w || undefined;
    const h = size?.h || undefined;
    try {
      const converted = await loadPngToRgb565(withCacheBust(ic.url), "#000000", w, h, null);
      const sym = safeSymbolFromPath(ic.file);
      const name = `icon_${sym}_${converted.w}x${converted.h}_xbm`;
      const bytes = converted.monoBitmap || [];
      out += `// ${ic.file}\n`;
      out += `#define ${name}_width ${converted.w}\n`;
      out += `#define ${name}_height ${converted.h}\n`;
      out += `const unsigned char ${name}[${bytes.length}] PROGMEM = {\n`;
      for (let i = 0; i < bytes.length; i++) {
        const isLast = i === bytes.length - 1;
        if (i % 16 === 0) out += "  ";
        out += bytesToHexByte(bytes[i]);
        out += isLast ? "" : ", ";
        if (i % 16 === 15 || isLast) out += "\n";
      }
      out += "};\n\n";
    } catch (e) {
      out += `// ${ic.file}\n`;
      out += `// ERROR: ${e && e.message ? e.message : "conversion failed"}\n\n`;
    }
  }

  downloadText("displaykit_icons_xbm.h", out);
  setIconHint("Exported: displaykit_icons_xbm.h");
}

let uiExamplesActiveTab = "tft"; // "tft" | "oled"
const UI_EXAMPLES_PER_PAGE = 3;
const uiExamplesPageByTab = { tft: 0, oled: 0 }; // 0-based

function setUiExamplesTab(tab) {
  uiExamplesActiveTab = tab === "oled" ? "oled" : "tft";
  if (uiExamplesTabTft) {
    const active = uiExamplesActiveTab === "tft";
    uiExamplesTabTft.classList.toggle("active", active);
    uiExamplesTabTft.setAttribute("aria-selected", active ? "true" : "false");
  }
  if (uiExamplesTabOled) {
    const active = uiExamplesActiveTab === "oled";
    uiExamplesTabOled.classList.toggle("active", active);
    uiExamplesTabOled.setAttribute("aria-selected", active ? "true" : "false");
  }
  renderUiExamples();
}

function renderUiExamples() {
  if (!uiExamplesList) return;
  uiExamplesList.innerHTML = "";

  const list = uiExamplesActiveTab === "oled" ? UI_EXAMPLES_OLED : UI_EXAMPLES;
  const totalPages = Math.max(1, Math.ceil(list.length / UI_EXAMPLES_PER_PAGE));
  const currentPage = Math.min(
    totalPages - 1,
    Math.max(0, uiExamplesPageByTab[uiExamplesActiveTab] || 0)
  );
  uiExamplesPageByTab[uiExamplesActiveTab] = currentPage;

  if (uiExamplesPagePill) {
    uiExamplesPagePill.textContent = `Page ${currentPage + 1} / ${totalPages}`;
  }
  if (uiExamplesPrevBtn) uiExamplesPrevBtn.disabled = currentPage <= 0;
  if (uiExamplesNextBtn) uiExamplesNextBtn.disabled = currentPage >= totalPages - 1;

  const start = currentPage * UI_EXAMPLES_PER_PAGE;
  const pageItems = list.slice(start, start + UI_EXAMPLES_PER_PAGE);

  pageItems.forEach((ex) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "link-chip example-chip";
    btn.innerHTML = `
      <span class="icon">${ex.icon}</span>
      <span class="example-chip-text">
        <span class="example-chip-title">${ex.title}</span>
        <span class="example-chip-desc">${ex.desc}</span>
      </span>
    `;
    btn.addEventListener("click", () => {
      const screen = createScreen(ex.title, safeFnNameFromTitle(ex.title));
      screen.elements = ex.build(dispWidth, dispHeight);
      refreshScreenUI();
      setActiveScreen(screen.id, false);
      pushHistory();
      scrollToScreensSettings();
    });
    uiExamplesList.appendChild(btn);
  });
}

function normalizeIconNameFromFile(file) {
  const raw = String(file || "").replace(/\\/g, "/");
  const baseName = raw.split("/").pop() || raw;
  const base = String(baseName || "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return base || "icon";
}

function buildIconUrl(file) {
  // Important: encode spaces and other characters safely, without breaking subpaths
  const raw = String(file || "").replace(/\\/g, "/").replace(/^\/+/, "");
  const encoded = raw
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `icons/${encoded}`;
}

function inferTagsFromName(name) {
  return String(name || "")
    .toLowerCase()
    .split(/\s+/g)
    .filter(Boolean);
}

function inferSizeFromPath(file) {
  const raw = String(file || "").replace(/\\/g, "/");
  const parts = raw.split("/").filter(Boolean);
  // Look for a folder like "16x16" / "32x32"
  for (const part of parts) {
    const m = part.match(/^(\d+)x(\d+)$/i);
    if (m) {
      const w = parseInt(m[1], 10);
      const h = parseInt(m[2], 10);
      if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
        return { w, h, tag: `${w}x${h}` };
      }
    }
  }
  return null;
}

function safeSymbolFromPath(path) {
  const raw = String(path || "").replace(/\\/g, "/");
  const base = raw.split("/").pop() || raw;
  const noExt = base.replace(/\.[a-z0-9]+$/i, "");
  const sym = noExt.replace(/[^a-zA-Z0-9_]/g, "_");
  return sym || "icon";
}

function imageDataToRgb565(data, w, h, bgHex) {
  const rgb565 = new Array(w * h);
  const bg = hexToRgb(bgHex || "#000000") || { r: 0, g: 0, b: 0 };
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const a = data[i + 3];
    // No alpha on TFT pushImage; blend with current background for preview + export
    const r = a < 16 ? bg.r : data[i];
    const g = a < 16 ? bg.g : data[i + 1];
    const b = a < 16 ? bg.b : data[i + 2];
    const r5 = (r >> 3) & 0x1f;
    const g6 = (g >> 2) & 0x3f;
    const b5 = (b >> 3) & 0x1f;
    rgb565[p] = (r5 << 11) | (g6 << 5) | b5;
  }
  return rgb565;
}

function buildMonoBitmapFromImageData(imageData, w, h, alphaThreshold = 16, lumaThreshold = 0.35) {
  // U8g2 drawXBMP expects XBM bit order: LSB first within each byte, row-major.
  const bytesPerRow = Math.ceil(w / 8);
  const out = new Uint8Array(bytesPerRow * h);
  const d = imageData.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const on = a >= alphaThreshold && lum >= lumaThreshold;
      if (on) {
        const byteIndex = y * bytesPerRow + (x >> 3);
        const bit = x & 7; // LSB first
        out[byteIndex] |= (1 << bit);
      }
    }
  }
  return Array.from(out);
}

function loadPngToRgb565(src, bgHex, targetW, targetH, tintHex) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Same-origin typically; set anyway for hosted builds
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;
        const w = targetW || naturalW;
        const h = targetH || naturalH;
        if (!w || !h) throw new Error("Invalid icon dimensions.");
        imgCanvas.width = w;
        imgCanvas.height = h;
        imgCtx.clearRect(0, 0, w, h);
        imgCtx.drawImage(img, 0, 0, w, h);
        const imageData = imgCtx.getImageData(0, 0, w, h);

        // If tint enabled, recolor non-transparent pixels before converting
        if (tintHex) {
          const t = hexToRgb(tintHex) || { r: 255, g: 255, b: 255 };
          const d = imageData.data;
          for (let i = 0; i < d.length; i += 4) {
            const a = d[i + 3];
            if (a >= 16) {
              d[i] = t.r;
              d[i + 1] = t.g;
              d[i + 2] = t.b;
            }
          }
        }

        const rgb565 = imageDataToRgb565(imageData.data, w, h, bgHex);
        const monoBitmap = buildMonoBitmapFromImageData(imageData, w, h);
        resolve({ w, h, rgb565, monoBitmap });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Failed to load icon image."));
    img.src = src;
  });
}

function schedule(fn, delayMs = 150) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delayMs);
  };
}

const scheduleRecomputeSelectedIcon = schedule(async () => {
  const el = elements.find((e) => e.id === selectedId);
  if (!el || el.type !== "icon" || !el.iconSrc) return;
  try {
    const tintHex = el.iconTintEnabled ? (el.iconTintColor || "#ffffff") : null;
    const converted = await loadPngToRgb565(el.iconSrc, bgColor, el.w, el.h, tintHex);
    el.imageWidth = converted.w;
    el.imageHeight = converted.h;
    el.rgb565 = converted.rgb565;
    el.monoBitmap = converted.monoBitmap;
    // keep name stable-ish (but unique per element)
    if (!el.imageName) {
      const baseSym = safeSymbolFromPath(el.iconFile || el.iconSrc || el.id);
      el.imageName = `icon_${baseSym}_${el.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
    }
    updateCode();
  } catch {
    // ignore conversion errors
  }
}, 220);

async function loadFileIcons() {
  // 0) Best-effort auto-scan (localhost/dev only): parse directory listings to discover icons
  // This allows new files dropped into icons/ to appear without manually editing manifests.
  // It only works when served by a server that exposes directory listings (e.g. `py -m http.server`).
  if (ICON_AUTO_SCAN_ENABLED && (location.protocol === "http:" || location.protocol === "https:")) {
    const auto = await tryLoadIconsFromDirectoryListing();
    if (auto && auto.length) {
      FILE_ICONS = auto;
      return;
    }
  }

  // Prefer JSON on GitHub Pages to avoid relying on cached injected scripts.
  const isGitHubPages = /github\.io$/i.test(location.hostname || "");
  if (isGitHubPages) {
    try {
      const res = await fetch(`icons/manifest.json?v=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("manifest not found");
      const manifest = await res.json();
      const files = Array.isArray(manifest.files) ? manifest.files : [];
      FILE_ICONS = files.map((file) => {
        const name = normalizeIconNameFromFile(file);
        const size = inferSizeFromPath(file);
        return {
          file,
          name,
          tags: [...inferTagsFromName(name), ...(size?.tag ? [size.tag] : [])],
          url: buildIconUrl(file)
        };
      });
      return;
    } catch {
      // fall through to injected manifest as a last resort
    }
  }

  // 1) Prefer JS-injected manifest (works on file://)
  try {
    const injected = window.DISPLAYKIT_ICON_MANIFEST;
    if (injected && Array.isArray(injected.files) && injected.files.length) {
      const files = injected.files;
      FILE_ICONS = files.map((file) => {
        const name = normalizeIconNameFromFile(file);
        const size = inferSizeFromPath(file);
        return {
          file,
          name,
          tags: [...inferTagsFromName(name), ...(size?.tag ? [size.tag] : [])],
          url: buildIconUrl(file)
        };
      });
      return;
    }
  } catch {
    // ignore
  }

  // 2) Fallback to JSON manifest (works on http/https)
  try {
    const res = await fetch("icons/manifest.json", { cache: "no-store" });
    if (!res.ok) throw new Error("manifest not found");
    const manifest = await res.json();
    const files = Array.isArray(manifest.files) ? manifest.files : [];
    FILE_ICONS = files.map((file) => {
      const name = normalizeIconNameFromFile(file);
      const size = inferSizeFromPath(file);
      return {
        file,
        name,
        tags: [...inferTagsFromName(name), ...(size?.tag ? [size.tag] : [])],
        url: buildIconUrl(file)
      };
    });
    if (!FILE_ICONS.length) {
      setIconHint("No icons found in icons/manifest.json.");
    }
  } catch (e) {
    FILE_ICONS = [];
    setIconHint("Could not load icons. If you opened via file://, use the included icons/manifest.js. If hosted, ensure icons/manifest.json is reachable.");
  }
}

async function fetchDirListingPngFiles(dirHref) {
  try {
    const res = await fetch(`${dirHref}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return [];
    const text = await res.text();
    // Parse Apache/python http.server listings (simple HTML with <a href="...">)
    const doc = new DOMParser().parseFromString(text, "text/html");
    const anchors = Array.from(doc.querySelectorAll("a[href]"));
    const files = anchors
      .map((a) => a.getAttribute("href") || "")
      .filter((href) => href && !href.startsWith("?") && !href.startsWith("#"))
      .map((href) => href.replace(/\\/g, "/"))
      .filter((href) => href.toLowerCase().endsWith(".png"))
      // decode URL-encoded names from listing
      .map((href) => {
        try { return decodeURIComponent(href); } catch { return href; }
      })
      // drop any path segments, keep filename only
      .map((href) => (href.split("/").pop() || href).trim())
      .filter(Boolean);
    // Deduplicate
    return Array.from(new Set(files));
  } catch {
    return [];
  }
}

async function tryLoadIconsFromDirectoryListing() {
  // Try known size folders; if they don't exist or listing is disabled, we'll fall back.
  const dirs = ["icons/16x16/", "icons/32x32/"];
  const all = [];
  for (const dir of dirs) {
    const sizeTag = dir.includes("16x16") ? "16x16" : (dir.includes("32x32") ? "32x32" : null);
    const files = await fetchDirListingPngFiles(dir);
    files.forEach((file) => {
      const rel = `${sizeTag}/${file}`;
      const name = normalizeIconNameFromFile(rel);
      all.push({
        file: rel,
        name,
        tags: [...inferTagsFromName(name), ...(sizeTag ? [sizeTag] : [])],
        url: buildIconUrl(rel)
      });
    });
  }
  // Sort for stable UI
  all.sort((a, b) => (a.file || "").localeCompare(b.file || ""));
  return all;
}

function signatureForIcons(list) {
  return (list || []).map((i) => i.file).join("|");
}

function filterFileIcons(query) {
  const q = String(query || "").trim().toLowerCase();
  return FILE_ICONS.filter((i) => {
    if (ICON_SIZE_FILTER !== "all" && !(i.tags || []).includes(ICON_SIZE_FILTER)) return false;
    const hay = [i.name, i.file, ...(i.tags || [])].join(" ").toLowerCase();
    if (!q) return true;
    return hay.includes(q);
  });
}

async function addIconElement(icon) {
  const inferred = inferSizeFromPath(icon.file);
  const sizeW = inferred?.w || 32;
  const sizeH = inferred?.h || 32;
  const x = Math.max(0, Math.round((dispWidth - sizeW) / 2));
  const y = Math.max(0, Math.round((dispHeight - sizeH) / 2));

  // Try to convert the PNG to RGB565 so it can be emitted in TFT code output.
  let rgb565 = null;
  let monoBitmap = null;
  let iw = sizeW;
  let ih = sizeH;
  try {
    const converted = await loadPngToRgb565(withCacheBust(icon.url), bgColor, sizeW, sizeH, null);
    iw = converted.w;
    ih = converted.h;
    rgb565 = converted.rgb565;
    monoBitmap = converted.monoBitmap;
  } catch {
    // Keep preview-only if conversion fails (e.g., browser blocks canvas due to file/cors)
  }

  const id = makeId();
  const baseSym = safeSymbolFromPath(icon.file);
  const el = createElementWithDefaults("icon", {
    id,
    x,
    y,
    w: iw,
    h: ih,
    iconFile: icon.file,
    iconSrc: withCacheBust(icon.url),
    imageName: `icon_${baseSym}_${id.replace(/[^a-zA-Z0-9_]/g, "_")}`,
    imageWidth: iw,
    imageHeight: ih,
    rgb565: rgb565 || undefined,
    monoBitmap: monoBitmap || undefined
  });

  elements.push(el);
  syncActiveScreenElements();
  selectedId = el.id;
  updatePreviewSize();
  renderElements();
  updatePropsInputs();
  updateCode();
  pushHistory();
  scrollToSelectedElementSettings();
}

function renderIconGrid() {
  if (!iconGrid) return;
  const icons = filterFileIcons(iconSearchInput ? iconSearchInput.value : "");
  iconGrid.innerHTML = "";
  if (iconCountPill) {
    iconCountPill.textContent = `${icons.length} icons`;
  }

  const totalPages = Math.max(1, Math.ceil(icons.length / ICONS_PER_PAGE));
  iconPage = Math.min(totalPages - 1, Math.max(0, iconPage));
  if (iconPagePill) iconPagePill.textContent = `Page ${iconPage + 1} / ${totalPages}`;
  if (iconPrevBtn) iconPrevBtn.disabled = iconPage <= 0;
  if (iconNextBtn) iconNextBtn.disabled = iconPage >= totalPages - 1;

  const start = iconPage * ICONS_PER_PAGE;
  const pageIcons = icons.slice(start, start + ICONS_PER_PAGE);

  pageIcons.forEach((ic) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "icon-tile";
    btn.title = ic.name;
    const img = document.createElement("img");
    img.src = withCacheBust(ic.url);
    img.alt = ic.name;
    img.loading = "lazy";
    btn.appendChild(img);

    btn.addEventListener("click", async (e) => {
      await addIconElement(ic);
      if (e.shiftKey) {
        try {
          await navigator.clipboard.writeText(ic.url);
          setIconHint(`Added + copied: ${ic.url}`);
        } catch {
          setIconHint(`Added: ${ic.name}`);
        }
      } else {
        setIconHint(`Added: ${ic.name}`);
      }
    });
    iconGrid.appendChild(btn);
  });
}


function createScreen(name, fnName) {
  const id = makeId();
  const safeName = name || "Screen " + (screens.length + 1);
  const defaultFn = "draw" + safeName.replace(/\s+/g, "");
  const screen = {
    id,
    name: safeName,
    fnName: fnName || defaultFn,
    elements: [],
  };
  screens.push(screen);
  return screen;
}

function refreshScreenUI() {
  screenSelect.innerHTML = "";
  screens.forEach((scr) => {
    const opt = document.createElement("option");
    opt.value = scr.id;
    opt.textContent = scr.name;
    screenSelect.appendChild(opt);
  });
  if (activeScreenId && screens.some((s) => s.id === activeScreenId)) {
    screenSelect.value = activeScreenId;
  }
}

function setActiveScreen(id, push = true) {
  const screen = screens.find((s) => s.id === id);
  if (!screen) return;
  activeScreenId = id;
  elements = screen.elements;
  selectedId = null;
  refreshScreenUI();
  screenSelect.value = id;
  screenFnNameInput.value = screen.fnName || "";
  updatePreviewSize();
  renderElements();
  updatePropsInputs();
  updateCode();
  if (push) pushHistory();
}

function syncActiveScreenElements() {
  const scr = screens.find((s) => s.id === activeScreenId);
  if (!scr) return;
  // Ensure `screens` always reflects the current `elements` array.
  scr.elements = elements;
}

function initScreens() {
  if (screens.length === 0) {
    const home = createScreen("Home", "drawHomeScreen");
    createScreen("Settings", "drawSettingsScreen");
    refreshScreenUI();
    setActiveScreen(home.id, false);
  } else {
    refreshScreenUI();
    setActiveScreen(screens[0].id, false);
  }
  updatePreviewSize();
  renderElements();
  updatePropsInputs();
  updateCode();
  pushHistory();
}

function initU8g2Presets() {
  u8g2PresetSelect.innerHTML = "";
  U8G2_PRESETS.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.label;
    u8g2PresetSelect.appendChild(opt);
  });
  u8g2PresetSelect.value = u8g2PresetId;
}

function initFontList() {
  propFont.innerHTML = "";

  // Populate fonts based on current driver mode
  const mode = getCurrentDriverMode();
  if (mode === "tft") {
    // TFT_eSPI fonts
    TFT_ESPI_FONTS.forEach(font => {
      const opt = document.createElement("option");
      opt.value = font.value;
      opt.textContent = font.label;
      propFont.appendChild(opt);
    });
  } else {
    // U8g2 fonts
    U8G2_FONTS.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      propFont.appendChild(opt);
    });
  }
}


function updatePreviewSize() {
  const previewWrapper = document.querySelector(".preview-wrapper");
  if (!previewWrapper) return;
  
  
  const wrapperRect = previewWrapper.getBoundingClientRect();
  const availableWidth = wrapperRect.width - 32; 
  const availableHeight = wrapperRect.height - 32; 
  
  
  const baseScale = Math.min(
    availableWidth / dispWidth,
    availableHeight / dispHeight
  );
  const rawScale = baseScale * zoomFactor;
  // OLED should scale by an integer so everything snaps to the pixel grid.
  const scale = driverMode === "u8g2"
    ? Math.max(1, Math.floor(rawScale))
    : rawScale;

  preview.style.width = dispWidth * scale + "px";
  preview.style.height = dispHeight * scale + "px";
  preview.style.backgroundColor = bgColor;

  // OLED mode: show individual pixels
  if (driverMode === "u8g2") {
    preview.classList.add('oled-display');
    // For OLED, use nearest neighbor scaling to show pixels clearly
    preview.style.imageRendering = 'pixelated';
    preview.style.imageRendering = '-moz-crisp-edges';
    preview.style.imageRendering = 'crisp-edges';

    // Set pixel grid size based on scale (each display pixel = 1 physical pixel at 1:1 scale)
    const pixelSize = Math.max(1, scale);
    preview.style.setProperty('--pixel-size', pixelSize + 'px');
  } else {
    preview.classList.remove('oled-display');
    preview.style.imageRendering = 'auto';
    preview.style.removeProperty('--pixel-size');
  }

  preview.dataset.scale = scale;
  const driverLabel = driverMode === "u8g2" ? "U8g2 OLED" : "TFT_eSPI";
  displayInfo.textContent = `${driverLabel} · ${dispWidth}x${dispHeight} px`;
}


function convertToOLEDColor(color) {
  if (!color || color === "transparent") return "#000000";

  // For OLED displays, convert to cyan shades for consistency with cyan theme
  // Check if color is already a hex color
  if (color.startsWith('#')) {
    // Convert to grayscale then to cyan shades
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate luminance (brightness)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    if (luminance < 0.1) return "#002244"; // Very dark cyan
    if (luminance < 0.2) return "#004466"; // Dark cyan
    if (luminance < 0.3) return "#006688"; // Medium-dark cyan
    if (luminance < 0.4) return "#0088aa"; // Medium cyan
    if (luminance < 0.5) return "#00aacc"; // Light medium cyan
    if (luminance < 0.6) return "#00ccee"; // Light cyan
    if (luminance < 0.7) return "#22ddff"; // Bright cyan
    if (luminance < 0.8) return "#44eeff"; // Very bright cyan
    if (luminance < 0.9) return "#66ffff"; // Maximum cyan
    return "#88ffff"; // Ultra bright cyan
  }

  // Handle named colors with OLED-appropriate cyan shades
  const colorMap = {
    "white": "#88ffff",  // Bright cyan
    "black": "#002244",  // Dark cyan
    "gray": "#006688",   // Medium cyan
    "grey": "#006688",
    "red": "#0088aa",    // Medium cyan
    "green": "#00ccee",  // Light cyan
    "blue": "#44eeff",   // Bright cyan
    "yellow": "#66ffff", // Very bright cyan
    "orange": "#22ddff", // Bright cyan
    "purple": "#00aacc", // Light medium cyan
    "pink": "#44eeff",   // Bright cyan
    "cyan": "#88ffff",   // Ultra bright cyan (keeps cyan bright)
    "magenta": "#22ddff", // Bright cyan
    "brown": "#004466",  // Dark cyan
    "navy": "#002244",   // Very dark cyan
    "maroon": "#004466", // Dark cyan
    "olive": "#006688"   // Medium cyan
  };

  return colorMap[color.toLowerCase()] || "#0088aa";
}

// OLED canvas rendering helpers (pixel-accurate preview)
const _oledImageCache = new Map(); // src -> HTMLImageElement
const _oledTextCanvas = document.createElement("canvas");
const _oledTextCtx = _oledTextCanvas.getContext("2d", { willReadFrequently: true });

function getCachedOledImage(src) {
  const key = String(src || "");
  if (!key) return null;
  if (_oledImageCache.has(key)) return _oledImageCache.get(key);
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    try { renderElements(); } catch (_) {}
  };
  img.src = key;
  _oledImageCache.set(key, img);
  return img;
}

function drawOledIconAlphaMask(ctx, src, x, y, w, h, color) {
  const img = getCachedOledImage(src);
  if (!img || !img.complete || !img.naturalWidth) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  // Paint a solid rectangle then mask it by the icon alpha so it is always visible in OLED.
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

function drawOledLine(ctx, x0, y0, x1, y1, color) {
  ctx.fillStyle = color;
  let dx = Math.abs(x1 - x0);
  let sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0);
  let sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    ctx.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

function drawOledCircle(ctx, cx, cy, r, color, filled) {
  ctx.fillStyle = color;
  let x = r;
  let y = 0;
  let err = 0;
  while (x >= y) {
    if (filled) {
      ctx.fillRect(cx - x, cy + y, x * 2 + 1, 1);
      ctx.fillRect(cx - x, cy - y, x * 2 + 1, 1);
      ctx.fillRect(cx - y, cy + x, y * 2 + 1, 1);
      ctx.fillRect(cx - y, cy - x, y * 2 + 1, 1);
    } else {
      ctx.fillRect(cx + x, cy + y, 1, 1);
      ctx.fillRect(cx + y, cy + x, 1, 1);
      ctx.fillRect(cx - y, cy + x, 1, 1);
      ctx.fillRect(cx - x, cy + y, 1, 1);
      ctx.fillRect(cx - x, cy - y, 1, 1);
      ctx.fillRect(cx - y, cy - x, 1, 1);
      ctx.fillRect(cx + y, cy - x, 1, 1);
      ctx.fillRect(cx + x, cy - y, 1, 1);
    }
    y++;
    if (err <= 0) {
      err += 2 * y + 1;
    } else {
      x--;
      err += 2 * (y - x) + 1;
    }
  }
}

// 5x7 bitmap font (ASCII 0x20..0x7F), derived from the classic Adafruit GFX glcdfont.
// Each character is 5 columns wide, stored as 5 bytes (LSB at top). Add 1px spacing.
const OLED_FONT_5X7 = [
  0x00,0x00,0x00,0x00,0x00, 0x00,0x00,0x5F,0x00,0x00, 0x00,0x07,0x00,0x07,0x00,
  0x14,0x7F,0x14,0x7F,0x14, 0x24,0x2A,0x7F,0x2A,0x12, 0x23,0x13,0x08,0x64,0x62,
  0x36,0x49,0x55,0x22,0x50, 0x00,0x05,0x03,0x00,0x00, 0x00,0x1C,0x22,0x41,0x00,
  0x00,0x41,0x22,0x1C,0x00, 0x14,0x08,0x3E,0x08,0x14, 0x08,0x08,0x3E,0x08,0x08,
  0x00,0x50,0x30,0x00,0x00, 0x08,0x08,0x08,0x08,0x08, 0x00,0x60,0x60,0x00,0x00,
  0x20,0x10,0x08,0x04,0x02, 0x3E,0x51,0x49,0x45,0x3E, 0x00,0x42,0x7F,0x40,0x00,
  0x42,0x61,0x51,0x49,0x46, 0x21,0x41,0x45,0x4B,0x31, 0x18,0x14,0x12,0x7F,0x10,
  0x27,0x45,0x45,0x45,0x39, 0x3C,0x4A,0x49,0x49,0x30, 0x01,0x71,0x09,0x05,0x03,
  0x36,0x49,0x49,0x49,0x36, 0x06,0x49,0x49,0x29,0x1E, 0x00,0x36,0x36,0x00,0x00,
  0x00,0x56,0x36,0x00,0x00, 0x08,0x14,0x22,0x41,0x00, 0x14,0x14,0x14,0x14,0x14,
  0x00,0x41,0x22,0x14,0x08, 0x02,0x01,0x51,0x09,0x06, 0x32,0x49,0x79,0x41,0x3E,
  0x7E,0x11,0x11,0x11,0x7E, 0x7F,0x49,0x49,0x49,0x36, 0x3E,0x41,0x41,0x41,0x22,
  0x7F,0x41,0x41,0x22,0x1C, 0x7F,0x49,0x49,0x49,0x41, 0x7F,0x09,0x09,0x09,0x01,
  0x3E,0x41,0x49,0x49,0x7A, 0x7F,0x08,0x08,0x08,0x7F, 0x00,0x41,0x7F,0x41,0x00,
  0x20,0x40,0x41,0x3F,0x01, 0x7F,0x08,0x14,0x22,0x41, 0x7F,0x40,0x40,0x40,0x40,
  0x7F,0x02,0x0C,0x02,0x7F, 0x7F,0x04,0x08,0x10,0x7F, 0x3E,0x41,0x41,0x41,0x3E,
  0x7F,0x09,0x09,0x09,0x06, 0x3E,0x41,0x51,0x21,0x5E, 0x7F,0x09,0x19,0x29,0x46,
  0x46,0x49,0x49,0x49,0x31, 0x01,0x01,0x7F,0x01,0x01, 0x3F,0x40,0x40,0x40,0x3F,
  0x1F,0x20,0x40,0x20,0x1F, 0x3F,0x40,0x38,0x40,0x3F, 0x63,0x14,0x08,0x14,0x63,
  0x07,0x08,0x70,0x08,0x07, 0x61,0x51,0x49,0x45,0x43, 0x00,0x7F,0x41,0x41,0x00,
  0x02,0x04,0x08,0x10,0x20, 0x00,0x41,0x41,0x7F,0x00, 0x04,0x02,0x01,0x02,0x04,
  0x40,0x40,0x40,0x40,0x40, 0x00,0x01,0x02,0x04,0x00, 0x20,0x54,0x54,0x54,0x78,
  0x7F,0x48,0x44,0x44,0x38, 0x38,0x44,0x44,0x44,0x20, 0x38,0x44,0x44,0x48,0x7F,
  0x38,0x54,0x54,0x54,0x18, 0x08,0x7E,0x09,0x01,0x02, 0x0C,0x52,0x52,0x52,0x3E,
  0x7F,0x08,0x04,0x04,0x78, 0x00,0x44,0x7D,0x40,0x00, 0x20,0x40,0x44,0x3D,0x00,
  0x7F,0x10,0x28,0x44,0x00, 0x00,0x41,0x7F,0x40,0x00, 0x7C,0x04,0x18,0x04,0x78,
  0x7C,0x08,0x04,0x04,0x78, 0x38,0x44,0x44,0x44,0x38, 0x7C,0x14,0x14,0x14,0x08,
  0x08,0x14,0x14,0x18,0x7C, 0x7C,0x08,0x04,0x04,0x08, 0x48,0x54,0x54,0x54,0x20,
  0x04,0x3F,0x44,0x40,0x20, 0x3C,0x40,0x40,0x20,0x7C, 0x1C,0x20,0x40,0x20,0x1C,
  0x3C,0x40,0x30,0x40,0x3C, 0x44,0x28,0x10,0x28,0x44, 0x0C,0x50,0x50,0x50,0x3C,
  0x44,0x64,0x54,0x4C,0x44, 0x00,0x08,0x36,0x41,0x00, 0x00,0x00,0x7F,0x00,0x00,
  0x00,0x41,0x36,0x08,0x00, 0x02,0x01,0x02,0x04,0x02, 0x00,0x00,0x00,0x00,0x00
];

function drawOledBitmapText5x7(ctx, text, x, y, w, h, color, scale = 1) {
  const sx = Math.max(1, Math.floor(scale));
  const sy = sx;
  const maxW = Math.max(0, Math.floor(w));
  const maxH = Math.max(0, Math.floor(h));
  const startX = Math.floor(x);
  const startY = Math.floor(y);
  let cx = 0;
  let cy = 0;
  const charW = 6 * sx; // 5 + 1 spacing
  const charH = 8 * sy; // 7 + 1 spacing

  ctx.fillStyle = color;
  const lines = String(text || "").split(/\r?\n/);
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    cx = 0;
    for (let k = 0; k < line.length; k++) {
      const ch = line.charCodeAt(k) & 0xff;
      if (ch < 32 || ch > 127) {
        cx += charW;
        continue;
      }
      if (cx + charW > maxW) break;
      if (cy + charH > maxH) return;

      const base = (ch - 32) * 5;
      for (let col = 0; col < 5; col++) {
        const bits = OLED_FONT_5X7[base + col] || 0;
        for (let row = 0; row < 7; row++) {
          if ((bits >> row) & 0x01) {
            const px = startX + cx + col * sx;
            const py = startY + cy + row * sy;
            // clip
            if (px < startX || py < startY) continue;
            if (px >= startX + maxW || py >= startY + maxH) continue;
            ctx.fillRect(px, py, sx, sy);
          }
        }
      }
      cx += charW;
    }
    cy += charH;
    if (cy + charH > maxH) return;
  }
}

function drawOledThresholdedText(ctx, text, x, y, w, h, textSize, color) {
  const ts = Number(textSize || 1);
  // For size 1, use a real bitmap font so it looks correct (no browser anti-alias artifacts).
  if (ts <= 1.05) {
    drawOledBitmapText5x7(ctx, text, x, y, w, h, color, 1);
    return;
  }
  const W = Math.max(1, Math.min(dispWidth, Math.floor(w)));
  const H = Math.max(1, Math.min(dispHeight, Math.floor(h)));
  if (!_oledTextCtx) return;

  _oledTextCanvas.width = W;
  _oledTextCanvas.height = H;
  _oledTextCtx.clearRect(0, 0, W, H);
  _oledTextCtx.imageSmoothingEnabled = false;
  _oledTextCtx.fillStyle = "#ffffff";
  _oledTextCtx.textBaseline = "top";
  _oledTextCtx.textAlign = "left";
  const px = Math.max(6, Math.floor(8 * (Number(textSize || 1))));
  _oledTextCtx.font = `${px}px ui-monospace, Menlo, Consolas, monospace`;

  const lines = String(text || "").split(/\r?\n/);
  const lh = Math.max(1, Math.floor(px + 1));
  lines.forEach((line, idx) => _oledTextCtx.fillText(line, 0, idx * lh));

  const data = _oledTextCtx.getImageData(0, 0, W, H).data;
  ctx.fillStyle = color;
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const a = data[(j * W + i) * 4 + 3];
      if (a > 90) ctx.fillRect(x + i, y + j, 1, 1);
    }
  }
}

function drawOledThresholdedImage(ctx, src, x, y, w, h, color) {
  const img = getCachedOledImage(src);
  if (!img || !img.complete || !img.naturalWidth) return;
  const W = Math.max(1, Math.floor(w));
  const H = Math.max(1, Math.floor(h));
  imgCanvas.width = W;
  imgCanvas.height = H;
  imgCtx.clearRect(0, 0, W, H);
  imgCtx.imageSmoothingEnabled = false;
  imgCtx.drawImage(img, 0, 0, W, H);
  let data = null;
  try {
    data = imgCtx.getImageData(0, 0, W, H).data;
  } catch (e) {
    // Likely a CORS/file:// tainted canvas. Fallback: draw pixelated image without thresholding.
    try {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, x, y, W, H);
      return;
    } catch (_) {
      return;
    }
  }
  ctx.fillStyle = color;
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const idx = (j * W + i) * 4;
      const a = data[idx + 3];
      if (a < 50) continue;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b);
      if (lum > 80) ctx.fillRect(x + i, y + j, 1, 1);
    }
  }
}

function renderElements() {
  const scale = parseFloat(preview.dataset.scale || "1");
  preview.innerHTML = "";
  preview.style.position = "relative";

  const isOLED = driverMode === "u8g2";

  // OLED mode: draw everything into a 1:1 canvas and scale it up pixelated.
  let oledCanvasOk = false;
  if (isOLED) {
    const canvas = document.createElement("canvas");
    canvas.id = "oledCanvas";
    canvas.width = dispWidth;
    canvas.height = dispHeight;
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.width = dispWidth * scale + "px";
    canvas.style.height = dispHeight * scale + "px";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "1";
    canvas.style.imageRendering = "pixelated";
    canvas.style.imageRendering = "-moz-crisp-edges";
    canvas.style.imageRendering = "crisp-edges";
    preview.appendChild(canvas);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      try {
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, dispWidth, dispHeight);

        elements.forEach((el) => {
          try {
            const shouldFill = el.oledFill !== false;
            const fill = convertToOLEDColor(el.fillColor || "#ffffff");
            const stroke = convertToOLEDColor(el.strokeColor || "#ffffff");
            const textColor = convertToOLEDColor(el.textColor || "#ffffff");

            const x = Math.round(el.x);
            const y = Math.round(el.y);
            const w = Math.max(1, Math.round(el.w));
            const h = Math.max(1, Math.round(el.h));

            if (el.type === "image" || el.type === "icon") {
              const src = el.type === "icon" ? el.iconSrc : el.previewUrl;
              if (src) {
                if (el.type === "icon") {
                  // Icons: tint by alpha mask (works even if the PNG itself is dark)
                  drawOledIconAlphaMask(ctx, src, x, y, w, h, textColor);
                } else {
                  drawOledThresholdedImage(ctx, src, x, y, w, h, textColor);
                }
              }
              return;
            }

            if (el.type === "rect" || el.type === "card" || el.type === "header" || el.type === "button") {
              if (shouldFill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
              ctx.strokeStyle = stroke;
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, w, h);
            } else if (el.type === "roundrect") {
              // Pixel preview: draw as a crisp rectangle (rounded corners would anti-alias).
              if (shouldFill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
              ctx.strokeStyle = stroke;
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, w, h);
            } else if (el.type === "circle") {
              const r = Math.max(1, Math.floor(Math.min(w, h) / 2));
              drawOledCircle(ctx, x + r, y + r, r, shouldFill ? fill : stroke, shouldFill);
            } else if (el.type === "line") {
              drawOledLine(ctx, x, y, x + w, y + h, stroke);
            } else if (el.type === "divider") {
              drawOledLine(ctx, x, y, x + w, y, stroke);
            } else if (el.type === "progress") {
              const val = Math.max(0, Math.min(100, el.value != null ? el.value : 50));
              ctx.strokeStyle = stroke;
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, w, h);
              if (shouldFill) {
                const barW = Math.max(0, Math.floor((w - 2) * (val / 100)));
                ctx.fillStyle = fill;
                ctx.fillRect(x + 1, y + 1, barW, Math.max(1, h - 2));
              }
            } else if (el.type === "slider" || el.type === "toggle") {
              ctx.strokeStyle = stroke;
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, w, h);
              const val = Math.max(0, Math.min(100, el.value != null ? el.value : 50));
              const knobX = x + Math.floor((w - 1) * (val / 100));
              drawOledCircle(
                ctx,
                knobX,
                y + Math.floor(h / 2),
                Math.max(1, Math.floor(Math.min(w, h) / 4)),
                shouldFill ? fill : stroke,
                true
              );
            }

            if (elementHasText(el.type)) {
              const t = el.text || (el.type === "button" ? "Button" : "");
              const pad = 1;
              drawOledThresholdedText(
                ctx,
                t,
                x + pad,
                y + pad,
                Math.max(1, w - pad * 2),
                Math.max(1, h - pad * 2),
                el.textSize || 1,
                textColor
              );
            }
          } catch (_) {
            // Skip rendering this element on error; never break the whole OLED preview.
          }
        });
        oledCanvasOk = true;
      } catch (_) {
        oledCanvasOk = false;
      }
    }
  }

  elements.forEach((el) => {
    const div = document.createElement("div");
    div.className = "ui-element" + (el.id === selectedId ? " selected" : "") + (isOLED ? " oled-element" : "");
    div.dataset.id = el.id;
    div.setAttribute("type", el.type); // Add type attribute for CSS targeting

    const x = el.x * scale;
    const y = el.y * scale;
    const w = el.w * scale;
    const h = el.h * scale;

    div.style.left = x + "px";
    div.style.top = y + "px";
    div.style.width = w + "px";
    div.style.height = h + "px";

    // OLED mode: when canvas is active, most elements become interaction overlays only.
    // BUT icons/images should render normally (not pixelated) per user preference.
    if (isOLED && oledCanvasOk && el.type !== "image" && el.type !== "icon") {
      div.style.background = "transparent";
      div.style.backgroundColor = "transparent";
      div.style.border = "none";
      div.style.boxShadow = "none";
      div.style.color = "transparent";
      div.textContent = "";
    }

    // In OLED mode, visuals are on the canvas. Keep overlay DOM light.
    let fill = el.fillColor || "#ffffff";
    let stroke = el.strokeColor || "#ffffff";
    let textColor = el.textColor || "#000000";
    let shouldFill = true;

    if (isOLED) {
      // OLED canvas handles visuals; still keep these for selection/hover consistency.
      shouldFill = el.oledFill !== false;
    } else {
      // TFT mode: use alpha transparency
      let fillAlpha = el.fillAlpha != null ? el.fillAlpha : 255;
      shouldFill = fillAlpha > 0;

      // Apply alpha to fill color if not fully opaque
      if (fillAlpha < 255) {
        // Convert hex to RGB for alpha support
        const rgb = hexToRgb(fill);
        if (rgb) {
          fill = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${fillAlpha / 255})`;
        }
      }
    }

    // Apply an approximate font mapping so the browser preview reflects selection.
    if (elementHasText(el.type)) {
      if (driverMode === "u8g2") {
        div.style.fontFamily = getPreviewFontFamily(el.font || DEFAULT_U8G2_FONT);
      } else {
        const st = getPreviewTftFontStyle(el.font || DEFAULT_TFT_FONT, el.textSize || 2);
        div.style.fontFamily = st.family;
        div.style.fontSize = st.sizePx * scale + "px";
        div.style.fontWeight = st.weight;
      }
    }

    if (isOLED && oledCanvasOk && el.type !== "image" && el.type !== "icon") {
      // Skip DOM-based visuals in OLED mode (canvas already drew them).
      enableDrag(div, el.id);
      if (el.id === selectedId && el.type !== "image" && el.type !== "icon") {
        addResizeHandles(div, el.id);
      }
      div.style.zIndex = el.id === selectedId ? "30" : "10";
      preview.appendChild(div);
      return;
    }

    if (el.type === "image" || el.type === "icon") {
      const src = el.type === "icon" ? el.iconSrc : el.previewUrl;
      const tintEnabled = el.type === "icon" && !!el.iconTintEnabled && !!el.iconTintColor;

      if (tintEnabled && src) {
        // Tint PNG using its alpha as a mask -> solid-colored icon silhouette.
        // IMPORTANT: apply mask on a child layer so resize handles aren't masked.
        div.style.backgroundImage = "none";
        div.style.backgroundColor = "transparent";

        const layer = document.createElement("div");
        layer.className = "icon-tint-layer";
        layer.style.position = "absolute";
        layer.style.inset = "0";
        layer.style.pointerEvents = "none";
        layer.style.backgroundColor = el.iconTintColor;
        layer.style.setProperty("-webkit-mask-image", `url(${src})`);
        layer.style.setProperty("mask-image", `url(${src})`);
        layer.style.setProperty("-webkit-mask-size", "contain");
        layer.style.setProperty("mask-size", "contain");
        layer.style.setProperty("-webkit-mask-repeat", "no-repeat");
        layer.style.setProperty("mask-repeat", "no-repeat");
        layer.style.setProperty("-webkit-mask-position", "center");
        layer.style.setProperty("mask-position", "center");
        // Keep OLED crispness if enabled
        layer.style.imageRendering = div.style.imageRendering || "";
        div.appendChild(layer);
      } else {
        div.style.backgroundColor = el.type === "icon" ? "transparent" : "#000000";
        div.style.backgroundImage = src ? `url(${src})` : "none";
      div.style.backgroundSize = "contain";
      div.style.backgroundPosition = "center";
      div.style.backgroundRepeat = "no-repeat";
      }
      // Icons should not have an outline/border by default (selection outline handles highlight).
      // Keep a subtle border for imported images only.
      div.style.border = el.type === "icon" ? "none" : "1px solid rgba(255, 255, 255, 0.1)";
      div.style.borderRadius = "4px";
    } else if (el.type === "circle") {
      if (shouldFill) {
        div.style.borderRadius = "50%";
        div.style.backgroundColor = fill;
        div.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)`;
      } else {
        // In OLED mode, unfilled circles become rectangles for simplicity
        div.style.borderRadius = "2px";
        div.style.backgroundColor = "transparent";
        div.style.background = "none";
        div.style.boxShadow = `0 1px 2px rgba(0, 0, 0, 0.2)`;
      }
      div.style.border = "1px solid " + stroke;
    } else if (el.type === "line") {
      
      const angle = Math.atan2(h, w) * (180 / Math.PI);
      div.style.width = Math.sqrt(w * w + h * h) + "px";
      div.style.height = "2px";
      div.style.backgroundColor = stroke;
      div.style.borderRadius = "1px";
      div.style.transformOrigin = "0 50%";
      div.style.transform = `rotate(${angle}deg)`;
      div.style.boxShadow = `0 1px 2px rgba(0, 0, 0, 0.2)`;
    } else if (el.type === "divider") {
      // Keep dividers crisp + always visible (avoid fragile background gradients)
      div.style.height = Math.max(2, h) + "px";
      div.style.width = w + "px";
      div.style.backgroundColor = stroke;
      div.style.borderRadius = "1px";
      div.style.boxShadow = `0 1px 2px rgba(0, 0, 0, 0.2)`;
      // NOTE: don't set `background` here; it can override backgroundColor and
      // become invalid depending on browser support (making the divider disappear).
    } else if (el.type === "progress") {
      div.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
      div.style.border = "1px solid " + stroke;
      div.style.borderRadius = Math.min(h / 2, 8) + "px";
      div.style.overflow = "hidden";
      const bar = document.createElement("div");
      bar.style.position = "absolute";
      bar.style.left = "0";
      bar.style.top = "0";
      bar.style.bottom = "0";
      const val = Math.max(0, Math.min(100, el.value || 50));
      bar.style.width = w * (val / 100) + "px";
      bar.style.borderRadius = Math.min(h / 2, 8) + "px";
      bar.style.backgroundColor = fill;
      bar.style.boxShadow = `inset 0 1px 2px rgba(255, 255, 255, 0.2)`;
      bar.style.transition = "width 0.2s ease";
      div.appendChild(bar);
    } else if (el.type === "slider") {
      div.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
      div.style.borderRadius = h + "px";
      div.style.border = "1px solid " + stroke;
      div.style.position = "relative";
      const track = document.createElement("div");
      track.style.position = "absolute";
      track.style.left = "0";
      track.style.top = "50%";
      track.style.transform = "translateY(-50%)";
      track.style.height = "2px";
      const val = Math.max(0, Math.min(100, el.value || 50));
      track.style.width = w * (val / 100) + "px";
      track.style.backgroundColor = fill;
      track.style.borderRadius = "1px";
      div.appendChild(track);
      const knob = document.createElement("div");
      const knobSize = Math.max(h - 6, 8);
      knob.style.position = "absolute";
      knob.style.top = "50%";
      knob.style.transform = "translate(-50%, -50%)";
      knob.style.width = knobSize + "px";
      knob.style.height = knobSize + "px";
      knob.style.borderRadius = "50%";
      knob.style.backgroundColor = fill;
      knob.style.border = "2px solid " + stroke;
      knob.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.4)`;
      const trackWidth = w;
      knob.style.left = (trackWidth * (val / 100)) + "px";
      div.appendChild(knob);
    } else if (el.type === "toggle") {
      const radius = h / 2;
      const val = Math.max(0, Math.min(100, el.value || 0));
      const on = val >= 50;
      div.style.backgroundColor = on ? fill : "rgba(0, 0, 0, 0.3)";
      div.style.borderRadius = radius + "px";
      div.style.border = "1px solid " + stroke;
      div.style.transition = "background-color 0.2s ease";
      const knob = document.createElement("div");
      knob.style.position = "absolute";
      knob.style.width = (h - 4) + "px";
      knob.style.height = (h - 4) + "px";
      knob.style.borderRadius = "50%";
      knob.style.top = "2px";
      knob.style.backgroundColor = on ? "#ffffff" : "#cccccc";
      knob.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.3)`;
      knob.style.transition = "left 0.2s ease, background-color 0.2s ease";
      knob.style.left = on ? (w - h + 2) + "px" : "2px";
      div.appendChild(knob);
    } else if (el.type === "header") {
      if (shouldFill) {
        div.style.backgroundColor = fill;
      } else {
        div.style.backgroundColor = "transparent";
      }
      div.style.borderBottom = "2px solid " + stroke;
      div.style.alignItems = "center";
      div.style.justifyContent = "flex-start";
      div.style.paddingLeft = Math.max(6, 4 * scale) + "px";
      div.style.fontWeight = "600";
      div.style.color = textColor;
      div.style.textShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";
      div.textContent = el.text || "Header";
    } else if (el.type === "card") {
      if (shouldFill) {
        div.style.backgroundColor = fill;
        div.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.2)`;
      } else {
        div.style.backgroundColor = "transparent";
        div.style.boxShadow = `0 1px 2px rgba(0, 0, 0, 0.2)`;
      }
      div.style.borderRadius = "8px";
      div.style.border = "1px solid " + stroke;
      div.style.padding = Math.max(6, 4 * scale) + "px";
      div.style.color = textColor;
      div.style.alignItems = "flex-start";
      div.style.justifyContent = "flex-start";
      div.textContent = el.text || "Card";
    } else if (el.type === "rect") {
      if (shouldFill) {
        div.style.backgroundColor = fill;
        div.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)`;
      } else {
        div.style.backgroundColor = "transparent";
        div.style.background = "none";
        div.style.boxShadow = `0 1px 2px rgba(0, 0, 0, 0.2)`;
      }
      div.style.border = "1px solid " + stroke;
      div.style.borderRadius = "2px";
    } else if (el.type === "roundrect") {
      if (shouldFill) {
        div.style.backgroundColor = fill;
        div.style.boxShadow = `0 3px 6px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.15)`;
      } else {
        div.style.backgroundColor = "transparent";
        div.style.background = "none";
        div.style.boxShadow = `0 1px 2px rgba(0, 0, 0, 0.2)`;
      }
      div.style.border = "1px solid " + stroke;
      div.style.borderRadius = "8px";
    } else {
      if (el.type === "button") {
        if (shouldFill) {
          div.style.backgroundColor = fill;
          div.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.2)`;
        } else {
          div.style.backgroundColor = "transparent";
          div.style.background = "none";
          div.style.boxShadow = `0 1px 2px rgba(0, 0, 0, 0.2)`;
        }
        div.style.borderRadius = "6px";
        div.style.border = "1px solid " + stroke;
        div.style.cursor = "pointer";
      } else {
        div.style.backgroundColor = (el.type === "label" || el.type === "text") ? "transparent" : (shouldFill ? fill : "transparent");
      }
      div.style.color = textColor;
      if (elementHasText(el.type)) {
        div.textContent = el.text || el.type;
        if (el.type === "text") {
          // Pure text block (no box/border)
          div.style.border = "none";
          div.style.boxShadow = "none";
          div.style.justifyContent = "flex-start";
          div.style.alignItems = "flex-start";
          div.style.padding = Math.max(6, 4 * scale) + "px";
          div.style.whiteSpace = "pre-wrap";
          div.style.textAlign = "left";
          div.style.overflow = "hidden";
        }
        if (el.type === "button") {
          div.style.fontWeight = "500";
          div.style.textShadow = "0 1px 1px rgba(0, 0, 0, 0.1)";
        }
      } else {
        div.textContent = "";
      }
    }

    if (el.type !== "image" && el.type !== "icon") {
      div.style.fontSize = (el.textSize || 2) * 5 * scale + "px";
    }

    enableDrag(div, el.id);
    
    
    // Only show resize handles for resizable elements.
    // Images + icons are treated as fixed-size assets (no resize handles).
    if (el.id === selectedId && el.type !== "image" && el.type !== "icon") {
      addResizeHandles(div, el.id);
    }
    
    preview.appendChild(div);
  });
}


function addResizeHandles(elementDiv, id) {
  const handles = [
    { class: "nw", cursor: "nw-resize" },
    { class: "ne", cursor: "ne-resize" },
    { class: "sw", cursor: "sw-resize" },
    { class: "se", cursor: "se-resize" },
    { class: "n", cursor: "n-resize" },
    { class: "s", cursor: "s-resize" },
    { class: "e", cursor: "e-resize" },
    { class: "w", cursor: "w-resize" }
  ];

  handles.forEach(handle => {
    const handleDiv = document.createElement("div");
    handleDiv.className = `resize-handle ${handle.class}`;
    handleDiv.dataset.handle = handle.class;
    handleDiv.dataset.elementId = id;
    enableResize(handleDiv, id, handle.class);
    elementDiv.appendChild(handleDiv);
  });
}

function enableResize(handle, elementId, direction) {
  let isResizing = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;
  let startXPos = 0;
  let startYPos = 0;

  handle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    e.preventDefault();
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;

    const el = elements.find((el) => el.id === elementId);
    if (!el) return;

    startWidth = el.w;
    startHeight = el.h;
    startXPos = el.x;
    startYPos = el.y;

    // Add resizing class for visual feedback
    const elementDiv = handle.closest('.ui-element');
    if (elementDiv) {
      elementDiv.classList.add('resizing');
    }
    preview.classList.add('manipulating');

    document.addEventListener("mousemove", onResizeMove);
    document.addEventListener("mouseup", onResizeUp);
  });

  function onResizeMove(e) {
    if (!isResizing) return;
    const scale = parseFloat(preview.dataset.scale || "1");
    const dx = (e.clientX - startX) / scale;
    const dy = (e.clientY - startY) / scale;

    const el = elements.find((el) => el.id === elementId);
    if (!el) return;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newX = startXPos;
    let newY = startYPos;

    
    if (direction.includes("e")) {
      newWidth = Math.max(10, startWidth + dx);
    }
    if (direction.includes("w")) {
      newWidth = Math.max(10, startWidth - dx);
      newX = startXPos + dx;
    }
    if (direction.includes("s")) {
      newHeight = Math.max(10, startHeight + dy);
    }
    if (direction.includes("n")) {
      newHeight = Math.max(10, startHeight - dy);
      newY = startYPos + dy;
    }

    
    if (snapToGrid && gridSize > 0) {
      newWidth = Math.round(newWidth / gridSize) * gridSize;
      newHeight = Math.round(newHeight / gridSize) * gridSize;
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }

    el.w = Math.round(newWidth);
    el.h = Math.round(newHeight);
    el.x = Math.round(newX);
    el.y = Math.round(newY);

    updatePropsInputs(false);
    renderElements();
    updateCode();
  }

  function onResizeUp() {
    if (isResizing) {
      pushHistory();
    }
    isResizing = false;

    // Remove resizing class
    const elementDiv = handle.closest('.ui-element');
    if (elementDiv) {
      elementDiv.classList.remove('resizing');
    }
    preview.classList.remove('manipulating');

    document.removeEventListener("mousemove", onResizeMove);
    document.removeEventListener("mouseup", onResizeUp);
  }
}


function enableDrag(node, id) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let origX = 0;
  let origY = 0;

  node.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("resize-handle")) {
      return;
    }
    e.preventDefault();
    selectElement(id, false);
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const el = elements.find((el) => el.id === id);
    if (!el) return;
    origX = el.x;
    origY = el.y;

    // Add dragging class for visual feedback
    node.classList.add('dragging');
    preview.classList.add('manipulating');

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;
    const scale = parseFloat(preview.dataset.scale || "1");
    let dx = (e.clientX - startX) / scale;
    let dy = (e.clientY - startY) / scale;

    let newX = origX + dx;
    let newY = origY + dy;

    if (snapToGrid && gridSize > 0) {
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }

    const el = elements.find((el) => el.id === id);
    if (!el) return;
    el.x = Math.round(newX);
    el.y = Math.round(newY);

    updatePropsInputs(false);
    renderElements();
    updateCode();
  }

  function onMouseUp() {
    if (isDragging) {
      pushHistory();
    }
    isDragging = false;

    // Remove dragging class
    node.classList.remove('dragging');
    preview.classList.remove('manipulating');

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}


function selectElement(id, push = true) {
  selectedId = id;
  updatePropsInputs();
  renderElements();
  if (push) pushHistory();

  // Add visual feedback for selection
  setTimeout(() => {
    const elementDiv = document.querySelector(`[data-id="${id}"]`);
    if (elementDiv) {
      elementDiv.style.animation = 'none';
      elementDiv.offsetHeight; // Trigger reflow
      elementDiv.style.animation = 'pulse 0.3s ease-out';
    }
  }, 50);
}

// Utility function to cycle through elements with Tab key
function selectNextElement() {
  if (elements.length === 0) return;

  let currentIndex = -1;
  if (selectedId) {
    currentIndex = elements.findIndex(el => el.id === selectedId);
  }

  const nextIndex = (currentIndex + 1) % elements.length;
  selectElement(elements[nextIndex].id, false);
}

function selectPreviousElement() {
  if (elements.length === 0) return;

  let currentIndex = -1;
  if (selectedId) {
    currentIndex = elements.findIndex(el => el.id === selectedId);
  }

  const prevIndex = currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
  selectElement(elements[prevIndex].id, false);
}

// Utility function to bring element to front/back
function bringToFront(elementId) {
  const index = elements.findIndex(el => el.id === elementId);
  if (index > -1) {
    const element = elements.splice(index, 1)[0];
    elements.push(element);
    syncActiveScreenElements();
    renderElements();
    updateCode();
    pushHistory();
  }
}

function sendToBack(elementId) {
  const index = elements.findIndex(el => el.id === elementId);
  if (index > -1) {
    const element = elements.splice(index, 1)[0];
    elements.unshift(element);
    renderElements();
    updateCode();
    pushHistory();
  }
}

function refreshActionTargetOptions(el) {
  propActionTarget.innerHTML = "";
  screens.forEach(scr => {
    const opt = document.createElement("option");
    opt.value = scr.id;
    opt.textContent = scr.name;
    propActionTarget.appendChild(opt);
  });
  if (el && el.actionTargetScreenId) {
    propActionTarget.value = el.actionTargetScreenId;
  }
}

function updatePropsInputs(push = false) {
  const el = elements.find((el) => el.id === selectedId);
  if (!el) {
    noSelection.style.display = "block";
    propsPanel.style.display = "none";
    return;
  }

  noSelection.style.display = "none";
  propsPanel.style.display = "block";

  // Keep font dropdown synced with current driver mode (TFT vs OLED)
  initFontList();

  elementTypePill.textContent = el.type.toUpperCase();
  propX.value = el.x;
  propY.value = el.y;
  propW.value = el.w;
  propH.value = el.h;
  propText.value = el.text || "";
  propTextSize.value = el.textSize || 2;
  propFillColor.value = el.fillColor || "#ffffff";
  propStrokeColor.value = el.strokeColor || "#ffffff";
  propTextColor.value = el.textColor || "#ffffff";

  if (driverMode === "u8g2") {
    // OLED mode: use binary fill control
    const isFilled = el.oledFill !== false; // Default to true
    propOLEDFill.checked = isFilled;
    fillTransparencyRow.style.display = "none";
    oledFillRow.style.display = elementHasFill(el.type) ? "block" : "none";

    // Disable fill color picker when OLED fill is off
    propFillColor.disabled = !isFilled;
    propFillColor.style.opacity = isFilled ? "1" : "0.3";
    propFillColor.style.cursor = isFilled ? "pointer" : "not-allowed";
  } else {
    // TFT mode: use alpha transparency
    propFillAlpha.value = el.fillAlpha != null ? el.fillAlpha : 255;
    fillAlphaValue.textContent = Math.round((el.fillAlpha != null ? el.fillAlpha : 255) / 255 * 100) + "%";
    fillTransparencyRow.style.display = elementHasFill(el.type) ? "block" : "none";
    oledFillRow.style.display = "none";

    // Re-enable fill color picker for TFT mode
    propFillColor.disabled = false;
    propFillColor.style.opacity = "1";
    propFillColor.style.cursor = "pointer";
  }
  propValue.value = el.value != null ? el.value : 50;
  // Use driver-specific font value and keep legacy `el.font` aligned with active mode.
  const mode = getCurrentDriverMode();
  const activeFont = getElementFontForMode(el, mode);
  el.font = activeFont;
  propFont.value = activeFont;

  textGroup.style.display = elementHasText(el.type) ? "block" : "none";
  valueGroup.style.display = elementHasValue(el.type) ? "block" : "none";
  fontGroup.style.display = elementHasText(el.type) ? "block" : "none";

  if (el.type === "image" || el.type === "icon") {
    propW.disabled = true;
    propH.disabled = true;
  } else {
    propW.disabled = false;
    propH.disabled = false;
  }

  
  if (elementSupportsAction(el.type)) {
    actionGroup.style.display = "block";
    propAction.value = el.actionType || "";
    refreshActionTargetOptions(el);
  } else {
    actionGroup.style.display = "none";
  }

  // Icon tint controls
  if (iconTintGroup) {
    const isIcon = el.type === "icon";
    iconTintGroup.style.display = isIcon ? "block" : "none";
    if (isIcon) {
      if (propIconTintEnabled) propIconTintEnabled.checked = !!el.iconTintEnabled;
      if (propIconTintColor) propIconTintColor.value = el.iconTintColor || "#ffffff";
    }
  }

  if (push) pushHistory();
}


function updateCode() {
  if (driverMode === "u8g2") {
    generateU8g2Code();
  } else {
    generateTFTCode();
  }
}

function getScreenFnName(scr) {
  return (scr.fnName && scr.fnName.trim().length)
    ? scr.fnName.trim()
    : "draw" + scr.name.replace(/\s+/g, "");
}

function generateTFTCode() {
  let code = "";
  code += "#include <TFT_eSPI.h>\n";
  code += "#include <SPI.h>\n\n";

  // Collect any GFX FreeFonts used by elements so we can emit the required includes.
  const usedFreeFonts = new Set();
  screens.forEach((scr) => {
    (scr.elements || []).forEach((el) => {
      if (!elementHasText(el.type)) return;
      const font = getElementFontForMode(el, "tft");
      if (!/^\d+$/.test(String(font))) usedFreeFonts.add(String(font));
    });
  });
  if (usedFreeFonts.size) {
    code += "// NOTE: To use FreeFonts, enable LOAD_GFXFF in TFT_eSPI/User_Setup.h\n";
    usedFreeFonts.forEach((name) => {
      code += `#include <Fonts/${name}.h>\n`;
    });
    code += "\n";
  }

  code += "TFT_eSPI tft = TFT_eSPI();\n";
  if (useSprite) {
    code += "TFT_eSprite spr = TFT_eSprite(&tft);\n";
  }
  code += "\n";

  const bg565 = hexToRgb565(bgColor);

  
  const imageElements = [];
  screens.forEach((scr) => {
    scr.elements.forEach((el) => {
      if (
        (el.type === "image" || el.type === "icon") &&
        el.rgb565 &&
        el.rgb565.length &&
        el.imageWidth &&
        el.imageHeight
      ) {
        imageElements.push(el);
      }
    });
  });

  
  imageElements.forEach((el) => {
    const name = el.imageName || "img_" + el.id.replace(/[^a-zA-Z0-9_]/g, "_");
    const totalPixels = el.imageWidth * el.imageHeight;
    code += `const uint16_t ${name}[${totalPixels}] PROGMEM = {\n`;
    for (let i = 0; i < el.rgb565.length; i++) {
      const val = el.rgb565[i];
      const hex = "0x" + val.toString(16).padStart(4, "0").toUpperCase();
      const isLast = i === el.rgb565.length - 1;
      if (i % 12 === 0) code += "  ";
      code += hex;
      code += isLast ? "" : ", ";
      if (i % 12 === 11 || isLast) code += "\n";
    }
    code += "};\n\n";
  });

  
  screens.forEach((scr) => {
    const fnName = getScreenFnName(scr);
    const drv = useSprite ? "spr" : "tft";

    code += `void ${fnName}() {\n`;
    if (useSprite) {
      code += `  spr.fillSprite(${bg565});\n`;
    } else {
      code += `  tft.fillScreen(${bg565});\n`;
    }
    code += "\n";

    let lastFont = null;
    scr.elements.forEach((el) => {
      const val = Math.max(0, Math.min(100, el.value != null ? el.value : 50));

      if (el.type === "image" || el.type === "icon") {
          if (el.rgb565 && el.rgb565.length && el.imageWidth && el.imageHeight) {
            const name = el.imageName || "img_" + el.id.replace(/[^a-zA-Z0-9_]/g, "_");
            code += `  ${drv}.pushImage(${el.x}, ${el.y}, ${el.imageWidth}, ${el.imageHeight}, ${name});\n\n`;
        } else if (el.type === "icon") {
          const src = el.iconSrc || (el.iconFile ? ("icons/" + el.iconFile) : "");
          code += `  // Icon asset (not embedded): ${src}\n`;
          code += "  // Tip: open via http:// (local server) if your browser blocks canvas conversion in file:// mode.\n\n";
          }
        return;
      }

      const fill565 = hexToRgb565(el.fillColor || "#FFFFFF");
      const stroke565 = hexToRgb565(el.strokeColor || "#FFFFFF");
      const text565 = hexToRgb565(el.textColor || "#FFFFFF");
      const fillAlpha = el.fillAlpha != null ? el.fillAlpha : 255;

      if (elementHasText(el.type)) {
        const font = getElementFontForMode(el, "tft");
        if (font !== lastFont) {
          if (/^\d+$/.test(String(font))) {
            // Built-in bitmap fonts
            code += `  ${drv}.setFreeFont(NULL);\n`;
            code += `  ${drv}.setTextFont(${String(font)});\n`;
          } else {
            // GFX FreeFonts
            code += `  ${drv}.setTextFont(1);\n`;
            code += `  ${drv}.setFreeFont(&${String(font)});\n`;
          }
          lastFont = font;
        }
      }

      if (el.type === "rect") {
        // Only draw fill if not fully transparent
        if (fillAlpha > 0) {
          code += `  ${drv}.fillRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${fill565});\n`;
        }
      } else if (el.type === "roundrect") {
        // Only draw fill if not fully transparent
        if (fillAlpha > 0) {
          code += `  ${drv}.fillRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, 4, ${fill565});\n`;
        }
        code += `  ${drv}.drawRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, 4, ${stroke565});\n`;
      } else if (el.type === "circle") {
        const r = Math.floor(Math.min(el.w, el.h) / 2);
        const cx = el.x + r;
        const cy = el.y + r;
        // Only draw fill if not fully transparent
        if (fillAlpha > 0) {
          code += `  ${drv}.fillCircle(${cx}, ${cy}, ${r}, ${fill565});\n`;
        }
      } else if (el.type === "line") {
        code += `  ${drv}.drawLine(${el.x}, ${el.y}, ${el.x + el.w}, ${el.y + el.h}, ${stroke565});\n`;
      } else if (el.type === "divider") {
        code += `  ${drv}.drawLine(${el.x}, ${el.y}, ${el.x + el.w}, ${el.y}, ${stroke565});\n`;
      } else if (el.type === "label") {
        const txt = (el.text || "").replace(/"/g, '\\"');
        code += `  ${drv}.setTextColor(${text565});\n`;
        code += `  ${drv}.setTextSize(${el.textSize || 2});\n`;
        code += `  ${drv}.setCursor(${el.x}, ${el.y});\n`;
        code += `  ${drv}.print("${txt}");\n\n`;
      } else if (el.type === "text") {
        const lines = String(el.text || "Text").split(/\r?\n/);
        code += `  ${drv}.setTextColor(${text565});\n`;
        code += `  ${drv}.setTextSize(${el.textSize || 2});\n`;
        // Approximate line height (TFT_eSPI default font): 8px * textSize
        const lh = (el.textSize || 2) * 8;
        lines.forEach((line, idx) => {
          const txt = String(line).replace(/"/g, '\\"');
          code += `  ${drv}.setCursor(${el.x}, ${el.y + idx * lh});\n`;
          code += `  ${drv}.print("${txt}");\n`;
        });
        code += "\n";
      } else if (el.type === "button") {
        const r = 6;
        const txt = (el.text || "Button").replace(/"/g, '\\"');
        code += `  ${drv}.fillRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r}, ${fill565});\n`;
        code += `  ${drv}.drawRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r}, ${stroke565});\n`;
        code += `  ${drv}.setTextColor(${text565});\n`;
        code += `  ${drv}.setTextSize(${el.textSize || 2});\n`;
        code += `  ${drv}.setTextDatum(MC_DATUM);\n`;
        code += `  ${drv}.drawString("${txt}", ${el.x + Math.floor(el.w / 2)}, ${el.y + Math.floor(el.h / 2)});\n`;
        code += `  ${drv}.setTextDatum(TL_DATUM);\n\n`;
      } else if (el.type === "progress") {
        const innerW = Math.max(0, el.w - 4);
        const barW = Math.floor(innerW * (val / 100));
        code += `  ${drv}.drawRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, 3, ${stroke565});\n`;
        code += `  ${drv}.fillRoundRect(${el.x + 2}, ${el.y + 2}, ${barW}, ${el.h - 4}, 3, ${fill565});\n\n`;
      } else if (el.type === "slider") {
        const r = Math.floor(el.h / 2);
        const knobTravel = el.w - el.h;
        const knobX = el.x + Math.floor(knobTravel * (val / 100));
        const centerY = el.y + r;
        code += `  ${drv}.drawRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r}, ${stroke565});\n`;
        code += `  ${drv}.fillCircle(${knobX + r}, ${centerY}, ${r - 2}, ${fill565});\n\n`;
      } else if (el.type === "toggle") {
        const r = Math.floor(el.h / 2);
        const centerY = el.y + r;
        const on = val >= 50;
        code += `  ${drv}.fillRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r}, ${on ? fill565 : hexToRgb565("#111827")});\n`;
        code += `  ${drv}.drawRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r}, ${stroke565});\n`;
        const knobX = on ? el.x + el.w - r : el.x;
        code += `  ${drv}.fillCircle(${knobX}, ${centerY}, ${r - 2}, ${on ? stroke565 : fill565});\n\n`;
      } else if (el.type === "header") {
        const txt = (el.text || "Header").replace(/"/g, '\\"');
        code += `  ${drv}.fillRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${fill565});\n`;
        code += `  ${drv}.drawLine(${el.x}, ${el.y + el.h - 1}, ${el.x + el.w}, ${el.y + el.h - 1}, ${stroke565});\n`;
        code += `  ${drv}.setTextColor(${text565});\n`;
        code += `  ${drv}.setTextSize(${el.textSize || 2});\n`;
        code += `  ${drv}.setCursor(${el.x + 4}, ${el.y + Math.max(0, Math.floor(el.h / 2) - 4)});\n`;
        code += `  ${drv}.print("${txt}");\n\n`;
      } else if (el.type === "card") {
        const txt = (el.text || "Card").replace(/"/g, '\\"');
        code += `  ${drv}.fillRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, 6, ${fill565});\n`;
        code += `  ${drv}.drawRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, 6, ${stroke565});\n`;
        code += `  ${drv}.setTextColor(${text565});\n`;
        code += `  ${drv}.setTextSize(${el.textSize || 2});\n`;
        code += `  ${drv}.setCursor(${el.x + 4}, ${el.y + 4});\n`;
        code += `  ${drv}.print("${txt}");\n\n`;
      }

      
      if (el.actionType === "goto" && el.actionTargetScreenId) {
        const targetScreen = screens.find(s => s.id === el.actionTargetScreenId);
        if (targetScreen) {
          const targetFnName = getScreenFnName(targetScreen);
        }
      }
    });

    if (useSprite) {
      code += "  spr.pushSprite(0, 0);\n";
    }

    code += "}\n\n";
  });

  
  const defaultScreen =
    screens.find((s) => s.id === activeScreenId) || screens[0];

  code += "void setup() {\n";
  code += "  tft.init();\n";

  // Add TFT rotation setting
  code += `  tft.setRotation(${tftSettingsState.rotation});\n`;

  code += "  tft.setTextDatum(TL_DATUM);\n";
  code += "  tft.setTextFont(1);\n";
  if (useSprite) {
    code += `  spr.createSprite(${dispWidth}, ${dispHeight});\n`;
  }
  if (defaultScreen) {
    const fnName = getScreenFnName(defaultScreen);
    code += `  ${fnName}();\n`;
  }
  code += "}\n\n";
  code += "void loop() {\n";
  code += "}\n\n";

  codeOutput.value = code;
}

function generateU8g2Code() {
  let code = "";
  code += "#include <U8g2lib.h>\n";
  code += "#include <Wire.h>\n\n";

  const preset = U8G2_PRESETS.find(p => p.id === u8g2PresetId) || U8G2_PRESETS[0];
  if (preset.id === "custom") {
    code += preset.ctor + "\n\n";
  } else {
    code += preset.ctor + "\n\n";
  }

  // Monochrome bitmaps for icon elements (XBMP)
  const monoIcons = [];
  screens.forEach((scr) => {
    scr.elements.forEach((el) => {
      if (
        el.type === "icon" &&
        Array.isArray(el.monoBitmap) &&
        el.monoBitmap.length &&
        el.imageWidth &&
        el.imageHeight
      ) {
        monoIcons.push(el);
      }
    });
  });

  monoIcons.forEach((el) => {
    const name = (el.imageName || "icon_" + el.id.replace(/[^a-zA-Z0-9_]/g, "_")) + "_xbm";
    const bytes = el.monoBitmap;
    code += `const unsigned char ${name}[${bytes.length}] PROGMEM = {\n`;
    for (let i = 0; i < bytes.length; i++) {
      const v = bytes[i] & 0xff;
      const hx = "0x" + v.toString(16).padStart(2, "0").toUpperCase();
      const isLast = i === bytes.length - 1;
      if (i % 16 === 0) code += "  ";
      code += hx;
      code += isLast ? "" : ", ";
      if (i % 16 === 15 || isLast) code += "\n";
    }
    code += "};\n\n";
  });

  // Add OLED settings initialization
  code += "void setup() {\n";
  code += "  // Initialize OLED display\n";
  code += "  u8g2.begin();\n";

  // Add rotation setting
  if (oledSettingsState.rotation !== 0) {
    const rotationCommands = {
      1: "u8g2.setDisplayRotation(U8G2_R1);",
      2: "u8g2.setDisplayRotation(U8G2_R2);",
      3: "u8g2.setDisplayRotation(U8G2_R3);"
    };
    if (rotationCommands[oledSettingsState.rotation]) {
      code += `  ${rotationCommands[oledSettingsState.rotation]}\n`;
    }
  }

  // Add contrast setting
  if (oledSettingsState.contrast !== 127) {
    code += `  u8g2.setContrast(${oledSettingsState.contrast});\n`;
  }

  // Add flip mode
  if (oledSettingsState.flipMode !== "none") {
    const flipCommands = {
      "horizontal": "u8g2.setFlipMode(1);",
      "vertical": "u8g2.setFlipMode(1);", // U8g2 doesn't have separate horizontal/vertical, just flip
      "both": "u8g2.setFlipMode(1);"
    };
    if (flipCommands[oledSettingsState.flipMode]) {
      code += `  ${flipCommands[oledSettingsState.flipMode]}\n`;
    }
  }

  // Add font mode
  if (oledSettingsState.fontMode === "solid") {
    code += "  u8g2.setFontMode(1);\n"; // Solid background
  } else {
    code += "  u8g2.setFontMode(0);\n"; // Transparent background
  }

  // Add power save mode
  if (oledSettingsState.powerSave === "auto") {
    code += "  u8g2.setPowerSave(1);\n"; // Enable power save initially
  }

  code += "}\n\n";

  
  screens.forEach(scr => {
    const fnName = getScreenFnName(scr);
    code += `void ${fnName}() {\n`;
    code += "  u8g2.clearBuffer();\n";

    scr.elements.forEach(el => {
      const val = Math.max(0, Math.min(100, el.value != null ? el.value : 50));
      const font = el.font || DEFAULT_U8G2_FONT;
      const txtEsc = (el.text || "").replace(/"/g, '\\"');

      if (el.type === "image") {
        // images are not rendered directly in U8g2 demo code
        return;
      }
      if (el.type === "icon") {
        if (Array.isArray(el.monoBitmap) && el.monoBitmap.length && el.imageWidth && el.imageHeight) {
          const name = (el.imageName || "icon_" + el.id.replace(/[^a-zA-Z0-9_]/g, "_")) + "_xbm";
          code += `  u8g2.drawXBMP(${el.x}, ${el.y}, ${el.imageWidth}, ${el.imageHeight}, ${name});\n`;
        } else {
          const src = el.iconSrc || (el.iconFile ? ("icons/" + el.iconFile) : "");
          code += `  // Icon asset (not embedded): ${src}\n`;
        }
        return;
      }

      if (el.type === "rect") {
        if (el.oledFill !== false) {
          code += `  u8g2.drawBox(${el.x}, ${el.y}, ${el.w}, ${el.h});\n`;
        } else {
          code += `  u8g2.drawFrame(${el.x}, ${el.y}, ${el.w}, ${el.h});\n`;
        }
      } else if (el.type === "roundrect") {
        const r = 4;
        if (el.oledFill !== false) {
          code += `  u8g2.drawRBox(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r});\n`;
        } else {
          code += `  u8g2.drawRFrame(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r});\n`;
        }
      } else if (el.type === "circle") {
        const r = Math.floor(Math.min(el.w, el.h) / 2);
        const cx = el.x + r;
        const cy = el.y + r;
        if (el.oledFill !== false) {
          code += `  u8g2.drawDisc(${cx}, ${cy}, ${r});\n`;
        } else {
          code += `  u8g2.drawCircle(${cx}, ${cy}, ${r});\n`;
        }
      } else if (el.type === "line") {
        code += `  u8g2.drawLine(${el.x}, ${el.y}, ${el.x + el.w}, ${el.y + el.h});\n`;
      } else if (el.type === "divider") {
        code += `  u8g2.drawLine(${el.x}, ${el.y}, ${el.x + el.w}, ${el.y});\n`;
      } else if (el.type === "label") {
        code += `  u8g2.setFont(${font});\n`;
        code += `  u8g2.drawUTF8(${el.x}, ${el.y} + 10, "${txtEsc}");\n\n`;
      } else if (el.type === "text") {
        const lines = String(el.text || "Text").split(/\r?\n/);
        code += `  u8g2.setFont(${font});\n`;
        // Approximate baseline spacing
        const lh = 12;
        lines.forEach((line, idx) => {
          const esc = String(line).replace(/"/g, '\\"');
          code += `  u8g2.drawUTF8(${el.x}, ${el.y} + 10 + ${idx} * ${lh}, "${esc}");\n`;
        });
        code += "\n";
      } else if (el.type === "button") {
        const r = 4;
        if (el.oledFill !== false) {
          code += `  u8g2.drawRBox(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r});\n`;
        } else {
          code += `  u8g2.drawRFrame(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r});\n`;
        }
        if (txtEsc.length) {
          const textY = el.y + Math.floor(el.h / 2) + 4;
          code += `  u8g2.setFont(${font});\n`;
          if (el.oledFill !== false) {
            code += `  u8g2.setDrawColor(0);\n`;
          }
          code += `  u8g2.drawUTF8(${el.x + 4}, ${textY}, "${txtEsc}");\n`;
          if (el.oledFill !== false) {
            code += "  u8g2.setDrawColor(1);\n";
          }
        }
        code += "\n";
      } else if (el.type === "progress") {
        const innerW = Math.max(0, el.w - 4);
        const barW = Math.floor(innerW * (val / 100));
        code += `  u8g2.drawFrame(${el.x}, ${el.y}, ${el.w}, ${el.h});\n`;
        code += `  u8g2.drawBox(${el.x + 2}, ${el.y + 2}, ${barW}, ${el.h - 4});\n\n`;
      } else if (el.type === "slider") {
        const r = Math.floor(el.h / 2);
        const knobTravel = el.w - el.h;
        const knobX = el.x + Math.floor(knobTravel * (val / 100));
        const centerY = el.y + r;
        code += `  u8g2.drawRFrame(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r});\n`;
        code += `  u8g2.drawDisc(${knobX + r}, ${centerY}, ${r - 2});\n\n`;
      } else if (el.type === "toggle") {
        const r = Math.floor(el.h / 2);
        const centerY = el.y + r;
        const on = val >= 50;
        code += `  u8g2.drawRFrame(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r});\n`;
        const knobX = on ? el.x + el.w - r : el.x;
        code += `  u8g2.drawDisc(${knobX}, ${centerY}, ${r - 2});\n\n`;
      } else if (el.type === "header") {
        if (el.oledFill !== false) {
          code += `  u8g2.drawBox(${el.x}, ${el.y}, ${el.w}, ${el.h});\n`;
        } else {
          code += `  u8g2.drawFrame(${el.x}, ${el.y}, ${el.w}, ${el.h});\n`;
        }
        if (txtEsc.length) {
          const textY = el.y + el.h - 4;
          code += `  u8g2.setFont(${font});\n`;
          code += `  u8g2.setDrawColor(0);\n`;
          code += `  u8g2.drawUTF8(${el.x + 4}, ${textY}, "${txtEsc}");\n`;
          code += "  u8g2.setDrawColor(1);\n\n";
        }
      } else if (el.type === "card") {
        if (el.oledFill !== false) {
          code += `  u8g2.drawRBox(${el.x}, ${el.y}, ${el.w}, ${el.h}, 4);\n`;
        } else {
          code += `  u8g2.drawRFrame(${el.x}, ${el.y}, ${el.w}, ${el.h}, 4);\n`;
        }
        if (txtEsc.length) {
          const textY = el.y + 10;
          code += `  u8g2.setFont(${font});\n`;
          code += `  u8g2.drawUTF8(${el.x + 4}, ${textY}, "${txtEsc}");\n\n`;
        }
      }

      
      if (el.actionType === "goto" && el.actionTargetScreenId) {
        const targetScreen = screens.find(s => s.id === el.actionTargetScreenId);
        if (targetScreen) {
          const targetFnName = getScreenFnName(targetScreen);
          // navigation wiring left for user to implement
        }
      }
    });

    code += "  u8g2.sendBuffer();\n";
    code += "}\n\n";
  });

  const defaultScreen =
    screens.find((s) => s.id === activeScreenId) || screens[0];

  code += "void setup() {\n";
  code += "  u8g2.begin();\n";
  if (defaultScreen) {
    const fnName = getScreenFnName(defaultScreen);
    code += `  ${fnName}();\n`;
  }
  code += "}\n\n";
  code += "void loop() {\n";
  code += "}\n";

  codeOutput.value = code;
}


applyResBtn.addEventListener("click", () => {
  dispWidth = parseInt(dispWidthInput.value, 10) || 240;
  dispHeight = parseInt(dispHeightInput.value, 10) || 320;
  updatePreviewSize();
  renderElements();
  updateCode();
  pushHistory();
});

bgColorInput.addEventListener("input", () => {
  bgColor = bgColorInput.value;
  updatePreviewSize();
  updateCode();
  pushHistory();
});

bgColorChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const value = chip.getAttribute("data-bg-color");
    if (!value) return;
    bgColorInput.value = value;
    bgColor = value;
    updatePreviewSize();
    updateCode();
    pushHistory();
  });
});

if (bgColorCustomBtn) {
  bgColorCustomBtn.addEventListener("click", () => {
    bgColorInput.click();
  });
}

useSpriteCheckbox.addEventListener("change", () => {
  useSprite = useSpriteCheckbox.checked;
  updateCode();
  pushHistory();
});

snapCheckbox.addEventListener("change", () => {
  snapToGrid = snapCheckbox.checked;
  pushHistory();
});

gridSizeInput.addEventListener("input", () => {
  let v = parseInt(gridSizeInput.value, 10);
  if (isNaN(v) || v <= 0) v = 1;
  gridSize = v;
  gridSizeInput.value = v;
  pushHistory();
});

displayDriverSelect.addEventListener("change", () => {
  const newDriverMode = displayDriverSelect.value;
  driverMode = newDriverMode;
  ensureAllElementsHaveFonts();

  // Set default dimensions based on display mode
  if (driverMode === "u8g2") {
    dispWidth = 128;
    dispHeight = 64;
  } else if (driverMode === "tft") {
    dispWidth = 240;
    dispHeight = 320;
  }

  dispWidthInput.value = dispWidth;
  dispHeightInput.value = dispHeight;

  updateDisplaySettingsVisibility();
  initFontList(); // Update font dropdown for new driver mode
  updatePreviewSize();
  renderElements(); // Re-render elements with new display mode styling
  updatePropsInputs(); // Update property controls for new mode
  updateCode();
  pushHistory();

  // Keep UI Examples tab in sync with selected driver
  setUiExamplesTab(driverMode === "u8g2" ? "oled" : "tft");
});

function updateDisplaySettingsVisibility() {
  // Hide all settings panels
  tftSettings.classList.remove("tft-active");
  oledSettings.classList.remove("oled-active");

  // Show appropriate settings panel
  if (driverMode === "tft") {
    tftSettings.classList.add("tft-active");
    // Initialize TFT settings
    tftRotation.value = tftSettingsState.rotation;
    tftColorDepth.value = tftSettingsState.colorDepth;
    tftBacklight.value = tftSettingsState.backlight;
    tftTouch.value = tftSettingsState.touch;
  } else if (driverMode === "u8g2") {
    oledSettings.classList.add("oled-active");
    // Initialize OLED settings
    oledRotation.value = oledSettingsState.rotation;
    oledContrast.value = oledSettingsState.contrast;
    oledContrastValue.textContent = oledSettingsState.contrast;
    oledFlipMode.value = oledSettingsState.flipMode;
    oledFontMode.value = oledSettingsState.fontMode;
    oledPowerSave.value = oledSettingsState.powerSave;
  }

  // Update element properties to show correct fill controls
  updatePropsInputs();
}

u8g2PresetSelect.addEventListener("change", () => {
  u8g2PresetId = u8g2PresetSelect.value;
  updateCode();
  pushHistory();
});

// TFT Settings Event Listeners
tftRotation.addEventListener("change", () => {
  tftSettingsState.rotation = parseInt(tftRotation.value);
  updateCode();
  pushHistory();
});

tftColorDepth.addEventListener("change", () => {
  tftSettingsState.colorDepth = parseInt(tftColorDepth.value);
  updateCode();
  pushHistory();
});

tftBacklight.addEventListener("change", () => {
  tftSettingsState.backlight = tftBacklight.value;
  updateCode();
  pushHistory();
});

tftTouch.addEventListener("change", () => {
  tftSettingsState.touch = tftTouch.value;
  updateCode();
  pushHistory();
});

// OLED Settings Event Listeners
oledRotation.addEventListener("change", () => {
  oledSettingsState.rotation = parseInt(oledRotation.value);
  updateCode();
  pushHistory();
});

oledContrast.addEventListener("input", () => {
  oledSettingsState.contrast = parseInt(oledContrast.value);
  oledContrastValue.textContent = oledSettingsState.contrast;
  updateCode();
  pushHistory();
});

oledFlipMode.addEventListener("change", () => {
  oledSettingsState.flipMode = oledFlipMode.value;
  updateCode();
  pushHistory();
});

oledFontMode.addEventListener("change", () => {
  oledSettingsState.fontMode = oledFontMode.value;
  updateCode();
  pushHistory();
});

oledPowerSave.addEventListener("change", () => {
  oledSettingsState.powerSave = oledPowerSave.value;
  updateCode();
  pushHistory();
});

clearAllBtn.addEventListener("click", () => {
  const scr = screens.find((s) => s.id === activeScreenId);
  if (scr) {
    scr.elements = [];
    elements = scr.elements;
  } else {
    elements = [];
  }
  selectedId = null;
  renderElements();
  updatePropsInputs();
  updateCode();
  pushHistory();
});

addButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const type = btn.getAttribute("data-add");
    addElement(type);
  });
});


addImageBtn.addEventListener("click", () => {
  imageInput.value = "";
  imageInput.click();
});

imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const w = img.width;
      const h = img.height;

      imgCanvas.width = w;
      imgCanvas.height = h;
      imgCtx.clearRect(0, 0, w, h);
      imgCtx.drawImage(img, 0, 0, w, h);

      const imageData = imgCtx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const rgb565 = new Array(w * h);

      for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const r5 = (r >> 3) & 0x1f;
        const g6 = (g >> 2) & 0x3f;
        const b5 = (b >> 3) & 0x1f;
        const val = (r5 << 11) | (g6 << 5) | b5;
        rgb565[p] = val;
      }

      const id = makeId();
      const el = {
        id,
        type: "image",
        x: Math.round((dispWidth - w) / 2),
        y: Math.round((dispHeight - h) / 2),
        w,
        h,
        text: "",
        textSize: 2,
        fillColor: "#ffffff",
        strokeColor: "#ffffff",
        textColor: "#000000",
        value: 0,
        imageName: "img_" + id.replace(/[^a-zA-Z0-9_]/g, "_"),
        imageWidth: w,
        imageHeight: h,
        rgb565,
        previewUrl: reader.result,
        font: getCurrentDriverMode() === "tft" ? DEFAULT_TFT_FONT : DEFAULT_U8G2_FONT
      };

      elements.push(el);
      syncActiveScreenElements();
      selectedId = id;
      updatePreviewSize();
      renderElements();
      updatePropsInputs();
      updateCode();
      pushHistory();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});


addScreenBtn.addEventListener("click", () => {
  const screen = createScreen("Screen " + (screens.length + 1));
  refreshScreenUI();
  setActiveScreen(screen.id);
  // Bring the Screens settings into view after adding
  scrollToScreensSettings();
});

deleteScreenBtn.addEventListener("click", () => {
  if (screens.length <= 1) {
    alert("At least one screen is required.");
    return;
  }
  screens = screens.filter((s) => s.id !== activeScreenId);
  const next = screens[0];
  setActiveScreen(next.id);
});

screenSelect.addEventListener("change", () => {
  setActiveScreen(screenSelect.value);
});

screenFnNameInput.addEventListener("input", () => {
  const scr = screens.find((s) => s.id === activeScreenId);
  if (!scr) return;
  scr.fnName = screenFnNameInput.value.trim();
  updateCode();
  pushHistory();
});


function addElement(type) {
  const id = makeId();
  let baseW = 80;
  let baseH = 30;
  let text = "";
  let textSize = 2;
  let value = 50;

  // Enhanced element properties based on type
  if (type === "text") {
    baseW = 120;
    baseH = 20;
    text = "Text";
  } else if (type === "label") {
    baseW = 80;
    baseH = 20;
    text = "Label";
  } else if (type === "button") {
    baseW = 80;
    baseH = 28;
    text = "Button";
  } else if (type === "header") {
    baseW = Math.min(dispWidth - 20, 200); // Responsive width
    baseH = 24;
    text = "Header";
  } else if (type === "card") {
    baseW = 120;
    baseH = 60;
    text = "Card";
  } else if (type === "divider") {
    baseW = Math.min(dispWidth - 40, 150);
    baseH = 2;
  } else if (type === "progress") {
    baseW = 120;
    baseH = 16;
    value = 60;
  } else if (type === "slider") {
    baseW = 120;
    baseH = 18;
    value = 40;
  } else if (type === "toggle") {
    baseW = 50;
    baseH = 20;
    value = 0;
  } else if (type === "circle") {
    baseW = 40;
    baseH = 40;
  }

  // Smart positioning - place new elements in a grid pattern or near existing elements
  const existingElements = elements.length;
  let x, y;

  if (existingElements === 0) {
    // First element - center it
    x = Math.round((dispWidth - baseW) / 2);
    y = Math.round((dispHeight - baseH) / 2);
  } else {
    // Subsequent elements - position in a cascading pattern
    const lastElement = elements[elements.length - 1];
    x = Math.min(lastElement.x + 20, dispWidth - baseW - 10);
    y = Math.min(lastElement.y + 20, dispHeight - baseH - 10);

    // If it would go off-screen, wrap to next row
    if (x + baseW > dispWidth - 10) {
      x = 10;
      y = Math.min(y + 60, dispHeight - baseH - 10);
    }
  }

  // Ensure element stays within bounds
  x = Math.max(5, Math.min(x, dispWidth - baseW - 5));
  y = Math.max(5, Math.min(y, dispHeight - baseH - 5));

  // Auto-pick defaults that contrast with the current background
  const defaultStroke = getContrastingColor(bgColor);
  // Fill defaults: on light backgrounds, default to dark fill; on dark backgrounds, default to light fill
  const defaultFill = defaultStroke;
  const defaultText = isLightColor(defaultFill) ? "#111827" : "#FFFFFF";

  // Apply grid snapping if enabled
  if (snapToGrid && gridSize > 0) {
    x = Math.round(x / gridSize) * gridSize;
    y = Math.round(y / gridSize) * gridSize;
  }

  const el = {
    id,
    type,
    x: Math.round(x),
    y: Math.round(y),
    w: baseW,
    h: baseH,
    text,
    textSize,
    fillColor: defaultFill,
    strokeColor: defaultStroke,
    textColor: defaultText,
    fillAlpha: 255, // 0 = transparent, 255 = opaque
    oledFill: true, // For OLED: true = filled, false = transparent
    value,
    actionType: "",
    actionTargetScreenId: null,
    font: getCurrentDriverMode() === "tft" ? DEFAULT_TFT_FONT : DEFAULT_U8G2_FONT
  };

  elements.push(el);
  syncActiveScreenElements();
  selectedId = id;

  // Add visual feedback for element creation
  setTimeout(() => {
    const elementDiv = document.querySelector(`[data-id="${id}"]`);
    if (elementDiv) {
      elementDiv.classList.add('creating');
      setTimeout(() => {
        elementDiv.classList.remove('creating');
      }, 300);
    }
  }, 50);

  updatePreviewSize();
  renderElements();
  updatePropsInputs();
  updateCode();
  pushHistory();
  // After adding a new element, bring its settings into view
  scrollToSelectedElementSettings();
}


function bindNumeric(input, key) {
  input.addEventListener("input", () => {
    const el = elements.find((el) => el.id === selectedId);
    if (!el) return;
    if ((el.type === "image" || el.type === "icon") && (key === "w" || key === "h")) {
      input.value = el[key];
      return;
    }
    let v = parseInt(input.value, 10);
    if (isNaN(v)) v = 0;
    if (snapToGrid && (key === "x" || key === "y") && gridSize > 0) {
      v = Math.round(v / gridSize) * gridSize;
    }
    el[key] = v;
    renderElements();
    updateCode();
    pushHistory();

    // If user resized an icon via inputs, recompute the bitmap for code export
    if (el.type === "icon" && (key === "w" || key === "h")) {
      scheduleRecomputeSelectedIcon();
    }
  });
}

bindNumeric(propX, "x");
bindNumeric(propY, "y");
bindNumeric(propW, "w");
bindNumeric(propH, "h");
bindNumeric(propTextSize, "textSize");

propText.addEventListener("input", () => {
  const el = elements.find((el) => el.id === selectedId);
  if (!el) return;
  el.text = propText.value;
  renderElements();
  updateCode();
  pushHistory();
});

propFillColor.addEventListener("input", () => {
  const el = elements.find((el) => el.id === selectedId);
  if (!el) return;
  el.fillColor = propFillColor.value;
  renderElements();
  updateCode();
  pushHistory();
});

propFillAlpha.addEventListener("input", () => {
  const el = elements.find((el) => el.id === selectedId);
  if (!el) return;
  el.fillAlpha = parseInt(propFillAlpha.value);
  fillAlphaValue.textContent = Math.round(el.fillAlpha / 255 * 100) + "%";
  renderElements();
  updateCode();
  pushHistory();
});

propOLEDFill.addEventListener("change", () => {
  const el = elements.find((el) => el.id === selectedId);
  if (!el) return;
  el.oledFill = propOLEDFill.checked;

  // Update fill color picker state
  propFillColor.disabled = !propOLEDFill.checked;
  propFillColor.style.opacity = propOLEDFill.checked ? "1" : "0.3";
  propFillColor.style.cursor = propOLEDFill.checked ? "pointer" : "not-allowed";

  renderElements();
  updateCode();
  pushHistory();
});

propStrokeColor.addEventListener("input", () => {
  const el = elements.find((el) => el.id === selectedId);
  if (!el) return;
  el.strokeColor = propStrokeColor.value;
  renderElements();
  updateCode();
  pushHistory();
});

propTextColor.addEventListener("input", () => {
  const el = elements.find((el) => el.id === selectedId);
  if (!el) return;
  el.textColor = propTextColor.value;
  renderElements();
  updateCode();
  pushHistory();
});

propValue.addEventListener("input", () => {
  const el = elements.find((el) => el.id === selectedId);
  if (!el) return;
  let v = parseInt(propValue.value, 10);
  if (isNaN(v)) v = 0;
  v = Math.max(0, Math.min(100, v));
  el.value = v;
  renderElements();
  updateCode();
  pushHistory();
});

propFont.addEventListener("change", () => {
  const el = elements.find((el) => el.id === selectedId);
  if (!el) return;
  const mode = getCurrentDriverMode();
  setElementFontForMode(el, mode, propFont.value);
  renderElements(); // make font changes visible in the preview
  updateCode();
  pushHistory();
});

propAction.addEventListener("change", () => {
  const el = elements.find((el) => el.id === selectedId);
  if (!el) return;
  const val = propAction.value;
  el.actionType = val || "";
  if (!val) {
    el.actionTargetScreenId = null;
  } else {
    
    const target = screens.find(s => s.id !== activeScreenId) || screens[0];
    el.actionTargetScreenId = target ? target.id : null;
  }
  refreshActionTargetOptions(el);
  updateCode();
  pushHistory();
});

propActionTarget.addEventListener("change", () => {
  const el = elements.find((el) => el.id === selectedId);
  if (!el) return;
  el.actionTargetScreenId = propActionTarget.value || null;
  updateCode();
  pushHistory();
});

if (propIconTintEnabled) {
  propIconTintEnabled.addEventListener("change", () => {
    const el = elements.find((el) => el.id === selectedId);
    if (!el || el.type !== "icon") return;
    el.iconTintEnabled = propIconTintEnabled.checked;
    // Default tint color if missing
    if (el.iconTintEnabled && (!el.iconTintColor || !String(el.iconTintColor).startsWith("#"))) {
      el.iconTintColor = "#ffffff";
      if (propIconTintColor) propIconTintColor.value = el.iconTintColor;
    }
    renderElements();
    updateCode();
    pushHistory();
    scheduleRecomputeSelectedIcon();
  });
}

if (propIconTintColor) {
  propIconTintColor.addEventListener("input", () => {
    const el = elements.find((el) => el.id === selectedId);
    if (!el || el.type !== "icon") return;
    el.iconTintColor = propIconTintColor.value;
    // Auto-enable tint when user picks a color
    el.iconTintEnabled = true;
    if (propIconTintEnabled) propIconTintEnabled.checked = true;
    renderElements();
    updateCode();
    pushHistory();
    scheduleRecomputeSelectedIcon();
  });
}

deleteElementBtn.addEventListener("click", () => {
  elements = elements.filter((el) => el.id !== selectedId);
  const scr = screens.find((s) => s.id === activeScreenId);
  if (scr) scr.elements = elements;
  selectedId = null;
  renderElements();
  updatePropsInputs();
  updateCode();
  pushHistory();
});


preview.addEventListener("mousedown", (e) => {
  if (e.target.classList.contains("ui-element")) {
    // Clicked on an element - select it
    const id = e.target.dataset.id;
    selectElement(id, false);
    pushHistory();
  } else {
    // Clicked on empty space - deselect current element
    if (selectedId) {
      selectedId = null;
      updatePropsInputs();
      renderElements();
      pushHistory();
    }
  }
});


copyCodeBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(codeOutput.value);
    const label = copyCodeBtn.querySelector("span") || copyCodeBtn;
    label.textContent = "Copied!";
    setTimeout(() => {
      const labelReset = copyCodeBtn.querySelector("span") || copyCodeBtn;
      labelReset.textContent = "Copy";
    }, 1200);
  } catch (e) {
    alert("Could not copy. Please copy manually.");
  }
});


undoBtn.addEventListener("click", () => {
  if (historyIndex <= 0) return;
  historyIndex--;
  updateUndoRedoButtons();
  const snap = history[historyIndex];
  applyStateSnapshot(snap);
});

redoBtn.addEventListener("click", () => {
  if (historyIndex >= history.length - 1) return;
  historyIndex++;
  updateUndoRedoButtons();
  const snap = history[historyIndex];
  applyStateSnapshot(snap);
});


duplicateBtn.addEventListener("click", () => {
  const el = elements.find((el) => el.id === selectedId);
  if (!el) return;
  const id = makeId();
  const copy = JSON.parse(JSON.stringify(el));
  copy.id = id;
  copy.x = el.x + 10;
  copy.y = el.y + 10;

  // Ensure the copy stays within bounds
  copy.x = Math.min(copy.x, dispWidth - copy.w);
  copy.y = Math.min(copy.y, dispHeight - copy.h);

  elements.push(copy);
  syncActiveScreenElements();
  selectedId = id;

  // Add visual feedback for duplication
  setTimeout(() => {
    const elementDiv = document.querySelector(`[data-id="${id}"]`);
    if (elementDiv) {
      elementDiv.classList.add('creating');
      setTimeout(() => {
        elementDiv.classList.remove('creating');
      }, 300);
    }
  }, 50);

  renderElements();
  updatePropsInputs();
  updateCode();
  pushHistory();
});


zoomSlider.addEventListener("input", () => {
  zoomFactor = parseInt(zoomSlider.value, 10) / 100;
  updatePreviewSize();
  renderElements();
});


let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    updatePreviewSize();
    renderElements();
  }, 100);
});


exportJsonBtn.addEventListener("click", () => {
  const data = deepCloneState();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ui_project.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});


importJsonBtn.addEventListener("click", () => {
  importJsonInput.value = "";
  importJsonInput.click();
});

importJsonInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      history = [];
      historyIndex = -1;
      applyStateSnapshot(data);
      pushHistory();
    } catch (err) {
      alert("Invalid JSON project file.");
    }
  };
  reader.readAsText(file);
});


function alignSelected(mode) {
  const el = elements.find(e => e.id === selectedId);
  if (!el) return;

  if (mode === "left") {
    el.x = 0;
  } else if (mode === "right") {
    el.x = dispWidth - el.w;
  } else if (mode === "hcenter") {
    el.x = Math.round((dispWidth - el.w) / 2);
  } else if (mode === "top") {
    el.y = 0;
  } else if (mode === "bottom") {
    el.y = dispHeight - el.h;
  } else if (mode === "vcenter") {
    el.y = Math.round((dispHeight - el.h) / 2);
  }

  if (snapToGrid && gridSize > 0) {
    el.x = Math.round(el.x / gridSize) * gridSize;
    el.y = Math.round(el.y / gridSize) * gridSize;
  }

  updatePropsInputs(false);
  renderElements();
  updateCode();
  pushHistory();
}

alignLeftBtn.addEventListener("click", () => alignSelected("left"));
alignRightBtn.addEventListener("click", () => alignSelected("right"));
alignHCenterBtn.addEventListener("click", () => alignSelected("hcenter"));
alignTopBtn.addEventListener("click", () => alignSelected("top"));
alignBottomBtn.addEventListener("click", () => alignSelected("bottom"));
alignVCenterBtn.addEventListener("click", () => alignSelected("vcenter"));


document.addEventListener("keydown", (e) => {
  const tag = e.target.tagName.toLowerCase();
  if (["input", "textarea", "select"].includes(tag)) return;

  // Undo/Redo
  if ((e.key === "z" || e.key === "Z") && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    if (e.shiftKey || e.key === "y" || e.key === "Y") {
      // Redo
      if (historyIndex < history.length - 1) {
        historyIndex++;
        updateUndoRedoButtons();
        applyStateSnapshot(history[historyIndex]);
      }
    } else {
      // Undo
      if (historyIndex > 0) {
        historyIndex--;
        updateUndoRedoButtons();
        applyStateSnapshot(history[historyIndex]);
      }
    }
    return;
  }

  // Duplicate element (Ctrl+D)
  if ((e.key === "d" || e.key === "D") && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    duplicateBtn.click();
    return;
  }

  // Select all elements (Ctrl+A) - selects first element
  if ((e.key === "a" || e.key === "A") && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    if (!selectedId && elements.length > 0) {
      selectElement(elements[0].id);
    }
    return;
  }

  // Tab to cycle through elements
  if (e.key === "Tab") {
    e.preventDefault();
    if (e.shiftKey) {
      selectPreviousElement();
    } else {
      selectNextElement();
    }
    return;
  }

  // Bring to front/back (Ctrl+Shift+Up/Down)
  if ((e.key === "ArrowUp" || e.key === "ArrowDown") && (e.ctrlKey || e.metaKey) && e.shiftKey) {
    e.preventDefault();
    if (e.key === "ArrowUp") {
      bringToFront(selectedId);
    } else {
      sendToBack(selectedId);
    }
    return;
  }

  const el = elements.find((el) => el.id === selectedId);
  if (!el) return;

  // Delete element
  if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault();
    elements = elements.filter((x) => x.id !== selectedId);
    const scr = screens.find((s) => s.id === activeScreenId);
    if (scr) scr.elements = elements;
    selectedId = null;
    renderElements();
    updatePropsInputs();
    updateCode();
    pushHistory();
    return;
  }

  // Element movement with arrow keys
  if (e.key.startsWith("Arrow")) {
    e.preventDefault();
    const step = e.shiftKey ? (snapToGrid ? gridSize * 2 : 10) : (snapToGrid ? gridSize : 1);

    if (e.key === "ArrowLeft") el.x = Math.max(0, el.x - step);
    if (e.key === "ArrowRight") el.x = Math.min(dispWidth - el.w, el.x + step);
    if (e.key === "ArrowUp") el.y = Math.max(0, el.y - step);
    if (e.key === "ArrowDown") el.y = Math.min(dispHeight - el.h, el.y + step);

    if (snapToGrid && gridSize > 0) {
      el.x = Math.round(el.x / gridSize) * gridSize;
      el.y = Math.round(el.y / gridSize) * gridSize;
    }

    updatePropsInputs(false);
    renderElements();
    updateCode();
    pushHistory();
    return;
  }

  // Quick alignment shortcuts
  if (e.ctrlKey || e.metaKey) {
    if (e.key === "1") {
      e.preventDefault();
      alignSelected("left");
    } else if (e.key === "2") {
      e.preventDefault();
      alignSelected("hcenter");
    } else if (e.key === "3") {
      e.preventDefault();
      alignSelected("right");
    } else if (e.key === "4") {
      e.preventDefault();
      alignSelected("top");
    } else if (e.key === "5") {
      e.preventDefault();
      alignSelected("vcenter");
    } else if (e.key === "6") {
      e.preventDefault();
      alignSelected("bottom");
    }
  }

  // Element type switching (number keys)
  if (!e.ctrlKey && !e.metaKey && !e.altKey) {
    const numberKey = parseInt(e.key);
    if (numberKey >= 1 && numberKey <= 9) {
      e.preventDefault();
      const elementTypes = ["rect", "roundrect", "circle", "line", "divider", "label", "button", "progress", "slider"];
      if (numberKey <= elementTypes.length) {
        el.type = elementTypes[numberKey - 1];
        renderElements();
        updatePropsInputs();
        updateCode();
        pushHistory();
      }
    }
  }
});



bgColor = bgColorInput.value;
snapToGrid = snapCheckbox.checked;
gridSize = parseInt(gridSizeInput.value, 10) || 4;

initU8g2Presets();
displayDriverSelect.value = driverMode;
updateDisplaySettingsVisibility();
initFontList();
initScreens();

// Sidebar extras init
setUiExamplesTab(driverMode === "u8g2" ? "oled" : "tft");
loadFileIcons().then(renderIconGrid);

if (iconSearchInput) {
  iconSearchInput.addEventListener("input", () => {
    iconPage = 0;
    renderIconGrid();
  });
}
if (clearIconSearchBtn) {
  clearIconSearchBtn.addEventListener("click", () => {
    if (iconSearchInput) iconSearchInput.value = "";
    iconPage = 0;
    renderIconGrid();
  });
}
if (iconSizeFilterSelect) {
  iconSizeFilterSelect.addEventListener("change", () => {
    ICON_SIZE_FILTER = iconSizeFilterSelect.value || "all";
    iconPage = 0;
    renderIconGrid();
  });
}
if (refreshIconsBtn) {
  refreshIconsBtn.addEventListener("click", async () => {
    setIconHint("Refreshing icon list…");
    ICON_ASSET_BUST = Date.now();
    iconPage = 0;
    // Try to reload the injected manifest (file:// friendly). If it fails, we'll still try JSON fetch.
    await reloadIconManifestScript();
    await loadFileIcons();
    renderIconGrid();
    setIconHint("Icon list refreshed.");
  });
}

// Auto-refresh icon list in the background (useful when adding/removing files in icons/)
if (location.protocol === "http:" || location.protocol === "https:") {
  setInterval(async () => {
    if (!ICON_AUTO_SCAN_ENABLED) return;
    const prev = signatureForIcons(FILE_ICONS);
    await loadFileIcons();
    const next = signatureForIcons(FILE_ICONS);
    if (next && next !== prev) {
      ICON_ASSET_BUST = Date.now();
      renderIconGrid();
      setIconHint("Icon list updated.");
    }
  }, 4000);
}

if (exportIconsTftBtn) {
  exportIconsTftBtn.addEventListener("click", () => {
    exportAllIconsTftRgb565();
  });
}
if (exportIconsU8g2Btn) {
  exportIconsU8g2Btn.addEventListener("click", () => {
    exportAllIconsU8g2Xbm();
  });
}

if (iconPrevBtn) {
  iconPrevBtn.addEventListener("click", () => {
    iconPage = Math.max(0, iconPage - 1);
    renderIconGrid();
  });
}
if (iconNextBtn) {
  iconNextBtn.addEventListener("click", () => {
    iconPage = iconPage + 1;
    renderIconGrid();
  });
}

if (uiExamplesTabTft) {
  uiExamplesTabTft.addEventListener("click", () => setUiExamplesTab("tft"));
}
if (uiExamplesTabOled) {
  uiExamplesTabOled.addEventListener("click", () => setUiExamplesTab("oled"));
}

if (uiExamplesPrevBtn) {
  uiExamplesPrevBtn.addEventListener("click", () => {
    uiExamplesPageByTab[uiExamplesActiveTab] = Math.max(0, (uiExamplesPageByTab[uiExamplesActiveTab] || 0) - 1);
    renderUiExamples();
  });
}
if (uiExamplesNextBtn) {
  uiExamplesNextBtn.addEventListener("click", () => {
    uiExamplesPageByTab[uiExamplesActiveTab] = (uiExamplesPageByTab[uiExamplesActiveTab] || 0) + 1;
    renderUiExamples();
  });
}





