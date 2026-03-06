"use client";

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LockIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import { useCallback, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/packages/utils/cn";
import { learnParsers } from "./learn-parsers";

interface Lesson {
  id: string;
  title: string;
  isLocked: boolean;
  isCompleted: boolean;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface LearnSidebarProps {
  courseId: string;
  courseTitle: string;
  sections: Section[];
  currentLessonId: string;
}

function isSectionLocked(section: Section): boolean {
  return section.lessons.length > 0 && section.lessons.every((l) => l.isLocked);
}

export function LearnSidebar({
  courseId,
  courseTitle,
  sections,
  currentLessonId,
}: LearnSidebarProps) {
  const [{ expandedSections }, setExpandedSections] =
    useQueryStates(learnParsers);

  // Auto-expand section containing current lesson when none expanded
  useEffect(() => {
    if (expandedSections.length > 0) {
      return;
    }
    const sectionWithCurrent = sections.find((s) =>
      s.lessons.some((l) => l.id === currentLessonId)
    );
    if (sectionWithCurrent) {
      setExpandedSections({ expandedSections: [sectionWithCurrent.id] });
    }
  }, [currentLessonId, expandedSections.length, sections, setExpandedSections]);

  const toggleSection = useCallback(
    (sectionId: string) => {
      setExpandedSections({
        expandedSections: expandedSections.includes(sectionId)
          ? expandedSections.filter((id) => id !== sectionId)
          : [...expandedSections, sectionId],
      });
    },
    [expandedSections, setExpandedSections]
  );

  return (
    <aside className="flex w-64 shrink-0 flex-col border-border border-r bg-muted/30">
      <div className="border-border border-b p-3">
        <Link
          className="text-muted-foreground text-sm hover:text-foreground"
          href={`/learn/course/${courseId}` as Route}
        >
          ← {courseTitle}
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {sections.map((section) => {
          const locked = isSectionLocked(section);
          const isExpanded = expandedSections.includes(section.id);

          return (
            <Collapsible
              key={section.id}
              onOpenChange={() => toggleSection(section.id)}
              open={isExpanded}
            >
              <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted">
                {isExpanded ? (
                  <ChevronDownIcon className="size-4 shrink-0" />
                ) : (
                  <ChevronRightIcon className="size-4 shrink-0" />
                )}
                <span
                  className={cn(
                    "flex-1 truncate",
                    locked && "text-muted-foreground"
                  )}
                >
                  {section.title}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-1 ml-4 space-y-0.5 border-border border-l pl-3">
                  {section.lessons.map((lesson) => {
                    const isCurrent = lesson.id === currentLessonId;
                    const canNavigate = !lesson.isLocked;

                    let icon: ReactNode = null;
                    if (lesson.isCompleted) {
                      icon = (
                        <CheckIcon className="size-3.5 shrink-0 text-primary" />
                      );
                    } else if (lesson.isLocked) {
                      icon = (
                        <LockIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      );
                    }
                    const content = (
                      <div className="flex items-center gap-2">
                        {icon}
                        <span
                          className={cn(
                            "truncate text-sm",
                            isCurrent && "font-medium text-primary",
                            !canNavigate && "text-muted-foreground"
                          )}
                        >
                          {lesson.title}
                        </span>
                      </div>
                    );

                    if (canNavigate) {
                      return (
                        <Link
                          className={cn(
                            "block rounded-md px-2 py-1.5 hover:bg-muted",
                            isCurrent && "bg-primary/10"
                          )}
                          href={
                            `/learn/course/${courseId}/${lesson.id}` as Route
                          }
                          key={lesson.id}
                        >
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <Tooltip key={lesson.id}>
                        <TooltipTrigger
                          render={
                            <span className="block cursor-not-allowed rounded-md px-2 py-1.5 opacity-75">
                              {content}
                            </span>
                          }
                        />
                        <TooltipContent>
                          Complete previous lessons to unlock
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>
    </aside>
  );
}
