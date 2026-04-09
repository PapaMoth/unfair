export type TaskType = "topic" | "script" | "scene";

export const TASK_MODEL_MAP = {
  topic: [
    { provider: "groq", model: "llama3-70b" },
    { provider: "anthropic", model: "claude-3-haiku" },
  ],
  script: [
    { provider: "openai", model: "gpt-5.3" },
    { provider: "anthropic", model: "claude-3-haiku" },
  ],
  scene: [
    { provider: "groq", model: "llama3-70b" },
    { provider: "openai", model: "gpt-5.3" },
  ],
} as const;
