import { AdminProductsManager } from "@/components/AdminProductsManager";
import { fetchSupabaseProducts } from "@/lib/supabase-products";

export default async function AdminProductsPage() {
  const products = await fetchSupabaseProducts();

  return <AdminProductsManager initialProducts={products} />;
}