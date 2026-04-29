import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { createUserSchema } from "@/lib/validations";

// GET /api/users — admin: list all users, reps: forbidden
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) filter.role = role;

    const users = await User.find(filter).sort("-createdAt").lean();
    return NextResponse.json({ success: true, data: users });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/users — admin: create user
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const validated = createUserSchema.parse(body);

    // Check for existing email
    const existing = await User.findOne({ email: validated.email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email already in use" },
        { status: 409 }
      );
    }

    const user = await User.create(validated);
    const { password, ...userWithoutPass } = user.toObject();
    return NextResponse.json({ success: true, data: userWithoutPass }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
