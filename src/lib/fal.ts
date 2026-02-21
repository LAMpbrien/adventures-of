import { fal } from "@fal-ai/client";
import type { ImageQuality } from "@/types";

let configured = false;
function ensureConfig() {
  if (!configured) {
    fal.config({ credentials: process.env.FAL_KEY! });
    configured = true;
  }
}

const STYLE_PREFIX =
  "Create a wide, full-scene children's book illustration in a warm watercolor style with bold colors and gentle lines. Show the entire environment as a panoramic landscape scene — include the sky, ground, background details, and surrounding scenery. The child should be shown within the scene, not as a close-up portrait. Frame it like a double-page spread in a high-quality children's picture book.";

interface GenerateIllustrationInput {
  photoUrl: string;
  childName: string;
  childAge: number;
  sceneDescription: string;
  quality?: ImageQuality;
}

interface FalResult {
  data: {
    images: Array<{ url: string }>;
  };
}

export async function generateIllustration(
  input: GenerateIllustrationInput
): Promise<string> {
  ensureConfig();
  const prompt = `${STYLE_PREFIX} The child in the photo is ${input.childName}, age ${input.childAge}. Scene: ${input.sceneDescription}`;
  const quality = input.quality ?? "standard";

  const falInput = {
    prompt,
    image_url: input.photoUrl,
    guidance_scale: 3.5,
    aspect_ratio: "16:9",
    output_format: quality === "fast" ? "jpeg" : "png",
  };

  console.log("[fal] Generating illustration:", {
    model: "fal-ai/flux-pro/kontext",
    image_url: input.photoUrl.substring(0, 80) + "...",
    quality,
    output_format: falInput.output_format,
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (await fal.subscribe("fal-ai/flux-pro/kontext" as any, {
      input: falInput,
    } as any)) as FalResult;

    if (!result.data.images?.[0]?.url) {
      console.error("[fal] No image in response:", JSON.stringify(result));
      throw new Error("No image returned from fal.ai");
    }

    return result.data.images[0].url;
  } catch (err) {
    console.error("[fal] Generation failed:", err);
    throw err;
  }
}
