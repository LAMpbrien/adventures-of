import type { Child } from "@/types";

export function getOceanExplorerPrompt(child: Child): string {
  return `Create an 8-page personalized children's ocean exploration adventure story.

CHILD DETAILS:
- Name: ${child.name}
- Age: ${child.age}
- Interests: ${child.interests.join(", ")}
- Favorite things: ${child.favorite_things || "not specified"}
- Things to AVOID in the story: ${child.fears_to_avoid || "none specified"}
- Reading level: ${child.reading_level}

STORY STRUCTURE:
- Page 1: ${child.name} discovers a magical seashell or meets a friendly sea creature at the beach
- Page 2: ${child.name} can suddenly breathe underwater! They dive beneath the waves into a colorful coral kingdom
- Page 3: They swim through an incredible coral reef full of amazing sea life
- Page 4: ${child.name} meets the ruler of the ocean kingdom who asks for help with a problem
- Page 5: Something is threatening the ocean (tangled kelp blocking light, a missing pearl that keeps the waters warm, etc.)
- Page 6: ${child.name} uses their unique interests and skills to come up with a creative solution
- Page 7: The ocean is saved! All the sea creatures celebrate with ${child.name}
- Page 8: ${child.name} returns to the beach with a special treasure, knowing the ocean will always welcome them back

TONE: Magical, colorful, joyful. The ocean is beautiful and welcoming, never threatening. Make ${child.name} feel like a guardian of the sea.

Remember: Respond with ONLY valid JSON, no markdown code blocks.`;
}
