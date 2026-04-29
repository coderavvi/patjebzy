import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "sales_rep";
  isActive: boolean;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "sales_rep"],
      default: "sales_rep",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
