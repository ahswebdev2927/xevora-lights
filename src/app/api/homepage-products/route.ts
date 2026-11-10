import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productVariations, siteSettings } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";

export async function GET() {
  try {
    // 1. Fetch all active products
    const allActive = await db
      .select()
      .from(products)
      .where(eq(products.isActive, true));

    // 2. Fetch variations for active products
    const allVariations = await db.select().from(productVariations);

    // Helper to format a product for homepage card
    const formatHomepageProduct = (p: any, defaultSlotLabel: string) => {
      // Parse images
      let img = "/images/landing/product-10w-rgb.jpg";
      if (p.images) {
        try {
          const parsed = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
          if (Array.isArray(parsed) && parsed.length > 0) {
            img = parsed[0];
          } else if (typeof parsed === "object") {
            const vals = Object.values(parsed).flat() as string[];
            if (vals.length > 0) img = vals[0];
          }
        } catch {
          if (typeof p.images === "string" && p.images.startsWith("http")) img = p.images;
        }
      }

      // Selling price and MRP
      const sellingPrice = p.salePrice || p.basePrice || 0;
      const originalMrp = p.mrp || (sellingPrice * 1.5) || 0;
      const discount = originalMrp > sellingPrice ? Math.round(((originalMrp - sellingPrice) / originalMrp) * 100) : 0;

      // Extract up to 4 specification bullets
      const specBullets: string[] = [];
      if (p.specifications) {
        try {
          const parsedSpecs = typeof p.specifications === "string" ? JSON.parse(p.specifications) : p.specifications;
          if (typeof parsedSpecs === "object" && !Array.isArray(parsedSpecs)) {
            for (const [key, val] of Object.entries(parsedSpecs)) {
              if (specBullets.length >= 4) break;
              if (val) specBullets.push(`${key}: ${val}`);
            }
          }
        } catch {}
      }

      // Variation ID for cart
      const prodVars = allVariations.filter(v => v.productId === p.id);
      const firstVar = prodVars.length > 0 ? prodVars[0] : null;

      return {
        id: p.id,
        name: p.name,
        price: sellingPrice,
        mrp: originalMrp,
        discount,
        image: img,
        stock: p.stock ?? 25,
        rating: p.avgRating ?? 4.9,
        numReviews: p.numReviews ?? 110,
        specBullets,
        variationId: firstVar?.id || 1,
        size: firstVar?.size || "Standard Edition",
        slotLabel: p.homepageSlot === "slot_2" ? "MOST POWERFUL FLAGSHIP" : (p.homepageSlot === "slot_1" ? "CREATOR ESSENTIAL" : defaultSlotLabel)
      };
    };

    // Find Slot 1 product
    let slot1Prod = allActive.find(p => p.homepageSlot === "slot_1");
    // Find Slot 2 product
    let slot2Prod = allActive.find(p => p.homepageSlot === "slot_2");

    // Fallbacks if not explicitly tagged with slots
    const featuredList = allActive.filter(p => p.isFeatured && p.homepageSlot !== "slot_1" && p.homepageSlot !== "slot_2");
    
    if (!slot1Prod && featuredList.length > 0) {
      slot1Prod = featuredList[0];
    }
    if (!slot2Prod && featuredList.length > 1) {
      slot2Prod = featuredList[1];
    } else if (!slot2Prod && !slot1Prod && allActive.length > 0) {
      slot1Prod = allActive[0];
    }

    const slot1 = slot1Prod ? formatHomepageProduct(slot1Prod, "CREATOR ESSENTIAL") : null;
    const slot2 = slot2Prod ? formatHomepageProduct(slot2Prod, "MOST POWERFUL FLAGSHIP") : null;

    // Calculate Hero Starting From price
    const featuredPrices = [slot1?.price, slot2?.price].filter((p): p is number => typeof p === "number" && p > 0);
    const heroPrice = featuredPrices.length > 0 ? Math.min(...featuredPrices) : 4999;
    
    const featuredMrps = [slot1?.mrp, slot2?.mrp].filter((p): p is number => typeof p === "number" && p > 0);
    const heroMrp = featuredMrps.length > 0 ? Math.max(...featuredMrps) : 7999;

    // Fetch Hero Card Media & Badges setting
    const heroMediaSetting = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "hero_media"))
      .limit(1);

    let heroMedia = {
      mediaUrl: "/images/landing/hero-gflash.jpg",
      tag1: "TYPE-C FAST CHARGING",
      tag2: "CNC AEROSPACE CHASSIS",
    };

    if (heroMediaSetting.length > 0 && heroMediaSetting[0].value) {
      try {
        const parsed = JSON.parse(heroMediaSetting[0].value);
        if (parsed.mediaUrl) heroMedia.mediaUrl = parsed.mediaUrl;
        if (parsed.tag1 !== undefined) heroMedia.tag1 = parsed.tag1;
        if (parsed.tag2 !== undefined) heroMedia.tag2 = parsed.tag2;
      } catch {
        if (typeof heroMediaSetting[0].value === "string") {
          heroMedia.mediaUrl = heroMediaSetting[0].value;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        slot1,
        slot2,
        heroStartingPrice: heroPrice,
        heroStartingMrp: heroMrp,
        heroMedia,
      }
    });

  } catch (error) {
    console.error("Error in GET /api/homepage-products:", error);
    return NextResponse.json({ success: false, error: "Failed to load homepage products" }, { status: 500 });
  }
}
