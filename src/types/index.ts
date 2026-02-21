export type ReadingLevel = "beginner" | "intermediate" | "advanced";

export type Region = "global" | "au" | "nz";

export type Theme =
  | "space-adventure"
  | "dinosaur-rescue"
  | "ocean-explorer"
  | "bush-adventure"
  | "reef-explorer"
  | "forest-guardian"
  | "outback-explorer";

export type ImageQuality = "fast" | "standard";

export type IllustrationStyle =
  | "watercolor"
  | "storybook"
  | "cartoon"
  | "pencil-sketch";

export interface StyleInfo {
  id: IllustrationStyle;
  name: string;
  description: string;
}

export const ILLUSTRATION_STYLES: StyleInfo[] = [
  {
    id: "watercolor",
    name: "Watercolor",
    description: "Warm, soft watercolor with bold colors and gentle lines",
  },
  {
    id: "storybook",
    name: "Classic Storybook",
    description: "Traditional picture book illustration with rich gouache textures",
  },
  {
    id: "cartoon",
    name: "Cartoon",
    description: "Bright, modern cartoon style with clean outlines",
  },
  {
    id: "pencil-sketch",
    name: "Pencil Sketch",
    description: "Gentle pencil and ink sketch with soft shading",
  },
];

export type BookStatus =
  | "generating"
  | "generating_story"
  | "generating_images"
  | "preview_ready"
  | "paid"
  | "complete"
  | "failed";

export interface Child {
  id: string;
  user_id: string;
  name: string;
  age: number;
  interests: string[];
  favorite_things: string | null;
  fears_to_avoid: string | null;
  reading_level: ReadingLevel;
  photo_urls: string[];
  created_at: string;
}

export interface Book {
  id: string;
  child_id: string;
  theme: Theme;
  region: Region;
  image_quality: ImageQuality;
  illustration_style: IllustrationStyle;
  status: BookStatus;
  character_appearance: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface BookPage {
  id: string;
  book_id: string;
  page_number: number;
  text: string;
  image_prompt: string;
  image_url: string | null;
  is_preview: boolean;
  created_at: string;
}

// Claude story generation output
export interface StoryPage {
  page_number: number;
  text: string;
  image_description: string;
}

export interface StoryOutput {
  title: string;
  character_appearance: string;
  pages: StoryPage[];
}

// Creation form data
export interface CreateBookInput {
  // Child details
  name: string;
  age: number;
  interests: string[];
  favorite_things: string;
  fears_to_avoid: string;
  reading_level: ReadingLevel;
  photos: File[];
  // Book details
  theme: Theme;
  region: Region;
  illustration_style: IllustrationStyle;
}

// Theme metadata for the picker
export interface ThemeInfo {
  id: Theme;
  name: string;
  description: string;
  emoji: string;
  color: string;
  region: Region;
}

export const THEMES: ThemeInfo[] = [
  {
    id: "space-adventure",
    name: "Space Adventure",
    description:
      "Blast off into the cosmos! Explore distant planets, meet friendly aliens, and save the galaxy.",
    emoji: "🚀",
    color: "from-indigo-500 to-purple-600",
    region: "global",
  },
  {
    id: "dinosaur-rescue",
    name: "Dinosaur Rescue",
    description:
      "Travel back in time to the age of dinosaurs! Befriend gentle giants and outsmart the fierce ones.",
    emoji: "🦕",
    color: "from-green-500 to-emerald-600",
    region: "global",
  },
  {
    id: "ocean-explorer",
    name: "Ocean Explorer",
    description:
      "Dive deep beneath the waves! Discover hidden treasures, swim with dolphins, and explore coral kingdoms.",
    emoji: "🌊",
    color: "from-cyan-500 to-blue-600",
    region: "global",
  },
  {
    id: "bush-adventure",
    name: "Australian Bush Adventure",
    description:
      "Explore the magical Australian bush! Meet koalas, kangaroos, and wombats in the land down under.",
    emoji: "🐨",
    color: "from-amber-500 to-yellow-600",
    region: "au",
  },
  {
    id: "reef-explorer",
    name: "Great Barrier Reef Explorer",
    description:
      "Dive into the world's greatest reef! Swim with sea turtles, discover coral gardens, and help protect ocean treasures.",
    emoji: "🐢",
    color: "from-teal-500 to-cyan-600",
    region: "au",
  },
  {
    id: "outback-explorer",
    name: "Outback Explorer",
    description:
      "Journey into the red heart of Australia! Discover ancient landscapes, meet curious creatures, and gaze at endless stars.",
    emoji: "🏜️",
    color: "from-orange-500 to-red-600",
    region: "au",
  },
  {
    id: "forest-guardian",
    name: "New Zealand Forest Guardian",
    description:
      "Venture into ancient native bush! Protect kiwi birds, discover glowworm caves, and explore towering kauri forests.",
    emoji: "🌿",
    color: "from-emerald-500 to-green-700",
    region: "nz",
  },
];

export const INTEREST_OPTIONS = [
  "Dinosaurs",
  "Space",
  "Animals",
  "Cars & Trucks",
  "Princesses",
  "Superheroes",
  "Nature",
  "Music",
  "Art & Drawing",
  "Sports",
  "Building & Legos",
  "Cooking",
  "Magic",
  "Robots",
  "Pirates",
];

export const AU_INTEREST_OPTIONS = [
  "Australian Animals",
  "Beach & Surfing",
  "Cricket",
  "Rugby",
  "Bushwalking",
  "Marine Life",
];

export const NZ_INTEREST_OPTIONS = [
  "New Zealand Birds",
  "Rugby",
  "Beach & Surfing",
  "Bushwalking",
  "Volcanoes",
  "Marine Life",
];

export function getInterestOptions(region: Region): string[] {
  switch (region) {
    case "au":
      return [...INTEREST_OPTIONS, ...AU_INTEREST_OPTIONS];
    case "nz":
      return [...INTEREST_OPTIONS, ...NZ_INTEREST_OPTIONS];
    default:
      return INTEREST_OPTIONS;
  }
}

export function getThemesForRegion(region: Region): ThemeInfo[] {
  return THEMES.filter((t) => t.region === "global" || t.region === region);
}
