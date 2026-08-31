#  YoYo Webamp & Milkdrop Visualizer

A modern, high-fidelity web recreation of the legendary **Winamp 2.9** retro audio player, powered by **React**, **TypeScript**, **Vite**, and **Butterchurn** (Milkdrop 2.0 WebGL visualizer engine).


---

##  Highlights & Features

-  **Authentic Winamp 2.9 UI**: Complete modular window layout including Main Player, 10-Band Graphic Equalizer, Interactive Playlist Window, and Milkdrop Visualizer.
-  **Butterchurn WebGL Visualizer Engine**: Hardware-accelerated Milkdrop 2.0 running at 60 FPS in WebGL with procedural shaders and mathematical feedback loops.
-  **Custom HD Procedural Presets**:
  -  *Cinematic Ambient Silk Fluid & Aurora (Ultra-Smooth)*
  -  *Multi-Instrument Harmonic Frequency Decomposer (Multi-Band Spectrum)*
  -  *4D Tesseract & Hyperbolic Poincaré Disk (Serious Math HD)*
  -  *Quantum Gravitational Vortex (HD Physics)*
  - *Plus the full Butterchurn presets library!*
-  **Classic Winamp Skins Included**: Pre-loaded with nostalgic skins like Base 2.91, Green Dimension, Internet Archive, AmigaPPC, MacOSX Aqua, Sonic Attitude, XMMS, and more.
-  **Drag & Drop Extensibility**: Drag and drop your own `.mp3` audio files, `.wsz` Winamp skins, and `.milk` or `.json` visualizer presets directly onto the player.
-  **Zero-Backend Static App**: 100% client-side web application — can be hosted for free on GitHub Pages, Vercel, Netlify, or Cloudflare Pages.

---

##  GitHub Pages Deployment Guide

### Why Did GitHub Pages Show a Black Screen?

If you see a black screen when visiting your GitHub Pages site, **it is NOT because the app is too complex for static hosting**. GitHub Pages can easily host this application!

The black screen happens because of the **GitHub Pages Build Source setting**:

1. By default, GitHub Pages is set to **"Deploy from a branch"** (serving root `/` of `main`).
2. The root `index.html` points to uncompiled TypeScript source: `<script type="module" src="./src/main.tsx"></script>`.
3. Browsers cannot run raw TypeScript/JSX files directly, causing the script to fail and leaving only the `#111116` black background.

###  Solution: Enable GitHub Actions Deployment

This repository already includes an automated deployment workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) that compiles the app with Vite and deploys the production-ready `dist/` bundle to GitHub Pages.

To enable it:

1. Open your repository on **GitHub**.
2. Go to **Settings**  $\rightarrow$ **Pages** (in the left sidebar).
3. Under **"Build and deployment"** $\rightarrow$ **"Source"**, click the dropdown and select **GitHub Actions**.
4. Go to the **Actions** tab on your repo and click **"Deploy to GitHub Pages"** $\rightarrow$ **"Run workflow"** (or simply push any commit to `main`).
5. Once the workflow finishes (green checkmark), your app will be live at `https/<your-username>.github.io/<repository-name>/`!

---

##  Local Development

### Prerequisites
- [Node.js](https/nodejs.org/) (version 18 or higher)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https/github.com/<your-username>/webamp.git
cd webamp

# Install dependencies
npm install
```

### Running Locally

```bash
# Start Vite development server
npm run dev
```

Open your browser at `http/localhost:5173`.

### Production Build & Preview

```bash
# Typecheck and compile production bundle into /dist
npm run build

# Preview the production build locally
npm run preview
```

---

##  Keyboard Shortcuts & Hotkeys

### Player Controls
| Shortcut | Action |
| :--- | :--- |
| **`Z`** | Previous Track |
| **`X`** | Play / Restart Track |
| **`C`** | Pause / Unpause |
| **`V`** | Stop |
| **`B`** | Next Track |
| **`J`** / **`Ctrl + J`** | Jump to Track / Search |
| **`Alt + W`** | Toggle Main Window |
| **`Alt + G`** | Toggle Equalizer Window |
| **`Alt + E`** | Toggle Playlist Window |
| **`Alt + K`** | Toggle Milkdrop Visualizer |

### Visualizer (Milkdrop) Controls
| Shortcut | Action |
| :--- | :--- |
| **`L`** | Open Preset Selector List |
| **`Ctrl + →`** | Advance to Next Preset |
| **`Ctrl + ←`** | Return to Previous Preset |
| **`R`** | Toggle Random / Shuffle Presets |
| **`Scroll Lock`** | Toggle Auto-Cycling Presets |
| **`F`** / **`Double-Click`** | Toggle Fullscreen Visualizer |

---

##  Custom Visualizers & Skins

- **Custom Skins**: Drop any `.wsz` skin file onto Webamp to instantly skin the player.
- **Custom Visualizers**: Drop any `.milk` or `.json` preset file directly onto the Milkdrop canvas.
- For in-depth documentation on math equations, shaders, and EEL syntax for creating Milkdrop visualizers, check out [`makemorevis.md`](makemorevis.md).

---

##  Tech Stack & Architecture

- **Core**: React 18, TypeScript, Redux, Redux-Thunk, Reselect
- **Audio & Visuals**: Web Audio API, WebGL, [Butterchurn](https/github.com/jberg/butterchurn), [Webamp](https/github.com/captbaritone/webamp)
- **Tooling**: [Vite](https/vitejs.dev/) with `vite-plugin-node-polyfills`
- **Deployment**: GitHub Actions + GitHub Pages (`actions/deploy-pages@v4`)

---

##  License

This project is open-source under the MIT License. Winamp is a registered trademark of Radionomy.
