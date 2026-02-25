import type { Metadata } from "next";
import { TwoFactorForm } from "@/components/auth/two-factor-form";

export const metadata: Metadata = {
  title: "Two-Factor Verification | Sycom LMS",
  description: "Verify your account with a two-factor authentication code.",
};

export default function TwoFactorPage() {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-full w-full items-center justify-center">
        <TwoFactorForm />
      </div>
    </div>
  );
}
