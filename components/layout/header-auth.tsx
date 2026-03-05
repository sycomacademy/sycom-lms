"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeaderAuth({ isSignedIn }: { isSignedIn: boolean }) {
  if (!isSignedIn) {
    return (
      <Button
        nativeButton={false}
        render={<Link href="/sign-in">Sign in</Link>}
        variant="outline"
      />
    );
  }

  return (
    <Button
      nativeButton={false}
      render={<Link href="/dashboard">Go to Dashboard</Link>}
      variant="outline"
    />
  );
}
