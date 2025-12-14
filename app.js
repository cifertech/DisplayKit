
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
const actionGroup = document.getElementById("actionGroup");
const propAction = document.getElementById("propAction");
const propActionTarget = document.getElementById("propActionTarget");


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
    font: DEFAULT_U8G2_FONT
  };

  elements.push(el);
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
  "u8g2_font_5x8_tf",
  "u8g2_font_6x10_tf",
  "u8g2_font_7x14_tf",
  "u8g2_font_8x13B_tf",
  "u8g2_font_9x15B_tf",
  "u8g2_font_10x20_tf",
  "u8g2_font_helvR08_tf",
  "u8g2_font_helvR10_tf",
  "u8g2_font_helvR12_tf",
  "u8g2_font_helvB08_tf",
  "u8g2_font_helvB10_tf",
  "u8g2_font_helvB12_tf",
  "u8g2_font_profont10_mf",
  "u8g2_font_profont12_mf",
  "u8g2_font_profont15_mf",
  "u8g2_font_t0_11b_mf",
  "u8g2_font_t0_12b_mf",
  "u8g2_font_ncenB08_tr",
  "u8g2_font_ncenB10_tr",
  "u8g2_font_ncenB12_tr",
  "u8g2_font_ncenB14_tr",
  "u8g2_font_6x12_tf",
  "u8g2_font_8x8_mf",
  "u8g2_font_inr16_mf",
  "u8g2_font_inb16_mf"
  
];


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
  return ["label", "button", "header", "card"].includes(type);
}

function elementHasValue(type) {
  return ["progress", "slider", "toggle"].includes(type);
}

function elementHasFill(type) {
  return ["rect", "roundrect", "circle", "button", "card", "header", "progress", "slider", "toggle"].includes(type);
}

function elementSupportsAction(type) {
  return ["button", "card", "header", "label"].includes(type);
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
  U8G2_FONTS.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    propFont.appendChild(opt);
  });
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
  
  
  const scale = baseScale * zoomFactor;

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

function renderElements() {
  const scale = parseFloat(preview.dataset.scale || "1");
  preview.innerHTML = "";
  preview.style.position = "relative";

  const isOLED = driverMode === "u8g2";

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

    let fill = el.fillColor || "#ffffff";
    let stroke = el.strokeColor || "#ffffff";
    let textColor = el.textColor || "#000000";
    let shouldFill = true;

    if (isOLED) {
      // OLED mode: use binary fill control
      shouldFill = el.oledFill !== false; // Default to true for OLED
      if (!shouldFill) {
        fill = "transparent";
        stroke = convertToOLEDColor(stroke);
        textColor = convertToOLEDColor(textColor);
      } else {
        // OLED displays are typically monochromatic
        fill = convertToOLEDColor(fill);
        stroke = convertToOLEDColor(stroke);
        textColor = convertToOLEDColor(textColor);
      }

      // Add crisp pixel rendering
      div.style.imageRendering = 'pixelated';
      div.style.imageRendering = '-moz-crisp-edges';
      div.style.imageRendering = 'crisp-edges';
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

    if (el.type === "image") {
      div.style.backgroundImage = el.previewUrl ? `url(${el.previewUrl})` : "none";
      div.style.backgroundSize = "contain";
      div.style.backgroundPosition = "center";
      div.style.backgroundRepeat = "no-repeat";
      div.style.border = "1px solid rgba(255, 255, 255, 0.1)";
      div.style.backgroundColor = "#000000";
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
        div.style.backgroundColor = el.type === "label" ? "transparent" : (shouldFill ? fill : "transparent");
      }
      div.style.color = textColor;
      if (elementHasText(el.type)) {
        div.textContent = el.text || el.type;
        if (el.type === "button") {
          div.style.fontWeight = "500";
          div.style.textShadow = "0 1px 1px rgba(0, 0, 0, 0.1)";
        }
      } else {
        div.textContent = "";
      }
    }

    if (el.type !== "image") {
      div.style.fontSize = (el.textSize || 2) * 5 * scale + "px";
    }

    enableDrag(div, el.id);
    
    
    if (el.id === selectedId && el.type !== "image") {
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
  propFont.value = el.font || DEFAULT_U8G2_FONT;

  textGroup.style.display = elementHasText(el.type) ? "block" : "none";
  valueGroup.style.display = elementHasValue(el.type) ? "block" : "none";
  fontGroup.style.display = elementHasText(el.type) ? "block" : "none";

  if (el.type === "image") {
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
        el.type === "image" &&
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

    scr.elements.forEach((el) => {
      const val = Math.max(0, Math.min(100, el.value != null ? el.value : 50));

      if (el.type === "image") {
          if (el.rgb565 && el.rgb565.length && el.imageWidth && el.imageHeight) {
            const name = el.imageName || "img_" + el.id.replace(/[^a-zA-Z0-9_]/g, "_");
            code += `  ${drv}.pushImage(${el.x}, ${el.y}, ${el.imageWidth}, ${el.imageHeight}, ${name});\n\n`;
          }
        return;
      }

      const fill565 = hexToRgb565(el.fillColor || "#FFFFFF");
      const stroke565 = hexToRgb565(el.strokeColor || "#FFFFFF");
      const text565 = hexToRgb565(el.textColor || "#FFFFFF");
      const fillAlpha = el.fillAlpha != null ? el.fillAlpha : 255;

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
  driverMode = displayDriverSelect.value;

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
  updatePreviewSize();
  renderElements(); // Re-render elements with new display mode styling
  updatePropsInputs(); // Update property controls for new mode
  updateCode();
  pushHistory();
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
        font: DEFAULT_U8G2_FONT
      };

      elements.push(el);
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
  if (type === "label") {
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
    font: DEFAULT_U8G2_FONT
  };

  elements.push(el);
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
}


function bindNumeric(input, key) {
  input.addEventListener("input", () => {
    const el = elements.find((el) => el.id === selectedId);
    if (!el) return;
    if (el.type === "image" && (key === "w" || key === "h")) {
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
  el.font = propFont.value || DEFAULT_U8G2_FONT;
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
updateDisplaySettingsVisibility();
initFontList();
initScreens();





