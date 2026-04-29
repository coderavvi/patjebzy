"use client";

import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import TopBar from "@/components/layout/TopBar";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Plus, Edit, ShieldCheck, ShieldAlert, Trash2, UserPlus } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminUsersPage() {
  const { toggleSidebar } = useLayout();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "sales_rep" as const,
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  const queryStr = `/api/users?search=${search}`;
  const { data: res, isLoading } = useSWR(queryStr, fetcher);
  const users = res?.data || [];

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: "", email: "", password: "", role: "sales_rep", phone: "" });
    setModalOpen(true);
  };

  const openEdit = (user: Record<string, unknown>) => {
    setEditing(user);
    setFormData({
      name: user.name as string,
      email: user.email as string,
      password: "",
      role: user.role as "sales_rep",
      phone: (user.phone as string) || "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        const { password, ...updateData } = formData;
        const res = await fetch(`/api/users/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        toast.success("User updated!");
      } else {
        if (!formData.password) {
          toast.error("Password is required for new users");
          setSaving(false);
          return;
        }
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        toast.success("User created!");
      }
      setModalOpen(false);
      mutate(queryStr);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/users/${deleting._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("User deactivated");
      setDeleteOpen(false);
      setDeleting(null);
      mutate(queryStr);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (item: Record<string, unknown>) => (
        <Badge variant={item.role === "admin" ? "crimson" : "info"}>
          {item.role === "admin" ? "Admin" : "Sales Rep"}
        </Badge>
      ),
    },
    { key: "phone", label: "Phone", render: (item: Record<string, unknown>) => (item.phone as string) || "—" },
    {
      key: "isActive",
      label: "Status",
      render: (item: Record<string, unknown>) => (
        <Badge variant={item.isActive ? "success" : "danger"}>
          {item.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (item: Record<string, unknown>) => formatDate(item.createdAt as string),
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
        title="Sales Reps" 
        subtitle="Manage your team" 
        onMenuClick={toggleSidebar}
      />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Team Members"
          subtitle={`${users.length} users`}
          actionLabel="Add User"
          actionIcon={UserPlus}
          onAction={openCreate}
        />

        <DataTable
          columns={columns}
          data={users}
          total={users.length}
          loading={isLoading}
          searchPlaceholder="Search users..."
          onSearch={(q) => setSearch(q)}
          getId={(item) => item._id as string}
        />
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update user details." : "Create a new user account."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            {!editing && (
              <div className="grid gap-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as "sales_rep" })}
                options={[
                  { value: "sales_rep", label: "Sales Rep" },
                  { value: "admin", label: "Admin" },
                ]}
              />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

      {/* Deactivate Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate &quot;{deleting?.name as string}&quot;?
              They will no longer be able to log in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeactivate}>
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
