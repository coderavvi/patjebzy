"use client";

import React, { useState, useCallback } from "react";
import useSWR, { mutate } from "swr";
import TopBar from "@/components/layout/TopBar";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { Edit, Trash2, Plus } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminInventoryPage() {
  const { toggleSidebar } = useLayout();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    costPrice: 0,
    sellingPrice: 0,
    quantity: 0,
    lowStockThreshold: 10,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const queryStr = `/api/products?page=${page}&limit=20&search=${search}`;
  const { data: res, isLoading } = useSWR(queryStr, fetcher);
  const { data: catRes } = useSWR("/api/categories", fetcher);

  const categories = catRes?.data || [];
  const products = res?.data || [];
  const total = res?.total || 0;

  const openCreate = () => {
    setEditing(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      costPrice: 0,
      sellingPrice: 0,
      quantity: 0,
      lowStockThreshold: 10,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (product: Record<string, unknown>) => {
    setEditing(product);
    const cat = product.category as Record<string, unknown>;
    setFormData({
      name: product.name as string,
      description: (product.description as string) || "",
      category: (cat?._id as string) || "",
      costPrice: product.costPrice as number,
      sellingPrice: product.sellingPrice as number,
      quantity: product.quantity as number,
      lowStockThreshold: product.lowStockThreshold as number,
      isActive: product.isActive as boolean,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editing ? `/api/products/${editing._id}` : "/api/products";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(editing ? "Product updated!" : "Product created!");
      setModalOpen(false);
      mutate(queryStr);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/products/${deleting._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Product deleted");
      setDeleteOpen(false);
      setDeleting(null);
      mutate(queryStr);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const columns = [
    { key: "name", label: "Product" },
    {
      key: "sku",
      label: "SKU",
      render: (item: Record<string, unknown>) => (
        <span className="font-mono text-xs text-surface-400">{item.sku as string}</span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (item: Record<string, unknown>) => {
        const cat = item.category as Record<string, unknown>;
        return <span>{(cat?.name as string) || "—"}</span>;
      },
    },
    {
      key: "sellingPrice",
      label: "Price",
      render: (item: Record<string, unknown>) => formatCurrency(item.sellingPrice as number),
    },
    {
      key: "quantity",
      label: "Stock",
      render: (item: Record<string, unknown>) => {
        const qty = item.quantity as number;
        const threshold = item.lowStockThreshold as number;
        const isLow = qty <= threshold;
        return (
          <Badge variant={isLow ? "danger" : "success"}>
            {qty} {isLow ? "⚠" : ""}
          </Badge>
        );
      },
    },
    {
      key: "isActive",
      label: "Status",
      render: (item: Record<string, unknown>) => (
        <Badge variant={item.isActive ? "success" : "default"}>
          {item.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (item: Record<string, unknown>) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(item); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setDeleting(item);
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <TopBar 
        title="Inventory" 
        subtitle="Manage your product catalog" 
        onMenuClick={toggleSidebar}
      />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Products"
          subtitle={`${total} products in inventory`}
          actionLabel="Add Product"
          onAction={openCreate}
        />

        <DataTable
          columns={columns}
          data={products}
          total={total}
          page={page}
          limit={20}
          loading={isLoading}
          searchPlaceholder="Search products..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
          onPageChange={setPage}
          getId={(item) => item._id as string}
        />
      </div>

      {/* Create/Edit Product Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the product details." : "Fill in the product details."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={categories.map((c: Record<string, unknown>) => ({
                  value: c._id as string,
                  label: c.name as string,
                }))}
                placeholder="Select category"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Cost Price (₦)</Label>
                <Input
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, costPrice: Number(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Selling Price (₦)</Label>
                <Input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: Number(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Low Stock Threshold</Label>
                <Input
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleting?.name as string}&quot;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
