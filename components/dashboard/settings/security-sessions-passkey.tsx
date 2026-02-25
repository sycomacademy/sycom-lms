"use client";

import {
  CirclePlusIcon,
  FingerprintIcon,
  LaptopIcon,
  Loader2Icon,
  SmartphoneIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toastManager } from "@/components/ui/toast";
import { authClient } from "@/packages/auth/auth-client";
import { useUserQuery } from "@/packages/hooks/use-user";
import { formatDeviceLabel, isMobileAgent } from "@/packages/utils/device";

function isPasskeyDismissedMessage(message?: string) {
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();
  return (
    normalized.includes("timed out or was not allowed") ||
    normalized.includes("abort signal")
  );
}

interface SessionItem {
  id: string;
  token: string;
  userAgent?: string | null;
}

interface PasskeyItem {
  id: string;
  name?: string | null;
  createdAt?: string | Date | null;
  deviceType?: string | null;
}

export function SecuritySessionsPasskey() {
  const router = useRouter();
  const { session: currentSession } = useUserQuery();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [passkeysLoading, setPasskeysLoading] = useState(true);
  const [isAddingPasskey, setIsAddingPasskey] = useState(false);
  const [newPasskeyName, setNewPasskeyName] = useState("");
  const [deletingPasskeyId, setDeletingPasskeyId] = useState<string | null>(
    null
  );

  const fetchSessions = useCallback(async () => {
    const { data, error } = await authClient.listSessions();
    if (error) {
      toastManager.add({
        title: "Failed to fetch sessions",
        description: error.message,
        type: "error",
      });
      return;
    }
    setSessions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const fetchPasskeys = useCallback(async () => {
    const { data, error } = await authClient.passkey.listUserPasskeys({});
    if (error) {
      toastManager.add({
        title: "Failed to fetch passkeys",
        description: error.message,
        type: "error",
      });
      setPasskeysLoading(false);
      return;
    }

    setPasskeys(data ?? []);
    setPasskeysLoading(false);
  }, []);

  useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  const handleRevoke = async (token: string) => {
    setRevokingToken(token);
    const { error } = await authClient.revokeSession({ token });
    if (error) {
      toastManager.add({
        title: "Failed to end session",
        description: error.message,
        type: "error",
      });
      setRevokingToken(null);
      return;
    }
    const isCurrent = token === currentSession.token;
    if (isCurrent) {
      router.push("/");
      return;
    }
    setRevokingToken(null);

    setSessions((prev) => prev.filter((s) => s.token !== token));
    toastManager.add({
      title: "Session ended",
      type: "success",
    });
  };

  const renderSessionsContent = () => {
    if (loading) {
      return (
        <>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </>
      );
    }
    if (sessions.length === 0) {
      return (
        <p className="text-muted-foreground text-sm">No other sessions.</p>
      );
    }
    return (
      <ul className="flex flex-col gap-2">
        {sessions.map((session) => {
          const isCurrent = session.token === currentSession.token;
          const isRevoking = revokingToken === session.token;
          const DeviceIcon = isMobileAgent(session.userAgent)
            ? SmartphoneIcon
            : LaptopIcon;
          let revokeLabel: string;
          if (isRevoking) {
            revokeLabel = "";
          } else if (isCurrent) {
            revokeLabel = "Sign out";
          } else {
            revokeLabel = "End session";
          }
          return (
            <li
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3"
              key={session.id}
            >
              <div className="flex items-center gap-2 text-foreground text-sm">
                <DeviceIcon className="size-4 shrink-0 text-muted-foreground" />
                <span>
                  {formatDeviceLabel(session.userAgent)}
                  {isCurrent && (
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-success/10 px-1.5 py-0.5 text-success text-xs">
                      This device
                    </span>
                  )}
                </span>
              </div>
              <button
                className="text-destructive text-xs underline hover:no-underline disabled:opacity-70"
                disabled={isRevoking}
                onClick={() => handleRevoke(session.token)}
                type="button"
              >
                {isRevoking ? (
                  <Loader2Icon className="inline size-3 animate-spin" />
                ) : (
                  revokeLabel
                )}
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  const handleAddPasskey = async () => {
    setIsAddingPasskey(true);
    const passkeyName = newPasskeyName.trim();
    const { error } = await authClient.passkey.addPasskey({
      name: passkeyName || undefined,
    });
    if (error) {
      if (isPasskeyDismissedMessage(error.message)) {
        setIsAddingPasskey(false);
        return;
      }

      toastManager.add({
        title: "Failed to add passkey",
        description: error.message,
        type: "error",
      });
      setIsAddingPasskey(false);
      return;
    }

    toastManager.add({
      title: "Passkey added",
      description: "You can now sign in with this device passkey.",
      type: "success",
    });
    setNewPasskeyName("");
    setIsAddingPasskey(false);
    fetchPasskeys();
  };

  const handleDeletePasskey = async (id: string) => {
    setDeletingPasskeyId(id);
    const { error } = await authClient.passkey.deletePasskey({ id });
    if (error) {
      toastManager.add({
        title: "Failed to delete passkey",
        description: error.message,
        type: "error",
      });
      setDeletingPasskeyId(null);
      return;
    }

    toastManager.add({
      title: "Passkey deleted",
      type: "success",
    });
    setPasskeys((prev) => prev.filter((item) => item.id !== id));
    setDeletingPasskeyId(null);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-medium text-foreground text-sm">
            Sessions & passkey
          </h3>
          <p className="text-muted-foreground text-xs">
            Manage devices where you're signed in and passkeys for passwordless
            sign-in.
          </p>
        </div>

        <div className="mt-4">
          <p className="mb-2 font-medium text-foreground text-xs">
            Active sessions
          </p>
          {renderSessionsContent()}
        </div>

        <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-2 text-foreground text-sm">
            <div className="flex items-center gap-2">
              <FingerprintIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="font-medium text-xs">Passkeys</span>
            </div>
          </div>

          <p className="mt-1 text-muted-foreground text-xs">
            Register passkeys to sign in without your password.
          </p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              className="h-8"
              onChange={(event) => setNewPasskeyName(event.target.value)}
              placeholder="Optional name (e.g. Work MacBook)"
              value={newPasskeyName}
            />
            <button
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-border px-3 text-xs underline hover:no-underline disabled:opacity-70"
              disabled={isAddingPasskey}
              onClick={handleAddPasskey}
              type="button"
            >
              {isAddingPasskey ? (
                <Loader2Icon className="size-3 animate-spin" />
              ) : (
                <CirclePlusIcon className="size-3" />
              )}
              Save passkey
            </button>
          </div>

          <div className="mt-3">
            {passkeysLoading ? <Skeleton className="h-10 w-full" /> : null}
            {!passkeysLoading && passkeys.length === 0 ? (
              <p className="text-muted-foreground text-xs">
                No passkeys registered.
              </p>
            ) : null}
            {!passkeysLoading && passkeys.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {passkeys.map((item) => {
                  const isDeleting = deletingPasskeyId === item.id;
                  return (
                    <li
                      className="flex items-center justify-between gap-2 rounded-md border border-border bg-background p-2.5"
                      key={item.id}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-xs">
                          {item.name || "Unnamed passkey"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {item.deviceType || "Unknown device"}
                        </p>
                      </div>
                      <button
                        className="text-destructive text-xs underline hover:no-underline disabled:opacity-70"
                        disabled={isDeleting}
                        onClick={() => handleDeletePasskey(item.id)}
                        type="button"
                      >
                        {isDeleting ? (
                          <Loader2Icon className="inline size-3 animate-spin" />
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Trash2Icon className="size-3" />
                            Remove
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
