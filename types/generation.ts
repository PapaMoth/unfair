export type TopicResult = {
  title: string;
  topic: string;
  angle: string;
  targetAudience: string;
  tone: string;
  cta: string;
};

export type ScriptResult = {
  title: string;
  hook: string;
  body: string[];
  ending: string;
  cta: string;
};

export type ScenePlan = {
  sceneIndex: number;
  durationSeconds: number;
  voiceoverText: string;
  captionText: string;
  visualPrompt: string;
  assetStrategy: "stock" | "ai_image" | "ai_video" | "kinetic_text";
};

export type SubtitleItem = {
  startMs: number;
  endMs: number;
  text: string;
};

export type GenerateVideoJobPayload = {
  channelId: string;
  triggeredBy: "manual" | "schedule" | "regenerate";
};
