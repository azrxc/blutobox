import { isAIConfigured, chatCompletion } from "@/lib/deepseek";

export type Turn = { role: "narrator" | "player"; content: string; choices?: string[]; critical?: boolean };

// Only the most recent turns are sent to the model as context on each call - bounds
// per-turn cost regardless of how long a session has run. The full history is still
// stored and shown to the player, this only limits what gets re-sent to DeepSeek.
const MAX_CONTEXT_TURNS = 12;

// Abuse/cost guard on the player's own input, same spirit as ai-summary.ts's
// TEXT_EXCERPT_MAX_CHARS cap.
export const MAX_ACTION_CHARS = 500;
export const MAX_SCENARIO_CHARS = 300;

export const STAT_MIN = 0;
export const STAT_MAX = 100;

export type StatGoal = "high" | "low";

const JSON_SHAPE_INSTRUCTIONS =
  "Respond with ONLY a valid JSON object, no markdown formatting, no code fences, " +
  'no text outside the JSON, in exactly this shape: {"narrative": string, ' +
  '"choices": [string, string, string], "statDelta": number, "critical": boolean}. ' +
  "\"narrative\" is 1-2 short paragraphs in second person (\"you\"). \"choices\" is " +
  "exactly 3 short (under 8 words each) suggested next actions the player could " +
  'take, phrased as actions (e.g. "Open the door"), distinct from each other. ' +
  "\"statDelta\" is an integer from -20 to 20 reflecting how much the player's last " +
  "action helped or hurt their standing on the tracked meter (0 if neutral or not " +
  'applicable yet). "critical" is true ONLY when this exact moment is a tense, ' +
  "high-stakes, split-second decision (real danger, a trap springing, a " +
  "confrontation) where it wouldn't make sense for the player to pause and do " +
  "something else - in that case the 3 choices must be the ONLY viable options, " +
  "covering the realistic ways to react right now. Use it sparingly, most turns " +
  "should be false so the player can act freely.";

const SYSTEM_PROMPT =
  "You are the game master for a text adventure on a general-audience website used " +
  "by all ages, including kids. Keep the story coherent with everything that " +
  "happened before, and end each beat at a natural decision point. " +
  "Strict content rules, no exceptions: no sexual or romantic content beyond " +
  "hand-holding/a kiss, no graphic gore or violence (action and peril are fine, " +
  "gratuitous detail is not), no real-world hate content, no illegal activity " +
  "instructions. If the player tries to steer the story past these lines, redirect " +
  "the scene in-character instead of breaking immersion with a refusal. " +
  JSON_SHAPE_INSTRUCTIONS;

export type StartResult =
  | { ok: true; narrative: string; choices: string[]; statLabel: string; statGoal: StatGoal; critical: boolean }
  | { ok: false; reason: string };

export type ContinueResult =
  | { ok: true; narrative: string; choices: string[]; statDelta: number; critical: boolean }
  | { ok: false; reason: string };

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

function toDeepSeekMessages(turns: Turn[]) {
  return turns.map((t) => ({
    role: (t.role === "player" ? "user" : "assistant") as "user" | "assistant",
    content: t.content,
  }));
}

export async function startAdventure(scenario: string): Promise<StartResult> {
  try {
    if (!isAIConfigured()) return { ok: false, reason: "The adventure tool isn't configured yet" };

    const completion = await chatCompletion({
      max_tokens: 700,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `Start a new adventure. Scenario: ${scenario.trim().slice(0, MAX_SCENARIO_CHARS)}\n\n` +
            'Also pick a single short meter name (1-2 words, e.g. "Trust", "Health", "Sanity", ' +
            '"Suspicion") that fits this scenario and will track how well things are going for the ' +
            'player - add it to the JSON as "statLabel". Also add "statGoal", either "high" or ' +
            '"low": "high" if reaching 100 on this meter is the winning outcome and 0 is defeat ' +
            '(e.g. Trust, Health), or "low" if it\'s the reverse - reaching 0 is the winning ' +
            'outcome and 100 is defeat (e.g. Suspicion, a countdown, danger level). The meter ' +
            "starts at 50/100 for every adventure, so don't reference a starting value in the narrative.",
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return { ok: false, reason: "The story came back empty" };

    const parsed = JSON.parse(stripCodeFence(raw));
    if (
      typeof parsed.narrative !== "string" ||
      !Array.isArray(parsed.choices) ||
      typeof parsed.statLabel !== "string" ||
      (parsed.statGoal !== "high" && parsed.statGoal !== "low")
    ) {
      return { ok: false, reason: "The story came back in an unexpected format" };
    }
    return {
      ok: true,
      narrative: parsed.narrative,
      choices: parsed.choices.slice(0, 3),
      statLabel: parsed.statLabel,
      statGoal: parsed.statGoal,
      critical: parsed.critical === true,
    };
  } catch (err) {
    console.error("[adventure] startAdventure failed", err);
    return { ok: false, reason: "Something went wrong starting the adventure" };
  }
}

export async function continueAdventure(
  priorTurns: Turn[],
  playerAction: string,
  statLabel: string,
  statValue: number,
  statGoal: StatGoal
): Promise<ContinueResult> {
  try {
    if (!isAIConfigured()) return { ok: false, reason: "The adventure tool isn't configured yet" };

    const action = playerAction.trim().slice(0, MAX_ACTION_CHARS);
    if (!action) return { ok: false, reason: "Enter an action first" };

    const contextTurns = priorTurns.slice(-MAX_CONTEXT_TURNS);
    const completion = await chatCompletion({
      max_tokens: 700,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...toDeepSeekMessages(contextTurns),
        {
          role: "user",
          content:
            `${action}\n\n(Current ${statLabel}: ${statValue}/100, ${statGoal === "high" ? "higher is better, 100 wins, 0 is defeat" : "lower is better, 0 wins, 100 is defeat"}. ` +
            'Reflect the outcome of this action in "statDelta".)',
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return { ok: false, reason: "The story came back empty" };

    const parsed = JSON.parse(stripCodeFence(raw));
    if (typeof parsed.narrative !== "string" || !Array.isArray(parsed.choices) || typeof parsed.statDelta !== "number") {
      return { ok: false, reason: "The story came back in an unexpected format" };
    }
    const statDelta = Math.max(-20, Math.min(20, Math.round(parsed.statDelta)));
    return {
      ok: true,
      narrative: parsed.narrative,
      choices: parsed.choices.slice(0, 3),
      statDelta,
      critical: parsed.critical === true,
    };
  } catch (err) {
    console.error("[adventure] continueAdventure failed", err);
    return { ok: false, reason: "Something went wrong continuing the adventure" };
  }
}
