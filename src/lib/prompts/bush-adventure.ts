import type { Child } from "@/types";

export function getBushAdventurePrompt(child: Child): string {
  return `Create an 8-page personalized children's Australian bush adventure story.

CHILD DETAILS:
- Name: ${child.name}
- Age: ${child.age}
- Interests: ${child.interests.join(", ")}
- Favourite things: ${child.favorite_things || "not specified"}
- Things to AVOID in the story: ${child.fears_to_avoid || "none specified"}
- Reading level: ${child.reading_level}

STORY STRUCTURE:
- Page 1: ${child.name} discovers a golden gum leaf glowing at the base of a tall eucalyptus tree in an Australian bush setting
- Page 2: A friendly joey hops out of the scrub and beckons ${child.name} to follow deeper into the bush. The sounds of kookaburras and bellbirds fill the air
- Page 3: They reach a magical billabong surrounded by tree ferns, where a wise old platypus surfaces and tells them the bush needs help
- Page 4: The bush animals gather — wombats, echidnas, cockatoos, and a shy koala — and explain that the ancient waterhole that feeds the bush is fading
- Page 5: ${child.name} and the joey journey through towering gum trees, past banksia flowers and grasstrees, following a trail of glowing golden leaves
- Page 6: ${child.name} uses their unique interests and cleverness to restore the waterhole and bring water flowing back through the bush
- Page 7: The bush bursts back to life! Kookaburras laugh from the treetops, kangaroos bound through the grass, and the koala finally comes down to celebrate with ${child.name}
- Page 8: ${child.name} returns home carrying the golden gum leaf, which will always smell like eucalyptus and remind them of their friends in the Australian bush

SETTING DETAILS:
- Australian bush landscape: eucalyptus forests, red earth, billabongs, sandstone rocks
- Native flora: gum trees, banksia, bottlebrush, grasstrees (Xanthorrhoea), tree ferns, wattle
- Native fauna: kangaroos, joeys, koalas, wombats, platypus, echidnas, kookaburras, cockatoos, goannas, possums
- Use Australian English spelling throughout (colour, favourite, mum, etc.)

TONE: Warm, adventurous, distinctly Australian. The bush is beautiful and welcoming. Make ${child.name} feel like a true friend of the Australian bush and its creatures.

Remember: Respond with ONLY valid JSON, no markdown code blocks.`;
}
