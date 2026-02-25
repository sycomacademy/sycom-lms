"use client";

import { FingerprintIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { authClient } from "@/packages/auth/auth-client";

function isPasskeyDismissedError(error: unknown) {
  if (!error) {
    return false;
  }

  if (error instanceof DOMException) {
    return error.name === "NotAllowedError" || error.name === "AbortError";
  }

  if (typeof error === "object" && error !== null && "name" in error) {
    const name = String((error as { name?: unknown }).name ?? "");
    return name === "NotAllowedError" || name === "AbortError";
  }

  return false;
}

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

export function PasskeySignInButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePasskeySignIn = async () => {
    setIsLoading(true);
    try {
      const { data: response, error } = await authClient.signIn.passkey({
        autoFill: false,
      });

      if (error) {
        if (isPasskeyDismissedMessage(error.message)) {
          setIsLoading(false);
          return;
        }

        toastManager.add({
          title: "Passkey sign-in failed",
          description: error.message,
          type: "error",
        });
        setIsLoading(false);
        return;
      }

      if (
        response &&
        "twoFactorRedirect" in response &&
        response.twoFactorRedirect
      ) {
        toastManager.add({
          title: "Two-factor verification required",
          description: "Enter your authenticator code to finish sign-in.",
          type: "info",
        });
        window.location.href = "/two-factor";
        setIsLoading(false);
        return;
      }

      toastManager.add({
        title: "Signed in",
        description: "Passkey authentication successful.",
        type: "success",
      });
      await authClient.revokeOtherSessions();
      router.refresh();
      router.push("/dashboard");
    } catch (error) {
      if (isPasskeyDismissedError(error)) {
        setIsLoading(false);
        return;
      }

      toastManager.add({
        title: "Passkey sign-in failed",
        description: "Could not complete passkey authentication.",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full"
      disabled={isLoading}
      onClick={handlePasskeySignIn}
      type="button"
      variant="secondary"
    >
      {isLoading ? (
        <Spinner className="mr-2" />
      ) : (
        <FingerprintIcon className="mr-2 size-4" />
      )}
      Continue with passkey
    </Button>
  );
}
