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

async function tryGenerateTrivia(): Promise<TriviaQuestion[] | null> {
  const completion = await chatCompletion({
    max_tokens: 1200,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: "Generate today's trivia quiz. Make it interesting and varied." },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(stripCodeFence(raw));
    if (!Array.isArray(parsed.questions) || parsed.questions.length < QUESTION_COUNT) return null;
    const questions = parsed.questions.slice(0, QUESTION_COUNT);
    if (!questions.every(isValidQuestion)) return null;
    return questions.map((q: TriviaQuestion) => ({
      question: q.question,
      options: q.options.slice(0, 4),
      correctIndex: q.correctIndex,
      category: q.category,
    }));
  } catch {
    return null;
  }
}

export async function generateDailyTrivia(): Promise<TriviaResult> {
  if (!isAIConfigured()) return { ok: false, reason: "The trivia generator isn't configured yet" };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const questions = await tryGenerateTrivia();
      if (questions) return { ok: true, questions };
      console.warn(`[daily-trivia] attempt ${attempt} came back empty/malformed, retrying`);
    } catch (err) {
      console.warn(`[daily-trivia] attempt ${attempt} threw, retrying`, err);
    }
  }

  return { ok: false, reason: "Something went wrong generating today's trivia" };
}
