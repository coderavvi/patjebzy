"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLayout } from "@/context/LayoutContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { sidebarOpen, setSidebarOpen } = useLayout();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="space-y-4 w-64 text-center">
          <div className="h-12 w-12 rounded-xl bg-crimson-600 animate-pulse mx-auto mb-4" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-navy-950">
      <Sidebar 
        user={session.user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="lg:pl-64 transition-all duration-300 min-h-screen flex flex-col">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
