import path from "path";
import fetch from "node-fetch";
import { config } from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../.env") });

const { TOGETHER_API_KEY } = process.env;

export async function getLLMReview(prompt) {
  const res = await fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOGETHER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-ai/DeepSeek-V3",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 1024,
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response from model.";
}
