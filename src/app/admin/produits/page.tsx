import { ProductsAdmin, type ProductRow } from "@/components/admin/products-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProduitsPage() {
  const items = await prisma.product.findMany({ orderBy: { updatedAt: "desc" } });
  const rows: ProductRow[] = items.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    stock: p.stock,
    minStockAlert: p.minStockAlert,
    category: p.category,
    imageUrl: p.imageUrl,
    isActive: p.isActive,
  }));

  return <ProductsAdmin initial={rows} />;
}
