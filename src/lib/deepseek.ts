import OpenAI from "openai";

// DeepSeek's API is OpenAI-compatible - same SDK, different base URL/model. Chosen
// over Claude/GPT for every AI feature on the site specifically because it's
// dramatically cheaper per token, and none of these features need frontier-level
// quality (short summaries, short story turns). Shared lazy singleton so every
// caller (AI summary, adventure, ...) reuses one client instead of each rolling
// its own - returns null if DEEPSEEK_API_KEY isn't configured, callers degrade
// gracefully instead of crashing.
export const DEEPSEEK_MODEL = "deepseek-v4-flash";

let cachedClient: OpenAI | null | undefined;

export function getDeepSeekClient(): OpenAI | null {
  if (cachedClient !== undefined) return cachedClient;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  cachedClient = apiKey ? new OpenAI({ apiKey, baseURL: "https://api.deepseek.com" }) : null;
  return cachedClient;
}
