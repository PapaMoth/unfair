import { z } from "zod";

export const TopicSchema = z.object({
  title: z.string().min(5),
  topic: z.string(),
  angle: z.string(),
  targetAudience: z.string(),
  tone: z.string(),
  cta: z.string(),
});

export const ScriptSchema = z.object({
  title: z.string(),
  hook: z.string().min(10),
  body: z.array(z.string()).min(2).max(6),
  ending: z.string(),
  cta: z.string(),
});

export const SceneSchema = z.object({
  sceneIndex: z.number(),
  durationSeconds: z.number().min(3).max(12),
  voiceoverText: z.string(),
  captionText: z.string(),
  visualPrompt: z.string(),
  assetStrategy: z.enum(["stock", "ai_image", "ai_video", "kinetic_text"]),
});

export const SceneArraySchema = z.object({
  scenes: z.array(SceneSchema).min(5),
});
