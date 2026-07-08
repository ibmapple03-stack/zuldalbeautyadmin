import { Category, IconName } from "./types";

export const productIcons: IconName[] = [
  "leaf",
  "droplet",
  "shield",
  "sparkles",
  "heart",
  "bottle",
  "jar",
  "dumbbell",
  "flame",
];

export const categories: Category[] = [
  {
    slug: "women",
    name: "Women's Beauty",
    tagline: "Skincare, makeup & haircare",
    description:
      "Carefully selected skincare, makeup and haircare essentials for every skin tone and skin type.",
    icon: "sparkles",
  },
  {
    slug: "men",
    name: "Men's Grooming",
    tagline: "Skincare & grooming for him",
    description:
      "Grooming, skincare and self-care essentials made for men — because beauty is for everyone.",
    icon: "leaf",
  },
  {
    slug: "wellness",
    name: "Wellness",
    tagline: "Feel good, inside and out",
    description:
      "Supplements, self-care rituals and wellness tools to support your mind and body.",
    icon: "dumbbell",
  },
  {
    slug: "perfumes",
    name: "Perfumes",
    tagline: "Signature scents & EDPs",
    description:
      "Designer-inspired and niche fragrances, curated for long-lasting, unforgettable scent.",
    icon: "bottle",
  },
  {
    slug: "turaren-wuta",
    name: "Turaren Wuta",
    tagline: "Traditional Hausa fragrance oils",
    description:
      "Authentic turaren wuta, bakhoor and oil-based attars rooted in Northern Nigerian tradition.",
    icon: "flame",
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
