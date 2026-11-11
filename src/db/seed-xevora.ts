import { db } from "./index";
import { products, productVariations, users, siteSettings, offerBanners, reels } from "./schema";
import { eq } from "drizzle-orm";

async function seedXevora() {
  console.log("Seeding Xevora Lights database...");

  try {
    // 1. Admin User
    await db.insert(users).values({
      phoneNumber: "9876543210",
      fullName: "Xevora Admin",
      email: "Xevora.Lights@gmail.com",
      role: "admin",
    }).onConflictDoNothing();

    // 2. Clear old test products or insert flagship if not exists
    const existing = await db.select().from(products).where(eq(products.name, "Xevora G-Flash Quad-Emitter Series"));

    const specsData = {
      lightSource: 'Quad-source emitter ("white-laser"-type LED module)',
      colourModes: 'White · Ice-blue · Yellow · Golden',
      zoom: 'Telescopic optical zoom (flood ↔ spot)',
      power: '3 × 18650 lithium cells — swappable (= 10,000 mAh combined)',
      charging: 'USB Type-C',
      display: 'Digital readout (battery / mode)',
      bodyWeight: 'Aluminium alloy · 465 g',
      dimensions: '160 × 53 mm',
      waterResistance: 'Daily-life splash resistance',
      beamDistance: '1,200 Meters Long Throw',
      maxLumens: '3,200 Lumens Peak Output',
      inTheBox: [
        '1× Xevora G-Flash Quad-Source Tactical Light',
        '3× 18650 High-Capacity Lithium Cells (10,000 mAh combined)',
        '1× USB Type-C Fast-Charging Cable',
        '1× Military-Grade Tactical Lanyard',
        '1× Shockproof Protective Hard Case',
        '1× User Manual & 1-Year Comprehensive Warranty Card'
      ]
    };

    let productId = existing.length > 0 ? existing[0].id : null;

    if (!productId) {
      const inserted = await db.insert(products).values({
        name: "Xevora G-Flash Quad-Emitter Series",
        description: "The pinnacle of portable illumination. Featuring an advanced quad-source 'white-laser' LED emitter module, 4 selectable color spectrums (White, Ice-blue, Yellow, Golden), smooth telescopic optical zoom from wide flood to intense spot, and a monster 10,000 mAh swappable 3-cell battery pack with real-time digital OLED readout.",
        basePrice: 8999,
        salePrice: 5999,
        avgRating: 4.9,
        numReviews: 128,
        images: JSON.stringify({
          Default: [
            "/images/spec-sheet.png",
            "/images/brand_feature_banner.png"
          ]
        }),
        colors: JSON.stringify(["Matte Stealth Black", "Titanium Grey"]),
        category: "Flashlights & Spotlights",
        tags: "flashlight, spotlight, quad emitter, white laser, 10000mah, optical zoom, gobo projector",
        isFeatured: true,
        isActive: true,
        specifications: JSON.stringify(specsData),
      }).returning({ id: products.id });

      productId = inserted[0]?.id;
      console.log("Inserted Flagship Product ID:", productId);
    } else {
      await db.update(products).set({
        description: "The pinnacle of portable illumination. Featuring an advanced quad-source 'white-laser' LED emitter module, 4 selectable color spectrums (White, Ice-blue, Yellow, Golden), smooth telescopic optical zoom from wide flood to intense spot, and a monster 10,000 mAh swappable 3-cell battery pack with real-time digital OLED readout.",
        basePrice: 8999,
        salePrice: 5999,
        specifications: JSON.stringify(specsData),
        category: "Flashlights & Spotlights",
        colors: JSON.stringify(["Matte Stealth Black", "Titanium Grey"]),
      }).where(eq(products.id, productId));
      console.log("Updated Flagship Product ID:", productId);
    }

    if (productId) {
      // Check variations
      const vars = await db.select().from(productVariations).where(eq(productVariations.productId, productId));
      if (vars.length === 0) {
        await db.insert(productVariations).values([
          {
            productId,
            size: "Standard Edition",
            color: "Matte Stealth Black",
            mrp: 8999,
            salePrice: 5999,
            stock: 250,
            sku: "XEV-GFL-STD-BLK"
          },
          {
            productId,
            size: "Creator Studio Pro Kit (With 20 GOBO Filters)",
            color: "Matte Stealth Black",
            mrp: 11999,
            salePrice: 7999,
            stock: 120,
            sku: "XEV-GFL-PRO-BLK"
          },
          {
            productId,
            size: "Tactical Extreme Kit (+ 3 Extra Spare Cells)",
            color: "Titanium Grey",
            mrp: 13999,
            salePrice: 9499,
            stock: 80,
            sku: "XEV-GFL-TAC-GRY"
          }
        ]);
        console.log("Seeded Product Variations/Kits.");
      }
    }

    // 4. Offer Banners
    await db.delete(offerBanners);
    await db.insert(offerBanners).values([
      { text: "⚡ Introducing Xevora G-Flash Quad-Emitter | Special Launch Price + Free Express Shipping", link: `/product/${productId || 1}`, order: 1 },
      { text: "🛡️ 1-Year Comprehensive Replacement Warranty on All Orders", link: "/contact", order: 2 },
      { text: "🎬 Complimentary 20-Piece GOBO Filter Set with Creator Pro Edition", link: `/product/${productId || 1}`, order: 3 },
    ]);

    // 5. Site Settings
    await db.insert(siteSettings).values([
      { key: "brand_name", value: "Xevora Lights" },
      { key: "site_tagline", value: "Precision Tactical & Creator Illumination" },
      { 
        key: "hero_media", 
        value: JSON.stringify({
          mediaUrl: "/images/landing/hero-gflash.jpg",
          tag1: "TYPE-C FAST CHARGING",
          tag2: "CNC AEROSPACE CHASSIS"
        }) 
      },
    ]).onConflictDoNothing();

    // 6. Watch It In Action Reels
    await db.delete(reels);
    await db.insert(reels).values([
      {
        title: "Dramatic Rim Light",
        creatorHandle: "@filmmaker_sam",
        videoUrl: "/videos/reels/reel-1.mp4",
        thumbnailUrl: "/images/landing/reel-1.jpg",
        badgeText: "PRO IN ACTION",
        viewsCount: "2.9M",
        displayOrder: 1,
        isActive: true,
      },
      {
        title: "RGB Mood Shifter",
        creatorHandle: "@studio_claire",
        videoUrl: "/videos/reels/reel-2.mp4",
        thumbnailUrl: "/images/landing/reel-2.jpg",
        badgeText: "G-FLASH 10W",
        viewsCount: "1.9M",
        displayOrder: 2,
        isActive: true,
      },
      {
        title: "One Room, 5 Sets",
        creatorHandle: "@cinema_dan",
        videoUrl: "/videos/reels/reel-3.mp4",
        thumbnailUrl: "/images/landing/reel-3.jpg",
        badgeText: "GOBO EFFECTS",
        viewsCount: "1.9M",
        displayOrder: 3,
        isActive: true,
      },
      {
        title: "60-Sec Pod Desk",
        creatorHandle: "@alex_tech",
        videoUrl: "/videos/reels/reel-4.mp4",
        thumbnailUrl: "/images/landing/reel-4.jpg",
        badgeText: "SETUP GUIDE",
        viewsCount: "2.7M",
        displayOrder: 4,
        isActive: true,
      },
      {
        title: "Adjust Intensity",
        creatorHandle: "@luxe_visuals",
        videoUrl: "/videos/reels/reel-5.mp4",
        thumbnailUrl: "/images/landing/reel-5.jpg",
        badgeText: "BEAM DEMO",
        viewsCount: "3.1M",
        displayOrder: 5,
        isActive: true,
      },
    ]);

    console.log("Xevora Lights seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

seedXevora();
