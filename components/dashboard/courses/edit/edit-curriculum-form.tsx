"use client";

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  GripVerticalIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { Editor } from "@/components/editor/editor";
import {
  Editable,
  EditableArea,
  EditableInput,
  EditablePreview,
} from "@/components/elements/editable";
import {
  SortableItem,
  SortableItemHandle,
} from "@/components/elements/sortable";
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
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";
import { cn } from "@/packages/utils/cn";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type CourseDetail = RouterOutputs["course"]["getById"];
type Section = CourseDetail["sections"][number];
type Lesson = Section["lessons"][number];

interface OrderSnapshot {
  sectionIds: string[];
  lessonIdsBySection: Record<string, string[]>;
}

type CurriculumAction =
  | {
      type: "reorder-sections";
      activeId: string;
      overId: string;
    }
  | {
      type: "reorder-lessons";
      sectionId: string;
      activeId: string;
      overId: string;
    }
  | {
      type: "move-lesson";
      lessonId: string;
      targetSectionId: string;
      overLessonId?: string;
    };

interface EditCurriculumFormProps {
  courseId: string;
}

function cloneSections(sections: Section[]) {
  return sections.map((section) => ({
    ...section,
    lessons: [...section.lessons],
  }));
}

function buildOrderSnapshot(sections: Section[]): OrderSnapshot {
  return {
    sectionIds: sections.map((section) => section.id),
    lessonIdsBySection: Object.fromEntries(
      sections.map((section) => [
        section.id,
        section.lessons.map((lesson) => lesson.id),
      ])
    ),
  };
}

function orderSnapshotsEqual(a: OrderSnapshot, b: OrderSnapshot) {
  if (a.sectionIds.length !== b.sectionIds.length) {
    return false;
  }

  if (a.sectionIds.some((id, index) => id !== b.sectionIds[index])) {
    return false;
  }

  const sectionIds = new Set([
    ...Object.keys(a.lessonIdsBySection),
    ...Object.keys(b.lessonIdsBySection),
  ]);

  for (const sectionId of sectionIds) {
    const aLessonIds = a.lessonIdsBySection[sectionId] ?? [];
    const bLessonIds = b.lessonIdsBySection[sectionId] ?? [];

    if (aLessonIds.length !== bLessonIds.length) {
      return false;
    }

    if (aLessonIds.some((id, index) => id !== bLessonIds[index])) {
      return false;
    }
  }

  return true;
}

function normalizeLessonContent(content: Lesson["content"]) {
  const raw = content as JSONContent | unknown[] | null | undefined;
  if (!raw) {
    return undefined;
  }
  if (typeof raw === "object" && "type" in (raw as object)) {
    return raw as JSONContent;
  }
  if (Array.isArray(raw) && raw.length > 0) {
    return { type: "doc", content: raw as JSONContent[] };
  }
  return undefined;
}

function applyCurriculumAction(
  sections: Section[],
  action: CurriculumAction
): Section[] {
  switch (action.type) {
    case "reorder-sections": {
      const sectionIds = sections.map((section) => section.id);
      const oldIndex = sectionIds.indexOf(action.activeId);
      const newIndex = sectionIds.indexOf(action.overId);

      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
        return sections;
      }

      return arrayMove(sections, oldIndex, newIndex);
    }

    case "reorder-lessons": {
      return sections.map((section) => {
        if (section.id !== action.sectionId) {
          return section;
        }

        const lessonIds = section.lessons.map((lesson) => lesson.id);
        const oldIndex = lessonIds.indexOf(action.activeId);
        const newIndex = lessonIds.indexOf(action.overId);

        if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
          return section;
        }

        return {
          ...section,
          lessons: arrayMove(section.lessons, oldIndex, newIndex),
        };
      });
    }

    case "move-lesson": {
      const sourceSection = sections.find((section) =>
        section.lessons.some((lesson) => lesson.id === action.lessonId)
      );
      const targetSection = sections.find(
        (section) => section.id === action.targetSectionId
      );
      const lesson = sourceSection?.lessons.find(
        (currentLesson) => currentLesson.id === action.lessonId
      );

      if (!(sourceSection && targetSection && lesson)) {
        return sections;
      }

      const targetLessons = targetSection.lessons.filter(
        (currentLesson) => currentLesson.id !== action.lessonId
      );

      const targetIndex = action.overLessonId
        ? targetLessons.findIndex(
            (currentLesson) => currentLesson.id === action.overLessonId
          )
        : -1;

      const nextLesson = {
        ...lesson,
        sectionId: action.targetSectionId,
      };

      if (targetIndex >= 0) {
        targetLessons.splice(targetIndex, 0, nextLesson);
      } else {
        targetLessons.push(nextLesson);
      }

      return sections.map((section) => {
        if (section.id === sourceSection.id) {
          return {
            ...section,
            lessons: section.lessons.filter(
              (currentLesson) => currentLesson.id !== action.lessonId
            ),
          };
        }

        if (section.id === action.targetSectionId) {
          return {
            ...section,
            lessons: targetLessons,
          };
        }

        return section;
      });
    }

    default:
      return sections;
  }
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export function EditCurriculumForm({ courseId }: EditCurriculumFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const courseQueryKey = trpc.course.getById.queryKey({ courseId });

  const { data: course } = useSuspenseQuery(
    trpc.course.getById.queryOptions({ courseId })
  );

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  );
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [savingLessonId, setSavingLessonId] = useState<string | null>(null);
  const persistedOrderRef = useRef<OrderSnapshot>(
    buildOrderSnapshot((course.sections ?? []) as Section[])
  );
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPendingOrderChangesRef = useRef(false);
  const isFlushingOrderRef = useRef(false);

  const invalidateCourse = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: courseQueryKey,
    });
  }, [courseQueryKey, queryClient]);

  const setCourseData = useCallback(
    (updater: (currentCourse: CourseDetail) => CourseDetail) => {
      queryClient.setQueryData<CourseDetail>(
        courseQueryKey,
        (currentCourse) => {
          if (!currentCourse) {
            return currentCourse;
          }

          return updater(currentCourse);
        }
      );
    },
    [courseQueryKey, queryClient]
  );

  const updateSectionsInCache = useCallback(
    (updater: (sections: Section[]) => Section[]) => {
      setCourseData((currentCourse) => ({
        ...currentCourse,
        sections: updater(
          cloneSections((currentCourse.sections ?? []) as Section[])
        ),
      }));
    },
    [setCourseData]
  );

  const getSectionsFromCache = useCallback(() => {
    const currentCourse =
      queryClient.getQueryData<CourseDetail>(courseQueryKey);
    return cloneSections((currentCourse?.sections ?? []) as Section[]);
  }, [courseQueryKey, queryClient]);

  // Mutations
  const createSectionMutation = useMutation(
    trpc.course.createSection.mutationOptions({
      onSuccess: (createdSection) => {
        updateSectionsInCache((sections) => [
          ...sections,
          { ...createdSection, lessons: [] },
        ]);
        persistedOrderRef.current = buildOrderSnapshot(getSectionsFromCache());
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
      onError: (error) => {
        invalidateCourse();
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
        persistedOrderRef.current = buildOrderSnapshot(getSectionsFromCache());
        toastManager.add({
          title: "Section deleted",
          type: "success",
        });
      },
      onError: (error) => {
        invalidateCourse();
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
        updateSectionsInCache((sections) =>
          sections.map((section) =>
            section.id === newLesson.sectionId
              ? { ...section, lessons: [...section.lessons, newLesson] }
              : section
          )
        );
        persistedOrderRef.current = buildOrderSnapshot(getSectionsFromCache());
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
      onError: (error) => {
        invalidateCourse();
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
        persistedOrderRef.current = buildOrderSnapshot(getSectionsFromCache());
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

  const sections = useMemo(
    () => cloneSections((course.sections ?? []) as Section[]),
    [course.sections]
  );

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current !== null) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!(hasPendingOrderChangesRef.current || isFlushingOrderRef.current)) {
      persistedOrderRef.current = buildOrderSnapshot(sections);
    }
  }, [sections]);

  const sectionIds = useMemo(
    () => sections.map((section) => section.id),
    [sections]
  );

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
    const previousCourse =
      queryClient.getQueryData<CourseDetail>(courseQueryKey);

    updateSectionsInCache((sections) =>
      sections.map((section) =>
        section.id === sectionId ? { ...section, title } : section
      )
    );

    updateSectionMutation.mutate(
      { sectionId, title },
      {
        onError: () => {
          if (previousCourse) {
            queryClient.setQueryData(courseQueryKey, previousCourse);
          }
        },
      }
    );
  };

  const handleDeleteSection = (sectionId: string) => {
    const previousCourse =
      queryClient.getQueryData<CourseDetail>(courseQueryKey);

    updateSectionsInCache((sections) =>
      sections.filter((section) => section.id !== sectionId)
    );

    deleteSectionMutation.mutate(
      { sectionId },
      {
        onError: () => {
          if (previousCourse) {
            queryClient.setQueryData(courseQueryKey, previousCourse);
          }
        },
      }
    );
  };

  const handleUpdateLessonTitle = (lessonId: string, title: string) => {
    const previousCourse =
      queryClient.getQueryData<CourseDetail>(courseQueryKey);

    updateSectionsInCache((sections) =>
      sections.map((section) => ({
        ...section,
        lessons: section.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, title } : lesson
        ),
      }))
    );

    updateLessonMutation.mutate(
      { lessonId, title },
      {
        onError: () => {
          if (previousCourse) {
            queryClient.setQueryData(courseQueryKey, previousCourse);
          }
        },
      }
    );
  };

  const handleUpdateLessonContent = (
    lessonId: string,
    content: JSONContent
  ) => {
    const previousCourse =
      queryClient.getQueryData<CourseDetail>(courseQueryKey);

    setSavingLessonId(lessonId);
    updateSectionsInCache((sections) =>
      sections.map((section) => ({
        ...section,
        lessons: section.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, content } : lesson
        ),
      }))
    );

    updateLessonMutation.mutate(
      { lessonId, content },
      {
        onSuccess: () => {
          toastManager.add({
            title: "Lesson saved",
            type: "success",
          });
        },
        onError: () => {
          if (previousCourse) {
            queryClient.setQueryData(courseQueryKey, previousCourse);
          }
        },
        onSettled: () => {
          setSavingLessonId((currentLessonId) =>
            currentLessonId === lessonId ? null : currentLessonId
          );
        },
      }
    );
  };

  const handleDeleteLesson = (lessonId: string) => {
    const previousCourse =
      queryClient.getQueryData<CourseDetail>(courseQueryKey);

    updateSectionsInCache((sections) =>
      sections.map((section) => ({
        ...section,
        lessons: section.lessons.filter((lesson) => lesson.id !== lessonId),
      }))
    );

    deleteLessonMutation.mutate(
      { lessonId },
      {
        onError: () => {
          if (previousCourse) {
            queryClient.setQueryData(courseQueryKey, previousCourse);
          }
        },
      }
    );
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

  // Flush cached order state to server (section order, moves, lesson orders)
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: grouped sync matches curriculum state machine
  const flushOrderToServer = useCallback(async () => {
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    if (isFlushingOrderRef.current) {
      return;
    }

    const current = getSectionsFromCache();
    const previousSnapshot = persistedOrderRef.current;
    const currentSnapshot = buildOrderSnapshot(current);

    if (orderSnapshotsEqual(currentSnapshot, previousSnapshot)) {
      hasPendingOrderChangesRef.current = false;
      return;
    }

    isFlushingOrderRef.current = true;

    const lastSectionIds = previousSnapshot.sectionIds;
    const lastBySection = previousSnapshot.lessonIdsBySection;

    const currentSectionIds = current.map((s) => s.id);
    const sectionOrderChanged =
      currentSectionIds.length !== lastSectionIds.length ||
      currentSectionIds.some((id, i) => id !== lastSectionIds[i]);

    try {
      if (sectionOrderChanged) {
        await reorderSectionsMutation.mutateAsync({
          courseId,
          sectionIds: currentSectionIds,
        });
      }

      const lastLessonToSection: Record<string, string> = {};
      for (const [secId, lessonIds] of Object.entries(lastBySection)) {
        for (const lessonId of lessonIds) {
          lastLessonToSection[lessonId] = secId;
        }
      }

      const movedLessons: {
        lessonId: string;
        targetSectionId: string;
        newOrder: number;
      }[] = [];

      for (const section of current) {
        for (const [index, lesson] of section.lessons.entries()) {
          if (lastLessonToSection[lesson.id] !== section.id) {
            movedLessons.push({
              lessonId: lesson.id,
              targetSectionId: section.id,
              newOrder: index,
            });
          }
        }
      }

      for (const movedLesson of movedLessons) {
        await moveLessonMutation.mutateAsync(movedLesson);
      }

      const sectionsToReorder = current.filter((section) => {
        const currentLessonIds = section.lessons.map((lesson) => lesson.id);
        const previousLessonIds = lastBySection[section.id] ?? [];

        return (
          currentLessonIds.length !== previousLessonIds.length ||
          currentLessonIds.some((id, index) => id !== previousLessonIds[index])
        );
      });

      await Promise.all(
        sectionsToReorder.map((section) =>
          reorderLessonsMutation.mutateAsync({
            sectionId: section.id,
            lessonIds: section.lessons.map((lesson) => lesson.id),
          })
        )
      );

      persistedOrderRef.current = currentSnapshot;
      hasPendingOrderChangesRef.current = false;
    } catch {
      hasPendingOrderChangesRef.current = false;
      invalidateCourse();
    } finally {
      isFlushingOrderRef.current = false;

      const latestSnapshot = buildOrderSnapshot(getSectionsFromCache());
      if (orderSnapshotsEqual(latestSnapshot, persistedOrderRef.current)) {
        hasPendingOrderChangesRef.current = false;
      } else {
        hasPendingOrderChangesRef.current = true;
        saveTimeoutRef.current = setTimeout(() => {
          flushOrderToServer().catch(() => {
            // mutation handlers already surface errors
          });
        }, DEBOUNCE_MS);
      }
    }
  }, [
    courseId,
    getSectionsFromCache,
    invalidateCourse,
    moveLessonMutation,
    reorderLessonsMutation,
    reorderSectionsMutation,
  ]);

  const scheduleDebouncedSave = useCallback(() => {
    hasPendingOrderChangesRef.current = true;
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      flushOrderToServer().catch(() => {
        // mutation handlers already surface errors
      });
    }, DEBOUNCE_MS);
  }, [flushOrderToServer]);

  const handleCurriculumChange = useCallback(
    (action: CurriculumAction) => {
      updateSectionsInCache((sections) =>
        applyCurriculumAction(sections, action)
      );
      scheduleDebouncedSave();
    },
    [scheduleDebouncedSave, updateSectionsInCache]
  );

  // ---- Shared single DndContext for all sections and lessons ----
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const allLessonIds = useMemo(
    () => sections.flatMap((s) => s.lessons.map((l) => l.id)),
    [sections]
  );

  const handleCurriculumDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  }, []);

  const handleCurriculumDragEnd = useCallback(
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: multi-container DnD handler
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragId(null);
      if (!over) {
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      // Section reordering
      if (sectionIds.includes(activeId)) {
        if (sectionIds.includes(overId) && activeId !== overId) {
          handleCurriculumChange({
            type: "reorder-sections",
            activeId,
            overId,
          });
        }
        return;
      }

      // Lesson dragging
      if (!allLessonIds.includes(activeId)) {
        return;
      }

      const sourceSection = sections.find((s) =>
        s.lessons.some((l) => l.id === activeId)
      );
      if (!sourceSection) {
        return;
      }

      // Dropped on an empty-section droppable zone
      if (over.data?.current?.type === "empty-section") {
        if (overId !== sourceSection.id) {
          handleCurriculumChange({
            type: "move-lesson",
            lessonId: activeId,
            targetSectionId: overId,
          });
        }
        return;
      }

      // Dropped on another lesson
      if (allLessonIds.includes(overId)) {
        const targetSection = sections.find((s) =>
          s.lessons.some((l) => l.id === overId)
        );
        if (!targetSection) {
          return;
        }

        if (sourceSection.id === targetSection.id) {
          handleCurriculumChange({
            type: "reorder-lessons",
            sectionId: sourceSection.id,
            activeId,
            overId,
          });
        } else {
          handleCurriculumChange({
            type: "move-lesson",
            lessonId: activeId,
            targetSectionId: targetSection.id,
            overLessonId: overId,
          });
        }
        return;
      }

      // Dropped on a section container (non-empty section)
      if (sectionIds.includes(overId) && overId !== sourceSection.id) {
        handleCurriculumChange({
          type: "move-lesson",
          lessonId: activeId,
          targetSectionId: overId,
        });
      }
    },
    [sectionIds, allLessonIds, sections, handleCurriculumChange]
  );

  // Active drag item info for overlay
  const activeDragSection = activeDragId
    ? sections.find((s) => s.id === activeDragId)
    : null;
  const activeDragLesson = activeDragId
    ? sections.flatMap((s) => s.lessons).find((l) => l.id === activeDragId)
    : null;

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
      <DndContext
        id="curriculum-dnd"
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        onDragEnd={handleCurriculumDragEnd}
        onDragStart={handleCurriculumDragStart}
        sensors={dndSensors}
      >
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <p className="text-muted-foreground text-sm">
              No sections yet. Add your first section to get started.
            </p>
          </div>
        ) : (
          <SortableContext
            items={sectionIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
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
                    onMoveLessonToSection={(lessonId, targetSectionId) =>
                      handleCurriculumChange({
                        type: "move-lesson",
                        lessonId,
                        targetSectionId,
                      })
                    }
                    onToggleCollapse={toggleSectionCollapse}
                    onToggleLessonExpand={toggleLessonExpand}
                    onUpdateLessonContent={handleUpdateLessonContent}
                    onUpdateLessonTitle={handleUpdateLessonTitle}
                    onUpdateSectionTitle={handleUpdateSectionTitle}
                    savingLessonId={savingLessonId}
                    section={section}
                  />
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        )}
        <DragOverlay>
          {activeDragSection && (
            <div className="rounded-lg border bg-card px-4 py-3 font-medium text-sm opacity-90 shadow-lg">
              {activeDragSection.title}
            </div>
          )}
          {activeDragLesson && (
            <div className="rounded-md border bg-background px-3 py-2 text-sm opacity-90 shadow-lg">
              {activeDragLesson.title}
            </div>
          )}
        </DragOverlay>
      </DndContext>

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
// Empty Section Droppable
// -----------------------------------------------------------------------------

function EmptySectionDroppable({ sectionId }: { sectionId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: sectionId,
    data: { type: "empty-section" },
  });

  return (
    <div
      className={cn(
        "mt-2 flex min-h-16 flex-col items-center justify-center gap-2 rounded-md border border-dashed py-4 text-center text-muted-foreground text-xs transition-colors",
        isOver && "border-primary bg-primary/5 text-primary"
      )}
      ref={setNodeRef}
    >
      <span>
        {isOver ? "Release to drop here" : "No lessons yet — drag one here"}
      </span>
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
  savingLessonId: string | null;
  onToggleCollapse: (sectionId: string) => void;
  onToggleLessonExpand: (lessonId: string) => void;
  onAddLesson: (sectionId: string) => void;
  onUpdateSectionTitle: (sectionId: string, title: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onUpdateLessonTitle: (lessonId: string, title: string) => void;
  onUpdateLessonContent: (lessonId: string, content: JSONContent) => void;
  onDeleteLesson: (lessonId: string) => void;
  onMoveLessonToSection: (lessonId: string, targetSectionId: string) => void;
}

function SectionItemImpl({
  section,
  allSections,
  collapsedSections,
  expandedLessonId,
  isUpdating,
  savingLessonId,
  onToggleCollapse,
  onToggleLessonExpand,
  onAddLesson,
  onUpdateSectionTitle,
  onDeleteSection,
  onUpdateLessonTitle,
  onUpdateLessonContent,
  onDeleteLesson,
  onMoveLessonToSection,
}: SectionItemProps) {
  const isCollapsed = collapsedSections.has(section.id);

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

          <Editable
            className="flex-1 gap-0"
            onSubmit={(value) => {
              const trimmedValue = value.trim();
              if (trimmedValue && trimmedValue !== section.title) {
                onUpdateSectionTitle(section.id, trimmedValue);
              }
            }}
            value={section.title}
          >
            <EditableArea className="w-full">
              <EditablePreview className="font-medium text-sm hover:underline" />
              <EditableInput className="h-7 px-2 text-sm" />
            </EditableArea>
          </Editable>

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
            <SortableContext
              items={section.lessons.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              {section.lessons.length === 0 ? (
                <EmptySectionDroppable sectionId={section.id} />
              ) : (
                <div className="flex flex-col gap-1 pt-2">
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
                          onUpdateContent={onUpdateLessonContent}
                          onUpdateTitle={onUpdateLessonTitle}
                          otherSections={otherSections}
                          savingLessonId={savingLessonId}
                        />
                      </div>
                    </SortableItem>
                  ))}
                </div>
              )}
            </SortableContext>
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
  savingLessonId: string | null;
  onToggleExpand: (lessonId: string) => void;
  onUpdateTitle: (lessonId: string, title: string) => void;
  onUpdateContent: (lessonId: string, content: JSONContent) => void;
  onDeleteLesson: (lessonId: string) => void;
  otherSections: Section[];
  onMoveToSection?: (lessonId: string, targetSectionId: string) => void;
}

function LessonItemImpl({
  lesson,
  expandedLessonId,
  isUpdating,
  savingLessonId,
  onToggleExpand,
  onUpdateTitle,
  onUpdateContent,
  onDeleteLesson,
  otherSections,
  onMoveToSection,
}: LessonItemProps) {
  const isExpanded = expandedLessonId === lesson.id;
  const [content, setContent] = useState<JSONContent | undefined>(() =>
    normalizeLessonContent(lesson.content)
  );

  useEffect(() => {
    if (!isExpanded) {
      setContent(normalizeLessonContent(lesson.content));
    }
  }, [isExpanded, lesson.content]);

  const handleSaveContent = () => {
    onUpdateContent(lesson.id, content ?? { type: "doc", content: [] });
  };

  return (
    <div className={cn(isExpanded && "ring-1 ring-primary/20")}>
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

        <Editable
          className="flex-1 gap-0"
          onSubmit={(value) => {
            const trimmedValue = value.trim();
            if (trimmedValue && trimmedValue !== lesson.title) {
              onUpdateTitle(lesson.id, trimmedValue);
            }
          }}
          value={lesson.title}
        >
          <EditableArea className="w-full">
            <EditablePreview className="text-sm hover:underline" />
            <EditableInput className="h-6 px-2 text-sm" />
          </EditableArea>
        </Editable>

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
        <div className="p-2">
          <Editor
            content={content}
            mediaUploadOwnerId={lesson.id}
            onUpdate={setContent}
            placeholder="Write your lesson content..."
            variant="full"
          />
          <div className="mt-3 flex justify-end">
            <Button
              disabled={isUpdating && savingLessonId === lesson.id}
              onClick={handleSaveContent}
              size="sm"
              type="button"
            >
              {isUpdating && savingLessonId === lesson.id && (
                <Loader2Icon className="size-4 animate-spin" />
              )}
              Save Lesson
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const SectionItem = memo(SectionItemImpl);
const LessonItem = memo(LessonItemImpl);
