import OpenAI from "openai";

// Two-tier fallback: try DeepSeek's own direct API first (if DEEPSEEK_API_KEY is
// set - this exists so a pre-paid balance on that account gets spent down instead
// of wasted), and only fall back to OpenRouter if the direct API specifically
// fails with "insufficient balance" (HTTP 402). OpenRouter is preferred long-term -
// DeepSeek's model weights are open, so 28+ independent hosts run the same model
// and compete on price there, coming out 3-5x cheaper than DeepSeek's own direct
// API (which also introduced peak/off-peak surge pricing on 2026-08-16) - see the
// memory note on always checking aggregators before a vendor's direct API. Once
// the direct balance runs out for good, every call quietly falls through to
// OpenRouter forever after - no manual cutover needed.
const DIRECT_MODEL = "deepseek-v4-flash";
const OPENROUTER_MODEL = "deepseek/deepseek-v4-flash";

let directClient: OpenAI | null | undefined;
let openRouterClient: OpenAI | null | undefined;

function getDirectClient(): OpenAI | null {
  if (directClient !== undefined) return directClient;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  directClient = apiKey ? new OpenAI({ apiKey, baseURL: "https://api.deepseek.com" }) : null;
  return directClient;
}

function getOpenRouterClient(): OpenAI | null {
  if (openRouterClient !== undefined) return openRouterClient;
  const apiKey = process.env.OPENROUTER_API_KEY;
  openRouterClient = apiKey
    ? new OpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://blutobox.com",
          "X-Title": "Bluto Box",
        },
      })
    : null;
  return openRouterClient;
}

// Callers check this before doing any work (extracting text, etc.) that would be
// wasted if no AI provider is configured at all.
export function isAIConfigured(): boolean {
  return Boolean(getDirectClient() || getOpenRouterClient());
}

type ChatCompletionParams = Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, "model">;

export async function chatCompletion(
  params: ChatCompletionParams,
  options?: {
    // DeepSeek's own direct API has consistently run in a heavier reasoning mode
    // than most OpenRouter-routed hosts for the same nominal model (observed
    // 600-1485 reasoning tokens on every direct call tested vs. 0-759 on
    // OpenRouter, price-sorted) - callers that are latency-sensitive (bounded by a
    // hard function timeout, not just cost) can skip straight to OpenRouter.
    skipDirect?: boolean;
  }
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  const direct = options?.skipDirect ? null : getDirectClient();
  if (direct) {
    try {
      return await direct.chat.completions.create({ ...params, model: DIRECT_MODEL });
    } catch (err) {
      const status = (err as { status?: number } | null)?.status;
      if (status !== 402) throw err;
      console.warn("[deepseek] direct API balance exhausted, falling back to OpenRouter");
    }
  }

  const openRouter = getOpenRouterClient();
  if (!openRouter) throw new Error("No AI provider configured");
  // `provider.sort: "price"` is an OpenRouter extension, not part of the OpenAI
  // SDK's own request type - always route to whichever of DeepSeek V4 Flash's many
  // competing hosts is cheapest right now. The cast is needed because the SDK's TS
  // types don't know about this OpenRouter-specific field.
  return openRouter.chat.completions.create({
    ...params,
    model: OPENROUTER_MODEL,
    provider: { sort: "price" },
  } as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming);
}
