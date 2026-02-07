import { RouteIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/packages/auth/auth";
import { getInstructorByUserId } from "@/packages/db/queries/instructor";
import { getAllPathways } from "@/packages/db/queries/pathway";

export default async function InstructorPathwaysPage() {
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

  const pathways = await getAllPathways();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans font-semibold text-2xl tracking-tight">
            Pathways
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Manage pathways and their courses
          </p>
        </div>
        <Button render={<Link href="/instructor/pathways/new" />}>
          <RouteIcon className="mr-2 size-4" />
          New pathway
        </Button>
      </div>

      {pathways.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <RouteIcon className="size-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium text-lg">No pathways yet</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Create a pathway to bundle courses
              </p>
            </div>
            <Button render={<Link href="/instructor/pathways/new" />}>
              Create pathway
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pathways.map((pathway) => (
            <Card key={pathway.id}>
              <CardContent className="p-4">
                <h3 className="font-semibold">
                  <Link
                    className="hover:text-primary"
                    href={`/instructor/pathways/${pathway.id}/edit`}
                  >
                    {pathway.title}
                  </Link>
                </h3>
                <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
                  {pathway.shortDescription}
                </p>
                <Button
                  className="mt-3"
                  render={
                    <Link href={`/instructor/pathways/${pathway.id}/edit`} />
                  }
                  size="sm"
                  variant="outline"
                >
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
