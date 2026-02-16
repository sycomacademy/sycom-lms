"use client";

import { BookOpenIcon, InfoIcon } from "lucide-react";

import { EditCourseInfoForm } from "@/components/dashboard/courses/edit-course-info-form";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";

interface EditCoursePageProps {
  courseId: string;
}

export function EditCoursePage({ courseId }: EditCoursePageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Edit course</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Update course details, manage sections and lessons.
        </p>
      </div>

      <Tabs defaultValue={0}>
        <TabsList variant="underline">
          <TabsTab value={0}>
            <InfoIcon className="size-4" />
            Course Info
          </TabsTab>
          <TabsTab value={1}>
            <BookOpenIcon className="size-4" />
            Curriculum
          </TabsTab>
        </TabsList>

        <TabsPanel className="pt-6" value={0}>
          <EditCourseInfoForm courseId={courseId} />
        </TabsPanel>

        <TabsPanel className="pt-6" value={1}>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <BookOpenIcon className="mb-3 size-8 text-muted-foreground/60" />
            <p className="font-medium text-sm">Curriculum editor</p>
            <p className="mt-1 text-muted-foreground text-sm">
              Sections and lessons management coming soon.
            </p>
          </div>
        </TabsPanel>
      </Tabs>
    </div>
  );
}
