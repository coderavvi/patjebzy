import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Sale from "@/models/Sale";
import { auth } from "@/lib/auth";

// GET /api/sales/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const sale = await Sale.findById(id)
      .populate("soldBy", "name email")
      .lean();

    if (!sale) {
      return NextResponse.json({ success: false, error: "Sale not found" }, { status: 404 });
    }

    // Sales reps can only see their own sales
    if (
      session.user.role === "sales_rep" &&
      sale.soldBy &&
      typeof sale.soldBy === "object" &&
      "_id" in sale.soldBy &&
      sale.soldBy._id.toString() !== session.user.id
    ) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: sale });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
