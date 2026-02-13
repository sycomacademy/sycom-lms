"use client";

import {
  FingerprintIcon,
  LaptopIcon,
  Loader2Icon,
  SmartphoneIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toastManager } from "@/components/ui/toast";
import { authClient } from "@/packages/auth/auth-client";
import { useUserQuery } from "@/packages/hooks/use-user";
import { formatDeviceLabel, isMobileAgent } from "@/packages/utils/device";

interface SessionItem {
  id: string;
  token: string;
  userAgent?: string | null;
}

export function SecuritySessionsPasskey() {
  const router = useRouter();
  const { session: currentSession } = useUserQuery();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);

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

  const handleRevoke = async (token: string) => {
    setRevokingToken(token);
    const { error } = await authClient.revokeSession({ token });
    if (error) {
      toastManager.add({
        title: "Failed to end session",
        description: error.message,
        type: "error",
      });
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
