"use client";

import React, { useState } from "react";
import useSWR from "swr";
import TopBar from "@/components/layout/TopBar";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useLayout } from "@/context/LayoutContext";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SalesRepInventoryPage() {
  const { toggleSidebar } = useLayout();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: res, isLoading } = useSWR(
    `/api/products?page=${page}&limit=20&search=${search}&status=active`,
    fetcher
  );

  const products = res?.data || [];
  const total = res?.total || 0;

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
        return (
          <Badge variant={qty <= threshold ? "danger" : "success"}>
            {qty} available
          </Badge>
        );
      },
    },
  ];

  return (
    <div>
      <TopBar 
        title="Inventory" 
        subtitle="Browse available products" 
        onMenuClick={toggleSidebar}
      />
      <div className="p-6 space-y-6">
        <PageHeader title="Products" subtitle={`${total} active products`} />
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
    </div>
  );
}
