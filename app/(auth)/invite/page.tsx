import type { Metadata } from "next";
import { PublicInviteForm } from "@/components/auth/public-invite-form";
import { Link } from "@/components/layout/foresight-link";
import { Button } from "@/components/ui/button";
import { signInGuard } from "@/packages/auth/helper";

export const metadata: Metadata = {
  title: "Accept Invite | Sycom LMS",
  description: "Accept your Sycom LMS platform invite.",
};

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  await signInGuard();
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex h-full w-full items-center justify-center">
          <div className="w-full space-y-3 text-center">
            <div className="space-y-2">
              <h1 className="font-medium text-lg tracking-tight">
                Missing invite token
              </h1>
              <p className="text-muted-foreground text-sm">
                This invite link is incomplete. Ask an admin to send a new one.
              </p>
            </div>
            <Button nativeButton={false} render={<Link href="/sign-in" />}>
              Back to sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-full w-full items-center justify-center">
        <PublicInviteForm token={token} />
      </div>
    </div>
  );
}
