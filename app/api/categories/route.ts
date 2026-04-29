import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { auth } from "@/lib/auth";
import { createCategorySchema } from "@/lib/validations";

// GET /api/categories
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const categories = await Category.find().sort("name").lean();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/categories — admin only
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const validated = createCategorySchema.parse(body);

    const category = await Category.create(validated);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ success: false, error: "Validation error" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
