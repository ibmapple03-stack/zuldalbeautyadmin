import BackButton from "@/components/BackButton";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackButton fallbackHref="/products" />
        <h1 className="font-heading text-2xl text-brand-black">Add Product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
