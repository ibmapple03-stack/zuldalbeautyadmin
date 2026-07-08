import { CategorySlug } from "./types";

interface CategoryStyle {
  gradient: string;
  textClass: string;
}

export const categoryStyles: Record<CategorySlug, CategoryStyle> = {
  women: {
    gradient: "from-brand-gold/40 via-brand-cream to-brand-white",
    textClass: "text-brand-black",
  },
  men: {
    gradient: "from-brand-black via-brand-brown to-brand-gold",
    textClass: "text-brand-white",
  },
  wellness: {
    gradient: "from-brand-brown/20 via-brand-cream to-brand-white",
    textClass: "text-brand-black",
  },
  perfumes: {
    gradient: "from-brand-black via-brand-black/90 to-brand-brown",
    textClass: "text-brand-white",
  },
  "turaren-wuta": {
    gradient: "from-brand-brown via-brand-gold-dark to-brand-gold",
    textClass: "text-brand-white",
  },
};
