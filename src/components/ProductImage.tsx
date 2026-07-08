import { Product } from "@/lib/types";
import { categoryStyles } from "@/lib/theme";
import Icon from "./icons";

export default function ProductImage({
  product,
  className = "",
  imageIndex = 0,
}: {
  product: Pick<Product, "name" | "category" | "icon"> &
    Partial<Pick<Product, "imageUrls">>;
  className?: string;
  imageIndex?: number;
}) {
  const style = categoryStyles[product.category];
  const initials = product.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const src = product.imageUrls?.[imageIndex];

  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URLs, not local assets */}
        <img
          src={src}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${style.gradient} ${className}`}
    >
      <Icon
        name={product.icon}
        className={`absolute -bottom-3 -right-3 h-20 w-20 opacity-20 ${style.textClass}`}
      />
      <span
        className={`font-heading text-3xl md:text-4xl tracking-wide ${style.textClass}`}
      >
        {initials}
      </span>
    </div>
  );
}
