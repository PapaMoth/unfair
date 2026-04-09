import { z } from "zod";

export const ScriptSchema = z.object({
  title: z.string(),
  hook: z.string().min(10),
  body: z.array(z.string()).min(2).max(6),
  ending: z.string(),
  cta: z.string(),
});
