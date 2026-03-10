"use client";

import { ArrowRight, Check, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { track } from "@/packages/analytics/client";
import { analyticsEvents } from "@/packages/analytics/events";
import { authClient } from "@/packages/auth/auth-client";

function GoogleLogo() {
  return (
    <svg
      aria-hidden
      className="size-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Google</title>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LinkedInLogo() {
  return (
    <svg
      aria-hidden
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>LinkedIn</title>
      <path
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
        fill="#0077B5"
      />
    </svg>
  );
}

type OAuthProvider = "google" | "linkedin";

const providerConfig: Record<
  OAuthProvider,
  { label: string; logo: React.ReactNode; description: string }
> = {
  google: {
    label: "Google",
    logo: <GoogleLogo />,
    description: "Sign in with your Google account",
  },
  linkedin: {
    label: "LinkedIn",
    logo: <LinkedInLogo />,
    description: "Sign in with your LinkedIn account",
  },
};

interface LinkedAccount {
  id: string;
  providerId: string;
}

export function SecurityLinkOAuth() {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(
    null
  );
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [unlinkingProviderId, setUnlinkingProviderId] = useState<string | null>(
    null
  );
  const [unlinkDialogProvider, setUnlinkDialogProvider] =
    useState<OAuthProvider | null>(null);

  const fetchAccounts = useCallback(async () => {
    const { data, error } = await authClient.listAccounts();
    if (error) {
      toastManager.add({
        title: "Could not load linked accounts",
        description: error.message,
        type: "error",
      });
      setLoadingAccounts(false);
      return;
    }
    setLinkedAccounts(
      (data ?? []).map((a: { id: string; providerId: string }) => ({
        id: a.id,
        providerId: a.providerId,
      }))
    );
    setLoadingAccounts(false);
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  async function handleLink(provider: OAuthProvider) {
    setLoadingProvider(provider);
    const { error } = await authClient.linkSocial({
      provider,
      callbackURL: "/dashboard/settings/security",
    });
    setLoadingProvider(null);
    if (error) {
      toastManager.add({
        title: "Could not link account",
        description: error.message,
        type: "error",
      });
      return;
    }
    track({
      event: analyticsEvents.settingsOauthLinked,
      provider,
    });
    fetchAccounts();
  }

  async function handleUnlink(providerId: string) {
    setUnlinkingProviderId(providerId);
    const { error } = await authClient.unlinkAccount({ providerId });
    setUnlinkingProviderId(null);
    setUnlinkDialogProvider(null);
    if (error) {
      toastManager.add({
        title: "Could not unlink account",
        description: error.message,
        type: "error",
      });
      return;
    }
    track({
      event: analyticsEvents.settingsOauthUnlinked,
      provider: providerId,
    });
    toastManager.add({
      title: "Account unlinked",
      type: "success",
    });
    fetchAccounts();
  }

  const isLinked = (provider: OAuthProvider) =>
    linkedAccounts.some(
      (a) => a.providerId === provider || a.providerId.startsWith(`${provider}`)
    );

  const getProviderIdForUnlink = (provider: OAuthProvider) =>
    linkedAccounts.find(
      (a) => a.providerId === provider || a.providerId.startsWith(`${provider}`)
    )?.providerId;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-medium text-foreground text-sm">
            Linked accounts
          </h3>
          <p className="text-muted-foreground text-xs">
            Connect your Google or LinkedIn account for easier sign-in.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {loadingAccounts ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : (
            (["google", "linkedin"] as const).map((provider) => {
              const config = providerConfig[provider];
              const isLoading = loadingProvider === provider;
              const linked = isLinked(provider);
              const providerIdForUnlink = getProviderIdForUnlink(provider);
              const isUnlinking =
                providerIdForUnlink &&
                unlinkingProviderId === providerIdForUnlink;

              return (
                <div
                  className="flex items-center gap-4 rounded-sm border border-border bg-card p-4"
                  key={provider}
                >
                  {/* Icon Container */}
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-secondary">
                    {config.logo}
                  </div>

                  {/* Text Content */}
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">
                        {config.label}
                      </span>
                      {linked && (
                        <span className="inline-flex items-center gap-1 text-success text-xs">
                          <Check className="size-3.5" />
                          Connected
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {linked
                        ? `${config.label} is connected to your account`
                        : config.description}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {linked ? (
                      <AlertDialog
                        onOpenChange={(open) =>
                          !open && setUnlinkDialogProvider(null)
                        }
                        open={unlinkDialogProvider === provider}
                      >
                        <Button
                          onClick={() => setUnlinkDialogProvider(provider)}
                          size="icon-sm"
                          variant={"destructive"}
                        >
                          {isUnlinking ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Disconnect {config.label}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              You will no longer be able to sign in with{" "}
                              {config.label}. You can reconnect it anytime.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              disabled={!!isUnlinking}
                              onClick={() =>
                                providerIdForUnlink &&
                                handleUnlink(providerIdForUnlink)
                              }
                              variant="destructive"
                            >
                              {isUnlinking ? (
                                <Spinner className="size-4" />
                              ) : (
                                "Disconnect"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button
                        disabled={isLoading}
                        onClick={() => handleLink(provider)}
                        size="sm"
                      >
                        {isLoading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <>
                            Connect
                            <ArrowRight className="size-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
