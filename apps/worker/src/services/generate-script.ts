import { ScriptSchema } from "@autoshorts/shared/src/schemas";
import { parseWithRetry } from "../utils/parse";
import { generateTextWithTask } from "../providers/ai.provider";

export async function generateScript(channel: { tone?: string; targetAudience?: string }, topic: { topic: string }) {
  return parseWithRetry(ScriptSchema, async () => {
    const res = await generateTextWithTask(`
Return ONLY valid JSON. No explanation. No markdown.

{
  "title": "...",
  "hook": "...",
  "body": ["...", "..."],
  "ending": "...",
  "cta": "..."
}

Topic: ${topic.topic}
Tone: ${channel.tone || "educational"}
Audience: ${channel.targetAudience || "general"}
`, "script");

    return res.text;
  });
}
