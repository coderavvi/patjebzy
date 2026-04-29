"use client";

import React, { useState } from "react";
import useSWR from "swr";
import TopBar from "@/components/layout/TopBar";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useLayout } from "@/context/LayoutContext";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminSalesPage() {
  const { toggleSidebar } = useLayout();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<Record<string, unknown> | null>(null);

  const { data: res, isLoading } = useSWR(
    `/api/sales?page=${page}&limit=20&search=${search}`,
    fetcher
  );

  const sales = res?.data || [];
  const total = res?.total || 0;

  const columns = [
    {
      key: "saleNumber",
      label: "Sale #",
      render: (item: Record<string, unknown>) => (
        <span className="font-mono text-crimson-400 text-xs">{item.saleNumber as string}</span>
      ),
    },
    {
      key: "products",
      label: "Products",
      render: (item: Record<string, unknown>) => {
        const items = item.items as Record<string, any>[];
        return (
          <div className="max-w-[200px] truncate text-xs text-surface-400">
            {items?.map(i => i.productName).join(", ")}
          </div>
        );
      },
    },
    {
      key: "customerName",
      label: "Customer",
      render: (item: Record<string, unknown>) => (item.customerName as string) || "Walk-in",
    },
    {
      key: "items",
      label: "Items",
      render: (item: Record<string, unknown>) => {
        const items = item.items as unknown[];
        return <Badge variant="info">{items?.length || 0} items</Badge>;
      },
    },
    {
      key: "totalAmount",
      label: "Amount",
      render: (item: Record<string, unknown>) => (
        <span className="font-semibold text-emerald-400">
          {formatCurrency(item.totalAmount as number)}
        </span>
      ),
    },
    {
      key: "soldBy",
      label: "Sold By",
      render: (item: Record<string, unknown>) => {
        const rep = item.soldBy as Record<string, string>;
        return rep?.name || "Unknown";
      },
    },
    {
      key: "createdAt",
      label: "Date",
      render: (item: Record<string, unknown>) => formatDate(item.createdAt as string),
    },
  ];

  return (
    <div>
      <TopBar 
        title="Sales" 
        subtitle="View all sales transactions" 
        onMenuClick={toggleSidebar}
      />
      <div className="p-6 space-y-6">
        <PageHeader title="All Sales" subtitle={`${total} total transactions`} />

        <DataTable
          columns={columns}
          data={sales}
          total={total}
          page={page}
          limit={20}
          loading={isLoading}
          searchPlaceholder="Search by sale # or customer..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
          onPageChange={setPage}
          onRowClick={setSelectedSale}
          getId={(item) => item._id as string}
        />
      </div>

      {/* Sale Detail Modal */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sale {selectedSale?.saleNumber as string}</DialogTitle>
            <DialogDescription>
              {formatDate(selectedSale?.createdAt as string)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-surface-400">Customer</p>
                <p className="text-white">{(selectedSale?.customerName as string) || "Walk-in"}</p>
              </div>
              <div>
                <p className="text-surface-400">Sold By</p>
                <p className="text-white">
                  {(selectedSale?.soldBy as Record<string, string>)?.name || "Unknown"}
                </p>
              </div>
            </div>

            <div className="border-t border-surface-700 pt-4">
              <p className="text-sm font-medium text-surface-300 mb-2">Items</p>
              <div className="space-y-2">
                {(selectedSale?.items as Record<string, unknown>[])?.map(
                  (item: Record<string, unknown>, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded bg-surface-900/50"
                    >
                      <div>
                        <p className="text-sm text-white">{item.productName as string}</p>
                        <p className="text-xs text-surface-400">
                          {item.quantity as number} × {formatCurrency(item.unitPrice as number)}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {formatCurrency(item.totalPrice as number)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="border-t border-surface-700 pt-4 flex justify-between">
              <span className="text-surface-300 font-medium">Total</span>
              <span className="text-lg font-bold text-emerald-400">
                {formatCurrency(selectedSale?.totalAmount as number)}
              </span>
            </div>

            {!!selectedSale?.notes && (
              <div className="border-t border-surface-700 pt-4">
                <p className="text-sm text-surface-400">Notes</p>
                <p className="text-sm text-white mt-1">{selectedSale.notes as string}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
