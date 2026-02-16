import { instructorGuard } from "@/packages/auth/helper";

interface EditCoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  await instructorGuard();
  const { courseId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Edit course</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Edit course details, sections, and lessons.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <p className="text-muted-foreground text-sm">
          Edit page for course {courseId} coming soon.
        </p>
      </div>
    </div>
  );
}
