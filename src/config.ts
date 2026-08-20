import { Track, URLTrack, PartialState } from "./webamp/js/types";

interface Config {
  initialTracks?: Track[];
  audioUrl?: string;
  skinUrl?: string;
  disableMarquee?: boolean;
  initialState?: PartialState;
}

const { hash } = window.location;
let config: Config = {};
if (hash) {
  try {
    config = JSON.parse(decodeURIComponent(hash).slice(1));
  } catch (_e) {
    console.error("Failed to decode config from hash: ", hash);
  }
}

if (config.audioUrl && !config.initialTracks) {
  config.initialTracks = [{ url: config.audioUrl }];
}

export const SHOW_DESKTOP_ICONS = false;
export const skinUrl = config.skinUrl ?? null;

export const defaultInitialTracks: URLTrack[] = [
  {
    metaData: {
      artist: "Angélica Vale, Marco Antonio Solís",
      title: "La Llorona (De Coco)",
    },
    url: "./mp3/Angélica Vale, Marco Antonio Solís - La Llorona (De CocoAudio Only).mp3",
  },
  {
    metaData: {
      artist: "Moby ft. Jacob Lusk",
      title: "Natural Blues (Live at Coachella 2026)",
    },
    url: "./mp3/Moby ft. Jacob Lusk - Natural Blues - Live at Coachella 2026.mp3",
  },
  {
    metaData: {
      artist: "Peace Orchestra",
      title: "Who am I",
    },
    url: "./mp3/Peace Orchestra-Who am I.mp3",
  },
];

export const initialTracks = config.initialTracks || defaultInitialTracks;
export const disableMarquee = config.disableMarquee || false;
export const initialState = config.initialState || undefined;
