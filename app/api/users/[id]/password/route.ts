import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validations";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (session.user.role !== "admin" && session.user.id !== id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const validated = changePasswordSchema.parse(body);

    const user = await User.findById(id).select("+password");
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const isValid = await user.comparePassword(validated.currentPassword);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    user.password = validated.newPassword;
    await user.save();

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
