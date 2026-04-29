import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { auth } from "@/lib/auth";
import { createProductSchema } from "@/lib/validations";

// GET /api/products — list products with search/filter/sort
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "-createdAt";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build filter
    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;
    if (status === "low_stock") {
      filter.$expr = { $lte: ["$quantity", "$lowStockThreshold"] };
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("category", "name prefix")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: products,
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

// POST /api/products — create product (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const validated = createProductSchema.parse(body);

    // Ensure category exists
    const cat = await Category.findById(validated.category);
    if (!cat) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const product = await Product.create(validated);
    const populated = await Product.findById(product._id)
      .populate("category", "name prefix")
      .lean();

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ success: false, error: "Validation error", details: error }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
