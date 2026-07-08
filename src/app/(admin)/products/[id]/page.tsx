"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchProductById } from "@/lib/productQueries";
import { Product } from "@/lib/types";
import BackButton from "@/components/BackButton";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchProductById(params.id).then((data) => {
      if (!data) {
        setNotFound(true);
      } else {
        setProduct(data);
      }
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return <p className="py-20 text-center text-sm text-brand-black/50">Loading product...</p>;
  }

  if (notFound || !product) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-sm text-brand-black/50">Product not found.</p>
        <BackButton fallbackHref="/products" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackButton fallbackHref="/products" />
        <h1 className="font-heading text-2xl text-brand-black">Edit Product</h1>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
