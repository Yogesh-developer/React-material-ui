import { jsonrepair } from "jsonrepair";

export function jsonParser(text) {
  const jsonMatch = text.match(/```json([\s\S]*?)```/);
  try {
    const rawString =
      typeof jsonMatch?.[1] === "string"
        ? jsonMatch?.[1]
        : JSON.stringify(jsonMatch?.[1]);
    const repaired = jsonrepair(rawString);
    return JSON.parse(repaired);
  } catch (e) {
    console.error("Still invalid:", e);
  }
}
