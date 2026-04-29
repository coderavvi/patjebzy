import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategoryDocument extends Document {
  name: string;
  prefix: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    prefix: {
      type: String,
      required: [true, "Category prefix is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [2, "Prefix must be at least 2 characters"],
      maxlength: [5, "Prefix must be at most 5 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category: Model<ICategoryDocument> =
  mongoose.models.Category ||
  mongoose.model<ICategoryDocument>("Category", CategorySchema);

export default Category;
