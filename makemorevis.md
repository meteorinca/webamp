# 🎨 How to Create Custom Milkdrop & Butterchurn Visualizers (`makemorevis.md`)

Milkdrop visualizers are legendary in real-time audio visualization. Built on procedural mathematics, trigonometry, and WebGL shader mechanics, Milkdrop presets react dynamically to audio frequencies (`bass`, `mid`, `treb`) in real time.

---

## 1. What Language Are Milkdrop Visualizers Written In?

Milkdrop presets use two main complementary domain-specific languages:

1. **EEL / EEL2 (Expression Evaluation Language)**:
   - Used for **Per-Frame Equations** (evaluated 60 times per second to update global motion, colors, and math variables) and **Per-Pixel Equations** (evaluated for every pixel across screen space).
   - Syntax resembles C / MATLAB math expressions (`sin`, `cos`, `tan`, `atan2`, `pow`, `abs`, `sqrt`, `above`, `below`, `if`, `sign`).
2. **HLSL / WebGL Pixel Shaders (Warp & Composite Shaders)**:
   - Introduced in Milkdrop 2.0 and Butterchurn.
   - High-performance GPU shaders (`shader_body`) for 3D raymarching, black hole distortions, reaction-diffusion feedback, chromatic aberration, and fractal domain warping.

When running inside **Webamp**, the **Butterchurn** engine compiles `.milk` text files into fast JavaScript objects using the `milkdrop-preset-converter`.

---

## 2. Milkdrop Math Engine & Built-In Variables

Every preset manipulates a canvas coordinate system where \((x, y) \in [0, 1] \times [0, 1]\), with center at \((cx, cy) = (0.5, 0.5)\).

### Audio Input Variables (Read-Only)
| Variable | Description | Range |
| :--- | :--- | :--- |
| `bass`, `mid`, `treb` | Instantaneous audio frequency energy | \([0.0, 2.5+]\) |
| `bass_att`, `mid_att`, `treb_att` | Smoothed / attenuated audio energy | \([0.0, 2.5+]\) |
| `time` | Total elapsed time in seconds | \([0, \infty)\) |
| `fps` | Current frame rate | \(\approx 60\) |

### Per-Frame Motion & Color Controls
| Variable | Mathematical Role | Default |
| :--- | :--- | :--- |
| `zoom` | Scale factor (\(>1.0\) zooms in, \(<1.0\) zooms out) | `1.0` |
| `rot` | Canvas rotation angle in radians | `0.0` |
| `cx`, `cy` | Center of rotation and zooming | `0.5`, `0.5` |
| `dx`, `dy` | Horizontal and vertical screen translation | `0.0`, `0.0` |
| `warp` | Non-linear spatial grid distortion | `0.0` |
| `decay` | Feedback persistence (\(0.98\) leaves trails, \(1.0\) infinite persistence) | `0.98` |
| `wave_r`, `wave_g`, `wave_b` | Waveform oscilloscope RGB colors | \([0, 1]\) |
| `wave_x`, `wave_y` | Oscilloscope position | `0.5`, `0.5` |
| `q1` .. `q32` | Custom user variables passed from Per-Frame to Per-Pixel & Shaders | `0.0` |

### Per-Pixel Polar & Cartesian Variables
| Variable | Definition | Description |
| :--- | :--- | :--- |
| `x`, `y` | \((x, y)\) | Normalized pixel coordinates |
| `rad` | \(\sqrt{(x-cx)^2 + (y-cy)^2}\) | Distance from center |
| `ang` | \(\text{atan2}(y-cy, x-cx)\) | Angle around center in radians \([-\pi, \pi]\) |

---

## 3. Creating Complex Visualizer Mathematics

### Technique 1: Gravitational Black Hole / Vortex Lensing
Pull pixels inward proportional to inverse square distance \(r^{-2}\) with audio pulses:

$$dx = -\frac{x - cx}{rad^2 + \epsilon} \cdot (\text{bass\_att} \times 0.05)$$
$$dy = -\frac{y - cy}{rad^2 + \epsilon} \cdot (\text{bass\_att} \times 0.05)$$

### Technique 2: Logarithmic Spiral & Ripple Waves
Combine polar radius and angle to create infinite tunnel spirals:

$$\text{zoom} = 1.0 + 0.08 \cdot \sin(rad \times 12.0 - \text{time} \times 3.0) \cdot \text{treb}$$
$$\text{rot} = 0.1 \cdot \sin(\text{ang} \times 4.0 + \text{time}) \cdot \text{mid\_att}$$

### Technique 3: Kaleidoscope Domain Folding
Symmetrize polar angle into \(N\) rotational petals:

$$N = 6.0 \quad (\text{6-fold symmetry})$$
$$\text{ang\_folded} = \left| \text{mod}\left(\text{ang}, \frac{2\pi}{N}\right) - \frac{\pi}{N} \right|$$

---

## 4. Complete Preset Code Examples

### Example 1: Cosmic Black Hole Vortex (`cosmic_blackhole.milk`)

Save this text as a `.milk` file:

```milk
[preset00]
fRating=5.000000
fGammaAdj=1.000000
fDecay=0.970000
fVideoEchoZoom=1.000000
fVideoEchoAlpha=0.000000
nVideoEchoOrientation=0
nWaveMode=0
bAdditiveWaves=1
bWaveDots=0
bWaveThick=1
bModWaveAlphaByVolume=1
bMaximizeWaveColor=0
bTexWrap=1
bDarkenCenter=0
bRedefineRad=0
bInverseDraw=0
fWaveAlpha=0.800
fWaveScale=1.200
fWaveSmoothing=0.500
fWaveParam=0.000
fModWaveAlphaStart=0.750
fModWaveAlphaEnd=0.950
fWarpAnimSpeed=1.000
fWarpScale=1.000
fZoomExponent=1.000000
fShader=0.000000
zoom=1.000000
rot=0.000000
cx=0.500000
cy=0.500000
dx=0.000000
dy=0.000000
warp=0.010000
sx=1.000000
sy=1.000000
wave_r=0.200
wave_g=0.800
wave_b=1.000
wave_x=0.500
wave_y=0.500
wave_mystery=0.000

per_frame_1=// Smooth audio responsiveness
per_frame_2=q1 = bass_att * 0.5 + bass * 0.5;
per_frame_3=q2 = mid_att * 0.5 + mid * 0.5;
per_frame_4=q3 = treb_att * 0.5 + treb * 0.5;
per_frame_5=
per_frame_6=// Dynamic color cycling based on audio
per_frame_7=wave_r = 0.5 + 0.5 * sin(time * 1.2 + q1);
per_frame_8=wave_g = 0.5 + 0.5 * sin(time * 1.7 + q2);
per_frame_9=wave_b = 0.5 + 0.5 * sin(time * 2.3 + q3);
per_frame_10=
per_frame_11=// Rotate dynamic center
per_frame_12=rot = 0.04 * sin(time * 0.8) * q2;
per_frame_13=zoom = 1.01 + 0.03 * sin(time * 2.0) * q1;

per_pixel_1=// Black hole vortex suction math
per_pixel_2=r_sq = rad * rad + 0.05;
per_pixel_3=suction = (0.015 * q1) / r_sq;
per_pixel_4=dx = -(x - 0.5) * suction;
per_pixel_5=dy = -(y - 0.5) * suction;
per_pixel_6=
per_pixel_7=// Spiral twisting near core
per_pixel_8=rot = rot + (0.08 * q3) / (rad + 0.1);
```

---

### Example 2: Butterchurn Native JavaScript Preset (`PulsarKaleidoscope.json`)

If loading directly into Butterchurn JS format:

```json
{
  "baseVals": {
    "decay": 0.96,
    "waveMode": 1,
    "waveAdditive": true,
    "waveThick": true,
    "wave_r": 0,
    "wave_g": 0.9,
    "wave_b": 1,
    "zoom": 1.02
  },
  "init_eqs_str": "q1=0; q2=0; q3=0;",
  "frame_eqs_str": "
    q1 = bass_att;
    q2 = mid_att;
    q3 = treb_att;
    wave_r = 0.5 + 0.5 * Math.sin(time * 2.0);
    wave_g = 0.5 + 0.5 * Math.cos(time * 1.5);
    wave_b = 0.5 + 0.5 * Math.sin(time * 3.1);
    rot = Math.sin(time * 0.5) * 0.05 * q2;
    zoom = 1.0 + 0.04 * Math.sin(time * 3.0 + q1);
  ",
  "pixel_eqs_str": "
    var fold = Math.abs(Math.sin(ang * 4.0 + time));
    zoom = zoom + fold * 0.02 * q3;
    rot = rot + (0.03 * q1) / (rad + 0.2);
  "
}
```

---

## 5. How to Easily Create & Load Your Visualizers in Webamp

1. **Create/Edit the File**: Save your visualizer equations as `.milk` or `.json`.
2. **Load into Webamp**:
   - Open Webamp in your browser.
   - Open the **Milkdrop Window**.
   - Press **`L`** (or right-click $\rightarrow$ **Preset Selector...**).
   - Click **📁 Load Folder** or drag & drop your `.milk` / `.json` file directly onto the Milkdrop visualizer window!
3. **Control Playback**:
   - Press **`Ctrl + Right Arrow`** to advance to your next preset.
   - Press **`Ctrl + Left Arrow`** to return to the previous preset.
   - Press **`R`** to toggle shuffle or **`Scroll Lock`** to toggle auto-cycling!

Happy visualizer coding! 🚀✨
