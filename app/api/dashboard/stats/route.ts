import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Sale from "@/models/Sale";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const isSalesRep = session.user.role === "sales_rep";
    const userId = session.user.id;

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Filter for sales rep
    const baseFilter: Record<string, any> = isSalesRep 
      ? { soldBy: new mongoose.Types.ObjectId(userId) } 
      : {};

    // Current month stats
    const currentStats = await Sale.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startOfCurrentMonth },
          ...baseFilter
        } 
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
          profit: { $sum: "$totalProfit" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Last month stats for trend
    const lastStats = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          ...baseFilter
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
          profit: { $sum: "$totalProfit" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Total stats
    const allTimeStats = await Sale.aggregate([
      {
        $match: baseFilter
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
          profit: { $sum: "$totalProfit" },
          count: { $sum: 1 },
        },
      },
    ]);

    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
    });

    const productsCount = await Product.countDocuments({ isActive: true });

    const curr = currentStats[0] || { revenue: 0, profit: 0, count: 0 };
    const last = lastStats[0] || { revenue: 0, profit: 0, count: 0 };
    const all = allTimeStats[0] || { revenue: 0, profit: 0, count: 0 };

    const revenueChange = last.revenue === 0 ? 100 : ((curr.revenue - last.revenue) / last.revenue) * 100;
    const salesChange = last.count === 0 ? 100 : ((curr.count - last.count) / last.count) * 100;
    const profitChange = last.profit === 0 ? 100 : ((curr.profit - last.profit) / last.profit) * 100;

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: all.revenue,
        totalProfit: all.profit,
        totalSales: all.count,
        totalProducts: productsCount,
        lowStockCount,
        revenueChange: Math.round(revenueChange),
        salesChange: Math.round(salesChange),
        profitChange: Math.round(profitChange),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
