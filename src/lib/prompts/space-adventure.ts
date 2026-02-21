import type { Child } from "@/types";

export function getSpaceAdventurePrompt(child: Child): string {
  return `Create an 8-page personalized children's space adventure story.

CHILD DETAILS:
- Name: ${child.name}
- Age: ${child.age}
- Interests: ${child.interests.join(", ")}
- Favorite things: ${child.favorite_things || "not specified"}
- Things to AVOID in the story: ${child.fears_to_avoid || "none specified"}
- Reading level: ${child.reading_level}

STORY STRUCTURE:
- Page 1: ${child.name} discovers something magical that transports them to space (a glowing star map, a friendly robot messenger, etc.)
- Page 2: ${child.name} arrives at their spaceship and meets a friendly alien co-pilot
- Page 3: They blast off and fly through a beautiful nebula or asteroid field
- Page 4: They arrive at a mysterious planet that needs help (the planet reflects ${child.name}'s interests)
- Page 5: ${child.name} discovers the problem the planet faces
- Page 6: ${child.name} comes up with a clever solution using their unique skills and interests
- Page 7: ${child.name} saves the day! The planet celebrates
- Page 8: ${child.name} returns home as a hero, knowing they can always go back to the stars

TONE: Wonder, bravery, discovery. Make ${child.name} feel like the most important person in the galaxy.

Remember: Respond with ONLY valid JSON, no markdown code blocks.`;
}
