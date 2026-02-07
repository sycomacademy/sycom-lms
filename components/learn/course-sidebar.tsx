"use client";

import {
  BookOpenIcon,
  CheckCircle2Icon,
  CirclePlayIcon,
  ClipboardListIcon,
  FileTextIcon,
  ImageIcon,
  LayersIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/packages/utils/cn";

interface Module {
  id: string;
  title: string;
  order: number;
  sections: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      order: number;
      type: string;
      duration: number;
    }[];
  }[];
}

interface CourseSidebarProps {
  courseTitle: string;
  courseSlug: string;
  modules: Module[];
  currentLessonId: string;
  completedLessonIds: string[];
}

const lessonTypeIcon: Record<string, React.ElementType> = {
  article: FileTextIcon,
  video: CirclePlayIcon,
  image: ImageIcon,
  quiz: ClipboardListIcon,
  mixed: LayersIcon,
  lab: BookOpenIcon,
};

function isSectionComplete(
  section: Module["sections"][number],
  completedIds: string[]
) {
  return section.lessons.every((l) => completedIds.includes(l.id));
}

function isModuleComplete(module: Module, completedIds: string[]) {
  return module.sections.every((s) => isSectionComplete(s, completedIds));
}

export function CourseSidebar({
  courseTitle,
  courseSlug,
  modules,
  currentLessonId,
  completedLessonIds,
}: CourseSidebarProps) {
  // Find the module containing the current lesson to expand it by default
  const currentModuleId = modules.find((m) =>
    m.sections.some((s) => s.lessons.some((l) => l.id === currentLessonId))
  )?.id;

  const totalLessons = modules.reduce(
    (acc, m) => acc + m.sections.reduce((a, s) => a + s.lessons.length, 0),
    0
  );

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            render={
              <Link
                className="flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground"
                href={`/courses/${courseSlug}`}
              >
                Back to Course
              </Link>
            }
            size="sm"
            variant="link"
          />
          <Separator orientation="vertical" />
          <Button
            render={
              <Link
                className="flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground"
                href="/dashboard"
              >
                Dashboard
              </Link>
            }
            size="sm"
            variant="link"
          />
        </div>
        <h2 className="mt-1 font-semibold text-sm leading-tight">
          {courseTitle}
        </h2>
        <div className="mt-1 text-muted-foreground text-xs">
          {completedLessonIds.length} / {totalLessons} lessons completed
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <Accordion
            className="rounded-none border-0"
            defaultValue={currentModuleId ? [currentModuleId] : undefined}
          >
            {modules.map((module) => {
              const moduleComplete = isModuleComplete(
                module,
                completedLessonIds
              );
              return (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger className="px-4 py-2.5 text-left hover:no-underline">
                    <div className="flex flex-1 items-center gap-2 pr-2">
                      <div className="flex size-6 shrink-0 items-center justify-center">
                        {moduleComplete ? (
                          <CheckCircle2Icon className="size-4 text-primary" />
                        ) : (
                          <span className="flex size-5 items-center justify-center rounded bg-muted font-medium text-muted-foreground text-xs">
                            {module.order}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-xs leading-tight">
                        {module.title}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    {module.sections.map((section) => {
                      const sectionComplete = isSectionComplete(
                        section,
                        completedLessonIds
                      );
                      return (
                        <div key={section.id}>
                          <div className="flex items-center gap-2 px-4 py-1.5">
                            {sectionComplete && (
                              <CheckCircle2Icon className="size-3 text-primary" />
                            )}
                            <span
                              className={cn(
                                "font-medium text-muted-foreground text-xs",
                                !sectionComplete && "ml-5"
                              )}
                            >
                              {section.title}
                            </span>
                          </div>
                          <SidebarMenu>
                            {section.lessons.map((lesson) => {
                              const isActive = lesson.id === currentLessonId;
                              const isComplete = completedLessonIds.includes(
                                lesson.id
                              );
                              const Icon =
                                lessonTypeIcon[lesson.type] || FileTextIcon;

                              return (
                                <SidebarMenuItem key={lesson.id}>
                                  <SidebarMenuButton
                                    className="h-auto py-1.5 pl-10"
                                    isActive={isActive}
                                    render={
                                      <Link
                                        href={`/courses/${courseSlug}/learn/${lesson.id}`}
                                      />
                                    }
                                  >
                                    <div className="flex w-full items-center gap-2">
                                      <div className="flex size-5 shrink-0 items-center justify-center">
                                        {isComplete ? (
                                          <CheckCircle2Icon className="size-3.5 text-primary" />
                                        ) : (
                                          <Icon className="size-3.5 text-muted-foreground" />
                                        )}
                                      </div>
                                      <span className="flex-1 text-xs leading-tight">
                                        {lesson.title}
                                      </span>
                                      <span className="shrink-0 text-[10px] text-muted-foreground">
                                        {lesson.duration}m
                                      </span>
                                    </div>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              );
                            })}
                          </SidebarMenu>
                        </div>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
