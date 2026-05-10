---
name: Structural Precision System
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb9d8'
  on-tertiary: '#620040'
  tertiary-container: '#ff8cc5'
  on-tertiary-container: '#811057'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffd8e7'
  tertiary-fixed-dim: '#ffafd3'
  on-tertiary-fixed: '#3d0026'
  on-tertiary-fixed-variant: '#85145a'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: metropolis
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: metropolis
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  data-mono:
    fontFamily: jetbrainsMono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-caps:
    fontFamily: inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar-width: 320px
  inspector-width: 360px
  gutter: 1rem
  margin-page: 1.5rem
  panel-padding: 1rem
  component-gap: 0.5rem
---

## Brand & Style
The brand personality is authoritative, precise, and technologically advanced, mirroring the exactitude required in structural engineering. It aims to evoke a sense of "digital twin" reliability, where the software feels like a high-performance instrument rather than a generic tool. 

The design style utilizes **Glassmorphism** and **Minimalism** to manage high data density. By using translucent layers and thin, high-contrast borders, the UI maintains a sense of depth and hierarchy without obstructing the primary 3D viewport. The aesthetic is "Technical Noir"—a sophisticated dark environment where light is used sparingly to indicate focus, status, and intelligence.

## Colors
The palette is rooted in a deep charcoal base to minimize eye strain during long detailing sessions and to provide maximum contrast for colored rebar segments. 

- **Primary Cyan (#38BDF8):** Used for active selection, primary action buttons, and structural grid lines. It represents the "active" state of the digital model.
- **Emerald Green (#10B981):** Reserved for validated data, successful AI-generated detailing, and health indicators.
- **Deep Charcoal (#0F172A):** The structural foundation of the UI panels, providing a low-energy background.
- **Accent Rose/Pink:** (Optional Tertiary) Used exclusively for structural warnings or critical rebar collisions.

## Typography
The typography system prioritizes legibility of complex numerical strings and structural labels. 

- **Metropolis** is used for headers to provide a structured, architectural feel.
- **Inter** handles standard interface text, chosen for its excellent readability at small scales in high-density panels.
- **JetBrains Mono** is utilized for "Pingfa" (平法) detailing codes, coordinates, and dimensions. The monospaced nature ensures that columns of numerical data remain perfectly aligned, which is critical for error checking in rebar schedules.

## Layout & Spacing
This design system employs a specialized **3-Column Workspace** optimized for 3D visualization:

1.  **Left Sidebar (Navigation/Tree):** Contains the structural hierarchy (Project > Building > Floor > Member).
2.  **Central Canvas (Viewport):** The primary 3D visualization zone, utilizing a "fluid" model that expands to all available space.
3.  **Right Inspector (Data Density):** A fixed-width column for rebar parameters, "Pingfa" logic, and AI optimization settings.

**Breakpoints:**
- **Desktop (1440px+):** Full 3-column visibility.
- **Tablet/Small Desktop (1024px-1439px):** Sidebar collapses into an icon-only rail; Inspector remains fixed.
- **Mobile:** Not recommended for detailing; provides a "Viewer Only" mode with a single column and floating action sheets.

## Elevation & Depth
Depth is created through **Glassmorphism** rather than traditional drop shadows. This preserves the "High-Tech" aesthetic and allows the user to maintain a subconscious awareness of the 3D model behind floating UI panels.

- **Surface Level 1 (Background):** Solid `#020617`.
- **Surface Level 2 (Floating Panels):** Backdrop blur (20px) with `rgba(30, 41, 59, 0.7)` fill and a 1px border of `rgba(255, 255, 255, 0.1)`.
- **Surface Level 3 (Popovers/Tooltips):** Higher translucency with a subtle primary color outer glow (`0 0 15px rgba(56, 189, 248, 0.2)`) to indicate high-level interaction.

## Shapes
The shape language is "Soft-Technical." Elements use a 0.25rem (4px) base radius. This small radius maintains a professional, rigid feel appropriate for engineering while avoiding the aggressive sharpness of purely 0px corners. 

Buttons and input fields follow this `rounded-sm` logic. Only status "Pills" for AI indicators or tags use a fully rounded (pill-shaped) radius to contrast against the structural grid.

## Components
- **Buttons:** Primary buttons use a solid Cyan-to-Blue gradient. Secondary buttons use a "Ghost" style with a 1px border. All buttons have a subtle inner glow on hover.
- **Data Grids:** High-density rows with zebra striping using subtle opacity shifts. Row height is compressed (28px-32px) to maximize data visibility.
- **Inputs:** Dark backgrounds with a bottom-only 2px border that illuminates in Cyan when focused.
- **3D Gizmos:** Custom 3D manipulators (move/rotate) use the Primary Cyan and Secondary Green to ensure visibility against the dark canvas.
- **Rebar Cards:** Summary cards for specific rebar sets using Glassmorphism, featuring a small sparkline or icon indicating the "Pingfa" rule applied.
- **AI Feedback Chips:** Use the Emerald Green with a pulsing "Scan" animation to indicate real-time structural validation.