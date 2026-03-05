"use client";

import {
  FingerprintIcon,
  LaptopIcon,
  Loader2Icon,
  SmartphoneIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toastManager } from "@/components/ui/toast";
import { authClient } from "@/packages/auth/auth-client";
import { useUserQuery } from "@/packages/hooks/use-user";
import { formatDeviceLabel, isMobileAgent } from "@/packages/utils/device";

export function SecuritySessionsPasskey() {
  const router = useRouter();
  const { session: currentSession } = useUserQuery();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (!currentSession?.token) {
      return;
    }
    setSigningOut(true);
    const { error } = await authClient.revokeSession({
      token: currentSession.token,
    });
    if (error) {
      toastManager.add({
        title: "Failed to sign out",
        description: error.message,
        type: "error",
      });
      setSigningOut(false);
      return;
    }
    router.push("/");
  };

  if (!currentSession) {
    return null;
  }

  const DeviceIcon = isMobileAgent(currentSession.userAgent)
    ? SmartphoneIcon
    : LaptopIcon;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-medium text-foreground text-sm">
            Sessions & passkey
          </h3>
          <p className="text-muted-foreground text-xs">
            Manage devices where you&apos;re signed in and passkeys for
            passwordless sign-in.
          </p>
        </div>

        <div className="mt-4">
          <p className="mb-2 font-medium text-foreground text-xs">
            Current session
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3">
            <div className="flex items-center gap-2 text-foreground text-sm">
              <DeviceIcon className="size-4 shrink-0 text-muted-foreground" />
              <span>
                {formatDeviceLabel(currentSession.userAgent)}
                <span className="ml-1.5 inline-flex items-center rounded-full bg-success/10 px-1.5 py-0.5 text-success text-xs">
                  This device
                </span>
              </span>
            </div>
            <button
              className="text-destructive text-xs underline hover:no-underline disabled:opacity-70"
              disabled={signingOut}
              onClick={handleSignOut}
              type="button"
            >
              {signingOut ? (
                <Loader2Icon className="inline size-3 animate-spin" />
              ) : (
                "Sign out"
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-foreground text-sm">
            <FingerprintIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="font-medium text-xs">Passkeys</span>
          </div>
          <p className="mt-1 text-muted-foreground text-xs">
            Use passkeys to sign in without a password. Passkey functionality is
            not yet available.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
