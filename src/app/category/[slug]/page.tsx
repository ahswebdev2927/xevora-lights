import { db } from "@/db";
import { products, homepageCategories, productVariations } from "@/db/schema";
import { eq, inArray, or, and } from "drizzle-orm";
import CategoryFilterSection from "@/components/CategoryFilterSection";
import { getFirstProductImageUrl } from "@/utils/product";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const href = `/category/${slug}`;

  // 1. Find the category item from homepageCategories
  const homeCatResult = await db.select()
    .from(homepageCategories)
    .where(eq(homepageCategories.isActive, true))
    .limit(100);

  const matchingHomeCat = homeCatResult.find(
    (item) => item.name.toLowerCase().trim().replace(/\s+/g, "-") === slug || item.link === href
  );

  let categoryName = "";
  let filterTypes: string | null = null;

  if (matchingHomeCat) {
    categoryName = matchingHomeCat.name;
    filterTypes = matchingHomeCat.filterTypes;
  }

  // 2. If not found in categories, show Not Found
  if (!categoryName) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-playfair font-bold text-black mb-4">Category Not Found</h1>
        <Link href="/" className="text-[#C5A059] font-bold uppercase tracking-widest text-xs hover:underline">Return Home</Link>
      </div>
    );
  }

  // 3. Query all active products matching this category name or slug
  const categorySlug = categoryName.toLowerCase().trim().replace(/\s+/g, "-");
  const rawProducts = await db.select()
    .from(products)
    .where(
      and(
        or(
          eq(products.category, categoryName),
          eq(products.category, slug),
          eq(products.category, categorySlug)
        ),
        eq(products.isActive, true)
      )
    );

  // 4. Query variations/sizes for all products in this category
  const allProductIds = rawProducts.map((p) => p.id);

  let allVariations: any[] = [];
  if (allProductIds.length > 0) {
    allVariations = await db.select()
      .from(productVariations)
      .where(inArray(productVariations.productId, allProductIds));
  }

  // Group sizes and calculate total stock by product ID
  const sizeMap = new Map<number, string[]>();
  const stockMap = new Map<number, number>();
  allVariations.forEach((v) => {
    if (!v.productId) return;
    
    // Group sizes
    if (v.size) {
      const currentSizes = sizeMap.get(v.productId) || [];
      const normalizedSize = v.size.trim();
      if (normalizedSize && !currentSizes.includes(normalizedSize)) {
        currentSizes.push(normalizedSize);
      }
      sizeMap.set(v.productId, currentSizes);
    }

    // Accumulate stock
    const currentStock = stockMap.get(v.productId) || 0;
    stockMap.set(v.productId, currentStock + (v.stock || 0));
  });

  // Attach sizes, imageUrl, and totalStock to displayProducts
  const displayProducts = rawProducts.map((p) => ({
    ...p,
    imageUrl: getFirstProductImageUrl(p.images),
    sizes: sizeMap.get(p.id) || [],
    totalStock: stockMap.has(p.id) ? stockMap.get(p.id) : 0,
  }));

  return (
    <div className="w-full bg-brand-light min-h-[calc(100vh-48px)] flex flex-col">
      <CategoryFilterSection
        initialSections={[]}
        initialDisplayProducts={displayProducts}
        categoryName={categoryName}
        slug={slug}
        filterTypes={filterTypes}
        categoryImages={matchingHomeCat?.imageUrl || null}
      />
    </div>
  );
}
