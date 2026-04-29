"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { LayoutProvider } from "@/context/LayoutContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LayoutProvider>
        {children}
      </LayoutProvider>
    </SessionProvider>
  );
}
