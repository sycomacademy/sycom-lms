"use client";

import { PanelLeftOpenIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LearnSidebar } from "./learn-sidebar";

interface Section {
  id: string;
  title: string;
  lessons: {
    id: string;
    title: string;
    isLocked: boolean;
    isCompleted: boolean;
  }[];
}

interface LearnCourseShellProps {
  courseId: string;
  courseTitle: string;
  sections: Section[];
  children: React.ReactNode;
}

export function LearnCourseShell({
  courseId,
  courseTitle,
  sections,
  children,
}: LearnCourseShellProps) {
  const pathname = usePathname();
  const pathParts = pathname?.split("/") ?? [];
  const lastSegment = pathParts.at(-1);
  const currentLessonId =
    lastSegment !== courseId && (lastSegment?.length ?? 0) > 0
      ? (lastSegment ?? "")
      : "";

  const [sheetOpen, setSheetOpen] = useState(false);

  const sidebar = (
    <LearnSidebar
      courseId={courseId}
      courseTitle={courseTitle}
      currentLessonId={currentLessonId}
      sections={sections}
    />
  );

  return (
    <div className="flex min-h-0 flex-1">
      {/* Desktop sidebar */}
      <div className="hidden shrink-0 lg:block">{sidebar}</div>
      {/* Mobile sheet */}
      <Sheet onOpenChange={setSheetOpen} open={sheetOpen}>
        <SheetTrigger
          render={
            <Button
              className="fixed bottom-4 left-4 z-40 lg:hidden"
              size="icon"
              variant="secondary"
            >
              <PanelLeftOpenIcon className="size-4" />
              <span className="sr-only">Open course menu</span>
            </Button>
          }
        />
        <SheetContent className="w-64 p-0" showCloseButton side="left">
          {sidebar}
        </SheetContent>
      </Sheet>
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
