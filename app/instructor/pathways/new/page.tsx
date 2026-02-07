import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PathwayForm } from "@/components/instructor/pathway-form";
import { auth } from "@/packages/auth/auth";
import { getInstructorByUserId } from "@/packages/db/queries/instructor";

export default async function NewPathwayPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const instructor = await getInstructorByUserId(session.user.id);
  if (!instructor) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-sans font-semibold text-2xl tracking-tight">
          New pathway
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Add pathway details. You can add courses on the next page.
        </p>
      </div>
      <PathwayForm />
    </div>
  );
}
