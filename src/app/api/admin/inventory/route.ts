import { verifyAdminRequest } from "@/utils/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productVariations, orderItems, orders } from "@/db/schema";
import { eq, sql, ne, and, inArray } from "drizzle-orm";

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

export async function GET(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Fetch all products
    const allProducts = await db.select().from(products);
    
    // Fetch all variations for stock calculation
    const allVariations = await db.select().from(productVariations);

    // Fetch all order items and their associated order status
    const allOrderItems = await db
      .select({
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        status: orders.status,
        variationId: orderItems.variationId,
        size: orderItems.size,
        color: orderItems.color,
      })
      .from(orderItems)
      .leftJoin(orders, eq(orderItems.orderId, orders.id));

    // Process data to calculate metrics
    const inventoryData = allProducts.map((product: any) => {
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

      const totalStock = productVariationsList?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
      const remaining = totalStock - sold - toDeliver;

      // Group variations by size
      const variationsGroupedBySize: Record<string, {
        size: string;
        totalStock: number;
        totalSold: number;
        totalToBeDelivered: number;
        totalRemaining: number;
        colors: Array<{
          color: string;
          stock: number;
          sold: number;
          toBeDelivered: number;
          remaining: number;
        }>
      }> = {};

      productVariationsList.forEach((v: any) => {
        const varOrderItems = productOrderItems.filter(item => 
          item.variationId === v.id || 
          (item.size && item.size.toLowerCase() === v.size.toLowerCase() && item.color?.toLowerCase() === v.color?.toLowerCase())
        );

        const varSold = varOrderItems
          .filter(item => item.status && item.status.toLowerCase() === "delivered")
          .reduce((sum, item) => sum + (item.quantity || 0), 0);

        const varToDeliver = varOrderItems
          .filter(item => 
            item.status && 
            ["pending", "confirmed", "processing", "ready to ship", "shipped"].includes(item.status.toLowerCase())
          )
          .reduce((sum, item) => sum + (item.quantity || 0), 0);

        const varRemaining = Math.max(0, (v.stock || 0) - varSold - varToDeliver);

        const sizeKey = v.size.toUpperCase();
        if (!variationsGroupedBySize[sizeKey]) {
          variationsGroupedBySize[sizeKey] = {
            size: v.size,
            totalStock: 0,
            totalSold: 0,
            totalToBeDelivered: 0,
            totalRemaining: 0,
            colors: []
          };
        }

        variationsGroupedBySize[sizeKey].totalStock += (v.stock || 0);
        variationsGroupedBySize[sizeKey].totalSold += varSold;
        variationsGroupedBySize[sizeKey].totalToBeDelivered += varToDeliver;
        variationsGroupedBySize[sizeKey].totalRemaining += varRemaining;
        
        variationsGroupedBySize[sizeKey].colors.push({
          color: v.color || "Default",
          stock: v.stock || 0,
          sold: varSold,
          toBeDelivered: varToDeliver,
          remaining: varRemaining
        });
      });

      const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"];
      const sortedVariations = Object.values(variationsGroupedBySize).sort((a: any, b: any) => {
        const indexA = sizeOrder.indexOf(a.size.toUpperCase());
        const indexB = sizeOrder.indexOf(b.size.toUpperCase());
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.size.localeCompare(b.size);
      });

      sortedVariations.forEach((sizeGroup: any) => {
        sizeGroup.colors.sort((a: any, b: any) => a.color.localeCompare(b.color));
      });

      let firstImg = null;
      if (product.images) {
        try {
          const parsed = JSON.parse(product.images);
          if (Array.isArray(parsed)) {
            firstImg = parsed[0];
          } else {
            const keys = Object.keys(parsed);
            for (const key of keys) {
              if (parsed[key] && parsed[key].length > 0) {
                firstImg = parsed[key][0];
                break;
              }
            }
          }
        } catch {}
      }

      return {
        id: product.id,
        name: product.name,
        category: product.category || "Uncategorized",
        basePrice: product.basePrice,
        sold,
        remaining: Math.max(0, remaining),
        toBeDelivered: toDeliver,
        image: firstImg,
        variations: sortedVariations,
      };
    });

    // Group by category
    const groupedData = inventoryData.reduce((acc: any, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    return NextResponse.json({ success: true, data: groupedData });
  } catch (error: any) {
    console.error("Inventory API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
