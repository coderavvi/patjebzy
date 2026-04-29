import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { updateUserSchema } from "@/lib/validations";

// GET /api/users/[id]
export async function GET(
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
    const user = await User.findById(id).lean();

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/users/[id]
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
    const validated = updateUserSchema.parse(body);

    const user = await User.findByIdAndUpdate(id, validated, {
      new: true,
      runValidators: true,
    }).lean();

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/users/[id] — soft delete (deactivate)
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

    // Don't let admin delete themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot deactivate your own account" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).lean();

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User deactivated", data: user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
