import { ButterchurnOptions } from "./webamp/js/types";

const KNOWN_PRESET_URLS_REGEXES = [
  /^https:\/\/unpkg\.com\/butterchurn-presets\/.*\.json$/,
  /^https:\/\/unpkg\.com\/butterchurn-presets-weekly\/.*\.json$/,
  /^https:\/\/archive\.org\/cors\/md_.*\.json$/,
  /^https:\/\/s3-us-east-2\.amazonaws\.com\/butterchurn-presets\/.*\.json$/,
];

function presetNameFromURL(url: string) {
  try {
    const urlParts = url.split("/");
    const lastPart = urlParts[urlParts.length - 1];
    const presetName = lastPart.substring(0, lastPart.length - 5); // remove .milk or .json
    return decodeURIComponent(presetName);
  } catch (e) {
    // if something goes wrong parsing url, just use url as the preset name
    console.error(e);
    return url;
  }
}

async function loadButterchurnPresetMapURL(url: string) {
  const resp = await fetch(url);
  const namesToPresetUrls = await resp.json();
  return Object.keys(namesToPresetUrls).map((name: string) => {
    return { name, butterchurnPresetUrl: namesToPresetUrls[name] };
  });
}

export const HD_QUANTUM_VORTEX_PRESET = {
  baseVals: {
    decay: 0.97,
    waveMode: 1,
    waveAdditive: true,
    waveThick: true,
    wave_r: 0.1,
    wave_g: 0.85,
    wave_b: 1.0,
    wave_x: 0.5,
    wave_y: 0.5,
    wave_mystery: 0.2,
    zoom: 1.01,
    rot: 0.0,
    cx: 0.5,
    cy: 0.5,
    warp: 0.02,
    sx: 1.0,
    sy: 1.0,
  },
  init_eqs_str: "q1=0; q2=0; q3=0; q4=0; q5=0; q6=0; q7=0;",
  frame_eqs_str: `
    q1 = bass_att * 0.6 + bass * 0.4;
    q2 = mid_att * 0.6 + mid * 0.4;
    q3 = treb_att * 0.6 + treb * 0.4;

    q4 = 0.5 + 0.25 * Math.sin(time * 0.7);
    q5 = 0.5 + 0.25 * Math.cos(time * 0.9);
    q6 = 0.5 - 0.25 * Math.cos(time * 0.8);
    q7 = 0.5 - 0.25 * Math.sin(time * 1.1);

    wave_r = 0.5 + 0.5 * Math.sin(time * 1.3 + q1 * 0.8);
    wave_g = 0.5 + 0.5 * Math.sin(time * 1.9 + q2 * 0.8);
    wave_b = 0.5 + 0.5 * Math.sin(time * 2.5 + q3 * 0.8);

    zoom = 1.008 + 0.025 * Math.sin(time * 1.5) * q1;
    rot = 0.03 * Math.cos(time * 0.6) * q2;
  `,
  pixel_eqs_str: `
    var dx1 = x - q4;
    var dy1 = y - q5;
    var r1_sq = dx1*dx1 + dy1*dy1 + 0.012;

    var dx2 = x - q6;
    var dy2 = y - q7;
    var r2_sq = dx2*dx2 + dy2*dy2 + 0.012;

    var force1 = (0.018 * q1) / r1_sq;
    var force2 = (0.014 * q3) / r2_sq;

    dx = -(dx1 * force1 + dx2 * force2);
    dy = -(dy1 * force1 + dy2 * force2);

    var swirl = 0.04 * Math.sin(rad * 14.0 - time * 2.0) * q2;
    rot = rot + swirl / (rad + 0.15);

    warp = warp + 0.08 * Math.sin(ang * 6.0 + time * 1.2) * q1;
  `,
};

export const HD_HYPERDIMENSIONAL_MATH_PRESET = {
  baseVals: {
    decay: 0.975,
    waveMode: 0,
    waveAdditive: true,
    waveThick: true,
    wave_r: 0.95,
    wave_g: 0.2,
    wave_b: 1.0,
    wave_x: 0.5,
    wave_y: 0.5,
    wave_mystery: 0.3,
    zoom: 1.01,
    rot: 0.0,
    cx: 0.5,
    cy: 0.5,
    warp: 0.0,
    sx: 1.0,
    sy: 1.0,
  },
  init_eqs_str: "q1=0; q2=0; q3=0; q4=0; q5=0; q6=0; q7=0; q8=0;",
  frame_eqs_str: `
    q1 = bass_att * 0.6 + bass * 0.4;
    q2 = mid_att * 0.6 + mid * 0.4;
    q3 = treb_att * 0.6 + treb * 0.4;

    q4 = time * 0.4 + q1 * 0.3;
    q5 = time * 0.6 + q2 * 0.3;

    q6 = 0.2 * Math.sin(time * 0.8) * q2;
    q7 = 0.2 * Math.cos(time * 0.9) * q3;

    q8 = Math.sin(time * 1.5 + q1);
    wave_r = 0.5 + 0.5 * Math.sin(time * 1.1 + q1 * 1.2);
    wave_g = 0.5 + 0.5 * Math.sin(time * 1.7 + q2 * 1.2);
    wave_b = 0.5 + 0.5 * Math.cos(time * 2.3 + q3 * 1.2);

    zoom = 1.006 + 0.02 * Math.sin(time * 1.2) * q1;
    rot = 0.02 * Math.sin(time * 0.5) * q2;
  `,
  pixel_eqs_str: `
    var u = (x - 0.5) * 2.0;
    var v = (y - 0.5) * 2.0;

    var c_re = q6;
    var c_im = q7;
    var num_re = u + c_re;
    var num_im = v + c_im;
    var den_re = 1.0 + (c_re * u + c_im * v);
    var den_im = c_re * v - c_im * u;
    var den_sq = den_re * den_re + den_im * den_im + 0.0001;

    var hu = (num_re * den_re + num_im * den_im) / den_sq;
    var hv = (num_im * den_re - num_re * den_im) / den_sq;
    var h_rad = Math.sqrt(hu * hu + hv * hv);

    var w4 = Math.sin(q4) * hu + Math.cos(q5) * hv;
    var scale4d = 1.0 / (2.2 - w4 * 0.6);

    var doppler = 1.0 / Math.sqrt(1.0 - 0.4 * Math.min(0.9, h_rad));
    dx = -0.5 * (hu * scale4d * 0.025 * q1 * doppler);
    dy = -0.5 * (hv * scale4d * 0.025 * q3 * doppler);

    var quantum_phase = Math.sin(h_rad * 20.0 - time * 3.0 + q8 * 4.0);
    rot = rot + 0.05 * quantum_phase * q2 / (h_rad + 0.2);

    warp = warp + 0.1 * Math.sin(Math.atan2(hv, hu) * 8.0 + time) * q1;
  `,
};

export const HD_INSTRUMENT_DECOMPOSER_PRESET = {
  baseVals: {
    decay: 0.965,
    waveMode: 2,
    waveAdditive: true,
    waveThick: true,
    wave_r: 0.2,
    wave_g: 0.9,
    wave_b: 0.4,
    wave_x: 0.5,
    wave_y: 0.5,
    wave_mystery: 0.1,
    zoom: 1.01,
    rot: 0.0,
    cx: 0.5,
    cy: 0.5,
    warp: 0.01,
    sx: 1.0,
    sy: 1.0,
  },
  init_eqs_str: "q1=0; q2=0; q3=0; q4=0; q5=0; q6=0; q7=0; q8=0;",
  frame_eqs_str: `
    var kick_hit = Math.max(0, bass - bass_att);
    q1 = kick_hit * 2.5 + bass_att * 0.5;

    q2 = bass_att * 1.2;

    q3 = mid_att * 1.2 + mid * 0.4;

    var hat_hit = Math.max(0, treb - treb_att);
    q4 = hat_hit * 3.0 + treb_att * 0.6;

    q5 = 0.35 + 0.1 * Math.sin(time * 0.8);
    q6 = 0.35 + 0.1 * Math.cos(time * 0.6);
    q7 = 0.65 + 0.1 * Math.cos(time * 1.1);
    q8 = 0.35 + 0.1 * Math.sin(time * 0.9);

    wave_r = 0.8 * (q1 / 2.0) + 0.2 * (q3 / 2.0);
    wave_g = 0.9 * (q3 / 2.0) + 0.1 * (q2 / 2.0);
    wave_b = 0.9 * (q4 / 2.0) + 0.6 * (q2 / 2.0);

    zoom = 1.008 + 0.03 * q1;
    rot = 0.02 * Math.sin(time * 0.8) * q3;
  `,
  pixel_eqs_str: `
    var dx_kick = x - 0.5;
    var dy_kick = y - 0.5;
    var r_kick = Math.sqrt(dx_kick * dx_kick + dy_kick * dy_kick) + 0.001;

    var dx_vocal = x - q5;
    var dy_vocal = y - q6;
    var r_vocal = Math.sqrt(dx_vocal * dx_vocal + dy_vocal * dy_vocal) + 0.001;

    var dx_cymb = x - q7;
    var dy_cymb = y - q8;
    var r_cymb = Math.sqrt(dx_cymb * dx_cymb + dy_cymb * dy_cymb) + 0.001;

    var kick_shockwave = Math.sin(r_kick * 24.0 - time * 6.0) * (q1 * 0.035);

    var bass_wave = 0.025 * Math.sin(y * 12.0 + time * 2.0) * q2;

    var vocal_angle = Math.atan2(dy_vocal, dx_vocal);
    var vocal_petal = Math.sin(vocal_angle * 6.0 + time * 1.5) * (q3 * 0.03);

    var cymbal_spark = Math.sin(r_cymb * 45.0 - time * 12.0) * (q4 * 0.02);

    dx = -(dx_kick / r_kick) * kick_shockwave + bass_wave;
    dy = -(dy_kick / r_kick) * kick_shockwave + vocal_petal;

    rot = rot + (cymbal_spark / (r_cymb + 0.1)) * q4;

    warp = warp + 0.06 * Math.sin(ang * 4.0 + time * 2.0) * q3;
  `,
};

export const HD_CINEMATIC_SILK_PRESET = {
  baseVals: {
    decay: 0.992,
    waveMode: 0,
    waveAdditive: false,
    waveThick: true,
    wave_r: 0.15,
    wave_g: 0.45,
    wave_b: 0.85,
    wave_x: 0.5,
    wave_y: 0.5,
    wave_mystery: 0.0,
    zoom: 1.003,
    rot: 0.0,
    cx: 0.5,
    cy: 0.5,
    warp: 0.002,
    sx: 1.0,
    sy: 1.0,
  },
  init_eqs_str: "q1=0; q2=0; q3=0; q4=0; q5=0; q6=0; q7=0; q8=0;",
  frame_eqs_str: `
    var b_smooth = bass_att * 0.2 + bass * 0.1;
    var m_smooth = mid_att * 0.2 + mid * 0.1;
    var t_smooth = treb_att * 0.2 + treb * 0.1;

    q1 = q1 * 0.92 + b_smooth * 0.08;
    q2 = q2 * 0.92 + m_smooth * 0.08;
    q3 = q3 * 0.92 + t_smooth * 0.08;

    var slow_time = time * 0.08;
    wave_r = 0.12 + 0.15 * Math.sin(slow_time);
    wave_g = 0.35 + 0.20 * Math.sin(slow_time * 0.7 + 1.5);
    wave_b = 0.70 + 0.25 * Math.cos(slow_time * 0.5);

    zoom = 1.002 + 0.006 * Math.sin(time * 0.3) + 0.004 * q1;
    rot = 0.004 * Math.sin(time * 0.15);
  `,
  pixel_eqs_str: `
    var dx_c = x - 0.5;
    var dy_c = y - 0.5;
    var r = Math.sqrt(dx_c * dx_c + dy_c * dy_c) + 0.001;
    var a = Math.atan2(dy_c, dx_c);

    var wave1 = Math.sin(r * 6.0 - time * 0.4 + a * 2.0) * (0.004 + 0.003 * q2);
    var wave2 = Math.cos(a * 4.0 + time * 0.25) * (0.003 + 0.002 * q1);

    var bass_pulse = Math.sin(r * 4.0 - time * 0.8) * (0.003 * q1);
    var treble_refract = 0.002 * Math.sin(r * 18.0 - time * 0.6) * q3;

    dx = (dx_c / r) * (bass_pulse + treble_refract) + wave1 * Math.cos(a);
    dy = (dy_c / r) * (bass_pulse + treble_refract) + wave1 * Math.sin(a);

    rot = rot + 0.003 * wave2 / (r + 0.4);
    warp = warp + 0.002 * Math.sin(a * 3.0 + time * 0.2);
  `,
};

export function getButterchurnOptions(
  startWithMilkdropHidden: boolean
): ButterchurnOptions {
  return {
    importButterchurn: () => {
      return import(
        /* webpackChunkName: "butterchurn" */
        // @ts-ignore
        "butterchurn"
      );
    },
    importConvertPreset: () => {
      return import(
        /* webpackChunkName: "milkdrop-preset-converter" */
        // @ts-ignore
        "milkdrop-preset-converter-aws"
      );
    },
    presetConverterEndpoint:
      "https://p2tpeb5v8b.execute-api.us-east-2.amazonaws.com/default/milkdropShaderConverter",
    getPresets: async () => {
      if ("URLSearchParams" in window) {
        const params = new URLSearchParams(location.search);
        const butterchurnPresetUrlParam = params.get("butterchurnPresetUrl");
        const butterchurnPresetMapUrlParam = params.get(
          "butterchurnPresetMapUrl"
        );
        const milkdropPresetUrl = params.get("milkdropPresetUrl");
        if (butterchurnPresetMapUrlParam) {
          if (
            !KNOWN_PRESET_URLS_REGEXES.some((pattern) =>
              pattern.test(butterchurnPresetMapUrlParam)
            )
          ) {
            console.error(
              "Unsupported URL passed as butterchurnPresetMapUrl query param."
            );
          } else {
            return loadButterchurnPresetMapURL(butterchurnPresetMapUrlParam);
          }
        } else if (butterchurnPresetUrlParam) {
          if (
            !KNOWN_PRESET_URLS_REGEXES.some((pattern) =>
              pattern.test(butterchurnPresetUrlParam)
            )
          ) {
            console.error(
              "Unsupported URL passed as butterchurnPresetUrl query param."
            );
          } else {
            return [
              {
                name: presetNameFromURL(butterchurnPresetUrlParam),
                butterchurnPresetUrl: butterchurnPresetUrlParam,
              },
            ];
          }
        } else if (milkdropPresetUrl) {
          throw new Error("We still need to implement this");
        }
      }

      const presets = await import(
        /* webpackChunkName: "butterchurn-presets" */
        // @ts-ignore
        "butterchurn-presets"
      );
      const defaultPresets = Object.entries(presets.default).map(
        ([name, preset]) => {
          return { name, butterchurnPresetObject: preset as Object };
        }
      );

      return [
        {
          name: "🌊 Cinematic Ambient Silk Fluid & Aurora (Ultra-Smooth)",
          butterchurnPresetObject: HD_CINEMATIC_SILK_PRESET as Object,
        },
        {
          name: "🎶 Multi-Instrument Harmonic Frequency Decomposer (Multi-Band Spectrum)",
          butterchurnPresetObject: HD_INSTRUMENT_DECOMPOSER_PRESET as Object,
        },
        {
          name: "🌌 4D Tesseract & Hyperbolic Poincaré Disk (Serious Math HD)",
          butterchurnPresetObject: HD_HYPERDIMENSIONAL_MATH_PRESET as Object,
        },
        {
          name: "🌌 Quantum Gravitational Vortex (HD Physics)",
          butterchurnPresetObject: HD_QUANTUM_VORTEX_PRESET as Object,
        },
        ...defaultPresets,
      ];
    },
    butterchurnOpen: !startWithMilkdropHidden,
  };
}
