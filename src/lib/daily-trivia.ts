import { chatCompletion, isAIConfigured } from "@/lib/deepseek";

export type TriviaQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
};

export type TriviaResult = { ok: true; questions: TriviaQuestion[] } | { ok: false; reason: string };

const QUESTION_COUNT = 5;

const SYSTEM_PROMPT =
  `You write a ${QUESTION_COUNT}-question trivia quiz for a general-audience website used by all ages, ` +
  "including kids. Cover a mix of topics - science, history, geography, animals/nature, space, food, general " +
  "knowledge - vary which categories appear from one day to the next, and never repeat a category within the " +
  "same quiz. Family-friendly only: no politics, no religion, no violence, nothing requiring mature or " +
  "specialist knowledge. Every question must have exactly one unambiguously correct answer among the 4 " +
  'options. Your entire response must be a single JSON object - the first character must be "{" and the ' +
  'last character must be "}", nothing before or after it. Do not write the quiz out as readable text or a ' +
  "numbered list, do not use markdown headers or bold text or lettered options (A/B/C/D) - it must be raw " +
  `JSON data only, no code fences, no explanation. Exactly this shape: {"questions": [{"question": string, ` +
  '"options": [string, string, string, string], "correctIndex": number, "category": string}, ...]}. Exactly ' +
  `${QUESTION_COUNT} questions. "question" is under 20 words. Each of the 4 "options" is short, under 8 words. ` +
  '"correctIndex" is the 0-based index into "options" of the right answer. "category" is ' +
  "one or two words naming the topic.";

// Higher than the analogous Daily Character retry count - this larger 5-question
// payload has shown more format drift in practice (occasionally wrapped in prose
// and/or shaped as a bare array instead of the requested object), so more attempts
// buys real reliability for a feature that only needs to succeed once per day.
const MAX_ATTEMPTS = 5;

// The model doesn't always follow "respond with only JSON, no fence, no prose" -
// observed in production: a plain object, a fenced object, and prose followed by a
// fenced bare array. Handle all of them: prefer a fenced block if present (found
// anywhere in the text, not just as the whole string), otherwise fall back to the
// span between the first { or [ and the last } or ].
function extractJsonCandidate(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) return fenced[1].trim();

  const start = trimmed.search(/[{[]/);
  if (start === -1) return trimmed;
  const end = Math.max(trimmed.lastIndexOf("}"), trimmed.lastIndexOf("]"));
  return end > start ? trimmed.slice(start, end + 1) : trimmed;
}

class AttemptTimeoutError extends Error {}

// The OpenAI SDK call itself has no bound on how long a single reasoning-heavy
// generation can take - one attempt alone has been observed to run past the
// route's entire 60s maxDuration, which defeats the between-attempts time budget
// below (it only checks *before* starting a new attempt, not during one). Racing
// against a timer here caps each individual attempt so the budget can actually
// govern total wall-clock time. This doesn't cancel the underlying HTTP request,
// just stops waiting on it - the abandoned call finishes or fails on its own.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new AttemptTimeoutError(`attempt exceeded ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

function isValidQuestion(q: unknown): q is TriviaQuestion {
  if (typeof q !== "object" || q === null) return false;
  const question = q as Record<string, unknown>;
  return (
    typeof question.question === "string" &&
    Array.isArray(question.options) &&
    question.options.length >= 4 &&
    question.options.every((o) => typeof o === "string") &&
    typeof question.correctIndex === "number" &&
    question.correctIndex >= 0 &&
    question.correctIndex < 4 &&
    typeof question.category === "string"
  );
}

const PER_ATTEMPT_TIMEOUT_MS = 15_000;

async function tryGenerateTrivia(): Promise<{ questions: TriviaQuestion[] | null; debug: string }> {
  const completion = await withTimeout(
    chatCompletion({
      // Generous headroom, not a tight estimate - this model spends a highly variable,
      // sometimes very large chunk of max_tokens on hidden reasoning before ever
      // emitting the answer. The per-attempt timeout below is what actually bounds
      // wall-clock time now; this just needs to be big enough that a genuinely fast
      // attempt isn't truncated.
      max_tokens: 6000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "Generate today's trivia quiz. Make it interesting and varied." },
      ],
    }),
    PER_ATTEMPT_TIMEOUT_MS
  );

  const raw = completion.choices[0]?.message?.content;
  const finishReason = completion.choices[0]?.finish_reason;
  if (!raw) return { questions: null, debug: `empty content, finish_reason=${finishReason}` };

  try {
    const parsed = JSON.parse(extractJsonCandidate(raw));
    // Accept either the requested {"questions": [...]} shape or a bare [...] array,
    // since the model sometimes drops the object wrapper despite instructions.
    const questionsArray = Array.isArray(parsed) ? parsed : parsed?.questions;
    if (!Array.isArray(questionsArray) || questionsArray.length < QUESTION_COUNT) {
      return { questions: null, debug: `bad shape: ${raw.slice(0, 500)}` };
    }
    const questions = questionsArray.slice(0, QUESTION_COUNT);
    if (!questions.every(isValidQuestion)) {
      return { questions: null, debug: `failed validation: ${raw.slice(0, 500)}` };
    }
    return {
      questions: questions.map((q: TriviaQuestion) => ({
        question: q.question,
        options: q.options.slice(0, 4),
        correctIndex: q.correctIndex,
        category: q.category,
      })),
      debug: "ok",
    };
  } catch (err) {
    return { questions: null, debug: `JSON.parse threw: ${err instanceof Error ? err.message : String(err)} | raw: ${raw.slice(0, 500)}` };
  }
}

// Leaves real headroom under the route's maxDuration (60s): worst case is roughly
// TIME_BUDGET_MS + PER_ATTEMPT_TIMEOUT_MS (an attempt can start just under the
// budget checkpoint and still run its full timeout), so 35s + 15s = 50s, leaving
// ~10s for response overhead before Vercel's hard cutoff.
const TIME_BUDGET_MS = 35_000;

export async function generateDailyTrivia(): Promise<TriviaResult> {
  if (!isAIConfigured()) return { ok: false, reason: "The trivia generator isn't configured yet" };

  const startedAt = Date.now();
  const debugLog: string[] = [];
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) {
      debugLog.push(`stopped before attempt ${attempt}, budget exhausted at ${Date.now() - startedAt}ms`);
      break;
    }
    const attemptStart = Date.now();
    try {
      const { questions, debug } = await tryGenerateTrivia();
      const ms = Date.now() - attemptStart;
      if (questions) return { ok: true, questions };
      debugLog.push(`attempt ${attempt} (${ms}ms): ${debug}`);
    } catch (err) {
      const ms = Date.now() - attemptStart;
      debugLog.push(`attempt ${attempt} (${ms}ms) threw: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // TEMPORARY (round 3): timing + reason data to find why every attempt still
  // fails in production despite the widened parser - revert once root-caused.
  return { ok: false, reason: `DEBUG: ${debugLog.join(" || ")}` };
}
