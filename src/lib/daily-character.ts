import { chatCompletion, isAIConfigured } from "@/lib/deepseek";
import { generatePortraitImage } from "@/lib/image-gen";

export type CharacterResult =
  | {
      ok: true;
      name: string;
      tagline: string;
      description: string;
      traits: string[];
      decoyTraits: string[];
      portrait: string;
      portraitImageUrl: string | null;
    }
  | { ok: false; reason: string };

type ParsedCharacter = {
  name: string;
  tagline: string;
  description: string;
  traits: string[];
  decoyTraits: string[];
  portrait: string;
};

const SYSTEM_PROMPT =
  "You invent a single original fictional character for a general-audience website used by all ages, " +
  "including kids. Family-friendly only: no romance beyond wholesome, no violence beyond mild " +
  "adventure-story peril, no real people, no real brands. Keep every field short - this is a compact " +
  "card, not a novel. " +
  'Respond with ONLY a valid JSON object, no markdown formatting, no code fences, no text outside ' +
  'the JSON, in exactly this shape: {"name": string, "tagline": string, "description": string, ' +
  '"traits": [string, string, string], "decoyTraits": [string, string], "portrait": string}. "name" ' +
  'is a full character name. "tagline" is a punchy one-sentence hook, under 12 words. "description" ' +
  'is exactly 2 short sentences of backstory/personality, under 40 words total. "traits" is exactly ' +
  '3 short (1-2 word) personality traits that genuinely fit this character. "decoyTraits" is exactly ' +
  "2 short (1-2 word) traits that sound equally plausible for a character card but do NOT fit this " +
  'specific character - used for a "guess the real trait" mini-game, so they must be believable, not ' +
  'obviously wrong or joke traits. "portrait" is exactly 1 sentence, under 30 words, describing their ' +
  "visual appearance so someone could use it as a prompt for a separate art tool - specific about " +
  "clothing, features, and vibe, but never explicit or suggestive.";

// Once-a-day generation shared by the whole site, so a failure here blocks every
// visitor until it succeeds, not just one person clicking again like the other AI
// features - worth retrying a few times before giving up, especially since some
// failures (empty content, truncated JSON) are transient rather than fields being
// genuinely too long.
const MAX_ATTEMPTS = 3;

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

async function tryGenerateCharacterText(): Promise<ParsedCharacter | null> {
  const completion = await chatCompletion({
    max_tokens: 700,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: "Generate today's character. Make them distinct and memorable, any genre." },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(stripCodeFence(raw));
    if (
      typeof parsed.name !== "string" ||
      typeof parsed.tagline !== "string" ||
      typeof parsed.description !== "string" ||
      !Array.isArray(parsed.traits) ||
      parsed.traits.length < 3 ||
      !Array.isArray(parsed.decoyTraits) ||
      parsed.decoyTraits.length < 2 ||
      typeof parsed.portrait !== "string"
    ) {
      return null;
    }
    return {
      name: parsed.name,
      tagline: parsed.tagline,
      description: parsed.description,
      traits: parsed.traits.slice(0, 3),
      decoyTraits: parsed.decoyTraits.slice(0, 2),
      portrait: parsed.portrait,
    };
  } catch {
    return null;
  }
}

export async function generateDailyCharacter(): Promise<CharacterResult> {
  if (!isAIConfigured()) return { ok: false, reason: "The character generator isn't configured yet" };

  let character: ParsedCharacter | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      character = await tryGenerateCharacterText();
      if (character) break;
      console.warn(`[daily-character] attempt ${attempt} came back empty/malformed, retrying`);
    } catch (err) {
      console.warn(`[daily-character] attempt ${attempt} threw, retrying`, err);
    }
  }

  if (!character) return { ok: false, reason: "Something went wrong generating today's character" };

  // Best-effort - if image generation fails (provider hiccup, content policy, not
  // configured), the character still works text-only. One image per day site-wide,
  // so this is never in the per-viewer request path.
  const imageResult = await generatePortraitImage(character.portrait);

  return {
    ok: true,
    ...character,
    portraitImageUrl: imageResult.ok ? imageResult.dataUrl : null,
  };
}
