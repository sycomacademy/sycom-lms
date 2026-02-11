"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountSecurity() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {/* Change Password */}
      <Card>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-medium text-foreground text-sm">
              Change password
            </h3>
            <p className="text-muted-foreground text-xs">
              Update your password to keep your account secure.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs" htmlFor="current-password">
                Current password
              </Label>
              <div className="relative">
                <Input
                  className="pr-9"
                  id="current-password"
                  placeholder="Enter current password"
                  type={showCurrent ? "text" : "password"}
                />
                <button
                  aria-label={showCurrent ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrent((v) => !v)}
                  type="button"
                >
                  {showCurrent ? (
                    <EyeOffIcon className="size-3.5" />
                  ) : (
                    <EyeIcon className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs" htmlFor="new-password">
                New password
              </Label>
              <div className="relative">
                <Input
                  className="pr-9"
                  id="new-password"
                  placeholder="Enter new password"
                  type={showNew ? "text" : "password"}
                />
                <button
                  aria-label={showNew ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNew((v) => !v)}
                  type="button"
                >
                  {showNew ? (
                    <EyeOffIcon className="size-3.5" />
                  ) : (
                    <EyeIcon className="size-3.5" />
                  )}
                </button>
              </div>
              <p className="text-muted-foreground text-xs">
                Must be at least 8 characters with a mix of letters and numbers.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs" htmlFor="confirm-password">
                Confirm new password
              </Label>
              <div className="relative">
                <Input
                  className="pr-9"
                  id="confirm-password"
                  placeholder="Confirm new password"
                  type={showConfirm ? "text" : "password"}
                />
                <button
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirm((v) => !v)}
                  type="button"
                >
                  {showConfirm ? (
                    <EyeOffIcon className="size-3.5" />
                  ) : (
                    <EyeIcon className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm">Update password</Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-medium text-foreground text-sm">
                Active sessions
              </h3>
              <p className="text-muted-foreground text-xs">
                Manage devices where you're currently signed in.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-md border border-border p-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="font-medium text-foreground text-xs">
                  Current session
                </p>
                <p className="text-muted-foreground text-xs">
                  This device &middot; Active now
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-success text-xs">
                Active
              </span>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button size="sm" variant="destructive">
              Sign out other sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-medium text-destructive-foreground text-sm">
                Delete account
              </h3>
              <p className="text-muted-foreground text-xs">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <Button className="shrink-0" size="sm" variant="destructive">
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
