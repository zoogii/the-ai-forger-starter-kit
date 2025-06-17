"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Edit, Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../../app/generated/prisma";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  tokens: number;
  tokensExpiresAt: Date | null;
  subscriptions: any[];
  _count: {
    subscriptions: number;
    paymentHistory: number;
  };
}

interface UserManagementProps {
  users: User[];
  onUserUpdate: (
    userId: string,
    updates: { role?: UserRole; tokens?: number; tokensExpiresAt?: Date }
  ) => void;
}

export default function UserManagement({
  users,
  onUserUpdate,
}: UserManagementProps) {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    role: UserRole;
    tokens: string;
    tokensExpiresAt: Date | undefined;
  }>({
    role: UserRole.USER,
    tokens: "0",
    tokensExpiresAt: undefined,
  });
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});

  const startEditing = (user: User) => {
    setEditingUser(user.id);
    setEditData({
      role: user.role,
      tokens: user.tokens.toString(),
      tokensExpiresAt: user.tokensExpiresAt
        ? new Date(user.tokensExpiresAt)
        : undefined,
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditData({
      role: UserRole.USER,
      tokens: "0",
      tokensExpiresAt: undefined,
    });
  };

  const saveChanges = async (userId: string) => {
    const tokens = parseInt(editData.tokens);
    if (isNaN(tokens) || tokens < 0) {
      toast.error("Please enter a valid number of tokens");
      return;
    }

    setUpdating((prev) => ({ ...prev, [userId]: true }));
    try {
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role: editData.role,
          tokens,
          tokensExpiresAt: editData.tokensExpiresAt?.toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to update user");

      onUserUpdate(userId, {
        role: editData.role,
        tokens,
        tokensExpiresAt: editData.tokensExpiresAt,
      });
      setEditingUser(null);
      toast.success("User updated successfully");
    } catch (error) {
      toast.error("Failed to update user");
    } finally {
      setUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "destructive";
      case UserRole.PREMIUM:
        return "default";
      case UserRole.BANNED:
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (date: string | Date | null) => {
    return date ? new Date(date).toLocaleDateString() : "Never";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.name || "No name"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {user._count.subscriptions} subs •{" "}
                    {user._count.paymentHistory} payments
                  </span>
                  {editingUser === user.id ? (
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        onClick={() => saveChanges(user.id)}
                        disabled={updating[user.id]}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                        disabled={updating[user.id]}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Role</label>
                  {editingUser === user.id ? (
                    <select
                      value={editData.role}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          role: e.target.value as UserRole,
                        }))
                      }
                      disabled={updating[user.id]}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value={UserRole.USER}>USER</option>
                      <option value={UserRole.PREMIUM}>PREMIUM</option>
                      <option value={UserRole.ADMIN}>ADMIN</option>
                      <option value={UserRole.BANNED}>BANNED</option>
                    </select>
                  ) : (
                    <p className="text-sm py-2">{user.role}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Tokens</label>
                  {editingUser === user.id ? (
                    <Input
                      type="number"
                      min="0"
                      value={editData.tokens}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          tokens: e.target.value,
                        }))
                      }
                      disabled={updating[user.id]}
                    />
                  ) : (
                    <p className="text-sm py-2">{user.tokens}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Expires: {formatDate(user.tokensExpiresAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Token Expiry</label>
                  {editingUser === user.id ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={updating[user.id]}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editData.tokensExpiresAt ? (
                            format(editData.tokensExpiresAt, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={editData.tokensExpiresAt}
                          onSelect={(date) =>
                            setEditData((prev) => ({
                              ...prev,
                              tokensExpiresAt: date,
                            }))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className="text-sm py-2">
                      {user.subscriptions.length > 0
                        ? user.subscriptions[0].stripeProduct?.name || "Active"
                        : "None"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
