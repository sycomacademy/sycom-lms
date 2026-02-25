"use client";

import { BookOpenIcon, InfoIcon } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { EditCourseInfoForm } from "@/components/dashboard/courses/edit-course-info-form";
import { EditCurriculumForm } from "@/components/dashboard/courses/edit-curriculum-form";
import { BackButton } from "@/components/layout/back-button";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";

interface EditCoursePageProps {
  courseId: string;
}

export function EditCoursePage({ courseId }: EditCoursePageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab =
    searchParams.get("tab") === "curriculum" ? "curriculum" : "info";

  const handleTabChange = useCallback(
    (nextTab: string) => {
      const nextValue = nextTab === "curriculum" ? "curriculum" : "info";

      if (nextValue === activeTab) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", nextValue);
      router.replace(`${pathname}?${params.toString()}` as Route, {
        scroll: false,
      });
    },
    [activeTab, pathname, router, searchParams]
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackButton className="px-0" />
        <h1 className="font-semibold text-2xl tracking-tight">Edit course</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Update course details, manage sections and lessons.
        </p>
      </div>

      <Tabs onValueChange={handleTabChange} value={activeTab}>
        <TabsList variant="underline">
          <TabsTab value="info">
            <InfoIcon className="size-4" />
            Course Info
          </TabsTab>
          <TabsTab value="curriculum">
            <BookOpenIcon className="size-4" />
            Curriculum
          </TabsTab>
        </TabsList>

        <TabsPanel className="pt-6" value="info">
          <EditCourseInfoForm courseId={courseId} />
        </TabsPanel>

        <TabsPanel className="pt-6" value="curriculum">
          <EditCurriculumForm courseId={courseId} />
        </TabsPanel>
      </Tabs>
    </div>
  );
}
