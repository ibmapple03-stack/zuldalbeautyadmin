import { supabase } from "./supabase";
import { Product, CategorySlug, ProductStats } from "./types";
import { rowToProduct, ProductRow, ProductInput, productToRow } from "./productMappers";
import { sanitizeSearchTerm } from "./search";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating";

export async function fetchProductsPage(opts: {
  category?: CategorySlug;
  search?: string;
  sort?: SortKey;
  page: number;
  pageSize: number;
}): Promise<{ products: Product[]; totalCount: number }> {
  const { category, search, sort = "featured", page, pageSize } = opts;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("products").select("*", { count: "exact" });

  if (category) query = query.eq("category", category);
  if (search && search.trim()) {
    const term = sanitizeSearchTerm(search);
    if (term) query = query.or(`name.ilike.%${term}%,brand.ilike.%${term}%`);
  }

  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Failed to fetch products:", error.message);
    return { products: [], totalCount: 0 };
  }

  return {
    products: (data as ProductRow[]).map(rowToProduct),
    totalCount: count ?? 0,
  };
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Failed to fetch product:", error.message);
    return null;
  }
  return rowToProduct(data as ProductRow);
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("products").select("*").in("id", ids);

  if (error || !data) {
    if (error) console.error("Failed to fetch products by id:", error.message);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) console.error("Failed to fetch featured products:", error.message);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function fetchRelatedProducts(
  category: CategorySlug,
  excludeId: string,
  limit = 4
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .neq("id", excludeId)
    .limit(limit);

  if (error || !data) {
    if (error) console.error("Failed to fetch related products:", error.message);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function fetchRecentProducts(limit = 5): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) console.error("Failed to fetch recent products:", error.message);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export function slugifyProductId(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Date.now().toString(36).slice(-4);
  return `${base || "product"}-${suffix}`;
}

export async function createProduct(input: ProductInput): Promise<{ error: string | null }> {
  const { error } = await supabase.from("products").insert(productToRow(input));
  return { error: error?.message ?? null };
}

export async function updateProduct(input: ProductInput): Promise<{ error: string | null }> {
  const { id, ...rest } = productToRow(input);
  const { error } = await supabase.from("products").update(rest).eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteProduct(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  return { error: error?.message ?? null };
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadProductImage(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { url: null, error: "Only JPG, PNG, WEBP or GIF images are allowed." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { url: null, error: "Images must be 5MB or smaller." };
  }

  const ext = file.type.split("/")[1];
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export async function deleteProductImages(urls: string[]): Promise<void> {
  const paths = urls
    .map((url) => url.split("/product-images/")[1])
    .filter((p): p is string => Boolean(p));
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from("product-images").remove(paths);
  if (error) console.error("Failed to delete product images:", error.message);
}

export async function fetchProductStats(): Promise<ProductStats | null> {
  const { data, error } = await supabase.rpc("product_stats").single();

  if (error || !data) {
    if (error) console.error("Failed to fetch product stats:", error.message);
    return null;
  }

  const row = data as {
    total_products: number;
    inventory_value: number;
    low_stock: number;
    out_of_stock: number;
  };

  return {
    totalProducts: Number(row.total_products),
    inventoryValue: Number(row.inventory_value),
    lowStock: Number(row.low_stock),
    outOfStock: Number(row.out_of_stock),
  };
}

