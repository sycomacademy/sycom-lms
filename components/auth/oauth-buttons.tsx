"use client";

import { FingerprintIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toast";
import { track } from "@/packages/analytics/client";
import { analyticsEvents } from "@/packages/analytics/events";
import { authClient } from "@/packages/auth/auth-client";
import { cn } from "@/packages/utils/cn";

function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
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
      aria-hidden="true"
      className="h-5 w-5"
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

type OAuthProvider = "google" | "linkedin";

const providerConfig: Record<
  OAuthProvider,
  {
    label: string;
    name: OAuthProvider;
    logo: React.ReactNode;
    disabled: boolean;
  }
> = {
  google: {
    label: "Google",
    name: "google",
    logo: <GoogleLogo />,
    disabled: true,
  },
  linkedin: {
    label: "LinkedIn",
    name: "linkedin",
    logo: <LinkedInLogo />,
    disabled: true,
  },
};

interface OAuthButtonProps {
  provider: OAuthProvider;
  isLastUsed?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  onClick: () => void;
  className?: string;
}

function OAuthButton({
  provider,
  isLastUsed,
  disabled,
  isLoading,
  onClick,
  className,
}: OAuthButtonProps) {
  const config = providerConfig[provider];

  return (
    <div className="relative w-full">
      <Button
        className={cn("w-full gap-3", className)}
        disabled={disabled || isLoading}
        onClick={onClick}
        type="button"
        variant="outline"
      >
        {isLoading ? (
          <Loader2Icon className="h-5 w-5 animate-spin" />
        ) : (
          config.logo
        )}
        <span>Continue with {config.label}</span>
      </Button>
      {isLastUsed && (
        <Badge
          className="pointer-events-none absolute -top-2 -right-2"
          variant="default"
        >
          Last used
        </Badge>
      )}
    </div>
  );
}

interface OAuthButtonsProps {
  type: "sign-in" | "sign-up";
  callbackUrl?: string;
}

export function OAuthButtons({ type, callbackUrl }: OAuthButtonsProps) {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<
    OAuthProvider | "passkey" | null
  >(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastMethod, setLastMethod] = useState<string | null>(null);
  const shouldOpenAccordion =
    isHydrated && lastMethod !== null && lastMethod !== "email";

  useEffect(() => {
    setIsHydrated(true);
    setLastMethod(authClient.getLastUsedLoginMethod());
  }, []);

  async function handleOAuthSignIn(provider: OAuthProvider) {
    setLoadingProvider(provider);
    track({ event: analyticsEvents.oauthSignInStarted, provider });
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: callbackUrl ?? "/dashboard",
    });

    if (error) {
      track({
        event: analyticsEvents.oauthSignInFailed,
        provider,
        error_message: error.message,
        error_code: error.code,
      });
      toastManager.add({
        description: error.message ?? "Failed to sign in. Please try again.",
        title: "Sign in failed",
        type: "error",
      });
      setLoadingProvider(null);
      return;
    }

    track({ event: analyticsEvents.oauthSignInSuccess, provider });
  }

  async function handlePasskeySignIn() {
    setLoadingProvider("passkey");
    track({ event: analyticsEvents.passkeySignInStarted });
    const { error } = await authClient.signIn.passkey({
      autoFill: false,
      fetchOptions: {
        onSuccess() {
          track({ event: analyticsEvents.passkeySignInSuccess });
          toastManager.add({
            title: "Signed in",
            description: "Welcome back.",
            type: "success",
          });
          router.push((callbackUrl ?? "/dashboard") as "/dashboard");
        },
        onError(ctx) {
          track({
            event: analyticsEvents.passkeySignInFailed,
            error_message: ctx.error?.message,
          });
          toastManager.add({
            title: "Sign in failed",
            description:
              (ctx.error as { message?: string })?.message ??
              "Passkey authentication failed. Please try again.",
            type: "error",
          });
        },
      },
    });
    setLoadingProvider(null);
    if (error && !error.message?.includes("User cancelled")) {
      toastManager.add({
        title: "Sign in failed",
        description:
          error.message ?? "Passkey sign-in failed. Please try again.",
        type: "error",
      });
    }
  }

  return (
    <Accordion
      className="border-none"
      defaultValue={shouldOpenAccordion ? ["0"] : []}
      key={shouldOpenAccordion ? "oauth-open" : "oauth-closed"}
    >
      <AccordionItem className="border-none data-open:bg-transparent" value="0">
        <AccordionTrigger className="justify-center gap-2 hover:no-underline">
          More ways to {type === "sign-in" ? "sign in" : "sign up"}
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 pt-2">
            {type === "sign-in" && (
              <Button
                className="w-full gap-3"
                disabled={!!loadingProvider}
                onClick={handlePasskeySignIn}
                type="button"
                variant="outline"
              >
                {loadingProvider === "passkey" ? (
                  <Loader2Icon className="h-5 w-5 animate-spin" />
                ) : (
                  <FingerprintIcon className="h-5 w-5 shrink-0" />
                )}
                <span>Continue with passkey</span>
              </Button>
            )}
            {Object.values(providerConfig).map((provider) => (
              <OAuthButton
                disabled={provider.disabled}
                isLastUsed={lastMethod === provider.name}
                isLoading={loadingProvider === provider.name}
                key={provider.name}
                onClick={() => handleOAuthSignIn(provider.name)}
                provider={provider.name}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
