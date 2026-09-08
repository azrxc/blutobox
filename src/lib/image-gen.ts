// Image generation is a genuinely different cost tier from text (cents per image,
// not fractions of a cent), so this is only used where generation happens once for
// everyone (Daily Character: one image per calendar day, site-wide) - never per
// viewer. Uses OpenRouter's dedicated /v1/images endpoint (not the chat completions
// endpoint the OpenAI SDK client is built around), same OPENROUTER_API_KEY as
// everything else in src/lib/deepseek.ts, no separate account needed.
const IMAGE_MODEL = "black-forest-labs/flux.2-klein-4b"; // cheapest reasonable option, ~$0.014/image at 1MP

export type ImageResult = { ok: true; dataUrl: string } | { ok: false; reason: string };

export async function generatePortraitImage(description: string): Promise<ImageResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { ok: false, reason: "Image generation isn't configured yet" };

  try {
    const res = await fetch("https://openrouter.ai/api/v1/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://blutobox.com",
        "X-Title": "Bluto Box",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt:
          `Modern webtoon-style illustration, clean linework, semi-realistic proportions, polished professional ` +
          `character art, dynamic lighting. ${description} ` +
          "Family-friendly, safe for all ages, wholesome, no violence, no suggestive or explicit content.",
        n: 1,
        aspect_ratio: "1:1",
        output_format: "png",
      }),
    });

    if (!res.ok) {
      console.error("[image-gen] request failed", res.status, await res.text().catch(() => ""));
      return { ok: false, reason: "Image generation request failed" };
    }

    const data = await res.json();
    const image = data?.data?.[0];
    if (!image?.b64_json) return { ok: false, reason: "Image generation came back empty" };

    const mediaType = image.media_type ?? "image/png";
    return { ok: true, dataUrl: `data:${mediaType};base64,${image.b64_json}` };
  } catch (err) {
    console.error("[image-gen] generation failed", err);
    return { ok: false, reason: "Something went wrong generating the image" };
  }
}
