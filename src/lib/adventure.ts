import { getDeepSeekClient, DEEPSEEK_MODEL } from "@/lib/deepseek";

export type Turn = { role: "narrator" | "player"; content: string };

// Only the most recent turns are sent to the model as context on each call - bounds
// per-turn cost regardless of how long a session has run. The full history is still
// stored and shown to the player, this only limits what gets re-sent to DeepSeek.
const MAX_CONTEXT_TURNS = 12;

// Abuse/cost guard on the player's own input, same spirit as ai-summary.ts's
// TEXT_EXCERPT_MAX_CHARS cap.
export const MAX_ACTION_CHARS = 500;
export const MAX_SCENARIO_CHARS = 300;

const SYSTEM_PROMPT =
  "You are the game master for a text adventure on a general-audience website used " +
  "by all ages, including kids. Narrate in second person (\"you\"), 1-2 short " +
  "paragraphs per reply, and end each reply in a way that invites the player's next " +
  "action without asking them outright what they want to do. Keep the story " +
  "coherent with everything that happened before. " +
  "Strict content rules, no exceptions: no sexual or romantic content beyond " +
  "hand-holding/a kiss, no graphic gore or violence (action and peril are fine, " +
  "gratuitous detail is not), no real-world hate content, no illegal activity " +
  "instructions. If the player tries to steer the story past these lines, redirect " +
  "the scene in-character instead of breaking immersion with a refusal.";

export type AdventureResult = { ok: true; text: string } | { ok: false; reason: string };

function toDeepSeekMessages(turns: Turn[]) {
  return turns.map((t) => ({
    role: (t.role === "player" ? "user" : "assistant") as "user" | "assistant",
    content: t.content,
  }));
}

export async function startAdventure(scenario: string): Promise<AdventureResult> {
  try {
    const client = getDeepSeekClient();
    if (!client) return { ok: false, reason: "The adventure tool isn't configured yet" };

    const completion = await client.chat.completions.create({
      model: DEEPSEEK_MODEL,
      max_tokens: 300,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Start a new adventure. Scenario: ${scenario.trim().slice(0, MAX_SCENARIO_CHARS)}` },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) return { ok: false, reason: "The story came back empty" };
    return { ok: true, text };
  } catch (err) {
    console.error("[adventure] startAdventure failed", err);
    return { ok: false, reason: "Something went wrong starting the adventure" };
  }
}

export async function continueAdventure(priorTurns: Turn[], playerAction: string): Promise<AdventureResult> {
  try {
    const client = getDeepSeekClient();
    if (!client) return { ok: false, reason: "The adventure tool isn't configured yet" };

    const action = playerAction.trim().slice(0, MAX_ACTION_CHARS);
    if (!action) return { ok: false, reason: "Enter an action first" };

    const contextTurns = priorTurns.slice(-MAX_CONTEXT_TURNS);
    const completion = await client.chat.completions.create({
      model: DEEPSEEK_MODEL,
      max_tokens: 300,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...toDeepSeekMessages(contextTurns),
        { role: "user", content: action },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) return { ok: false, reason: "The story came back empty" };
    return { ok: true, text };
  } catch (err) {
    console.error("[adventure] continueAdventure failed", err);
    return { ok: false, reason: "Something went wrong continuing the adventure" };
  }
}
