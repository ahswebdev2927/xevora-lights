import { verifyAdminRequest } from "@/utils/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productVariations, orderItems, cartItems, orders } from "@/db/schema";
import { eq, like, or, sql, desc, and, ne } from "drizzle-orm";

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

export async function GET(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const id = searchParams.get("id");
    const type = searchParams.get("type"); // main_product | spare_part

    if (id) {
      const product = await db.select().from(products).where(eq(products.id, parseInt(id))).limit(1);
      if (!product.length) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
      
      const variations = await db.select().from(productVariations).where(eq(productVariations.productId, parseInt(id))).orderBy(productVariations.id);
      const mappedVariations = variations.map(v => ({
        ...v,
        basePrice: v.mrp
      }));
      return NextResponse.json({ success: true, data: { ...product[0], variations: mappedVariations } });
    }
    
    // Fetch products
    let query = db.select().from(products);
    const conditions = [];
    if (search) {
      conditions.push(or(like(products.name, `%${search}%`), like(products.category, `%${search}%`)));
    }
    if (type) {
      conditions.push(eq(products.productType, type));
    }

    const allProducts = await (conditions.length > 0
      ? db.select().from(products).where(and(...conditions)).orderBy(desc(products.id))
      : db.select().from(products).orderBy(desc(products.id)));
    
    // Fetch all variations for stock calculation
    const allVariations = await db.select().from(productVariations);

    // Fetch all order items and their associated order status
    const allOrderItems = await db
      .select({
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        status: orders.status,
      })
      .from(orderItems)
      .leftJoin(orders, eq(orderItems.orderId, orders.id));

    // Process data to calculate metrics
    const results = allProducts.map((product: any) => {
      const productOrderItems = allOrderItems.filter(item => item.productId === product.id);
      const productVariationsList = allVariations.filter(v => v.productId === product.id);

      const sold = productOrderItems
        .filter(item => item.status && item.status.toLowerCase() === "delivered")
        .reduce((sum, item) => sum + (item.quantity || 0), 0);

      const toDeliver = productOrderItems
        .filter(item => 
          item.status && 
          ["pending", "confirmed", "processing", "ready to ship", "shipped"].includes(item.status.toLowerCase())
        )
        .reduce((sum, item) => sum + (item.quantity || 0), 0);

      const varStock = productVariationsList?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
      const initialStock = varStock > 0 ? varStock : (product.stock || 0);
      const totalStock = Math.max(0, initialStock - sold - toDeliver);

      return {
        ...product,
        totalStock
      };
    });

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      name, description, mrp, salePrice, stock, sku, images, variations, hasVariations,
      avgRating, numReviews, category, tags, isFeatured, productType, homepageSlot, parentProductId,
      specifications, isActive
    } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Product name is required" }, { status: 400 });
    }
    
    // Check uniqueness
    const existing = await db
      .select()
      .from(products)
      .where(sql`lower(${products.name}) = lower(${name.trim()})`)
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: "A product with this name already exists" }, { status: 400 });
    }
    
    // Pricing calculation
    const isMultiVariant = hasVariations && Array.isArray(variations) && variations.length > 0;
    const baseSellingPrice = isMultiVariant 
      ? Math.min(...variations.map((v: any) => Number(v.salePrice) || Number(v.basePrice) || 0)) 
      : Number(salePrice || mrp || 0);
    const mrpValue = isMultiVariant 
      ? Math.max(...variations.map((v: any) => Number(v.basePrice) || Number(v.mrp) || 0)) 
      : Number(mrp || salePrice || 0);
    const totalStockValue = isMultiVariant 
      ? variations.reduce((sum: number, v: any) => sum + (parseInt(v.stock) || 0), 0)
      : parseInt(stock) || 0;

    // Insert Product and Variations in a Transaction
    const newProduct = await db.transaction(async (tx) => {
      const productResult = await tx.insert(products).values({
        name: name.trim(),
        description: description || null,
        basePrice: baseSellingPrice,
        salePrice: baseSellingPrice,
        mrp: mrpValue,
        stock: totalStockValue,
        sku: sku || null,
        productType: productType || "main_product",
        homepageSlot: homepageSlot || null,
        parentProductId: parentProductId ? parseInt(parentProductId) : null,
        images: JSON.stringify(images || []),
        colors: JSON.stringify(["Matte Stealth Black"]),
        avgRating: !isNaN(parseFloat(avgRating)) ? parseFloat(avgRating) : 4.9,
        numReviews: !isNaN(parseInt(numReviews)) ? parseInt(numReviews) : 1,
        category: category || (productType === "spare_part" ? "Spare Parts & Accessories" : "Studio Lights"),
        tags: tags || null,
        isFeatured: homepageSlot ? true : !!isFeatured,
        isActive: isActive !== undefined ? !!isActive : true,
        specifications: specifications ? JSON.stringify(specifications) : null,
      }).returning();

      if (!productResult || productResult.length === 0) {
        throw new Error("Database failed to return the new product ID.");
      }

      const insertedProduct = productResult[0];

      if (isMultiVariant) {
        const variationValues = variations.map((v: any) => ({
          productId: insertedProduct.id,
          size: v.size || "Standard Edition",
          color: v.color || "Default",
          stock: parseInt(v.stock) || 0,
          mrp: Number(v.basePrice || v.mrp) || mrpValue,
          salePrice: Number(v.salePrice) || baseSellingPrice,
          sku: v.sku || `${insertedProduct.id}-${v.size || 'STD'}`
        }));
        await tx.insert(productVariations).values(variationValues);
      } else {
        // Create 1 default variation row for cart/order compatibility
        await tx.insert(productVariations).values({
          productId: insertedProduct.id,
          size: "Standard Edition",
          color: "Default",
          stock: totalStockValue,
          mrp: mrpValue,
          salePrice: baseSellingPrice,
          sku: sku || `${insertedProduct.id}-STD`
        });
      }

      return insertedProduct;
    });

    return NextResponse.json({ success: true, data: newProduct });

  } catch (error: any) {
    console.error("CRITICAL ERROR in POST /api/admin/products:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create product",
      details: error.message 
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      id, name, description, mrp, salePrice, stock, sku, images, variations, hasVariations,
      avgRating, numReviews, category, tags, isFeatured, productType, homepageSlot, parentProductId,
      specifications, isActive
    } = body;

    if (!id) return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });

    // Check uniqueness if name is updated
    if (name) {
      const existing = await db
        .select()
        .from(products)
        .where(
          and(
            sql`lower(${products.name}) = lower(${name.trim()})`,
            ne(products.id, id)
          )
        )
        .limit(1);
      if (existing.length > 0) {
        return NextResponse.json({ success: false, error: "A product with this name already exists" }, { status: 400 });
      }
    }

    const isMultiVariant = hasVariations && Array.isArray(variations) && variations.length > 0;
    const baseSellingPrice = isMultiVariant 
      ? Math.min(...variations.map((v: any) => Number(v.salePrice) || Number(v.basePrice) || 0)) 
      : Number(salePrice || mrp || 0);
    const mrpValue = isMultiVariant 
      ? Math.max(...variations.map((v: any) => Number(v.basePrice) || Number(v.mrp) || 0)) 
      : Number(mrp || salePrice || 0);
    const totalStockValue = isMultiVariant 
      ? variations.reduce((sum: number, v: any) => sum + (parseInt(v.stock) || 0), 0)
      : parseInt(stock) || 0;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (salePrice !== undefined || mrp !== undefined || variations) {
      updateData.basePrice = baseSellingPrice;
      updateData.salePrice = baseSellingPrice;
      updateData.mrp = mrpValue;
    }
    if (stock !== undefined || variations) updateData.stock = totalStockValue;
    if (sku !== undefined) updateData.sku = sku;
    if (productType !== undefined) updateData.productType = productType;
    if (homepageSlot !== undefined) {
      updateData.homepageSlot = homepageSlot || null;
      if (homepageSlot) updateData.isFeatured = true;
    }
    if (parentProductId !== undefined) updateData.parentProductId = parentProductId ? parseInt(parentProductId) : null;
    if (images !== undefined) updateData.images = JSON.stringify(images);
    if (avgRating !== undefined) updateData.avgRating = !isNaN(parseFloat(avgRating)) ? parseFloat(avgRating) : undefined;
    if (numReviews !== undefined) updateData.numReviews = !isNaN(parseInt(numReviews)) ? parseInt(numReviews) : undefined;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (isFeatured !== undefined) updateData.isFeatured = homepageSlot ? true : !!isFeatured;
    if (isActive !== undefined) updateData.isActive = !!isActive;
    if (specifications !== undefined) updateData.specifications = specifications ? JSON.stringify(specifications) : null;

    // Update Product and Variations in a Transaction
    await db.transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx.update(products).set(updateData).where(eq(products.id, id));
      }

      await tx.delete(productVariations).where(eq(productVariations.productId, id));
      
      if (isMultiVariant) {
        const variationValues = variations.map((v: any) => ({
          productId: id,
          size: v.size || "Standard Edition",
          color: v.color || "Default",
          stock: parseInt(v.stock) || 0,
          mrp: Number(v.basePrice || v.mrp) || mrpValue,
          salePrice: Number(v.salePrice) || baseSellingPrice,
          sku: v.sku || `${id}-${v.size || 'STD'}`
        }));
        await tx.insert(productVariations).values(variationValues);
      } else {
        // Keep 1 default variation row
        await tx.insert(productVariations).values({
          productId: id,
          size: "Standard Edition",
          color: "Default",
          stock: totalStockValue,
          mrp: mrpValue,
          salePrice: baseSellingPrice,
          sku: sku || `${id}-STD`
        });
      }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("CRITICAL ERROR in PATCH /api/admin/products:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update product",
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");

    if (!id) return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });

    const relatedOrderItems = await db
      .select({ id: orderItems.id, status: orders.status })
      .from(orderItems)
      .leftJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(orderItems.productId, id))
      .all();

    const activeStatuses = ["pending", "confirmed", "processing", "ready to ship", "shipped"];
    const hasActiveOrders = relatedOrderItems.some(
      (item) => item.status && activeStatuses.includes(item.status.toLowerCase())
    );

    if (hasActiveOrders) {
      return NextResponse.json({ 
        success: false, 
        error: "Cannot delete: this product has active pending/shipped orders. Wait for them to complete first." 
      }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      if (relatedOrderItems.length > 0) {
        await tx.update(orderItems).set({ productId: null }).where(eq(orderItems.productId, id));
      }
      await tx.delete(productVariations).where(eq(productVariations.productId, id));
      await tx.delete(cartItems).where(eq(cartItems.productId, id));
      await tx.delete(products).where(eq(products.id, id));
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Product Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete product",
      details: error.message 
    }, { status: 500 });
  }
}
