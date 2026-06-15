export type NowSpinningTrack = {
  spotifyId: string;
  name: string;
  artists: string;
  albumName: string;
  albumImageUrl: string | null;
  spotifyUrl: string | null;
  progressMs: number | null;
  durationMs: number | null;
  isPlaying: boolean;
};

export type NowSpinningState =
  | {
      status: "not_connected";
    }
  | {
      status: "not_playing";
    }
  | {
      status: "unavailable";
    }
  | {
      status: "track";
      track: NowSpinningTrack;
    };
