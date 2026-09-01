import { getButterchurnOptions } from "./butterchurnOptions";
import { initialTracks, initialState } from "./config";
import { Options, WindowLayout } from "./webamp/js/types";
import { InjectableDependencies, PrivateOptions } from "./webamp/js/webampLazy";

export async function getWebampConfig(
  butterchurnSupported: boolean
): Promise<Options & PrivateOptions & InjectableDependencies> {
  let __butterchurnOptions;
  let windowLayout: WindowLayout | undefined;

  if (butterchurnSupported) {
    // Start with Milkdrop window open alongside player
    __butterchurnOptions = getButterchurnOptions(false);

    windowLayout = {
      main: { position: { left: 0, top: 0 } },
      equalizer: { position: { left: 0, top: 116 } },
      playlist: {
        position: { left: 0, top: 232 },
        size: { extraHeight: 4, extraWidth: 0 },
      },
      milkdrop: {
        position: { left: 275, top: 0 },
        size: { extraHeight: 12, extraWidth: 7 },
      },
    };
  }

  return {
    initialTracks,
    enableHotkeys: true,
    enableMediaSession: true,
    windowLayout,
    __butterchurnOptions,
    __initialState: initialState,
    requireJSZip: () => import("jszip/dist/jszip" as any),
    requireMusicMetadata: () => import("music-metadata" as any),
  };
}
