import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISaleItemSubdoc {
  product: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  totalPrice: number;
  totalProfit: number;
}

export interface ISaleDocument extends Document {
  saleNumber: string;
  items: ISaleItemSubdoc[];
  totalAmount: number;
  totalProfit: number;
  customerName?: string;
  customerPhone?: string;
  discount: number;
  notes?: string;
  soldBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SaleItemSchema = new Schema<ISaleItemSubdoc>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    unitCost: {
      type: Number,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    totalProfit: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const SaleSchema = new Schema<ISaleDocument>(
  {
    saleNumber: {
      type: String,
      unique: true,
    },
    items: {
      type: [SaleItemSchema],
      required: true,
      validate: {
        validator: (v: ISaleItemSubdoc[]) => v.length > 0,
        message: "Sale must have at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },
    totalProfit: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    customerName: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    soldBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sales rep is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate sale number
SaleSchema.pre("save", async function () {
  if (!this.saleNumber) {
    const count = await mongoose.models.Sale.countDocuments();
    this.saleNumber = `SAL-${String(count + 1).padStart(5, "0")}`;
  }
});

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Sale;
}

const Sale: Model<ISaleDocument> =
  mongoose.models.Sale || mongoose.model<ISaleDocument>("Sale", SaleSchema);

export default Sale;
