"use client";

import {
  FingerprintIcon,
  LaptopIcon,
  Loader2Icon,
  PlusIcon,
  SmartphoneIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { authClient } from "@/packages/auth/auth-client";
import { useUserQuery } from "@/packages/hooks/use-user";
import { formatDeviceLabel, isMobileAgent } from "@/packages/utils/device";

interface PasskeyInfo {
  id: string;
  name: string | null;
  createdAt?: Date;
}

export function SecuritySessionsPasskey() {
  const router = useRouter();
  const { session: currentSession } = useUserQuery();
  const [signingOut, setSigningOut] = useState(false);
  const [passkeys, setPasskeys] = useState<PasskeyInfo[] | null>(null);
  const [loadingPasskeys, setLoadingPasskeys] = useState(true);
  const [addingPasskey, setAddingPasskey] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPasskeys = useCallback(async () => {
    const { data, error } = await authClient.passkey.listUserPasskeys();
    if (error) {
      toastManager.add({
        title: "Could not load passkeys",
        description: error.message,
        type: "error",
      });
      setPasskeys([]);
    } else {
      setPasskeys(
        (data ?? []).map((p) => ({
          id: p.id,
          name: p.name ?? null,
          createdAt: p.createdAt,
        }))
      );
    }
    setLoadingPasskeys(false);
  }, []);

  useEffect(() => {
    if (currentSession) {
      fetchPasskeys().catch(() => {
        /* ignore */
      });
    }
  }, [currentSession, fetchPasskeys]);

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

  const handleAddPasskey = async () => {
    setAddingPasskey(true);
    const { error } = await authClient.passkey.addPasskey({
      name: "Sycom LMS",
      authenticatorAttachment: "platform",
    });
    setAddingPasskey(false);
    setAddDialogOpen(false);
    if (error) {
      toastManager.add({
        title: "Could not add passkey",
        description: error.message,
        type: "error",
      });
      return;
    }
    toastManager.add({
      title: "Passkey added",
      description: "You can now sign in with this passkey.",
      type: "success",
    });
    fetchPasskeys().catch(() => {
      /* ignore */
    });
  };

  const handleDeletePasskey = async (id: string) => {
    setDeletingId(id);
    const { error } = await authClient.passkey.deletePasskey({ id });
    setDeletingId(null);
    if (error) {
      toastManager.add({
        title: "Could not remove passkey",
        description: error.message,
        type: "error",
      });
      return;
    }
    toastManager.add({
      title: "Passkey removed",
      type: "success",
    });
    fetchPasskeys().catch(() => {
      /* ignore */
    });
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
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-foreground text-sm">
              <FingerprintIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="font-medium text-xs">Passkeys</span>
            </div>
            <Button
              disabled={addingPasskey}
              onClick={() => setAddDialogOpen(true)}
              size="xs"
              type="button"
              variant="ghost"
            >
              {addingPasskey ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <PlusIcon className="size-3.5" />
              )}
              Add passkey
            </Button>
          </div>
          <p className="mt-1 text-muted-foreground text-xs">
            Use passkeys to sign in without a password. Add a passkey from this
            device to enable passwordless sign-in.
          </p>
          {loadingPasskeys && <Skeleton className="mt-3 h-10 w-full" />}
          {!loadingPasskeys && passkeys && passkeys.length > 0 && (
            <ul className="mt-3 space-y-2">
              {passkeys.map((pk) => (
                <li
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2"
                  key={pk.id}
                >
                  <span className="text-foreground text-xs">
                    {pk.name ?? "Passkey"}
                  </span>
                  <Button
                    disabled={!!deletingId}
                    onClick={() => handleDeletePasskey(pk.id)}
                    size="xs"
                    type="button"
                    variant="ghost"
                  >
                    {deletingId === pk.id ? (
                      <Loader2Icon className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2Icon className="size-3.5" />
                    )}
                    <span className="sr-only">Remove passkey</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

      <Dialog onOpenChange={setAddDialogOpen} open={addDialogOpen}>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Add passkey</DialogTitle>
            <DialogDescription>
              Your browser will prompt you to create a passkey using your
              fingerprint, face, or device PIN. You can then sign in without a
              password.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel className="flex gap-2">
            <Button
              disabled={addingPasskey}
              onClick={() => setAddDialogOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={addingPasskey}
              onClick={handleAddPasskey}
              type="button"
            >
              {addingPasskey ? <Spinner className="mr-2" /> : null}
              Add passkey
            </Button>
          </DialogPanel>
        </DialogPopup>
      </Dialog>
    </Card>
  );
}
