import type { Metadata } from "next";
import { TwoFactorForm } from "@/components/auth/two-factor-form";
import { signInGuard } from "@/packages/auth/helper";

export const metadata: Metadata = {
  title: "Two-Factor Verification | Sycom LMS",
  description: "Verify your identity with a two-factor code.",
};

export default async function TwoFactorPage() {
  await signInGuard();
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-full w-full items-center justify-center">
        <TwoFactorForm />
      </div>
    </div>
  );
}
