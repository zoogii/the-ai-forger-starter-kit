"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "next-auth";
import { signOut } from "next-auth/react";

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>Account information and settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Name</p>
            <p className="text-lg">{user.name || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Email</p>
            <p className="text-lg">{user.email}</p>
          </div>
          {user.image && (
            <div>
              <p className="text-sm font-medium text-gray-600">Profile Image</p>
              <img
                src={user.image}
                alt="Profile"
                className="w-16 h-16 rounded-full mt-2"
              />
            </div>
          )}
          <div className="pt-4 border-t">
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
