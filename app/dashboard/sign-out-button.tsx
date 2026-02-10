"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/packages/auth/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
    setPending(false);
  }

  return (
    <Button
      disabled={pending}
      onClick={handleSignOut}
      size="sm"
      variant="outline"
    >
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
