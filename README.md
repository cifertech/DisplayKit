<div align="center">

<!-- Badges -->

<a href="https://github.com/cifertech/DisplayKit" title="Go to GitHub repo"><img src="https://img.shields.io/static/v1?label=cifertech&message=DisplayKit&color=cyan&logo=github" alt="cifertech - DisplayKit"></a>
![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/cifertech/DisplayKit/total)
<a href="https://github.com/cifertech/DisplayKit"><img src="https://img.shields.io/github/stars/cifertech/DisplayKit?style=social" alt="stars - DisplayKit"></a>
<a href="https://github.com/cifertech/DisplayKit"><img src="https://img.shields.io/github/forks/cifertech/DisplayKit?style=social" alt="forks - DisplayKit"></a>
   
<h4>
    <a href="https://twitter.com/techcifer">TWITTER</a>
  <span> · </span>
    <a href="https://www.instagram.com/cifertech/">INSTAGRAM</a>
  <span> · </span>
    <a href="https://www.youtube.com/c/techcifer">YOUTUBE</a>
  <span> · </span>
    <a href="https://cifertech.net/">WEBSITE</a>
  </h4>
</div> 
 
<br />

# 🎨 DisplayKit

**DisplayKit** is a modern web-based drag-and-drop UI designer for embedded display development.

Design screens visually → generate clean **Arduino** drawing code → run it on boards like **ESP32 / ESP8266 / STM32 / Arduino / RP2040** (and more).

## Quick start

- **Use it online**: click the GitHub Pages link in the repository, or open: `https://cifertech.github.io/DisplayKit/`


## How to use

- **Pick display driver**: choose **TFT_eSPI** or **U8g2 OLED** from the sidebar (and set your display resolution)
- **Create screens**: add as many as you like and name the generated function (e.g. `drawHomeScreen`)
- **Add elements**: click an element type to add it, then drag / resize and edit properties
- **Export**:
  - **Copy** the generated code from “Generated Code (TFT_eSPI / U8g2)”
  - **Export JSON** to save a project snapshot (great for versioning)
  - **Import JSON** to restore a saved project

## Built-in tools

DisplayKit includes tool pages under `tools/` and can open them inside the app overlay:

- **PixelForge** (`tools/pixelforge/`): image converter (generate RGB565 headers and import into DisplayKit)
- **BitCanvas Studio** (`tools/bitcanvas-studio/`): animation tool (export and copy to clipboard)
- **Shared tool theming**: `tools/theme.css` keeps tool pages visually consistent with DisplayKit

## Keyboard shortcuts

- **Undo / Redo**: `Ctrl/Cmd + Z` / `Ctrl/Cmd + Shift + Z`
- **Duplicate**: `Ctrl/Cmd + D`
- **Cycle selection**: `Tab` / `Shift + Tab`
- **Align selected**: `Ctrl/Cmd + 1..6` (left / center / right / top / middle / bottom)
- **Move selected**: Arrow keys (hold **Shift** for bigger steps)
- **Delete selected**: `Delete` / `Backspace`
- **Close Tools overlay**: `Esc`

## 🚀 Features

### 🖥 Multi-screen UI builder
- Create **multiple screens** and switch between them
- Auto-generates a draw function per screen (e.g. `drawHomeScreen()`)
- Per-screen element lists (clear/reset a single screen without touching others)

### 🖥 Display driver modes
- **TFT_eSPI mode**: full-color UI preview + Arduino code generation
- **U8g2 OLED mode**: OLED-style preview + U8g2 code generation
- Built-in display settings:
  - **TFT**: rotation (plus UI options for color depth / backlight / touch metadata)
  - **OLED**: preset constructors (I2C/SPI), rotation, contrast, flip mode, font mode, power save

### 🧱 Drag-and-drop elements
- Shapes: Rect, RoundRect, Circle, Line, Divider
- UI: Label, Button, Header, Card
- Controls: Progress, Slider, Toggle
- Images:
  - Import PNG/JPG into the canvas (stored internally as RGB565 for TFT workflows)
  - Preview images inside the editor

### 🧰 Editor workflow & productivity
- Undo / Redo history
- Duplicate elements
- Resize handles (most elements) + drag to position
- Snap-to-grid + configurable grid size
- Zoom (50–200%)
- Background presets + custom background color
- JSON project **Export / Import**

### 🧩 Built-in tools (inside the app)
- PixelForge (image converter) and BitCanvas Studio (animation) can open in an in-app overlay
- Theme sync between DisplayKit and embedded tools (light/dark)

### ⚙ Code output
#### TFT_eSPI
- Generates: `fillRect`, `fillRoundRect` / `drawRoundRect`, `fillCircle`, `drawLine`, text primitives, etc.
- Optional **TFT_eSprite** rendering (`Use sprite` toggle)
- RGB565 image arrays in **PROGMEM** + `pushImage()`

#### U8g2
- Generates: `drawBox`, `drawRBox` / frames, `drawDisc` / circles, `drawLine`, etc.
- Font selection per text element + emits `u8g2.setFont(...)`
- Note: **image elements are currently not emitted** in the U8g2 sample code output

### 🔌 Actions & navigation hooks
- Elements can be assigned an “On click → Go to screen…” action in the editor
- Code output keeps drawing code focused; touch/click wiring is left for you to implement in your input loop

&nbsp;

## 🛠 Compatibility

| Display Library | Status | Notes |
|-----------------|--------|-------|
| **TFT_eSPI**    | ✅ Full | RGB565, sprites, images, colors |
| **U8g2**        | ✅ Full | Monochrome + full font system |
| **Adafruit_GFX** | ⚠ Planned | Not implemented yet |

## Project structure

```text
.
├─ index.html        # Main app UI
├─ style.css         # Main app styling
├─ app.js            # App logic (editor + code generation)
└─ tools/
   ├─ pixelforge/       # Image converter tool
   ├─ bitcanvas-studio/ # Animation tool
   └─ theme.css         # Shared theme tokens for tool pages
```

## 🤝 Contribute

Want to help make DisplayKit better?

- Submit bug reports  
- Suggest new features  
- Improve documentation  
- Contribute code or UI elements  
- Star ⭐ and share the project  

Every contribution helps. Thank you! ❤️


