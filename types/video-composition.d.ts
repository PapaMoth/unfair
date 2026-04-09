export type VideoCompositionInput = {
  videoId: string;
  title: string;
  aspectRatio: "9:16";
  scenes: {
    startFrame: number;
    durationFrames: number;
    voiceoverText: string;
    captionText: string;
    assetUrl: string;
    assetType: "video" | "image";
    transition?: string;
  }[];
  voiceoverUrl: string;
  musicUrl?: string;
  branding?: {
    watermarkText?: string;
    logoUrl?: string;
  };
  subtitles: {
    start: number;
    end: number;
    text: string;
  }[];
};
