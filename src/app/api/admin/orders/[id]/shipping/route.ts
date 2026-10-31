import { verifyAdminRequest } from "@/utils/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!await isAdmin(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { courierServiceName, courierId, trackingNumber, trackingLink, estimatedDeliveryDate, shippingNotes } = body;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ success: false, error: "Invalid order ID" }, { status: 400 });
    }

    if (!courierServiceName || !trackingNumber || !estimatedDeliveryDate) {
      return NextResponse.json(
        { success: false, error: "Courier Service Name, Tracking Number, and Estimated Delivery Date are required" },
        { status: 400 }
      );
    }

    // Fetch current order status
    const currentOrder = await db.select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!currentOrder.length) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    if (currentOrder[0].status?.toLowerCase() === "cancelled") {
      return NextResponse.json({ success: false, error: "Cannot add shipping details to a cancelled order" }, { status: 400 });
    }

    // Update shipping fields and automatically change status to 'Shipped'
    await db.update(orders)
      .set({
        courierServiceName,
        courierId: courierId || null,
        trackingNumber,
        trackingLink: trackingLink || null,
        estimatedDeliveryDate: new Date(estimatedDeliveryDate),
        shippingNotes: shippingNotes || null,
        status: "Shipped",
      })
      .where(eq(orders.id, orderId));

    return NextResponse.json({ success: true, message: "Order shipping details updated and status changed to Shipped" });
  } catch (error: any) {
    console.error("Error updating order shipping details:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
