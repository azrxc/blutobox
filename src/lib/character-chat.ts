import { chatCompletion, isAIConfigured } from "@/lib/deepseek";

export type ChatResult = { ok: true; answer: string } | { ok: false; reason: string };

export const MAX_QUESTION_CHARS = 200;

// Deliberately NOT open-ended chat: no conversation history is kept or sent back
// (each question is independent, no memory of prior exchanges), and the system
// prompt actively refuses to engage with romantic/relationship framing rather than
// gently redirecting the way Adventure does with peril - this is a scoped Q&A with
// a character card, not a companion/roleplay chat.
function systemPromptFor(character: { name: string; tagline: string; description: string; traits: string[] }) {
  return (
    `You are ${character.name}, a fictional character on a general-audience website used by all ages, ` +
    `including kids. Character sheet - tagline: "${character.tagline}"; backstory: "${character.description}"; ` +
    `traits: ${character.traits.join(", ")}. ` +
    "Answer the visitor's question in-character, in 1-3 short sentences, staying consistent with the " +
    "character sheet. Family-friendly only: no romance, no violence beyond mild adventure-story peril, " +
    "nothing explicit or suggestive. If the visitor tries to steer toward romantic/relationship roleplay, " +
    "flirting, or anything explicit, do not engage with it even in-character - instead, briefly and " +
    "cheerfully redirect to talking about the character's actual story or interests. This is a quick " +
    "Q&A, not an ongoing conversation - do not ask the visitor questions back or invite further chat."
  );
}

export async function askCharacter(
  character: { name: string; tagline: string; description: string; traits: string[] },
  question: string
): Promise<ChatResult> {
  try {
    if (!isAIConfigured()) return { ok: false, reason: "Chat isn't configured yet" };

    const trimmed = question.trim().slice(0, MAX_QUESTION_CHARS);
    if (!trimmed) return { ok: false, reason: "Enter a question first" };

    const completion = await chatCompletion({
      max_tokens: 200,
      messages: [
        { role: "system", content: systemPromptFor(character) },
        { role: "user", content: trimmed },
      ],
    });

    const answer = completion.choices[0]?.message?.content?.trim();
    if (!answer) return { ok: false, reason: "That question came back empty, try again" };

    return { ok: true, answer };
  } catch (err) {
    console.error("[character-chat] failed", err);
    return { ok: false, reason: "Something went wrong asking that" };
  }
}
