"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { categories, productIcons } from "@/lib/categories";
import {
  createProduct,
  deleteProduct,
  deleteProductImages,
  slugifyProductId,
  updateProduct,
  uploadProductImage,
} from "@/lib/productQueries";
import { ProductInput } from "@/lib/productMappers";
import { formatNaira } from "@/lib/format";
import Icon from "@/components/icons";
import ProductImage from "@/components/ProductImage";

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [category, setCategory] = useState<Product["category"]>(product?.category ?? "women");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [costPrice, setCostPrice] = useState(
    product?.costPrice ? String(product.costPrice) : ""
  );
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice ? String(product.compareAtPrice) : ""
  );
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [tags, setTags] = useState(product?.tags?.join(", ") ?? "");
  const [icon, setIcon] = useState<Product["icon"]>(product?.icon ?? "jar");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "0");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [imageUrls, setImageUrls] = useState<string[]>(product?.imageUrls ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const { url, error: uploadError } = await uploadProductImage(file);
      if (uploadError) {
        setError(uploadError);
        continue;
      }
      if (url) urls.push(url);
    }
    setImageUrls((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
    deleteProductImages([url]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const priceValue = Number(price);
    const stockValue = Number(stock);
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setError("Price must be a number greater than 0.");
      return;
    }
    if (!Number.isFinite(stockValue) || stockValue < 0) {
      setError("Stock must be a number of 0 or more.");
      return;
    }
    if (costPrice && (!Number.isFinite(Number(costPrice)) || Number(costPrice) < 0)) {
      setError("Cost price must be a number of 0 or more.");
      return;
    }

    setSaving(true);

    const input: ProductInput = {
      id: product?.id ?? slugifyProductId(name),
      name,
      brand,
      category,
      price: priceValue,
      costPrice: costPrice ? Number(costPrice) : undefined,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      shortDescription,
      description,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      icon,
      imageUrls,
      stock: stockValue,
      rating: product?.rating ?? 4.5,
      reviewsCount: product?.reviewsCount ?? 0,
      featured,
    };

    const { error: saveError } = isEdit ? await updateProduct(input) : await createProduct(input);

    if (saveError) {
      setError(saveError);
      setSaving(false);
      return;
    }

    router.push("/products");
  }

  async function handleDelete() {
    if (!product) return;
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    setDeleting(true);
    const { error: deleteError } = await deleteProduct(product.id);
    if (!deleteError) await deleteProductImages(product.imageUrls);
    if (deleteError) {
      setError(deleteError);
      setDeleting(false);
      return;
    }
    router.push("/products");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className="rounded-2xl border border-brand-black/10 bg-brand-white p-6">
        <h2 className="font-heading text-lg text-brand-black">Basic Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Product Name" required>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Brand" required>
            <input
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Category" required>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Product["category"])}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Icon (fallback when no photo)" required>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value as Product["icon"])}
              className={inputClass}
            >
              {productIcons.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price (₦)" required>
            <input
              required
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Cost Price (₦)">
            <input
              type="number"
              min={0}
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="What you pay per unit"
              className={inputClass}
            />
            {costPrice && price && Number.isFinite(Number(costPrice)) && Number.isFinite(Number(price)) && (
              <span className="text-xs text-brand-black/50">
                Profit per unit: {formatNaira(Number(price) - Number(costPrice))}
                {Number(price) > 0 &&
                  ` (${Math.round(((Number(price) - Number(costPrice)) / Number(price)) * 100)}% margin)`}
              </span>
            )}
          </Field>
          <Field label="Compare-at Price (₦)">
            <input
              type="number"
              min={0}
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              placeholder="Optional original price"
              className={inputClass}
            />
          </Field>
          <Field label="Stock Quantity" required>
            <input
              required
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Tags (comma separated)">
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Natural, Hydrating, Long Wear"
              className={inputClass}
            />
          </Field>
          <label className="flex items-center gap-2 pt-1 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="accent-brand-gold"
            />
            <span className="text-brand-black/70">Feature on the storefront homepage</span>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-black/10 bg-brand-white p-6">
        <h2 className="font-heading text-lg text-brand-black">Descriptions</h2>
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Short Description" required>
            <input
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Full Description" required>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-black/10 bg-brand-white p-6">
        <h2 className="font-heading text-lg text-brand-black">Photos</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {imageUrls.map((url) => (
            <div key={url} className="relative h-24 w-24 overflow-hidden rounded-xl border border-brand-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-black/60 text-brand-white"
              >
                <Icon name="close" className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-brand-black/20 text-brand-black/40 hover:border-brand-gold hover:text-brand-gold">
            <Icon name="upload" className="h-5 w-5" />
            <span className="text-[11px]">{uploading ? "Uploading..." : "Add Photo"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleImageUpload(e.target.files)}
            />
          </label>
        </div>
        {imageUrls.length === 0 && (
          <div className="mt-4 flex items-center gap-3">
            <ProductImage
              product={{ name: name || "Product", category, icon }}
              className="h-16 w-16 rounded-xl"
            />
            <p className="text-xs text-brand-black/50">
              No photos yet — this initials placeholder will show on the storefront until you add one.
            </p>
          </div>
        )}
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brand-brown px-6 py-3 font-accent text-sm font-semibold text-brand-white hover:bg-brand-gold disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="rounded-full border border-brand-black/15 px-6 py-3 font-accent text-sm font-semibold text-brand-black hover:border-brand-gold hover:text-brand-gold"
          >
            Cancel
          </button>
        </div>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 rounded-full border border-red-200 px-5 py-3 font-accent text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <Icon name="trash" className="h-4 w-4" />
            {deleting ? "Deleting..." : "Delete Product"}
          </button>
        )}
      </div>
    </form>
  );
}

const inputClass =
  "rounded-lg border border-brand-black/15 bg-brand-cream/40 px-3.5 py-2.5 text-sm text-brand-black placeholder:text-brand-black/30 focus:border-brand-gold focus:outline-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-accent text-xs font-medium text-brand-black/70">
        {label}
        {required && <span className="text-brand-gold"> *</span>}
      </span>
      {children}
    </label>
  );
}
