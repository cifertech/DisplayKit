// ----------------- Data model -----------------
let elements = []; // alias to active screen elements
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

// Driver mode: "tft" or "u8g2"
let driverMode = "tft";
let u8g2PresetId = "ssd1306_128x64_i2c_f";

const DEFAULT_U8G2_FONT = "u8g2_font_6x10_tf";

// Undo/Redo history
let history = [];
let historyIndex = -1;
let historyLocked = false; // avoid recursion while applying history

const preview = document.getElementById("preview");
const displayInfo = document.getElementById("displayInfo");

// Controls
const dispWidthInput = document.getElementById("dispWidth");
const dispHeightInput = document.getElementById("dispHeight");
const applyResBtn = document.getElementById("applyRes");
const bgColorInput = document.getElementById("bgColor");
const clearAllBtn = document.getElementById("clearAll");
const useSpriteCheckbox = document.getElementById("useSpriteCheckbox");
const snapCheckbox = document.getElementById("snapCheckbox");
const gridSizeInput = document.getElementById("gridSize");

const displayDriverSelect = document.getElementById("displayDriver");
const u8g2PresetSelect = document.getElementById("u8g2Preset");

const addButtons = document.querySelectorAll("[data-add]");
const addImageBtn = document.getElementById("addImageBtn");
const imageInput = document.getElementById("imageInput");

const imgCanvas = document.createElement("canvas");
const imgCtx = imgCanvas.getContext("2d");

// Screen controls
const screenSelect = document.getElementById("screenSelect");
const addScreenBtn = document.getElementById("addScreenBtn");
const deleteScreenBtn = document.getElementById("deleteScreenBtn");
const screenFnNameInput = document.getElementById("screenFnName");

// Props controls
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

// Alignment buttons
const alignLeftBtn = document.getElementById("alignLeftBtn");
const alignHCenterBtn = document.getElementById("alignHCenterBtn");
const alignRightBtn = document.getElementById("alignRightBtn");
const alignTopBtn = document.getElementById("alignTopBtn");
const alignVCenterBtn = document.getElementById("alignVCenterBtn");
const alignBottomBtn = document.getElementById("alignBottomBtn");

// Code output
const codeOutput = document.getElementById("codeOutput");
const copyCodeBtn = document.getElementById("copyCode");

// Top bar extra controls
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const duplicateBtn = document.getElementById("duplicateBtn");
const zoomSlider = document.getElementById("zoomSlider");
const exportJsonBtn = document.getElementById("exportJsonBtn");
const importJsonBtn = document.getElementById("importJsonBtn");
const importJsonInput = document.getElementById("importJsonInput");

// --------------- Theme Toggle (Initialize Early) -----------------
function getTheme() {
  // Check localStorage first, then system preference, default to light
  const saved = localStorage.getItem("theme");
  if (saved) return saved;
  // Check system preference
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  if (themeIcon) {
    themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  }
}

function toggleTheme() {
  const currentTheme = getTheme();
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);
}

// Initialize theme early
const savedTheme = getTheme();
setTheme(savedTheme);

// Theme toggle button event
if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}

// Listen for system theme changes (only if no manual preference is set)
if (window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      setTheme(e.matches ? "dark" : "light");
    }
  });
}


// --------- U8g2 presets and fonts (extend these lists if you want "full") ----------
const U8G2_PRESETS = [
  {
    id: "ssd1306_128x64_i2c_f",
    label: "SSD1306 128x64 I2C (F_HW_I2C)",
    ctor: "U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);"
  },
  {
    id: "ssd1306_128x64_spi_f",
    label: "SSD1306 128x64 SPI (F_4W_HW_SPI)",
    ctor: "U8G2_SSD1306_128X64_NONAME_F_4W_HW_SPI u8g2(U8G2_R0, /* cs=*/ 10, /* dc=*/ 9, /* reset=*/ 8);"
  },
  {
    id: "sh1106_128x64_i2c_f",
    label: "SH1106 128x64 I2C (F_HW_I2C)",
    ctor: "U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);"
  },
  {
    id: "custom",
    label: "Custom (edit manually in code)",
    ctor: "// TODO: Add your U8g2 constructor here\n// Example:\n// U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);"
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
  // add more if you want full list
];

// --------------- Utils -----------------
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
      u8g2PresetId
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

function elementSupportsAction(type) {
  return ["button", "card", "header", "label"].includes(type);
}

// --------------- Screens -----------------
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

// --------------- Preview layout -----------------
function updatePreviewSize() {
  const previewWrapper = document.querySelector(".preview-wrapper");
  if (!previewWrapper) return;
  
  // Get available space (accounting for padding in preview-frame)
  const wrapperRect = previewWrapper.getBoundingClientRect();
  const availableWidth = wrapperRect.width - 32; // 16px padding on each side
  const availableHeight = wrapperRect.height - 32; // 16px padding on each side
  
  // Calculate base scale to fit in available space at 100% zoom
  const baseScale = Math.min(
    availableWidth / dispWidth,
    availableHeight / dispHeight
  );
  
  // Apply zoom factor (allows scaling beyond 100%)
  const scale = baseScale * zoomFactor;

  preview.style.width = dispWidth * scale + "px";
  preview.style.height = dispHeight * scale + "px";
  preview.style.backgroundColor = bgColor;

  preview.dataset.scale = scale;
  const driverLabel = driverMode === "u8g2" ? "U8g2 OLED" : "TFT_eSPI";
  displayInfo.textContent = `${driverLabel} · ${dispWidth}x${dispHeight} px`;
}

// --------------- Render preview elements -----------------
function renderElements() {
  const scale = parseFloat(preview.dataset.scale || "1");
  preview.innerHTML = "";
  preview.style.position = "relative";

  elements.forEach((el) => {
    const div = document.createElement("div");
    div.className = "ui-element" + (el.id === selectedId ? " selected" : "");
    div.dataset.id = el.id;

    const x = el.x * scale;
    const y = el.y * scale;
    const w = el.w * scale;
    const h = el.h * scale;

    div.style.left = x + "px";
    div.style.top = y + "px";
    div.style.width = w + "px";
    div.style.height = h + "px";

    const fill = el.fillColor || "#ffffff";
    const stroke = el.strokeColor || "#ffffff";
    const textColor = el.textColor || "#000000";

    if (el.type === "image") {
      div.style.backgroundImage = el.previewUrl ? `url(${el.previewUrl})` : "none";
      div.style.backgroundSize = "contain";
      div.style.backgroundPosition = "center";
      div.style.backgroundRepeat = "no-repeat";
      div.style.border = "1px solid rgba(255, 255, 255, 0.1)";
      div.style.backgroundColor = "#000000";
      div.style.borderRadius = "4px";
    } else if (el.type === "circle") {
      div.style.borderRadius = "50%";
      div.style.backgroundColor = fill;
      div.style.border = "1px solid " + stroke;
      div.style.boxShadow = `0 3px 6px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)`;
    } else if (el.type === "line") {
      // Line connects two points
      const angle = Math.atan2(h, w) * (180 / Math.PI);
      div.style.width = Math.sqrt(w * w + h * h) + "px";
      div.style.height = "2px";
      div.style.backgroundColor = stroke;
      div.style.borderRadius = "1px";
      div.style.transformOrigin = "0 50%";
      div.style.transform = `rotate(${angle}deg)`;
      div.style.boxShadow = `0 1px 2px rgba(0, 0, 0, 0.2)`;
    } else if (el.type === "divider") {
      div.style.height = Math.max(2, h) + "px";
      div.style.width = w + "px";
      div.style.backgroundColor = stroke;
      div.style.borderRadius = "1px";
      div.style.boxShadow = `0 1px 2px rgba(0, 0, 0, 0.2)`;
      // Add subtle gradient for depth
      div.style.background = `linear-gradient(to bottom, ${stroke}, ${stroke}dd)`;
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
      div.style.backgroundColor = fill;
      div.style.borderBottom = "2px solid " + stroke;
      div.style.alignItems = "center";
      div.style.justifyContent = "flex-start";
      div.style.paddingLeft = Math.max(6, 4 * scale) + "px";
      div.style.fontWeight = "600";
      div.style.color = textColor;
      div.style.textShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";
      div.textContent = el.text || "Header";
    } else if (el.type === "card") {
      div.style.backgroundColor = fill;
      div.style.borderRadius = "8px";
      div.style.border = "1px solid " + stroke;
      div.style.padding = Math.max(6, 4 * scale) + "px";
      div.style.color = textColor;
      div.style.alignItems = "flex-start";
      div.style.justifyContent = "flex-start";
      div.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.2)`;
      div.textContent = el.text || "Card";
    } else if (el.type === "rect") {
      // Rectangle with enhanced styling
      div.style.backgroundColor = fill;
      div.style.border = "1px solid " + stroke;
      div.style.borderRadius = "2px";
      div.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)`;
    } else if (el.type === "roundrect") {
      // Rounded rectangle with enhanced styling
      div.style.backgroundColor = fill;
      div.style.border = "1px solid " + stroke;
      div.style.borderRadius = "8px";
      div.style.boxShadow = `0 3px 6px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.15)`;
    } else {
      // button, label
      div.style.backgroundColor = el.type === "label" ? "transparent" : fill;
      if (el.type === "button") {
        div.style.borderRadius = "6px";
        div.style.border = "1px solid " + stroke;
        div.style.boxShadow = `0 2px 4px rgba(0, 0, 0, 0.2)`;
        div.style.cursor = "pointer";
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
    
    // Add resize handles for selected elements (except images which are locked)
    if (el.id === selectedId && el.type !== "image") {
      addResizeHandles(div, el.id);
    }
    
    preview.appendChild(div);
  });
}

// --------------- Resize handles -----------------
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

    // Handle different resize directions
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

    // Apply snap to grid if enabled
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
    document.removeEventListener("mousemove", onResizeMove);
    document.removeEventListener("mouseup", onResizeUp);
  }
}

// --------------- Drag logic -----------------
function enableDrag(node, id) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let origX = 0;
  let origY = 0;

  node.addEventListener("mousedown", (e) => {
    // Don't start dragging if clicking on a resize handle
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
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}

// --------------- Selection & properties -----------------
function selectElement(id, push = true) {
  selectedId = id;
  updatePropsInputs();
  renderElements();
  if (push) pushHistory();
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

  // Actions
  if (elementSupportsAction(el.type)) {
    actionGroup.style.display = "block";
    propAction.value = el.actionType || "";
    refreshActionTargetOptions(el);
  } else {
    actionGroup.style.display = "none";
  }

  if (push) pushHistory();
}

// --------------- Code generation (TFT_eSPI + U8g2) -----------------
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
  code += "// NOTE: Touch / button input handling is not generated.\n";
  code += "// Use the comments marked \"Action\" to wire your touch logic.\n\n";

  const bg565 = hexToRgb565(bgColor);

  // Collect all image elements
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

  // Emit image arrays
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

  // Screen functions
  screens.forEach((scr) => {
    const fnName = getScreenFnName(scr);
    const drv = useSprite ? "spr" : "tft";

    code += `void ${fnName}() {\n`;
    if (useSprite) {
      code += `  spr.fillSprite(${bg565});\n`;
    } else {
      code += `  tft.fillScreen(${bg565});\n`;
    }
    code += `  // --- UI elements for screen: ${scr.name} ---\n`;

    scr.elements.forEach((el) => {
      const val = Math.max(0, Math.min(100, el.value != null ? el.value : 50));

      if (el.type === "image") {
        if (el.rgb565 && el.rgb565.length && el.imageWidth && el.imageHeight) {
          const name = el.imageName || "img_" + el.id.replace(/[^a-zA-Z0-9_]/g, "_");
          code += "  // Image\n";
          code += `  ${drv}.pushImage(${el.x}, ${el.y}, ${el.imageWidth}, ${el.imageHeight}, ${name});\n\n`;
        }
        return;
      }

      const fill565 = hexToRgb565(el.fillColor || "#FFFFFF");
      const stroke565 = hexToRgb565(el.strokeColor || "#FFFFFF");
      const text565 = hexToRgb565(el.textColor || "#FFFFFF");

      if (el.type === "rect") {
        code += `  ${drv}.fillRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${fill565});\n`;
      } else if (el.type === "roundrect") {
        code += `  ${drv}.fillRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, 4, ${fill565});\n`;
        code += `  ${drv}.drawRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, 4, ${stroke565});\n`;
      } else if (el.type === "circle") {
        const r = Math.floor(Math.min(el.w, el.h) / 2);
        const cx = el.x + r;
        const cy = el.y + r;
        code += `  ${drv}.fillCircle(${cx}, ${cy}, ${r}, ${fill565});\n`;
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
        code += "  // Button\n";
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
        code += `  // Progress bar (${val}%)\n`;
        code += `  ${drv}.drawRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, 3, ${stroke565});\n`;
        code += `  ${drv}.fillRoundRect(${el.x + 2}, ${el.y + 2}, ${barW}, ${el.h - 4}, 3, ${fill565});\n\n`;
      } else if (el.type === "slider") {
        const r = Math.floor(el.h / 2);
        const knobTravel = el.w - el.h;
        const knobX = el.x + Math.floor(knobTravel * (val / 100));
        const centerY = el.y + r;
        code += `  // Slider (${val}%)\n`;
        code += `  ${drv}.drawRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r}, ${stroke565});\n`;
        code += `  ${drv}.fillCircle(${knobX + r}, ${centerY}, ${r - 2}, ${fill565});\n\n`;
      } else if (el.type === "toggle") {
        const r = Math.floor(el.h / 2);
        const centerY = el.y + r;
        const on = val >= 50;
        code += `  // Toggle (${on ? "ON" : "OFF"})\n`;
        code += `  ${drv}.fillRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r}, ${on ? fill565 : hexToRgb565("#111827")});\n`;
        code += `  ${drv}.drawRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r}, ${stroke565});\n`;
        const knobX = on ? el.x + el.w - r : el.x;
        code += `  ${drv}.fillCircle(${knobX}, ${centerY}, ${r - 2}, ${on ? stroke565 : fill565});\n\n`;
      } else if (el.type === "header") {
        const txt = (el.text || "Header").replace(/"/g, '\\"');
        code += "  // Header bar\n";
        code += `  ${drv}.fillRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${fill565});\n`;
        code += `  ${drv}.drawLine(${el.x}, ${el.y + el.h - 1}, ${el.x + el.w}, ${el.y + el.h - 1}, ${stroke565});\n`;
        code += `  ${drv}.setTextColor(${text565});\n`;
        code += `  ${drv}.setTextSize(${el.textSize || 2});\n`;
        code += `  ${drv}.setCursor(${el.x + 4}, ${el.y + Math.max(0, Math.floor(el.h / 2) - 4)});\n`;
        code += `  ${drv}.print("${txt}");\n\n`;
      } else if (el.type === "card") {
        const txt = (el.text || "Card").replace(/"/g, '\\"');
        code += "  // Card\n";
        code += `  ${drv}.fillRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, 6, ${fill565});\n`;
        code += `  ${drv}.drawRoundRect(${el.x}, ${el.y}, ${el.w}, ${el.h}, 6, ${stroke565});\n`;
        code += `  ${drv}.setTextColor(${text565});\n`;
        code += `  ${drv}.setTextSize(${el.textSize || 2});\n`;
        code += `  ${drv}.setCursor(${el.x + 4}, ${el.y + 4});\n`;
        code += `  ${drv}.print("${txt}");\n\n`;
      }

      // Actions (comments only)
      if (el.actionType === "goto" && el.actionTargetScreenId) {
        const targetScreen = screens.find(s => s.id === el.actionTargetScreenId);
        if (targetScreen) {
          const targetFnName = getScreenFnName(targetScreen);
          code += `  // Action: if touch is inside (${el.x}, ${el.y}, ${el.w}, ${el.h}) -> call ${targetFnName}();\n\n`;
        }
      }
    });

    if (useSprite) {
      code += "  spr.pushSprite(0, 0);\n";
    }

    code += "}\n\n";
  });

  // setup & loop
  const defaultScreen =
    screens.find((s) => s.id === activeScreenId) || screens[0];

  code += "void setup() {\n";
  code += "  tft.init();\n";
  code += "  tft.setRotation(1);\n";
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
  code += "  // Put your logic here\n";
  code += "  // Example touch handler pseudocode:\n";
  code += "  // int16_t tx, ty;\n";
  code += "  // if (touched) { handleTouch(tx, ty); }\n";
  code += "}\n\n";
  code += "// Example helper you can implement:\n";
  code += "// void handleTouch(int16_t tx, int16_t ty) {\n";
  code += "//   // Check \"Action\" comments in the draw functions\n";
  code += "//   // and call the matching drawXXXScreen() when inside bounds.\n";
  code += "// }\n";

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

  code += "// NOTE: Input (buttons/encoder/touch) is not generated.\n";
  code += "// Use the \"Action\" comments to wire your navigation between screens.\n\n";

  // Screen functions
  screens.forEach(scr => {
    const fnName = getScreenFnName(scr);
    code += `void ${fnName}() {\n`;
    code += "  u8g2.clearBuffer();\n";
    code += `  // --- UI elements for screen: ${scr.name} ---\n`;

    scr.elements.forEach(el => {
      const val = Math.max(0, Math.min(100, el.value != null ? el.value : 50));
      const font = el.font || DEFAULT_U8G2_FONT;
      const txtEsc = (el.text || "").replace(/"/g, '\\"');

      if (el.type === "image") {
        code += `  // Image at (${el.x}, ${el.y}) not exported for U8g2 yet.\n`;
        code += "  // You can convert it to XBM and use u8g2.drawXBMP().\n\n";
        return;
      }

      if (el.type === "rect") {
        code += `  u8g2.drawBox(${el.x}, ${el.y}, ${el.w}, ${el.h});\n`;
      } else if (el.type === "roundrect") {
        const r = 4;
        code += `  u8g2.drawRBox(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r});\n`;
      } else if (el.type === "circle") {
        const r = Math.floor(Math.min(el.w, el.h) / 2);
        const cx = el.x + r;
        const cy = el.y + r;
        code += `  u8g2.drawDisc(${cx}, ${cy}, ${r});\n`;
      } else if (el.type === "line") {
        code += `  u8g2.drawLine(${el.x}, ${el.y}, ${el.x + el.w}, ${el.y + el.h});\n`;
      } else if (el.type === "divider") {
        code += `  u8g2.drawLine(${el.x}, ${el.y}, ${el.x + el.w}, ${el.y});\n`;
      } else if (el.type === "label") {
        code += `  u8g2.setFont(${font});\n`;
        code += `  u8g2.drawUTF8(${el.x}, ${el.y} + 10, "${txtEsc}");\n\n`;
      } else if (el.type === "button") {
        const r = 4;
        code += "  // Button\n";
        code += `  u8g2.drawRFrame(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r});\n`;
        if (txtEsc.length) {
          const textY = el.y + Math.floor(el.h / 2) + 4;
          code += `  u8g2.setFont(${font});\n`;
          code += `  u8g2.drawUTF8(${el.x + 4}, ${textY}, "${txtEsc}");\n`;
        }
        code += "\n";
      } else if (el.type === "progress") {
        const innerW = Math.max(0, el.w - 4);
        const barW = Math.floor(innerW * (val / 100));
        code += `  // Progress bar (${val}%)\n`;
        code += `  u8g2.drawFrame(${el.x}, ${el.y}, ${el.w}, ${el.h});\n`;
        code += `  u8g2.drawBox(${el.x + 2}, ${el.y + 2}, ${barW}, ${el.h - 4});\n\n`;
      } else if (el.type === "slider") {
        const r = Math.floor(el.h / 2);
        const knobTravel = el.w - el.h;
        const knobX = el.x + Math.floor(knobTravel * (val / 100));
        const centerY = el.y + r;
        code += `  // Slider (${val}%)\n`;
        code += `  u8g2.drawRFrame(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r});\n`;
        code += `  u8g2.drawDisc(${knobX + r}, ${centerY}, ${r - 2});\n\n`;
      } else if (el.type === "toggle") {
        const r = Math.floor(el.h / 2);
        const centerY = el.y + r;
        const on = val >= 50;
        code += `  // Toggle (${on ? "ON" : "OFF"})\n`;
        code += `  u8g2.drawRFrame(${el.x}, ${el.y}, ${el.w}, ${el.h}, ${r});\n`;
        const knobX = on ? el.x + el.w - r : el.x;
        code += `  u8g2.drawDisc(${knobX}, ${centerY}, ${r - 2});\n\n`;
      } else if (el.type === "header") {
        code += "  // Header bar\n";
        code += `  u8g2.drawBox(${el.x}, ${el.y}, ${el.w}, ${el.h});\n`;
        if (txtEsc.length) {
          const textY = el.y + el.h - 4;
          code += `  u8g2.setFont(${font});\n`;
          code += `  u8g2.setDrawColor(0);\n`;
          code += `  u8g2.drawUTF8(${el.x + 4}, ${textY}, "${txtEsc}");\n`;
          code += "  u8g2.setDrawColor(1);\n\n";
        }
      } else if (el.type === "card") {
        code += "  // Card\n";
        code += `  u8g2.drawRFrame(${el.x}, ${el.y}, ${el.w}, ${el.h}, 4);\n`;
        if (txtEsc.length) {
          const textY = el.y + 10;
          code += `  u8g2.setFont(${font});\n`;
          code += `  u8g2.drawUTF8(${el.x + 4}, ${textY}, "${txtEsc}");\n\n`;
        }
      }

      // Actions (comments only)
      if (el.actionType === "goto" && el.actionTargetScreenId) {
        const targetScreen = screens.find(s => s.id === el.actionTargetScreenId);
        if (targetScreen) {
          const targetFnName = getScreenFnName(targetScreen);
          code += `  // Action: if input is inside (${el.x}, ${el.y}, ${el.w}, ${el.h}) -> call ${targetFnName}();\n\n`;
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
  code += "  // Put your input handling & screen switching here.\n";
  code += "  // For example, check buttons and call drawXXXScreen() as needed.\n";
  code += "}\n";

  codeOutput.value = code;
}

// --------------- Event handlers -----------------
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
  updatePreviewSize();
  updateCode();
  pushHistory();
});

u8g2PresetSelect.addEventListener("change", () => {
  u8g2PresetId = u8g2PresetSelect.value;
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

// Image upload
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

// Screen events
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

// Add element helper
function addElement(type) {
  const id = makeId();
  let baseW = 80;
  let baseH = 30;
  let text = "";
  let textSize = 2;
  let value = 50;

  if (type === "label") {
    baseW = 80;
    baseH = 20;
    text = "Label";
  } else if (type === "button") {
    baseW = 80;
    baseH = 28;
    text = "Button";
  } else if (type === "header") {
    baseW = dispWidth;
    baseH = 24;
    text = "Header";
  } else if (type === "card") {
    baseW = 100;
    baseH = 50;
    text = "Card";
  } else if (type === "divider") {
    baseW = 80;
    baseH = 2;
  } else if (type === "progress") {
    baseW = 100;
    baseH = 16;
    value = 60;
  } else if (type === "slider") {
    baseW = 100;
    baseH = 18;
    value = 40;
  } else if (type === "toggle") {
    baseW = 50;
    baseH = 20;
    value = 0;
  } else if (type === "circle") {
    baseW = 30;
    baseH = 30;
  }

  const el = {
    id,
    type,
    x: Math.round((dispWidth - baseW) / 2),
    y: Math.round((dispHeight - baseH) / 2),
    w: baseW,
    h: baseH,
    text,
    textSize,
    fillColor: type === "label" ? "#000000" : "#ffffff",
    strokeColor: "#ffffff",
    textColor: "#000000",
    value,
    actionType: "",
    actionTargetScreenId: null,
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

// Numeric binding helper
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
    // default target = first other screen
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

// Click to select element
preview.addEventListener("mousedown", (e) => {
  if (e.target.classList.contains("ui-element")) {
    const id = e.target.dataset.id;
    selectElement(id, false);
    pushHistory();
  }
});

// Copy code
copyCodeBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(codeOutput.value);
    copyCodeBtn.textContent = "Copied!";
    setTimeout(() => {
      copyCodeBtn.textContent = "Copy";
    }, 1200);
  } catch (e) {
    alert("Could not copy. Please copy manually.");
  }
});

// Undo / Redo
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

// Duplicate element
duplicateBtn.addEventListener("click", () => {
  const el = elements.find((el) => el.id === selectedId);
  if (!el) return;
  const id = makeId();
  const copy = JSON.parse(JSON.stringify(el));
  copy.id = id;
  copy.x = el.x + 5;
  copy.y = el.y + 5;
  elements.push(copy);
  selectedId = id;
  renderElements();
  updatePropsInputs();
  updateCode();
  pushHistory();
});

// Zoom
zoomSlider.addEventListener("input", () => {
  zoomFactor = parseInt(zoomSlider.value, 10) / 100;
  updatePreviewSize();
  renderElements();
});

// Update preview size on window resize
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    updatePreviewSize();
    renderElements();
  }, 100);
});

// Export JSON
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

// Import JSON
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

// Alignment to screen
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

// Keyboard shortcuts (delete, arrows, undo/redo)
document.addEventListener("keydown", (e) => {
  const tag = e.target.tagName.toLowerCase();
  if (["input", "textarea", "select"].includes(tag)) return;

  if ((e.key === "z" || e.key === "Z") && (e.ctrlKey || e.metaKey)) {
    // Ctrl+Z / Cmd+Z
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      updateUndoRedoButtons();
      applyStateSnapshot(history[historyIndex]);
    }
    return;
  }
  if ((e.key === "y" || (e.key === "Z" && e.shiftKey)) && (e.ctrlKey || e.metaKey)) {
    // Ctrl+Y or Ctrl+Shift+Z
    e.preventDefault();
    if (historyIndex < history.length - 1) {
      historyIndex++;
      updateUndoRedoButtons();
      applyStateSnapshot(history[historyIndex]);
    }
    return;
  }

  const el = elements.find((el) => el.id === selectedId);
  if (!el) return;

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

  if (e.key.startsWith("Arrow")) {
    e.preventDefault();
    const step = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowLeft") el.x -= step;
    if (e.key === "ArrowRight") el.x += step;
    if (e.key === "ArrowUp") el.y -= step;
    if (e.key === "ArrowDown") el.y += step;

    if (snapToGrid && gridSize > 0) {
      el.x = Math.round(el.x / gridSize) * gridSize;
      el.y = Math.round(el.y / gridSize) * gridSize;
    }

    updatePropsInputs(false);
    renderElements();
    updateCode();
    pushHistory();
  }
});


// --------------- Init -----------------
bgColor = bgColorInput.value;
snapToGrid = snapCheckbox.checked;
gridSize = parseInt(gridSizeInput.value, 10) || 4;

initU8g2Presets();
initFontList();
initScreens();


