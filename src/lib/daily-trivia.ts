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
  'options. Respond with ONLY a valid JSON object, no markdown formatting, no code fences, no text outside ' +
  `the JSON, in exactly this shape: {"questions": [{"question": string, "options": [string, string, string, ` +
  'string], "correctIndex": number, "category": string}, ...]}. Exactly ' +
  `${QUESTION_COUNT} questions. "question" is under 20 words. Each of the 4 "options" is short, under 8 words. ` +
  '"correctIndex" is the 0-based index into "options" of the right answer. "category" is ' +
  "one or two words naming the topic.";

const MAX_ATTEMPTS = 3;

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
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
    max_tokens: 1200,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: "Generate today's trivia quiz. Make it interesting and varied." },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  const finishReason = completion.choices[0]?.finish_reason;
  if (!raw) return { questions: null, debug: `empty content, finish_reason=${finishReason}` };

  try {
    const parsed = JSON.parse(stripCodeFence(raw));
    if (!Array.isArray(parsed.questions) || parsed.questions.length < QUESTION_COUNT) {
      return { questions: null, debug: `bad shape: ${raw.slice(0, 500)}` };
    }
    const questions = parsed.questions.slice(0, QUESTION_COUNT);
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

  // TEMPORARY: surfacing real failure detail to debug a live production issue
  // (works locally against both providers, fails consistently in prod) - revert
  // to a plain user-facing message once root-caused.
  return { ok: false, reason: `DEBUG: ${debugLog.join(" || ")}` };
}
