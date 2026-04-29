import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";
import { updateProductSchema } from "@/lib/validations";

// GET /api/products/[id]
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
    const product = await Product.findById(id)
      .populate("category", "name prefix")
      .lean();

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/products/[id] — admin only
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const validated = updateProductSchema.parse(body);

    const product = await Product.findByIdAndUpdate(id, validated, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name prefix")
      .lean();

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/products/[id] — admin only
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
