import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  costPrice: z.number().min(0, "Cost price cannot be negative"),
  sellingPrice: z.number().min(0, "Selling price cannot be negative"),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  lowStockThreshold: z.number().int().min(0).default(10),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const createSaleSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.string().min(1, "Product is required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one item is required"),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "sales_rep"]),
  phone: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "sales_rep"]).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  prefix: z
    .string()
    .min(2, "Prefix must be at least 2 characters")
    .max(5, "Prefix must be at most 5 characters"),
  description: z.string().optional(),
});
