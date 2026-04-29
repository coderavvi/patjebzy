import { Types } from "mongoose";

// ─── User ────────────────────────────────────────
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "sales_rep";
  isActive: boolean;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserFormData = Pick<IUser, "name" | "email" | "role" | "phone"> & {
  password?: string;
};

// ─── Category ────────────────────────────────────
export interface ICategory {
  _id: string;
  name: string;
  prefix: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Product ─────────────────────────────────────
export interface IProduct {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  category: ICategory | string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductFormData = Omit<IProduct, "_id" | "sku" | "createdAt" | "updatedAt">;

// ─── Sale ────────────────────────────────────────
export interface ISaleItem {
  product: IProduct | string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ISale {
  _id: string;
  saleNumber: string;
  items: ISaleItem[];
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  soldBy: IUser | string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Dashboard ───────────────────────────────────
export interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
  lowStockCount: number;
  revenueChange?: number;
  salesChange?: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  sales: number;
}

export interface TopProduct {
  name: string;
  totalSold: number;
  revenue: number;
}

// ─── API Responses ───────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Next Auth ───────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "admin" | "sales_rep";
    };
  }
  interface User {
    id: string;
    role: "admin" | "sales_rep";
  }
  interface JWT {
    id: string;
    role: "admin" | "sales_rep";
  }
}
