import { Product } from "./types";

export interface ProductRow {
  id: string;
  name: string;
  brand: string;
  category: Product["category"];
  price: number;
  cost_price: number | null;
  compare_at_price: number | null;
  short_description: string;
  description: string;
  tags: string[];
  icon: Product["icon"];
  image_urls: string[];
  stock: number;
  rating: number;
  reviews_count: number;
  featured: boolean;
  created_at: string;
}

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: row.price,
    costPrice: row.cost_price ?? undefined,
    compareAtPrice: row.compare_at_price ?? undefined,
    shortDescription: row.short_description,
    description: row.description,
    tags: row.tags,
    icon: row.icon,
    imageUrls: row.image_urls ?? [],
    stock: row.stock,
    rating: row.rating,
    reviewsCount: row.reviews_count,
    featured: row.featured,
    createdAt: row.created_at,
  };
}

export type ProductInput = Omit<Product, "createdAt">;

export function productToRow(product: ProductInput) {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: product.price,
    cost_price: product.costPrice ?? null,
    compare_at_price: product.compareAtPrice ?? null,
    short_description: product.shortDescription,
    description: product.description,
    tags: product.tags,
    icon: product.icon,
    image_urls: product.imageUrls,
    stock: product.stock,
    rating: product.rating,
    reviews_count: product.reviewsCount,
    featured: product.featured ?? false,
  };
}
