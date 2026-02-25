"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  GripVerticalIcon,
  Loader2Icon,
  LockIcon,
  PlusIcon,
  Trash2Icon,
  UnlockIcon,
} from "lucide-react";
import type { Value } from "platejs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_EDITOR_VALUE,
  PlateEditor,
} from "@/components/editor/plate-editor";
import {
  Sortable,
  SortableItem,
  SortableItemHandle,
} from "@/components/reui/sortable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";
import { cn } from "@/packages/utils/cn";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface Section {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  content: Value | null;
  type: "text" | "video" | "quiz";
  order: number;
  isLocked: boolean;
  estimatedDuration: number | null;
}

interface EditCurriculumFormProps {
  courseId: string;
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export function EditCurriculumForm({ courseId }: EditCurriculumFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: course } = useSuspenseQuery(
    trpc.course.getById.queryOptions({ courseId })
  );

  // Local state for optimistic UI
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  );
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  const invalidateCourse = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: trpc.course.getById.queryKey({ courseId }),
    });
  }, [queryClient, trpc.course.getById, courseId]);

  // Mutations
  const createSectionMutation = useMutation(
    trpc.course.createSection.mutationOptions({
      onSuccess: () => {
        invalidateCourse();
        toastManager.add({
          title: "Section created",
          type: "success",
        });
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to create section",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const updateSectionMutation = useMutation(
    trpc.course.updateSection.mutationOptions({
      onSuccess: () => {
        invalidateCourse();
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to update section",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const deleteSectionMutation = useMutation(
    trpc.course.deleteSection.mutationOptions({
      onSuccess: () => {
        invalidateCourse();
        toastManager.add({
          title: "Section deleted",
          type: "success",
        });
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to delete section",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const createLessonMutation = useMutation(
    trpc.course.createLesson.mutationOptions({
      onSuccess: (newLesson) => {
        invalidateCourse();
        setExpandedLessonId(newLesson.id);
        toastManager.add({
          title: "Lesson created",
          type: "success",
        });
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to create lesson",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const updateLessonMutation = useMutation(
    trpc.course.updateLesson.mutationOptions({
      onSuccess: () => {
        invalidateCourse();
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to update lesson",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const deleteLessonMutation = useMutation(
    trpc.course.deleteLesson.mutationOptions({
      onSuccess: () => {
        invalidateCourse();
        setExpandedLessonId(null);
        toastManager.add({
          title: "Lesson deleted",
          type: "success",
        });
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to delete lesson",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const reorderSectionsMutation = useMutation(
    trpc.course.reorderSections.mutationOptions({
      onSuccess: () => {
        invalidateCourse();
      },
      onError: (error) => {
        invalidateCourse();
        toastManager.add({
          title: "Failed to reorder sections",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const reorderLessonsMutation = useMutation(
    trpc.course.reorderLessons.mutationOptions({
      onSuccess: () => {
        invalidateCourse();
      },
      onError: (error) => {
        invalidateCourse();
        toastManager.add({
          title: "Failed to reorder lessons",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const moveLessonMutation = useMutation(
    trpc.course.moveLesson.mutationOptions({
      onSuccess: () => {
        invalidateCourse();
      },
      onError: (error) => {
        invalidateCourse();
        toastManager.add({
          title: "Failed to move lesson",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  // Server data: initial and after refetch
  const sectionsFromServer = useMemo(
    () => (course.sections ?? []) as Section[],
    [course.sections]
  );

  // Client-side sort state: source of truth for UI (ReUI pattern: value + onValueChange)
  const [localSections, setLocalSections] = useState<Section[]>(() =>
    ((course?.sections ?? []) as Section[]).map((s) => ({
      ...s,
      lessons: [...s.lessons],
    }))
  );
  const localSectionsRef = useRef<Section[]>([]);
  const hasOrderDirtyRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSectionIdsRef = useRef<string[]>([]);
  const lastSavedLessonIdsBySectionRef = useRef<Record<string, string[]>>({});

  // Keep ref in sync for debounced flush
  useEffect(() => {
    localSectionsRef.current = localSections;
  }, [localSections]);

  // Sync local state from server whenever order isn't currently dirty
  useEffect(() => {
    if (hasOrderDirtyRef.current) {
      return;
    }

    setLocalSections(
      sectionsFromServer.map((s) => ({ ...s, lessons: [...s.lessons] }))
    );
    lastSavedSectionIdsRef.current = sectionsFromServer.map((s) => s.id);
    const bySection: Record<string, string[]> = {};
    for (const s of sectionsFromServer) {
      bySection[s.id] = s.lessons.map((l) => l.id);
    }
    lastSavedLessonIdsBySectionRef.current = bySection;
  }, [sectionsFromServer]);

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current !== null) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  const sectionIds = useMemo(
    () => localSections.map((s) => s.id),
    [localSections]
  );
  const sections = localSections;

  // Handlers
  const handleAddSection = () => {
    createSectionMutation.mutate({
      courseId,
      title: "New Section",
    });
  };

  const handleAddLesson = (sectionId: string) => {
    createLessonMutation.mutate({
      sectionId,
      title: "New Lesson",
    });
  };

  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    const nextTitle = title.trim();
    const previousTitle =
      localSections.find((section) => section.id === sectionId)?.title ?? null;

    setLocalSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, title: nextTitle } : section
      )
    );

    updateSectionMutation.mutate(
      { sectionId, title: nextTitle },
      {
        onError: () => {
          if (!previousTitle) {
            return;
          }
          setLocalSections((prev) =>
            prev.map((section) =>
              section.id === sectionId
                ? { ...section, title: previousTitle }
                : section
            )
          );
        },
      }
    );
  };

  const handleDeleteSection = (sectionId: string) => {
    deleteSectionMutation.mutate({ sectionId });
  };

  const handleUpdateLessonTitle = (lessonId: string, title: string) => {
    const nextTitle = title.trim();
    const previousTitle =
      localSections
        .flatMap((section) => section.lessons)
        .find((lesson) => lesson.id === lessonId)?.title ?? null;

    setLocalSections((prev) =>
      prev.map((section) => ({
        ...section,
        lessons: section.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, title: nextTitle } : lesson
        ),
      }))
    );

    updateLessonMutation.mutate(
      { lessonId, title: nextTitle },
      {
        onError: () => {
          if (!previousTitle) {
            return;
          }
          setLocalSections((prev) =>
            prev.map((section) => ({
              ...section,
              lessons: section.lessons.map((lesson) =>
                lesson.id === lessonId
                  ? { ...lesson, title: previousTitle }
                  : lesson
              ),
            }))
          );
        },
      }
    );
  };

  const handleToggleLessonLock = (lessonId: string, isLocked: boolean) => {
    updateLessonMutation.mutate({ lessonId, isLocked: !isLocked });
  };

  const handleUpdateLessonContent = (lessonId: string, content: Value) => {
    updateLessonMutation.mutate({ lessonId, content });
    toastManager.add({
      title: "Lesson saved",
      type: "success",
    });
  };

  const handleDeleteLesson = (lessonId: string) => {
    deleteLessonMutation.mutate({ lessonId });
  };

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const toggleLessonExpand = (lessonId: string) => {
    setExpandedLessonId((prev) => (prev === lessonId ? null : lessonId));
  };

  const expandAllSections = () => {
    setCollapsedSections(new Set());
    setExpandedLessonId(null);
  };

  const collapseAllSections = () => {
    setCollapsedSections(new Set(sectionIds));
    setExpandedLessonId(null);
  };

  const DEBOUNCE_MS = 400;

  // Flush local order state to server (section order, moves, lesson orders)
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: flush has multiple branches by design
  const flushOrderToServer = useCallback(() => {
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    const current = localSectionsRef.current;
    const lastSectionIds = lastSavedSectionIdsRef.current;
    const lastBySection = lastSavedLessonIdsBySectionRef.current;

    const currentSectionIds = current.map((s) => s.id);
    const sectionOrderChanged =
      currentSectionIds.length !== lastSectionIds.length ||
      currentSectionIds.some((id, i) => id !== lastSectionIds[i]);

    const applySavedRefs = () => {
      lastSavedSectionIdsRef.current = currentSectionIds;
      const newBySection: Record<string, string[]> = {};
      for (const s of current) {
        newBySection[s.id] = s.lessons.map((l) => l.id);
      }
      lastSavedLessonIdsBySectionRef.current = newBySection;
      hasOrderDirtyRef.current = false;
      invalidateCourse();
    };

    if (sectionOrderChanged) {
      reorderSectionsMutation.mutate(
        { courseId, sectionIds: currentSectionIds },
        { onSuccess: applySavedRefs }
      );
      return;
    }

    const lastLessonToSection: Record<string, string> = {};
    for (const [secId, lessonIds] of Object.entries(lastBySection)) {
      const ids = lessonIds as string[];
      for (const lid of ids) {
        lastLessonToSection[lid] = secId;
      }
    }

    const movedLessons: {
      lessonId: string;
      targetSectionId: string;
      newOrder: number;
    }[] = [];
    for (const sec of current) {
      for (let i = 0; i < sec.lessons.length; i++) {
        const lesson = sec.lessons[i];
        if (lastLessonToSection[lesson.id] !== sec.id) {
          movedLessons.push({
            lessonId: lesson.id,
            targetSectionId: sec.id,
            newOrder: i,
          });
        }
      }
    }

    const flushLessonOrders = (secs: Section[]) => {
      const toFlush = secs.filter((sec) => {
        const currentIds = sec.lessons.map((l) => l.id);
        const lastIds = lastBySection[sec.id] ?? [];
        return (
          currentIds.length !== lastIds.length ||
          currentIds.some((id, i) => id !== lastIds[i])
        );
      });
      if (toFlush.length === 0) {
        applySavedRefs();
        return;
      }
      let pending = toFlush.length;
      const checkDone = () => {
        pending--;
        if (pending === 0) {
          applySavedRefs();
        }
      };
      for (const sec of toFlush) {
        reorderLessonsMutation.mutate(
          { sectionId: sec.id, lessonIds: sec.lessons.map((l) => l.id) },
          { onSettled: checkDone }
        );
      }
    };

    const runMovesThenLessons = (idx: number) => {
      if (idx >= movedLessons.length) {
        flushLessonOrders(current);
        return;
      }
      const m = movedLessons[idx];
      moveLessonMutation.mutate(
        {
          lessonId: m.lessonId,
          targetSectionId: m.targetSectionId,
          newOrder: m.newOrder,
        },
        { onSettled: () => runMovesThenLessons(idx + 1) }
      );
    };

    if (movedLessons.length > 0) {
      runMovesThenLessons(0);
    } else {
      flushLessonOrders(current);
    }
  }, [
    courseId,
    invalidateCourse,
    moveLessonMutation,
    reorderLessonsMutation,
    reorderSectionsMutation,
  ]);

  const scheduleDebouncedSave = useCallback(() => {
    hasOrderDirtyRef.current = true;
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(flushOrderToServer, DEBOUNCE_MS);
  }, [flushOrderToServer]);

  const handleSectionsReorder = useCallback(
    (newSections: Section[]) => {
      hasOrderDirtyRef.current = true;
      setLocalSections(
        newSections.map((s) => ({ ...s, lessons: [...s.lessons] }))
      );
      scheduleDebouncedSave();
    },
    [scheduleDebouncedSave]
  );

  const handleLessonsReorder = useCallback(
    (sectionId: string, newLessons: Lesson[]) => {
      hasOrderDirtyRef.current = true;
      setLocalSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, lessons: newLessons } : s
        )
      );
      scheduleDebouncedSave();
    },
    [scheduleDebouncedSave]
  );

  const handleMoveLessonToSection = useCallback(
    (lessonId: string, targetSectionId: string) => {
      hasOrderDirtyRef.current = true;
      setLocalSections((prev) => {
        const activeLesson = prev
          .flatMap((s) => s.lessons)
          .find((l) => l.id === lessonId);
        const targetSection = prev.find((s) => s.id === targetSectionId);
        if (!(activeLesson && targetSection)) {
          return prev;
        }
        const newLesson = { ...activeLesson, sectionId: targetSectionId };
        return prev.map((s) => {
          if (s.id === activeLesson.sectionId) {
            return {
              ...s,
              lessons: s.lessons.filter((l) => l.id !== lessonId),
            };
          }
          if (s.id === targetSectionId) {
            return {
              ...s,
              lessons: [
                ...s.lessons.filter((l) => l.id !== lessonId),
                newLesson,
              ],
            };
          }
          return s;
        });
      });
      scheduleDebouncedSave();
    },
    [scheduleDebouncedSave]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={expandAllSections}
          size="sm"
          type="button"
          variant="ghost"
        >
          Expand all
        </Button>
        <Button
          onClick={collapseAllSections}
          size="sm"
          type="button"
          variant="ghost"
        >
          Collapse all
        </Button>
      </div>
      {sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <p className="text-muted-foreground text-sm">
            No sections yet. Add your first section to get started.
          </p>
        </div>
      ) : (
        <Sortable<Section>
          className="flex flex-col gap-3"
          getItemValue={(s) => s.id}
          onValueChange={handleSectionsReorder}
          value={sections}
        >
          {sections.map((section) => (
            <SortableItem key={section.id} value={section.id}>
              <SectionItem
                allSections={sections}
                collapsedSections={collapsedSections}
                expandedLessonId={expandedLessonId}
                isUpdating={
                  updateSectionMutation.isPending ||
                  updateLessonMutation.isPending
                }
                onAddLesson={handleAddLesson}
                onDeleteLesson={handleDeleteLesson}
                onDeleteSection={handleDeleteSection}
                onLessonsReorder={handleLessonsReorder}
                onMoveLessonToSection={handleMoveLessonToSection}
                onToggleCollapse={toggleSectionCollapse}
                onToggleLessonExpand={toggleLessonExpand}
                onToggleLessonLock={handleToggleLessonLock}
                onUpdateLessonContent={handleUpdateLessonContent}
                onUpdateLessonTitle={handleUpdateLessonTitle}
                onUpdateSectionTitle={handleUpdateSectionTitle}
                section={section}
              />
            </SortableItem>
          ))}
        </Sortable>
      )}

      <Button
        className="w-fit"
        disabled={createSectionMutation.isPending}
        onClick={handleAddSection}
        size="sm"
        type="button"
        variant="outline"
      >
        {createSectionMutation.isPending ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <PlusIcon className="size-4" />
        )}
        Add Section
      </Button>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Section Item
// -----------------------------------------------------------------------------

interface SectionItemProps {
  section: Section;
  allSections: Section[];
  collapsedSections: Set<string>;
  expandedLessonId: string | null;
  isUpdating: boolean;
  onToggleCollapse: (sectionId: string) => void;
  onToggleLessonExpand: (lessonId: string) => void;
  onAddLesson: (sectionId: string) => void;
  onUpdateSectionTitle: (sectionId: string, title: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onUpdateLessonTitle: (lessonId: string, title: string) => void;
  onToggleLessonLock: (lessonId: string, isLocked: boolean) => void;
  onUpdateLessonContent: (lessonId: string, content: Value) => void;
  onDeleteLesson: (lessonId: string) => void;
  onLessonsReorder: (sectionId: string, newLessons: Lesson[]) => void;
  onMoveLessonToSection: (lessonId: string, targetSectionId: string) => void;
}

function SectionItem({
  section,
  allSections,
  collapsedSections,
  expandedLessonId,
  isUpdating,
  onToggleCollapse,
  onToggleLessonExpand,
  onAddLesson,
  onUpdateSectionTitle,
  onDeleteSection,
  onUpdateLessonTitle,
  onToggleLessonLock,
  onUpdateLessonContent,
  onDeleteLesson,
  onLessonsReorder,
  onMoveLessonToSection,
}: SectionItemProps) {
  const isCollapsed = collapsedSections.has(section.id);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(section.title);

  useEffect(() => {
    setTitleValue(section.title);
  }, [section.title]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleValue.trim() && titleValue !== section.title) {
      onUpdateSectionTitle(section.id, titleValue.trim());
    } else {
      setTitleValue(section.title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setTitleValue(section.title);
      setIsEditingTitle(false);
    }
  };

  const otherSections = allSections.filter((s) => s.id !== section.id);

  return (
    <div className="rounded-lg border bg-card">
      <Collapsible open={!isCollapsed}>
        {/* Section Header */}
        <div className="flex items-center gap-2 p-3">
          <SortableItemHandle className="touch-none text-muted-foreground hover:text-foreground">
            <GripVerticalIcon className="size-4" />
          </SortableItemHandle>

          {/* Collapse Toggle */}
          <CollapsibleTrigger
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onToggleCollapse(section.id)}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="size-4" />
            ) : (
              <ChevronDownIcon className="size-4" />
            )}
          </CollapsibleTrigger>

          {/* Title */}
          {isEditingTitle ? (
            <Input
              autoFocus
              className="h-7 flex-1 text-sm"
              onBlur={handleTitleBlur}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              value={titleValue}
            />
          ) : (
            <button
              className="flex-1 text-left font-medium text-sm hover:underline"
              onClick={() => setIsEditingTitle(true)}
              type="button"
            >
              {section.title}
            </button>
          )}

          {/* Lesson Count */}
          <span className="text-muted-foreground text-xs">
            {section.lessons.length} lesson
            {section.lessons.length !== 1 ? "s" : ""}
          </span>

          {/* Add Lesson Button */}
          <Button
            onClick={() => onAddLesson(section.id)}
            size="sm"
            type="button"
            variant="ghost"
          >
            <PlusIcon className="size-4" />
          </Button>

          {/* Delete Section */}
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button size="sm" type="button" variant="ghost" />}
            >
              <Trash2Icon className="size-4 text-destructive" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete section?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{section.title}&quot; and
                  all its lessons. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDeleteSection(section.id)}
                  variant="destructive"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Lessons */}
        <CollapsibleContent>
          <div className="border-t px-3 pb-3">
            {section.lessons.length === 0 ? (
              <div className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-md border border-dashed py-4 text-center text-muted-foreground text-xs">
                <span>No lessons in this section yet.</span>
              </div>
            ) : (
              <Sortable<Lesson>
                className="flex flex-col gap-1 pt-2"
                getItemValue={(l) => l.id}
                onValueChange={(newLessons) =>
                  onLessonsReorder(section.id, newLessons)
                }
                value={section.lessons}
              >
                {section.lessons.map((lesson) => (
                  <SortableItem
                    className="flex items-center gap-2 rounded-md border bg-background pl-1"
                    key={lesson.id}
                    value={lesson.id}
                  >
                    <SortableItemHandle className="shrink-0 touch-none text-muted-foreground hover:text-foreground">
                      <GripVerticalIcon className="size-3.5" />
                    </SortableItemHandle>
                    <div className="min-w-0 flex-1">
                      <LessonItem
                        expandedLessonId={expandedLessonId}
                        isUpdating={isUpdating}
                        lesson={lesson}
                        onDeleteLesson={onDeleteLesson}
                        onMoveToSection={
                          otherSections.length > 0
                            ? onMoveLessonToSection
                            : undefined
                        }
                        onToggleExpand={onToggleLessonExpand}
                        onToggleLock={onToggleLessonLock}
                        onUpdateContent={onUpdateLessonContent}
                        onUpdateTitle={onUpdateLessonTitle}
                        otherSections={otherSections}
                      />
                    </div>
                  </SortableItem>
                ))}
              </Sortable>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Lesson Item
// -----------------------------------------------------------------------------

interface LessonItemProps {
  lesson: Lesson;
  expandedLessonId: string | null;
  isUpdating: boolean;
  onToggleExpand: (lessonId: string) => void;
  onUpdateTitle: (lessonId: string, title: string) => void;
  onToggleLock: (lessonId: string, isLocked: boolean) => void;
  onUpdateContent: (lessonId: string, content: Value) => void;
  onDeleteLesson: (lessonId: string) => void;
  otherSections: Section[];
  onMoveToSection?: (lessonId: string, targetSectionId: string) => void;
}

function LessonItem({
  lesson,
  expandedLessonId,
  isUpdating,
  onToggleExpand,
  onUpdateTitle,
  onToggleLock,
  onUpdateContent,
  onDeleteLesson,
  otherSections,
  onMoveToSection,
}: LessonItemProps) {
  const isExpanded = expandedLessonId === lesson.id;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(lesson.title);
  const [content, setContent] = useState<Value>(() => {
    const raw = lesson.content;
    return Array.isArray(raw) && raw.length > 0 ? raw : DEFAULT_EDITOR_VALUE;
  });

  useEffect(() => {
    setTitleValue(lesson.title);
  }, [lesson.title]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleValue.trim() && titleValue !== lesson.title) {
      onUpdateTitle(lesson.id, titleValue.trim());
    } else {
      setTitleValue(lesson.title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setTitleValue(lesson.title);
      setIsEditingTitle(false);
    }
  };

  const handleSaveContent = () => {
    onUpdateContent(lesson.id, content);
  };

  return (
    <div className={cn(isExpanded && "rounded-md ring-1 ring-primary/20")}>
      {/* Lesson Header */}
      <div className="flex items-center gap-2 p-2">
        {/* Expand/Collapse */}
        <button
          className="text-muted-foreground hover:text-foreground"
          onClick={() => onToggleExpand(lesson.id)}
          type="button"
        >
          {isExpanded ? (
            <ChevronDownIcon className="size-4" />
          ) : (
            <ChevronRightIcon className="size-4" />
          )}
        </button>

        {/* Title */}
        {isEditingTitle ? (
          <Input
            autoFocus
            className="h-6 flex-1 text-sm"
            onBlur={handleTitleBlur}
            onChange={(e) => setTitleValue(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            value={titleValue}
          />
        ) : (
          <button
            className="flex-1 text-left text-sm hover:underline"
            onClick={() => setIsEditingTitle(true)}
            type="button"
          >
            {lesson.title}
          </button>
        )}

        {/* Lock Toggle */}
        <Button
          className={cn(
            lesson.isLocked ? "text-amber-600" : "text-muted-foreground"
          )}
          onClick={() => onToggleLock(lesson.id, lesson.isLocked)}
          size="sm"
          title={lesson.isLocked ? "Unlock lesson" : "Lock lesson"}
          type="button"
          variant="ghost"
        >
          {lesson.isLocked ? (
            <LockIcon className="size-3.5" />
          ) : (
            <UnlockIcon className="size-3.5" />
          )}
        </Button>

        {/* Move to section */}
        {onMoveToSection && otherSections.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  className="text-muted-foreground"
                  size="sm"
                  title="Move to section"
                  type="button"
                  variant="ghost"
                >
                  Move to…
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              {otherSections.map((sec) => (
                <DropdownMenuItem
                  key={sec.id}
                  onClick={() => onMoveToSection(lesson.id, sec.id)}
                >
                  {sec.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Delete Lesson */}
        <AlertDialog>
          <AlertDialogTrigger
            render={<Button size="sm" type="button" variant="ghost" />}
          >
            <Trash2Icon className="size-3.5 text-destructive" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &quot;{lesson.title}&quot;. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDeleteLesson(lesson.id)}
                variant="destructive"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t p-3">
          <PlateEditor
            onChange={setContent}
            placeholder="Write your lesson content..."
            uploadEntityId={lesson.id}
            uploadEntityType="lesson"
            value={content}
            variant="course"
          />
          <div className="mt-3 flex justify-end">
            <Button
              disabled={isUpdating}
              onClick={handleSaveContent}
              size="sm"
              type="button"
            >
              {isUpdating && <Loader2Icon className="size-4 animate-spin" />}
              Save Lesson
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
