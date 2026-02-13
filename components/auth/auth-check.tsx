import { redirect } from "next/navigation";
import { getSession } from "@/packages/auth/helper";

export default async function AuthCheck({
  isOnLoggedInPage,
}: {
  isOnLoggedInPage: boolean;
}) {
  const session = await getSession();

  if (isOnLoggedInPage && !session) {
    redirect("/sign-in");
  }

  if (!isOnLoggedInPage && session) {
    redirect("/dashboard");
  }

  return null;
}
