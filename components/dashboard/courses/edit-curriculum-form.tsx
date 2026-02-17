"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_EDITOR_VALUE,
  PlateEditor,
} from "@/components/editor/plate-editor";
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
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<
    "section" | "lesson" | null
  >(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Sections data
  const sections = useMemo(
    () => (course.sections ?? []) as Section[],
    [course.sections]
  );

  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

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
    updateSectionMutation.mutate({ sectionId, title });
  };

  const handleDeleteSection = (sectionId: string) => {
    deleteSectionMutation.mutate({ sectionId });
  };

  const handleUpdateLessonTitle = (lessonId: string, title: string) => {
    updateLessonMutation.mutate({ lessonId, title });
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

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveDragId(id);
    if (id.startsWith("sec_")) {
      setActiveDragType("section");
    } else if (id.startsWith("lsn_")) {
      setActiveDragType("lesson");
    }
  };

  const applySectionReorder = useCallback(
    (activeId: string, overId: string) => {
      const oldIndex = sectionIds.indexOf(activeId);
      const newIndex = sectionIds.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) {
        return;
      }
      const newOrder = arrayMove(sectionIds, oldIndex, newIndex);
      reorderSectionsMutation.mutate({ courseId, sectionIds: newOrder });
    },
    [courseId, sectionIds, reorderSectionsMutation]
  );

  const applyLessonReorderSameSection = useCallback(
    (activeId: string, overId: string, sectionId: string) => {
      const sectionLessons =
        sections.find((s) => s.id === sectionId)?.lessons ?? [];
      const lessonIds = sectionLessons.map((l) => l.id);
      const oldIndex = lessonIds.indexOf(activeId);
      const newIndex = lessonIds.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) {
        return;
      }
      const newOrder = arrayMove(lessonIds, oldIndex, newIndex);
      reorderLessonsMutation.mutate({ sectionId, lessonIds: newOrder });
    },
    [sections, reorderLessonsMutation]
  );

  const applyLessonMoveToSection = useCallback(
    (activeId: string, overId: string, targetSectionId: string) => {
      const targetSection = sections.find((s) => s.id === targetSectionId);
      if (!targetSection) {
        return;
      }
      const overIndex = targetSection.lessons.findIndex((l) => l.id === overId);
      moveLessonMutation.mutate({
        lessonId: activeId,
        targetSectionId,
        newOrder: overIndex >= 0 ? overIndex : targetSection.lessons.length,
      });
    },
    [sections, moveLessonMutation]
  );

  const handleLessonReorderOrMove = useCallback(
    (activeId: string, overId: string) => {
      const allLessons = sections.flatMap((s) => s.lessons);
      const activeLesson = allLessons.find((l) => l.id === activeId);
      const overLesson = allLessons.find((l) => l.id === overId);
      if (!(activeLesson && overLesson)) {
        return;
      }

      if (activeLesson.sectionId === overLesson.sectionId) {
        applyLessonReorderSameSection(activeId, overId, activeLesson.sectionId);
      } else {
        applyLessonMoveToSection(activeId, overId, overLesson.sectionId);
      }
    },
    [sections, applyLessonReorderSameSection, applyLessonMoveToSection]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragId(null);
      setActiveDragType(null);
      if (!over || active.id === over.id) {
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId.startsWith("sec_") && overId.startsWith("sec_")) {
        applySectionReorder(activeId, overId);
        return;
      }
      if (activeId.startsWith("lsn_") && overId.startsWith("lsn_")) {
        handleLessonReorderOrMove(activeId, overId);
      }
    },
    [applySectionReorder, handleLessonReorderOrMove]
  );

  // Find active item for drag overlay
  const activeSection =
    activeDragType === "section"
      ? sections.find((s) => s.id === activeDragId)
      : null;
  const activeLesson =
    activeDragType === "lesson"
      ? sections.flatMap((s) => s.lessons).find((l) => l.id === activeDragId)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        <SortableContext
          items={sectionIds}
          strategy={verticalListSortingStrategy}
        >
          {sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <p className="text-muted-foreground text-sm">
                No sections yet. Add your first section to get started.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sections.map((section) => (
                <SectionItem
                  collapsedSections={collapsedSections}
                  expandedLessonId={expandedLessonId}
                  isUpdating={
                    updateSectionMutation.isPending ||
                    updateLessonMutation.isPending
                  }
                  key={section.id}
                  onAddLesson={handleAddLesson}
                  onDeleteLesson={handleDeleteLesson}
                  onDeleteSection={handleDeleteSection}
                  onToggleCollapse={toggleSectionCollapse}
                  onToggleLessonExpand={toggleLessonExpand}
                  onToggleLessonLock={handleToggleLessonLock}
                  onUpdateLessonContent={handleUpdateLessonContent}
                  onUpdateLessonTitle={handleUpdateLessonTitle}
                  onUpdateSectionTitle={handleUpdateSectionTitle}
                  section={section}
                />
              ))}
            </div>
          )}
        </SortableContext>

        <DragOverlay>
          {activeSection && (
            <div className="rounded-lg border bg-card p-4 opacity-90 shadow-lg">
              <span className="font-medium text-sm">{activeSection.title}</span>
            </div>
          )}
          {activeLesson && (
            <div className="rounded-md border bg-card p-3 opacity-90 shadow-lg">
              <span className="text-sm">{activeLesson.title}</span>
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
// Section Item
// -----------------------------------------------------------------------------

interface SectionItemProps {
  section: Section;
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
}

function SectionItem({
  section,
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
}: SectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCollapsed = collapsedSections.has(section.id);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(section.title);

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

  const lessonIds = section.lessons.map((l) => l.id);

  return (
    <div
      className={cn("rounded-lg border bg-card", isDragging && "opacity-50")}
      ref={setNodeRef}
      style={style}
    >
      <Collapsible open={!isCollapsed}>
        {/* Section Header */}
        <div className="flex items-center gap-2 p-3">
          {/* Drag Handle */}
          <button
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
            type="button"
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="size-4" />
          </button>

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
            <SortableContext
              items={lessonIds}
              strategy={verticalListSortingStrategy}
            >
              {section.lessons.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground text-xs">
                  No lessons in this section yet.
                </p>
              ) : (
                <div className="flex flex-col gap-1 pt-2">
                  {section.lessons.map((lesson) => (
                    <LessonItem
                      expandedLessonId={expandedLessonId}
                      isUpdating={isUpdating}
                      key={lesson.id}
                      lesson={lesson}
                      onDeleteLesson={onDeleteLesson}
                      onToggleExpand={onToggleLessonExpand}
                      onToggleLock={onToggleLessonLock}
                      onUpdateContent={onUpdateLessonContent}
                      onUpdateTitle={onUpdateLessonTitle}
                    />
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
  onToggleExpand: (lessonId: string) => void;
  onUpdateTitle: (lessonId: string, title: string) => void;
  onToggleLock: (lessonId: string, isLocked: boolean) => void;
  onUpdateContent: (lessonId: string, content: Value) => void;
  onDeleteLesson: (lessonId: string) => void;
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
}: LessonItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isExpanded = expandedLessonId === lesson.id;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(lesson.title);
  const [content, setContent] = useState<Value>(() => {
    const raw = lesson.content;
    return Array.isArray(raw) && raw.length > 0 ? raw : DEFAULT_EDITOR_VALUE;
  });

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
    <div
      className={cn(
        "rounded-md border bg-background",
        isDragging && "opacity-50",
        isExpanded && "ring-1 ring-primary/20"
      )}
      ref={setNodeRef}
      style={style}
    >
      {/* Lesson Header */}
      <div className="flex items-center gap-2 p-2">
        {/* Drag Handle */}
        <button
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-3.5" />
        </button>

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
            value={content}
            variant="basic"
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
