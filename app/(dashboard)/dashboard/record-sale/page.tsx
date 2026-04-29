"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Search, ShoppingCart } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface SaleItem {
  product: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  available: number;
}

export default function RecordSalePage() {
  const { toggleSidebar } = useLayout();
  const router = useRouter();
  const { data: productsRes } = useSWR("/api/products?limit=100&status=active", fetcher);

  const products = productsRes?.data || [];

  const [items, setItems] = useState<SaleItem[]>([
    { product: "", productName: "", quantity: 1, unitPrice: 0, available: 0 },
  ]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p: Record<string, unknown>) => p._id === productId);
    if (!product) return;

    const newItems = [...items];
    newItems[index] = {
      product: productId,
      productName: product.name as string,
      quantity: 1,
      unitPrice: product.sellingPrice as number,
      available: product.quantity as number,
    };
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const newItems = [...items];
    newItems[index].quantity = qty;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { product: "", productName: "", quantity: 1, unitPrice: 0, available: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter((item) => item.product);
    if (validItems.length === 0) {
      toast.error("Add at least one product");
      return;
    }

    // Validate quantities
    for (const item of validItems) {
      if (item.quantity > item.available) {
        toast.error(`Insufficient stock for "${item.productName}". Available: ${item.available}`);
        return;
      }
      if (item.quantity < 1) {
        toast.error(`Quantity must be at least 1 for "${item.productName}"`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: validItems.map((item) => ({
            product: item.product,
            quantity: item.quantity,
          })),
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success(`Sale ${data.data.saleNumber} recorded successfully!`);
      router.push("/dashboard/my-sales");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to record sale");
    } finally {
      setSubmitting(false);
    }
  };

  const productOptions = products.map((p: Record<string, unknown>) => ({
    value: p._id as string,
    label: `${p.name} — ${formatCurrency(p.sellingPrice as number)} (${p.quantity} in stock)`,
  }));

  return (
    <div>
      <TopBar 
        title="Record Sale" 
        subtitle="Create a new sales transaction" 
        onMenuClick={toggleSidebar}
      />

      <div className="p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sale Items */}
          <div className="rounded-xl border border-surface-700/50 bg-surface-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Sale Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-end p-3 rounded-lg bg-surface-900/50"
                >
                  <div className="col-span-5">
                    <Label className="text-xs">Product</Label>
                    <Select
                      value={item.product}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      options={productOptions}
                      placeholder="Select product"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      min={1}
                      max={item.available}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Unit Price</Label>
                    <div className="h-10 flex items-center text-sm text-surface-300">
                      {formatCurrency(item.unitPrice)}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Subtotal</Label>
                    <div className="h-10 flex items-center text-sm font-semibold text-emerald-400">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>

                  {item.product && item.quantity > item.available && (
                    <div className="col-span-12">
                      <Badge variant="danger">
                        Exceeds stock! Only {item.available} available
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-surface-700 flex justify-between items-center">
              <span className="text-surface-300 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-emerald-400">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="rounded-xl border border-surface-700/50 bg-surface-800/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Customer Information{" "}
              <span className="text-xs text-surface-400 font-normal">(optional)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Customer Name</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label>Phone Number</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 08012345678"
                />
              </div>
            </div>
            <div className="grid gap-2 mt-4">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting || items.every((i) => !i.product)}
          >
            <ShoppingCart className="h-5 w-5" />
            {submitting ? "Recording Sale..." : `Record Sale — ${formatCurrency(total)}`}
          </Button>
        </form>
      </div>
    </div>
  );
}
