import { MODEL_PRICING } from "./model-pricing";
import { TASK_MODEL_MAP, type TaskType } from "./task-model-map";

type ModelOption = {
  provider: keyof typeof MODEL_PRICING;
  model: string;
};

export function pickCheapestModel(task: TaskType) {
  const options = TASK_MODEL_MAP[task];

  return [...options].sort((a, b) => {
    const costA = estimateCost(a);
    const costB = estimateCost(b);
    return costA - costB;
  })[0];
}

function estimateCost({ provider, model }: ModelOption) {
  const pricing = (MODEL_PRICING as Record<string, Record<string, { input: number; output: number }>>)[provider]?.[model];

  if (!pricing) {
    return Number.POSITIVE_INFINITY;
  }

  // assume avg tokens
  return pricing.input * 500 + pricing.output * 500;
}
