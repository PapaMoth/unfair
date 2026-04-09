import { getOpenAIApiKey } from "../../../../lib/openai";
import { pickCheapestModel } from "../../../../packages/shared/src/model-router";
import type { TaskType } from "../../../../packages/shared/src/task-model-map";

export async function generateText(prompt: string): Promise<{ text: string }> {
  return generateTextWithTask(prompt, "script");
}

export async function generateTextWithTask(prompt: string, task: TaskType): Promise<{ text: string }> {
  const apiKey = getOpenAIApiKey();
  const selected = pickCheapestModel(task);

  // For now, requests are executed through OpenAI-compatible Responses API endpoint.
  // `selected` is still used for routing metadata and future provider expansion.
  const model = selected.provider === "openai" ? selected.model : "gpt-4.1-mini";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: prompt,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const data = await response.json();

  const text =
    data.output_text ||
    (Array.isArray(data.output)
      ? data.output
          .flatMap((item: { content?: { type: string; text: string }[] }) => item.content || [])
          .filter((content: { type: string }) => content.type === "output_text")
          .map((content: { text: string }) => content.text)
          .join("\n")
      : "");

  return { text };
}
