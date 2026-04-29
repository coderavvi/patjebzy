import mongoose, { Schema, Document, Model } from "mongoose";
import { generateSKU } from "@/lib/utils";

export interface IProductDocument extends Document {
  name: string;
  sku: string;
  description?: string;
  category: mongoose.Types.ObjectId;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isLowStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    costPrice: {
      type: Number,
      required: [true, "Cost price is required"],
      min: [0, "Cost price cannot be negative"],
    },
    sellingPrice: {
      type: Number,
      required: [true, "Selling price is required"],
      min: [0, "Selling price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Quantity cannot be negative"],
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, "Threshold cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for low stock status
ProductSchema.virtual("isLowStock").get(function () {
  return this.quantity <= this.lowStockThreshold;
});

// Auto-generate SKU before save
ProductSchema.pre("save", async function () {
  if (!this.sku) {
    const Category = mongoose.models.Category;
    if (Category) {
      const cat = await Category.findById(this.category);
      this.sku = generateSKU(cat?.prefix || "GEN");
    } else {
      this.sku = generateSKU("GEN");
    }
  }
});

const Product: Model<IProductDocument> =
  mongoose.models.Product ||
  mongoose.model<IProductDocument>("Product", ProductSchema);

export default Product;
