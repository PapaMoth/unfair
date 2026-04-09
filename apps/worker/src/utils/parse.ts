import { z } from "zod";

export async function parseWithRetry<T>(
  schema: z.ZodSchema<T>,
  generator: () => Promise<string>,
  retries = 2
): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      const raw = await generator();
      const json = JSON.parse(raw);
      return schema.parse(json);
    } catch (err) {
      console.warn("Parse failed, retrying...", err);
      if (i === retries) throw err;
    }
  }

  throw new Error("Unreachable");
}
