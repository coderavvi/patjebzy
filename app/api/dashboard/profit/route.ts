import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Sale from "@/models/Sale";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d"; // 24h, 7d, 30d, all

    let startDate = new Date();
    if (range === "24h") startDate.setHours(0, 0, 0, 0);
    else if (range === "7d") startDate.setDate(startDate.getDate() - 7);
    else if (range === "30d") startDate.setDate(startDate.getDate() - 30);
    else startDate = new Date(0); // All time

    const profitData = await Sale.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          profit: { $sum: { $ifNull: ["$totalProfit", 0] } },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          profit: 1,
          revenue: 1,
          _id: 0,
        },
      },
    ]);

    return NextResponse.json({ success: true, data: profitData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
