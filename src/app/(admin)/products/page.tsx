"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/format";
import { fetchProductsPage } from "@/lib/productQueries";
import { categories } from "@/lib/categories";
import { CategorySlug, Product } from "@/lib/types";
import ProductImage from "@/components/ProductImage";
import Pagination from "@/components/admin/Pagination";
import Icon from "@/components/icons";

const PAGE_SIZE = 15;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      fetchProductsPage({
        category: category === "all" ? undefined : category,
        search,
        sort: "newest",
        page,
        pageSize: PAGE_SIZE,
      }).then((result) => {
        setProducts(result.products);
        setTotalCount(result.totalCount);
        setLoading(false);
      });
    }, 250);
    return () => clearTimeout(timeout);
  }, [category, search, page]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-brand-black/10 bg-brand-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-black/30"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products by name or brand..."
            className="w-full rounded-lg border border-brand-black/15 bg-brand-cream/40 py-2.5 pl-9 pr-3.5 text-sm text-brand-black placeholder:text-brand-black/30 focus:border-brand-gold focus:outline-none"
          />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as CategorySlug | "all");
            setPage(1);
          }}
          className="rounded-lg border border-brand-black/15 bg-brand-white px-3.5 py-2.5 text-sm text-brand-black focus:border-brand-gold focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <Link
          href="/products/new"
          className="flex items-center justify-center gap-2 rounded-full bg-brand-brown px-5 py-2.5 font-accent text-sm font-semibold text-brand-white hover:bg-brand-gold"
        >
          <Icon name="plus" className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <div className="rounded-2xl border border-brand-black/10 bg-brand-white p-4">
        {loading ? (
          <p className="py-16 text-center text-sm text-brand-black/50">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="py-16 text-center text-sm text-brand-black/50">No products match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-brand-black/10 text-left text-xs uppercase tracking-wide text-brand-black/40">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 font-medium">Price</th>
                  <th className="pb-2 font-medium">Stock</th>
                  <th className="pb-2 font-medium">Featured</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-brand-black/5 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage product={product} className="h-11 w-11 shrink-0 rounded-lg" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-brand-black">{product.name}</p>
                          <p className="truncate text-xs text-brand-black/40">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 capitalize text-brand-black/60">
                      {product.category.replace("-", " ")}
                    </td>
                    <td className="py-3 text-brand-black/70">{formatNaira(product.price)}</td>
                    <td className="py-3">
                      <span
                        className={
                          product.stock <= 0
                            ? "font-medium text-red-600"
                            : product.stock < 5
                              ? "font-medium text-amber-600"
                              : "text-brand-black/70"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3">
                      {product.featured ? (
                        <span className="rounded-full bg-brand-gold/15 px-2.5 py-1 text-xs font-accent font-semibold text-brand-gold-dark">
                          Featured
                        </span>
                      ) : (
                        <span className="text-brand-black/30">&mdash;</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-accent text-xs font-semibold text-brand-gold hover:underline"
                      >
                        Edit &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount} onPageChange={setPage} />
      </div>
    </div>
  );
}
