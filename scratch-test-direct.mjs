import OpenAI from "openai";

const apiKey = process.env.DEEPSEEK_API_KEY;
const client = new OpenAI({ apiKey, baseURL: "https://api.deepseek.com" });

try {
  const completion = await client.chat.completions.create({
    model: "deepseek-v4-flash",
    max_tokens: 100,
    messages: [{ role: "user", content: "Say hello in one word." }],
  });
  console.log("SUCCESS:", completion.choices[0]?.message?.content);
} catch (err) {
  console.log("FAILED");
  console.log("status:", err?.status);
  console.log("message:", err?.message);
  console.log("error body:", JSON.stringify(err?.error ?? err, null, 2));
}
