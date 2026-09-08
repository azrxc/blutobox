import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;
const client = new OpenAI({
  apiKey,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: { "HTTP-Referer": "https://blutobox.com", "X-Title": "Bluto Box" },
});

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

const completion = await client.chat.completions.create({
  model: "deepseek/deepseek-v4-flash",
  provider: { sort: "price" },
  max_tokens: 1200,
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: "Generate today's trivia quiz. Make it interesting and varied." },
  ],
});

console.log("finish_reason:", completion.choices[0]?.finish_reason);
console.log("RAW CONTENT:");
console.log(completion.choices[0]?.message?.content);
console.log("--- usage ---");
console.log(completion.usage);
