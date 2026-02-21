import { fal } from "@fal-ai/client";
import type { ImageQuality, IllustrationStyle } from "@/types";

let configured = false;
function ensureConfig() {
  if (!configured) {
    fal.config({ credentials: process.env.FAL_KEY! });
    configured = true;
  }
}

const COMPOSITION_BASE =
  "Show the entire environment as an immersive panoramic landscape scene that fills the entire image edge to edge. There must be NO book spine, NO page edges, NO page curl, NO open book effect, NO border, NO frame — just a single continuous scene. The image must contain NO text, NO words, NO letters, NO numbers, NO captions, NO titles, NO speech bubbles, NO writing of any kind — purely visual illustration only. IMPORTANT COMPOSITION: Place all characters, action, and key details in the center of the image and toward the top-right and bottom-left areas. The child should be shown within the scene, not as a close-up portrait. The scene should feel like a full world the viewer is stepping into.";

const STYLE_PROMPTS: Record<IllustrationStyle, string> = {
  watercolor: `Create a wide, full-scene illustration in a warm watercolor style with bold colors and gentle lines. ${COMPOSITION_BASE} Keep the TOP-LEFT corner and BOTTOM-RIGHT corner simple and clear with soft washes, wet-on-wet bleeds, or pale color gradients.`,
  storybook: `Create a wide, full-scene illustration in a classic gouache style with rich textures, layered details, and a timeless hand-painted feel. ${COMPOSITION_BASE} Keep the TOP-LEFT corner and BOTTOM-RIGHT corner simple and clear with broad painted strokes, matte color fields, or textured paper tones.`,
  cartoon: `Create a wide, full-scene illustration in a bright, modern cartoon style with clean outlines, vivid flat colors, and expressive characters. ${COMPOSITION_BASE} Keep the TOP-LEFT corner and BOTTOM-RIGHT corner simple and clear with solid flat color fills or simple cel-shaded shapes.`,
  "pencil-sketch": `Create a wide, full-scene illustration in a gentle pencil and ink sketch style with soft cross-hatching, delicate shading, and a hand-drawn warmth. ${COMPOSITION_BASE} Keep the TOP-LEFT corner and BOTTOM-RIGHT corner simple and clear with light hatching, open white space, or faint graphite tones.`,
};

interface GenerateIllustrationInput {
  photoUrl: string;
  childName: string;
  childAge: number;
  sceneDescription: string;
  quality?: ImageQuality;
  illustrationStyle?: IllustrationStyle;
  characterAppearance?: string;
  isChainedReference?: boolean;
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
  const stylePrefix = STYLE_PROMPTS[input.illustrationStyle ?? "watercolor"];

  const characterBlock = input.characterAppearance
    ? ` CHARACTER SHEET: ${input.characterAppearance}`
    : "";

  let referenceBlock: string;
  if (input.isChainedReference) {
    referenceBlock = ` REFERENCE IMAGE: This is a previous illustration of ${input.childName}. Maintain the EXACT same character design — same face, same hair, same body proportions, same illustration style. IGNORE the background and scene from the reference — only use it to keep the character's appearance consistent. The scene description below specifies what the child is wearing and doing — follow it precisely.`;
  } else {
    referenceBlock = ` REFERENCE PHOTO: Use the child's photo ONLY to capture their facial likeness — face shape, eyes, hair color, hair style, skin tone, and expression. IGNORE the clothing, graphics, logos, or patterns on their clothes in the photo. The scene description specifies exactly what the child is wearing — follow that outfit description precisely.`;
  }

  const prompt = `${stylePrefix}${referenceBlock}${characterBlock} The child is ${input.childName}, age ${input.childAge}. Scene: ${input.sceneDescription}`;
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
    chained: !!input.isChainedReference,
    hasCharacterSheet: !!input.characterAppearance,
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
