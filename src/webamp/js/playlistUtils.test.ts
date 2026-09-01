import {
  parseM3u,
  parsePls,
  parseJsonPlaylist,
  parsePlaylist,
  serializeTracksToM3u,
  savePlaylistToStorage,
  loadPlaylistFromStorage,
} from "./playlistUtils";
import { URLTrack } from "./types";

describe("playlistUtils", () => {
  describe("parseM3u", () => {
    it("parses standard M3U with EXTM3U and EXTINF", () => {
      const m3u = `
#EXTM3U
#EXTINF:215,Artist One - Song Title
https://example.com/song1.mp3
#EXTINF:180,Song Without Artist
./mp3/song2.mp3
      `.trim();

      const tracks = parseM3u(m3u);
      expect(tracks).toHaveLength(2);
      expect(tracks[0]).toEqual({
        url: "https://example.com/song1.mp3",
        defaultName: "Song Title",
        duration: 215,
        metaData: {
          artist: "Artist One",
          title: "Song Title",
        },
      });
      expect(tracks[1]).toEqual({
        url: "./mp3/song2.mp3",
        defaultName: "Song Without Artist",
        duration: 180,
        metaData: {
          artist: "",
          title: "Song Without Artist",
        },
      });
    });

    it("parses plain M3U without EXTINF", () => {
      const m3u = `
https://example.com/track1.mp3
https://example.com/music/track2.mp3?query=1
      `.trim();

      const tracks = parseM3u(m3u);
      expect(tracks).toHaveLength(2);
      expect(tracks[0].url).toBe("https://example.com/track1.mp3");
      expect(tracks[0].defaultName).toBe("track1.mp3");
      expect(tracks[1].url).toBe("https://example.com/music/track2.mp3?query=1");
      expect(tracks[1].defaultName).toBe("track2.mp3");
    });
  });

  describe("parsePls", () => {
    it("parses standard PLS file", () => {
      const pls = `
[playlist]
File1=https://example.com/stream.mp3
Title1=DJ Awesome - Live Set
Length1=3600
File2=./local.mp3
Title2=Local Track
Length2=120
NumberOfEntries=2
Version=2
      `.trim();

      const tracks = parsePls(pls);
      expect(tracks).toHaveLength(2);
      expect(tracks[0]).toEqual({
        url: "https://example.com/stream.mp3",
        defaultName: "DJ Awesome - Live Set",
        duration: 3600,
        metaData: {
          artist: "DJ Awesome",
          title: "Live Set",
        },
      });
      expect(tracks[1]).toEqual({
        url: "./local.mp3",
        defaultName: "Local Track",
        duration: 120,
        metaData: {
          artist: "",
          title: "Local Track",
        },
      });
    });
  });

  describe("parseJsonPlaylist", () => {
    it("parses array of tracks", () => {
      const json = JSON.stringify([
        {
          url: "https://example.com/a.mp3",
          duration: 100,
          metaData: { artist: "A", title: "B" },
        },
      ]);
      const tracks = parseJsonPlaylist(json);
      expect(tracks).toHaveLength(1);
      expect(tracks[0].url).toBe("https://example.com/a.mp3");
      expect(tracks[0].duration).toBe(100);
      expect(tracks[0].metaData?.artist).toBe("A");
    });
  });

  describe("parsePlaylist auto-detection", () => {
    it("detects PLS by content", () => {
      const pls = `[playlist]\nFile1=test.mp3\nTitle1=Test`;
      const tracks = parsePlaylist(pls);
      expect(tracks).toHaveLength(1);
      expect(tracks[0].url).toBe("test.mp3");
    });

    it("detects by filename extension", () => {
      const pls = `File1=test.mp3\nTitle1=Test`;
      const tracks = parsePlaylist(pls, "my_playlist.pls");
      expect(tracks).toHaveLength(1);
      expect(tracks[0].url).toBe("test.mp3");
    });
  });

  describe("serializeTracksToM3u", () => {
    it("serializes tracks to M3U8 string", () => {
      const tracks: URLTrack[] = [
        {
          url: "./mp3/song1.mp3",
          duration: 200,
          metaData: { artist: "Artist", title: "Song" },
        },
        {
          url: "https://stream.org/live",
          defaultName: "Stream",
        },
      ];

      const serialized = serializeTracksToM3u(tracks);
      expect(serialized).toContain("#EXTM3U");
      expect(serialized).toContain("#EXTINF:200,Artist - Song");
      expect(serialized).toContain("./mp3/song1.mp3");
      expect(serialized).toContain("#EXTINF:-1,Stream");
      expect(serialized).toContain("https://stream.org/live");
    });
  });

  describe("storage save and load", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("saves and loads tracks from localStorage", () => {
      const tracks: URLTrack[] = [
        {
          url: "./mp3/test.mp3",
          duration: 150,
          metaData: { artist: "Test Artist", title: "Test Song" },
        },
      ];

      expect(loadPlaylistFromStorage()).toBeNull();

      const saved = savePlaylistToStorage(tracks);
      expect(saved).toBe(true);

      const loaded = loadPlaylistFromStorage();
      expect(loaded).toHaveLength(1);
      expect(loaded![0].url).toBe("./mp3/test.mp3");
      expect(loaded![0].metaData?.title).toBe("Test Song");
    });
  });
});
