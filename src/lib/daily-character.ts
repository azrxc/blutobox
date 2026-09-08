import { chatCompletion, isAIConfigured } from "@/lib/deepseek";

export type CharacterResult =
  | { ok: true; name: string; tagline: string; description: string; traits: string[]; portrait: string }
  | { ok: false; reason: string };

const SYSTEM_PROMPT =
  "You invent a single original fictional character for a general-audience website used by all ages, " +
  "including kids. Family-friendly only: no romance beyond wholesome, no violence beyond mild " +
  "adventure-story peril, no real people, no real brands. " +
  'Respond with ONLY a valid JSON object, no markdown formatting, no code fences, no text outside ' +
  'the JSON, in exactly this shape: {"name": string, "tagline": string, "description": string, ' +
  '"traits": [string, string, string], "portrait": string}. "name" is a full character name. ' +
  '"tagline" is a punchy one-sentence hook (under 12 words). "description" is a 2-3 sentence ' +
  'backstory/personality summary. "traits" is exactly 3 short personality/character traits. ' +
  '"portrait" is a 1-2 sentence visual description of their appearance, written so someone could ' +
  "use it as a prompt for a separate art tool - be specific about clothing, features, and vibe, " +
  "but never describe anything explicit or suggestive.";

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

export async function generateDailyCharacter(): Promise<CharacterResult> {
  try {
    if (!isAIConfigured()) return { ok: false, reason: "The character generator isn't configured yet" };

    const completion = await chatCompletion({
      max_tokens: 500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "Generate today's character. Make them distinct and memorable, any genre." },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return { ok: false, reason: "The character came back empty" };

    const parsed = JSON.parse(stripCodeFence(raw));
    if (
      typeof parsed.name !== "string" ||
      typeof parsed.tagline !== "string" ||
      typeof parsed.description !== "string" ||
      !Array.isArray(parsed.traits) ||
      typeof parsed.portrait !== "string"
    ) {
      return { ok: false, reason: "The character came back in an unexpected format" };
    }

    return {
      ok: true,
      name: parsed.name,
      tagline: parsed.tagline,
      description: parsed.description,
      traits: parsed.traits.slice(0, 3),
      portrait: parsed.portrait,
    };
  } catch (err) {
    console.error("[daily-character] generation failed", err);
    return { ok: false, reason: "Something went wrong generating today's character" };
  }
}
