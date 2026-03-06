import { GraduationCapIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function OrgCoursesPage({
  params,
}: {
  params: Promise<{ "org-slug": string }>;
}) {
  const { "org-slug": orgSlug } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-medium text-foreground text-sm">Courses</h2>
        <p className="text-muted-foreground text-xs">
          Assign courses to cohorts from the Cohorts tab.
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <GraduationCapIcon className="size-12 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground text-sm">
            Expand a cohort to see its assigned courses and add more.
          </p>
          <Button
            className="mt-4"
            nativeButton={false}
            render={
              <Link href={`/dashboard/org/${orgSlug}/cohorts` as Route} />
            }
            size="sm"
            variant="outline"
          >
            Go to Cohorts
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
