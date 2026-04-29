"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ClipboardList,
  X,
} from "lucide-react";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: "admin" | "sales_rep";
  };
  isOpen?: boolean;
  onClose?: () => void;
}

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/sales", label: "Sales", icon: ShoppingCart },
  { href: "/admin/sales-reps", label: "Sales Reps", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const repLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  { href: "/dashboard/record-sale", label: "Record Sale", icon: TrendingUp },
  { href: "/dashboard/my-sales", label: "My Sales", icon: ClipboardList },
];

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const links = user.role === "admin" ? adminLinks : repLinks;

  // Close mobile sidebar on route change
  useEffect(() => {
    if (onClose) onClose();
  }, [pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen flex flex-col bg-surface-900 border-r border-surface-700/50 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-surface-700/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-crimson-500 to-crimson-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            {(!collapsed || isOpen) && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white truncate uppercase tracking-wider">PATJEBZY</h1>
                <p className="text-[10px] text-crimson-400 tracking-wider uppercase font-medium">Reward Yourself</p>
              </div>
            )}
          </div>
          {isOpen && (
            <button onClick={onClose} className="lg:hidden p-1 text-surface-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-crimson-600/15 text-crimson-400 border border-crimson-500/20"
                    : "text-surface-400 hover:text-white hover:bg-surface-800"
                )}
              >
                <link.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-crimson-400" : "text-surface-500 group-hover:text-surface-300"
                  )}
                />
                {(!collapsed || isOpen) && <span className="truncate">{link.label}</span>}
                {isActive && !collapsed && (
                   <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-crimson-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-surface-700/50 p-3 bg-surface-950/50">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-crimson-500 to-purple-600 flex items-center justify-center flex-shrink-0 ring-2 ring-surface-800">
              <span className="text-white text-xs font-semibold">{getInitials(user.name)}</span>
            </div>
            {(!collapsed || isOpen) && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <Badge variant={user.role === "admin" ? "crimson" : "info"} className="mt-0.5 px-1.5 py-0">
                  {user.role === "admin" ? "Admin" : "Sales Rep"}
                </Badge>
              </div>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {(!collapsed || isOpen) && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle (hidden on mobile) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 rounded-full bg-surface-700 border border-surface-600 items-center justify-center text-surface-400 hover:text-white hover:bg-surface-600 transition-all shadow-xl"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>
    </>
  );
}
