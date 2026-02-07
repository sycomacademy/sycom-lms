import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/packages/auth/auth";

interface LearnLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function LearnLayout({
  children,
  params,
}: LearnLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const { slug } = await params;
    redirect(`/sign-in?redirect=/courses/${slug}`);
  }

  return <>{children}</>;
}
