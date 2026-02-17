"use client";

import { BookOpenIcon, InfoIcon } from "lucide-react";

import { EditCourseInfoForm } from "@/components/dashboard/courses/edit-course-info-form";
import { EditCurriculumForm } from "@/components/dashboard/courses/edit-curriculum-form";
import { BackButton } from "@/components/layout/back-button";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";

interface EditCoursePageProps {
  courseId: string;
}

export function EditCoursePage({ courseId }: EditCoursePageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackButton className="px-0" />
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
          <EditCurriculumForm courseId={courseId} />
        </TabsPanel>
      </Tabs>
    </div>
  );
}
