"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import TopBar from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Bell, Shield } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { toggleSidebar } = useLayout();
  const { data: session, update } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${session?.user.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <TopBar 
        title="Settings" 
        subtitle="Manage your account" 
        onMenuClick={toggleSidebar}
      />
      <div className="p-6 max-w-lg">
        <div className="rounded-xl border border-surface-700/50 bg-surface-800/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-crimson-500/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-crimson-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Change Password</h3>
              <p className="text-sm text-surface-400">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid gap-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
