"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error);
        setLoading(false);
        return;
      }

      toast.success("Welcome back!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-crimson-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-crimson-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-crimson-500 to-crimson-700 shadow-xl shadow-crimson-500/20 mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-white">PATJEBZY</h1>
          <p className="text-crimson-400 text-sm tracking-[0.25em] uppercase mt-1">
            Reward Yourself
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-surface-700/50 bg-surface-800/70 backdrop-blur-xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white">Welcome Back</h2>
            <p className="text-sm text-surface-400 mt-1">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </div>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-surface-500 mt-6">
          © {new Date().getFullYear()} PATJEBZY. All rights reserved.
        </p>
      </div>
    </div>
  );
}
