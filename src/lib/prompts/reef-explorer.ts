import type { Child } from "@/types";

export function getReefExplorerPrompt(child: Child): string {
  return `Create an 8-page personalized children's Great Barrier Reef adventure story.

CHILD DETAILS:
- Name: ${child.name}
- Age: ${child.age}
- Interests: ${child.interests.join(", ")}
- Favourite things: ${child.favorite_things || "not specified"}
- Things to AVOID in the story: ${child.fears_to_avoid || "none specified"}
- Reading level: ${child.reading_level}

STORY STRUCTURE:
- Page 1: ${child.name} is on a beach in tropical Queensland when they find a shimmering shell that lets them breathe underwater
- Page 2: ${child.name} dives beneath the turquoise waves and enters the Great Barrier Reef — an explosion of colour with coral towers, sea fans, and swaying anemones
- Page 3: A friendly green sea turtle glides up and invites ${child.name} to explore. They swim past giant clams, schools of clownfish, and graceful manta rays
- Page 4: The turtle brings ${child.name} to meet a wise old dugong, the gentle guardian of the reef, who explains that a section of coral is losing its colour and needs help
- Page 5: ${child.name} and the turtle travel through underwater canyons and coral gardens to find the fading reef. They pass parrotfish, sea stars, and curious octopuses along the way
- Page 6: ${child.name} uses their unique interests and creativity to help restore the coral and bring the brilliant colours back to the reef
- Page 7: The reef glows with life again! Dolphins leap, turtles dance, and all the reef creatures gather to celebrate with ${child.name}
- Page 8: ${child.name} surfaces back on the beach at sunset, keeping the shell as a reminder that the Great Barrier Reef will always welcome them back

SETTING DETAILS:
- Great Barrier Reef, Queensland, Australia
- Marine life: green sea turtles, clownfish, dugongs, manta rays, parrotfish, giant clams, sea stars, dolphins, octopuses, whale sharks
- Coral types: staghorn coral, brain coral, sea fans, anemones
- Tropical Australian setting: warm turquoise waters, white sand beaches, palm trees
- Use Australian English spelling throughout (colour, favourite, mum, etc.)

TONE: Magical, colourful, wonder-filled. The reef is vibrant and welcoming, never threatening. Make ${child.name} feel like a guardian of the Great Barrier Reef.

Remember: Respond with ONLY valid JSON, no markdown code blocks.`;
}
