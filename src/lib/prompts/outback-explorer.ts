import type { Child } from "@/types";

export function getOutbackExplorerPrompt(child: Child): string {
  return `Create an 8-page personalized children's Australian outback adventure story.

CHILD DETAILS:
- Name: ${child.name}
- Age: ${child.age}
- Interests: ${child.interests.join(", ")}
- Favourite things: ${child.favorite_things || "not specified"}
- Things to AVOID in the story: ${child.fears_to_avoid || "none specified"}
- Reading level: ${child.reading_level}

STORY STRUCTURE:
- Page 1: ${child.name} finds a smooth, ancient red stone that begins to glow warm in their hand, and the world around them shimmers into the vast Australian outback
- Page 2: ${child.name} stands beneath an enormous red rock formation under a brilliant blue sky. A curious bilby with big ears pops up from a burrow and says hello
- Page 3: The bilby leads ${child.name} across red sand plains dotted with spinifex grass and desert oaks. They spot a thorny devil and a perentie goanna sunning on a rock
- Page 4: At a desert waterhole, ${child.name} meets a wise wedge-tailed eagle who explains that the ancient rock paintings nearby are fading, and with them, the stories of the land
- Page 5: ${child.name} and the bilby journey through a gorge with towering red rock walls, past ghost gums and desert wildflowers blooming after rain
- Page 6: ${child.name} uses their unique interests and imagination to help restore the colours and stories of the ancient rock art
- Page 7: As the paintings glow with renewed colour, the outback comes alive with celebration — emus run across the plains, kangaroos bound under a sky turning orange and pink at sunset
- Page 8: Night falls and ${child.name} lies on the warm red earth gazing up at the most spectacular starry sky, the Milky Way blazing overhead. They return home with the red stone, a piece of the outback always with them

SETTING DETAILS:
- Australian outback: vast red desert plains, dramatic rock formations, gorges, waterholes
- Flora: spinifex grass, desert oaks, ghost gums, Sturt's desert pea, desert wildflowers
- Fauna: bilbies, wedge-tailed eagles, emus, red kangaroos, thorny devils, perentie goannas, dingoes (friendly)
- Features: ancient rock art, red earth, dramatic sunsets, brilliant starry skies, the Milky Way
- Use Australian English spelling throughout (colour, favourite, mum, etc.)

TONE: Awe-inspiring, warm, vast. The outback is ancient and magnificent, never harsh or dangerous. Make ${child.name} feel connected to the ancient heart of Australia.

Remember: Respond with ONLY valid JSON, no markdown code blocks.`;
}
