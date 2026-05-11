## Components / Symbols MVP (design doc)

This document defines a **minimal** “Components” system for DisplayKit without turning the app into a full design tool clone.

### Goals
- Let users define a reusable UI block (component) once and place multiple instances across screens.
- Updating the component updates all instances.
- Keep exports deterministic: a component expands to normal `elements` for codegen/export.

### Non-goals (for MVP)
- Nested components, overrides, variants, auto-layout, instance properties, or auto constraints.
- Collaborative editing, multi-page documents, or publishing libraries.

### Data model proposal
Add a new top-level key to the project JSON:

```json
{
  "components": [
    {
      "id": "cmp_1",
      "name": "StatusCard",
      "baseWidth": 120,
      "baseHeight": 60,
      "elements": [
        { "id": "e1", "type": "rect", "x": 0, "y": 0, "w": 120, "h": 60, "...": "..." },
        { "id": "e2", "type": "label", "x": 8, "y": 8, "w": 100, "h": 16, "text": "WiFi", "...": "..." }
      ]
    }
  ],
  "screens": [
    {
      "id": "scr_1",
      "name": "Home",
      "elements": [
        {
          "id": "inst_1",
          "type": "componentInstance",
          "componentId": "cmp_1",
          "x": 10,
          "y": 20,
          "w": 120,
          "h": 60,
          "scaleMode": "stretch"
        }
      ]
    }
  ]
}
```

### Rendering / editing behavior
- **Canvas**: component instances render as a single bounding box preview plus an “enter component” action (double-click) OR they expand to child elements (read-only) for preview.\n+- **Layers**: show `StatusCard` under a “Components” section; instances shown as `StatusCard (instance)`.\n+- **Inspector**: for an instance show: position/size + a “Go to component” button.\n+
### Export behavior
- Before export, expand each instance into normal elements:\n+  - Clone component elements\n+  - Offset by instance x/y\n+  - Apply scaling (stretch or uniform)\n+  - Generate stable ids/names\n+- Codegen remains unchanged: it only sees normal elements.

### MVP UI sketch
- Left rail: add a **Components** panel below Layers with:\n+  - “Create component from selection”\n+  - List components\n+  - Drag component onto canvas to create instance\n+
### Edge cases to handle
- Missing `componentId` → show “Broken instance” placeholder.\n+- Editing a component should update all instances, with undo history snapshots.\n+- Prevent recursive component references (instance inside its own component).\n+
