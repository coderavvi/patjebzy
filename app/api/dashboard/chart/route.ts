import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Sale from "@/models/Sale";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const isAdmin = session.user.role === "admin";
    const matchStage: Record<string, unknown> = {
      createdAt: { $gte: thirtyDaysAgo },
    };
    if (!isAdmin) {
      matchStage.soldBy = new mongoose.Types.ObjectId(session.user.id);
    }

    const chartData = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          profit: { $sum: { $ifNull: ["$totalProfit", 0] } },
          sales: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: 1,
          profit: 1,
          sales: 1,
        },
      },
    ]);

    // Top products
    const topProducts = await Sale.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productName",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.totalPrice" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          name: "$_id",
          totalSold: 1,
          revenue: 1,
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: { chartData, topProducts },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
