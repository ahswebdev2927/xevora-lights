import { redirect } from "next/navigation";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function GFlashSeriesPage() {
  const p = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.name, "Xevora G-Flash Quad-Emitter Series"))
    .limit(1);

  const productId = p[0]?.id || 13;
  redirect(`/product/${productId}`);
}
