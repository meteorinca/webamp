import { Track, PlaylistTrack, URLTrack } from "./types";

const STORAGE_KEY = "webamp_saved_playlist";

/**
 * Parse an M3U or M3U8 string into an array of Track objects.
 */
export function parseM3u(content: string): URLTrack[] {
  const lines = content.split(/\r?\n/);
  const tracks: URLTrack[] = [];

  let pendingDuration: number | undefined;
  let pendingTitle: string | undefined;
  let pendingArtist: string | undefined;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF:")) {
      const info = line.slice(8);
      const commaIdx = info.indexOf(",");
      if (commaIdx !== -1) {
        const durationStr = info.slice(0, commaIdx).trim();
        const duration = parseFloat(durationStr);
        if (!isNaN(duration) && duration > 0) {
          pendingDuration = Math.round(duration);
        }

        const titleFull = info.slice(commaIdx + 1).trim();
        const dashIdx = titleFull.indexOf(" - ");
        if (dashIdx !== -1) {
          pendingArtist = titleFull.slice(0, dashIdx).trim();
          pendingTitle = titleFull.slice(dashIdx + 3).trim();
        } else {
          pendingTitle = titleFull;
        }
      }
    } else if (!line.startsWith("#")) {
      // This is a media file URL or path
      const url = line;
      const defaultName = pendingTitle || url.split("/").pop()?.split("?")[0] || "Unknown Track";

      const track: URLTrack = {
        url,
        defaultName,
      };

      if (pendingDuration != null) {
        track.duration = pendingDuration;
      }

      if (pendingArtist || pendingTitle) {
        track.metaData = {
          artist: pendingArtist || "",
          title: pendingTitle || defaultName,
        };
      }

      tracks.push(track);

      // Reset pending metadata
      pendingDuration = undefined;
      pendingTitle = undefined;
      pendingArtist = undefined;
    }
  }

  return tracks;
}

/**
 * Parse an INI-style Winamp PLS playlist string.
 */
export function parsePls(content: string): URLTrack[] {
  const lines = content.split(/\r?\n/);
  const entries: { [index: number]: { url?: string; title?: string; length?: number } } = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("[") || line.startsWith("#")) continue;

    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;

    const key = line.slice(0, eqIdx).trim();
    const value = line.slice(eqIdx + 1).trim();

    const fileMatch = key.match(/^File(\d+)$/i);
    const titleMatch = key.match(/^Title(\d+)$/i);
    const lengthMatch = key.match(/^Length(\d+)$/i);

    if (fileMatch) {
      const idx = parseInt(fileMatch[1], 10);
      entries[idx] = entries[idx] || {};
      entries[idx].url = value;
    } else if (titleMatch) {
      const idx = parseInt(titleMatch[1], 10);
      entries[idx] = entries[idx] || {};
      entries[idx].title = value;
    } else if (lengthMatch) {
      const idx = parseInt(lengthMatch[1], 10);
      entries[idx] = entries[idx] || {};
      const len = parseInt(value, 10);
      if (!isNaN(len) && len > 0) {
        entries[idx].length = len;
      }
    }
  }

  const indices = Object.keys(entries)
    .map(Number)
    .sort((a, b) => a - b);

  const tracks: URLTrack[] = [];
  for (const idx of indices) {
    const entry = entries[idx];
    if (!entry.url) continue;

    const titleFull = entry.title || entry.url.split("/").pop()?.split("?")[0] || "Unknown Track";
    let artist = "";
    let title = titleFull;

    const dashIdx = titleFull.indexOf(" - ");
    if (dashIdx !== -1) {
      artist = titleFull.slice(0, dashIdx).trim();
      title = titleFull.slice(dashIdx + 3).trim();
    }

    const track: URLTrack = {
      url: entry.url,
      defaultName: titleFull,
      duration: entry.length,
    };

    if (artist || title) {
      track.metaData = {
        artist,
        title,
      };
    }

    tracks.push(track);
  }

  return tracks;
}

/**
 * Parse JSON playlist string.
 */
export function parseJsonPlaylist(content: string): URLTrack[] {
  try {
    const data = JSON.parse(content);
    const list = Array.isArray(data) ? data : Array.isArray(data.tracks) ? data.tracks : [];
    return list
      .filter((t: any) => t && (typeof t.url === "string"))
      .map((t: any) => ({
        url: t.url,
        duration: typeof t.duration === "number" ? t.duration : undefined,
        defaultName: t.defaultName || t.metaData?.title || undefined,
        metaData: t.metaData
          ? {
              artist: t.metaData.artist || "",
              title: t.metaData.title || "",
              album: t.metaData.album || undefined,
              albumArtUrl: t.metaData.albumArtUrl || undefined,
            }
          : undefined,
      }));
  } catch (_e) {
    return [];
  }
}

/**
 * Automatically determine playlist format and parse.
 */
export function parsePlaylist(content: string, filename?: string): URLTrack[] {
  const trimmed = content.trim();

  // Check by filename extension if provided
  if (filename) {
    const lower = filename.toLowerCase();
    if (lower.endsWith(".pls")) {
      return parsePls(content);
    }
    if (lower.endsWith(".json")) {
      return parseJsonPlaylist(content);
    }
    if (lower.endsWith(".m3u") || lower.endsWith(".m3u8")) {
      return parseM3u(content);
    }
  }

  // Auto-detect based on content
  if (trimmed.startsWith("[playlist]") || /\[playlist\]/i.test(trimmed)) {
    return parsePls(content);
  }
  if (trimmed.startsWith("[") || (trimmed.startsWith("{") && trimmed.includes('"tracks"'))) {
    const jsonTracks = parseJsonPlaylist(content);
    if (jsonTracks.length > 0) return jsonTracks;
  }

  // Default to M3U
  return parseM3u(content);
}

/**
 * Serialize a list of tracks into M3U8 string.
 */
export function serializeTracksToM3u(
  tracks: (PlaylistTrack | Track)[]
): string {
  const lines: string[] = ["#EXTM3U"];

  for (const track of tracks) {
    const duration = track.duration ? Math.round(track.duration) : -1;

    let artist = "";
    let title = "";

    if ("metaData" in track && track.metaData) {
      artist = track.metaData.artist || "";
      title = track.metaData.title || "";
    } else if ("artist" in track || "title" in track) {
      const pt = track as PlaylistTrack;
      artist = pt.artist || "";
      title = pt.title || "";
    }

    const defaultName = track.defaultName || "";
    let displayName = "";
    if (artist && title) {
      displayName = `${artist} - ${title}`;
    } else if (title) {
      displayName = title;
    } else if (defaultName) {
      displayName = defaultName;
    } else {
      displayName = "Unknown Track";
    }

    lines.push(`#EXTINF:${duration},${displayName}`);

    let trackUrl = "";
    if ("url" in track && typeof track.url === "string") {
      trackUrl = track.url;
    } else if (defaultName) {
      trackUrl = defaultName;
    }

    lines.push(trackUrl);
  }

  return lines.join("\n");
}

/**
 * Save tracks to browser localStorage.
 */
export function savePlaylistToStorage(
  tracks: (PlaylistTrack | Track)[]
): boolean {
  try {
    const serialized: URLTrack[] = tracks
      .filter((t) => "url" in t && typeof t.url === "string" && !t.url.startsWith("blob:"))
      .map((t) => {
        let artist = "";
        let title = "";
        let album: string | undefined;
        let albumArtUrl: string | undefined;

        if ("metaData" in t && t.metaData) {
          artist = t.metaData.artist || "";
          title = t.metaData.title || "";
          album = t.metaData.album;
          albumArtUrl = t.metaData.albumArtUrl;
        } else if ("artist" in t || "title" in t) {
          const pt = t as PlaylistTrack;
          artist = pt.artist || "";
          title = pt.title || "";
          album = pt.album;
          albumArtUrl = pt.albumArtUrl || undefined;
        }

        return {
          url: (t as any).url,
          duration: t.duration ? Math.round(t.duration) : undefined,
          defaultName: t.defaultName || undefined,
          metaData: artist || title ? { artist, title, album, albumArtUrl } : undefined,
        };
      });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    return true;
  } catch (e) {
    console.error("Failed to save playlist to localStorage:", e);
    return false;
  }
}

/**
 * Load tracks from browser localStorage.
 */
export function loadPlaylistFromStorage(): URLTrack[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch (e) {
    console.error("Failed to load playlist from localStorage:", e);
    return null;
  }
}
