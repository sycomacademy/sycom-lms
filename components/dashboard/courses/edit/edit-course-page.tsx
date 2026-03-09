"use client";

import { BookOpenIcon, InfoIcon } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { Suspense } from "react";
import { CoCreatorsModal } from "@/components/dashboard/courses/edit/co-creators-modal";
import { EditCourseInfoForm } from "@/components/dashboard/courses/edit/edit-course-info-form";
import { EditCurriculumForm } from "@/components/dashboard/courses/edit/edit-curriculum-form";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { BackButton } from "@/components/layout/back-button";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";

interface EditCoursePageProps {
  courseId: string;
}

export function EditCoursePage({ courseId }: EditCoursePageProps) {
  const [tab, setTab] = useQueryState("tab", parseAsInteger.withDefault(0));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-4 border-border/70 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <BackButton className="px-0" />
          <h1 className="font-semibold text-2xl tracking-tight">Edit course</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Update course details, manage sections and lessons.
          </p>
        </div>
        <CoCreatorsModal courseId={courseId} />
      </div>

      <Tabs onValueChange={(v) => setTab(v as number)} value={tab}>
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
          <Suspense fallback={<DashboardSkeleton />}>
            <EditCourseInfoForm courseId={courseId} />
          </Suspense>
        </TabsPanel>

        <TabsPanel className="pt-6" value={1}>
          <Suspense fallback={<DashboardSkeleton />}>
            <EditCurriculumForm courseId={courseId} />
          </Suspense>
        </TabsPanel>
      </Tabs>
    </div>
  );
}
