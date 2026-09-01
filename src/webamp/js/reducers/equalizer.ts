import { Slider, Action } from "./../types";
import { normalizeEqBand } from "./../utils";
import builtin from "../../presets/builtin.json";

export interface EqualizerState {
  on: boolean;
  auto: boolean;
  sliders: Record<Slider, number>;
}

const rockPreset = builtin.presets.find((p) => p.name === "Rock");

const defaultSliders: Record<Slider, number> = rockPreset
  ? {
      preamp: normalizeEqBand(rockPreset.preamp),
      60: normalizeEqBand(rockPreset.hz60),
      170: normalizeEqBand(rockPreset.hz170),
      310: normalizeEqBand(rockPreset.hz310),
      600: normalizeEqBand(rockPreset.hz600),
      1000: normalizeEqBand(rockPreset.hz1000),
      3000: normalizeEqBand(rockPreset.hz3000),
      6000: normalizeEqBand(rockPreset.hz6000),
      12000: normalizeEqBand(rockPreset.hz12000),
      14000: normalizeEqBand(rockPreset.hz14000),
      16000: normalizeEqBand(rockPreset.hz16000),
    }
  : {
      preamp: 51,
      60: 70,
      170: 62,
      310: 35,
      600: 29,
      1000: 40,
      3000: 60,
      6000: 73,
      12000: 78,
      14000: 78,
      16000: 78,
    };

const defaultState: EqualizerState = {
  on: true,
  auto: false,
  sliders: defaultSliders,
};

const equalizer = (
  state: EqualizerState = defaultState,
  action: Action
): EqualizerState => {
  switch (action.type) {
    case "SET_BAND_VALUE":
      const newSliders = {
        ...state.sliders,
        [(action as any).band]: (action as any).value,
      };
      return { ...state, sliders: newSliders };
    case "SET_EQ_ON":
      return { ...state, on: true };
    case "SET_EQ_OFF":
      return { ...state, on: false };
    case "SET_EQ_AUTO":
      return { ...state, auto: (action as any).value };
    default:
      return state;
  }
};

export default equalizer;
