import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign In | Sycom LMS",
  description: "Sign in to your Sycom account or create a new one.",
};

export default function SignInPage() {
  return <AuthForm />;
}
