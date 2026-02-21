import type { Child } from "@/types";

export function getDinosaurRescuePrompt(child: Child): string {
  return `Create an 8-page personalized children's dinosaur rescue adventure story.

CHILD DETAILS:
- Name: ${child.name}
- Age: ${child.age}
- Interests: ${child.interests.join(", ")}
- Favorite things: ${child.favorite_things || "not specified"}
- Things to AVOID in the story: ${child.fears_to_avoid || "none specified"}
- Reading level: ${child.reading_level}

STORY STRUCTURE:
- Page 1: ${child.name} finds a mysterious fossil or portal in an unexpected place (their backyard, a park, etc.)
- Page 2: ${child.name} is transported back to the age of dinosaurs! They meet a friendly baby dinosaur
- Page 3: The baby dinosaur leads ${child.name} through a lush prehistoric jungle
- Page 4: They discover that the baby dinosaur is lost and can't find its family
- Page 5: ${child.name} and the baby dinosaur encounter a challenge on their journey (crossing a river, navigating through tall ferns, etc.)
- Page 6: ${child.name} uses their cleverness and interests to help overcome the challenge
- Page 7: They find the dinosaur's family! A heartwarming reunion. The dinosaurs show their gratitude
- Page 8: ${child.name} returns home with a special gift from their dinosaur friend, knowing they made a real difference

TONE: Adventurous, warm, brave. The dinosaurs are friendly and awe-inspiring, never scary. Make ${child.name} feel courageous and kind.

Remember: Respond with ONLY valid JSON, no markdown code blocks.`;
}
