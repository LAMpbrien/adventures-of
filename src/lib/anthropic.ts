import Anthropic from "@anthropic-ai/sdk";
import type { Child, Theme, Region, StoryOutput } from "@/types";
import { getStoryPrompt } from "@/lib/prompts/story-system";

function getClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });
}

export async function generateStory(
  child: Child,
  theme: Theme,
  region: Region = "global"
): Promise<StoryOutput> {
  const { systemPrompt, userPrompt } = getStoryPrompt(child, theme, region);

  const response = await getClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Extract JSON from the response (may be wrapped in markdown code blocks)
  let jsonStr = textContent.text;
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  // Strip trailing commas before } or ] (common LLM JSON error)
  jsonStr = jsonStr.trim().replace(/,\s*([}\]])/g, "$1");

  const story: StoryOutput = JSON.parse(jsonStr);

  if (!story.title || !story.character_appearance || !story.pages || story.pages.length !== 8) {
    throw new Error("Invalid story output format");
  }

  return story;
}
