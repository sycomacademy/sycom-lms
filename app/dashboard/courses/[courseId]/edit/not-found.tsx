import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CourseNotFound() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="font-semibold text-foreground text-lg">
        Course not found
      </h2>
      <p className="max-w-md text-muted-foreground text-sm">
        The course you are looking for does not exist or you do not have access
        to it.
      </p>
      <Button
        nativeButton={false}
        render={<Link href="/dashboard/courses" />}
        size="sm"
        variant="outline"
      >
        Back to courses
      </Button>
    </div>
  );
}
