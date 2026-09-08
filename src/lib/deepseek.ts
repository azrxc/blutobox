import OpenAI from "openai";

// Routed through OpenRouter rather than DeepSeek's own official API - DeepSeek's
// model weights are open, so 28+ independent hosts (DeepInfra, StreamLake, etc.)
// run the same model and compete on price via OpenRouter, coming out 3-5x cheaper
// than DeepSeek's own direct API (which also introduced peak/off-peak surge
// pricing on 2026-08-16). Same model, cheaper access path - verified 2026-09-08,
// see the memory note on always checking aggregators before a vendor's direct API.
export const DEEPSEEK_MODEL = "deepseek/deepseek-v4-flash";

let cachedClient: OpenAI | null | undefined;

// Shared lazy singleton so every caller (AI summary, adventure, ...) reuses one
// client instead of each rolling its own - returns null if OPENROUTER_API_KEY
// isn't configured, callers degrade gracefully instead of crashing.
export function getDeepSeekClient(): OpenAI | null {
  if (cachedClient !== undefined) return cachedClient;
  const apiKey = process.env.OPENROUTER_API_KEY;
  cachedClient = apiKey
    ? new OpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://blutobox.com",
          "X-Title": "Bluto Box",
        },
      })
    : null;
  return cachedClient;
}

type ChatCompletionParams = OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;

// `provider.sort: "price"` is an OpenRouter extension, not part of the OpenAI SDK's
// own request type - always route to whichever of DeepSeek V4 Flash's many
// competing hosts is cheapest right now, instead of load-balancing across all of
// them for reliability. The cast is needed because the SDK's TS types don't know
// about this OpenRouter-specific field. Pinned to the non-streaming params/return
// type since every caller here awaits a single full response, never a stream.
export function chatCompletion(
  client: OpenAI,
  params: ChatCompletionParams
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  return client.chat.completions.create({ ...params, provider: { sort: "price" } } as ChatCompletionParams);
}
