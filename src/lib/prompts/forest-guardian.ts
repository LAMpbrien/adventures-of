import type { Child } from "@/types";

export function getForestGuardianPrompt(child: Child): string {
  return `Create an 8-page personalized children's New Zealand native forest adventure story.

CHILD DETAILS:
- Name: ${child.name}
- Age: ${child.age}
- Interests: ${child.interests.join(", ")}
- Favourite things: ${child.favorite_things || "not specified"}
- Things to AVOID in the story: ${child.fears_to_avoid || "none specified"}
- Reading level: ${child.reading_level}

STORY STRUCTURE:
- Page 1: ${child.name} discovers a glowing silver fern frond on the edge of a New Zealand native bush. When they pick it up, the forest seems to whisper their name
- Page 2: A small, shy kiwi bird waddles out from beneath the ferns and nudges ${child.name}'s hand. It needs their help — the ancient forest is in trouble
- Page 3: The kiwi leads ${child.name} deeper into the bush, past towering ponga ferns and ancient moss-covered trees. A friendly fantail (piwakawaka) flits alongside them, fanning its tail
- Page 4: They arrive at a massive kauri tree — the oldest tree in the forest — and meet a wise tuatara resting among its roots. The tuatara explains that a magical spring that feeds the forest has gone quiet
- Page 5: ${child.name} follows a stream through a glowworm cave, its ceiling twinkling with thousands of tiny blue-green lights like an underground sky of stars
- Page 6: ${child.name} uses their unique interests and creativity to awaken the magical spring and send fresh water flowing back through the forest
- Page 7: The forest bursts with life! Tui birds sing from the treetops, the kauri tree stands taller, and kereru (wood pigeons) swoop through the canopy. The kiwi does a happy dance
- Page 8: ${child.name} emerges from the bush at dusk, the silver fern frond now a keepsake. They know that as a guardian of the forest, they can always return to this magical place

SETTING DETAILS:
- New Zealand native bush (forest): dense, lush, ancient, moss-covered
- Flora: kauri trees, ponga (silver fern/tree fern), rimu, rata, nikau palms, mosses and lichens
- Fauna: kiwi birds, tuatara, fantail (piwakawaka), tui, kereru (wood pigeon), weta (friendly), morepork (ruru owl)
- Features: glowworm caves, fern-lined streams, ancient tree roots, misty bush trails
- Use New Zealand English spelling throughout (colour, favourite, mum, etc.)
- Include te reo Maori names for creatures in brackets where natural (e.g., fantail/piwakawaka, wood pigeon/kereru)

TONE: Enchanting, gentle, mysterious. The native bush is ancient and magical, full of wonder. Make ${child.name} feel like a true kaitiaki (guardian) of Aotearoa's native forest.

Remember: Respond with ONLY valid JSON, no markdown code blocks.`;
}
