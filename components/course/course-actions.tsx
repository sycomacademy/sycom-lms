import type { Route } from "next";
import { Link } from "@/components/layout/foresight-link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/packages/auth/helper";

interface CourseActionsProps {
  courseId: string;
}

export async function CourseActions({ courseId }: CourseActionsProps) {
  const session = await getSession();

  if (!session) {
    return (
      <Button
        className="w-full"
        nativeButton={false}
        render={<Link href={"/sign-in" as Route} />}
      >
        Sign in to enroll
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      nativeButton={false}
      render={<Link href={`/learn/${courseId}` as Route} />}
    >
      Go to Course
    </Button>
  );
}
