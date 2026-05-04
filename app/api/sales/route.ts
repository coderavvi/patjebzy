import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Sale from "@/models/Sale";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";
import { createSaleSchema } from "@/lib/validations";
import mongoose from "mongoose";

// GET /api/sales — admin sees all, rep sees own
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "-createdAt";

    const filter: Record<string, unknown> = {};

    if (session.user.role === "sales_rep") {
      filter.soldBy = new mongoose.Types.ObjectId(session.user.id);
    }

    if (search) {
      filter.$or = [
        { saleNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Sale.countDocuments(filter);
    const sales = await Sale.find(filter)
      .populate("soldBy", "name email")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: sales,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/sales — create sale with profit calculation
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const validated = createSaleSchema.parse(body);

    // 1. Validate all items and check stock first
    const itemsToProcess = [];
    let totalAmount = 0;
    let totalProfit = 0;

    for (const item of validated.items) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error(`Product not found: ${item.product}`);
      if (!product.isActive) throw new Error(`Product is inactive: ${product.name}`);
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name} (Available: ${product.quantity})`);
      }

      const itemTotal = product.sellingPrice * item.quantity;
      const itemProfit = (product.sellingPrice - product.costPrice) * item.quantity;
      
      totalAmount += itemTotal;
      totalProfit += itemProfit;

      itemsToProcess.push({
        product,
        quantity: item.quantity,
        unitCost: product.costPrice,
        unitPrice: product.sellingPrice,
        totalPrice: itemTotal,
        totalProfit: itemProfit
      });
    }

    // 2. Perform updates sequentially
    const saleItems = [];
    for (const p of itemsToProcess) {
      // Decrement stock
      await Product.findByIdAndUpdate(p.product._id, {
        $inc: { quantity: -p.quantity }
      });

      saleItems.push({
        product: p.product._id,
        productName: p.product.name,
        quantity: p.quantity,
        unitCost: p.unitCost,
        unitPrice: p.unitPrice,
        totalPrice: p.totalPrice,
        totalProfit: p.totalProfit
      });
    }

    // 3. Create the sale record
    const discount = validated.discount || 0;
    const finalTotal = totalAmount - discount;
    const finalProfit = totalProfit - discount;

    const sale = await Sale.create({
      items: saleItems,
      totalAmount: finalTotal,
      totalProfit: finalProfit,
      discount,
      customerName: validated.customerName,
      customerPhone: validated.customerPhone,
      notes: validated.notes,
      soldBy: session.user.id,
    });

    const populated = await Sale.findById(sale._id)
      .populate("soldBy", "name email")
      .lean();

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Sale Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
