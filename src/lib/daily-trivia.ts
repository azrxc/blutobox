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
  'last character must be "}", nothing before or after it, no markdown formatting, no code fences, no ' +
  `explanation. Exactly this shape: {"questions": [{"question": string, "options": [string, string, string, ` +
  'string], "correctIndex": number, "category": string}, ...]}. Exactly ' +
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

async function tryGenerateTrivia(): Promise<{ questions: TriviaQuestion[] | null; debug: string }> {
  const completion = await chatCompletion({
    // Generous headroom, not a tight estimate - this model spends a variable, often
    // large chunk of max_tokens on hidden reasoning before ever emitting the answer
    // (observed 275 reasoning tokens vs ~190 real content for a lucky run locally,
    // and a full budget-exhausted empty response from a slower host in production).
    // A tighter cap here reproduces the exact "finish_reason=length, empty content"
    // failure this was debugged from.
    max_tokens: 3000,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: "Generate today's trivia quiz. Make it interesting and varied." },
    ],
  });

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

export async function generateDailyTrivia(): Promise<TriviaResult> {
  if (!isAIConfigured()) return { ok: false, reason: "The trivia generator isn't configured yet" };

  const debugLog: string[] = [];
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { questions, debug } = await tryGenerateTrivia();
      if (questions) return { ok: true, questions };
      debugLog.push(`attempt ${attempt}: ${debug}`);
    } catch (err) {
      debugLog.push(`attempt ${attempt} threw: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // TEMPORARY (round 2): confirming the widened parser + 5-attempt budget actually
  // resolves this in production before reverting to a plain user-facing message.
  return { ok: false, reason: `DEBUG: ${debugLog.join(" || ")}` };
}
