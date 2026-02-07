"use client";

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import {
  addCourseToPathwayAction,
  removeCourseFromPathwayAction,
  reorderPathwayCoursesAction,
} from "@/lib/actions/instructor";

interface CourseRow {
  id: string;
  title: string;
  slug: string;
}
interface PathwayCourseRow {
  id: string;
  courseId: string;
  courseOrder: number;
  course: CourseRow;
}

interface PathwayCoursesManagerProps {
  pathwayId: string;
  pathwayTitle: string;
  initialPathwayCourses: PathwayCourseRow[];
  allCourses: CourseRow[];
}

function SortableCourseItem({
  item,
  onRemove,
}: {
  item: PathwayCourseRow;
  onRemove: (courseId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.courseId,
    data: { type: "pathway-course" as const, courseId: item.courseId },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={
        isDragging
          ? "opacity-50"
          : "flex items-center gap-2 rounded border border-border bg-card p-2"
      }
      ref={setNodeRef}
      style={style}
    >
      <button
        className="cursor-grab touch-none rounded p-1 hover:bg-muted active:cursor-grabbing"
        type="button"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4 text-muted-foreground" />
      </button>
      <span className="flex-1 font-medium text-sm">{item.course.title}</span>
      <Button
        onClick={() => onRemove(item.courseId)}
        size="icon-xs"
        variant="ghost"
      >
        <Trash2Icon className="size-3.5" />
      </Button>
    </div>
  );
}

export function PathwayCoursesManager({
  pathwayId,
  pathwayTitle: _pathwayTitle,
  initialPathwayCourses,
  allCourses,
}: PathwayCoursesManagerProps) {
  const router = useRouter();
  const [coursesInPathway, setCoursesInPathway] = useState<PathwayCourseRow[]>(
    initialPathwayCourses
  );
  const [selectedCourseId, setSelectedCourseId] = useState("");

  useEffect(() => {
    setCoursesInPathway(initialPathwayCourses);
  }, [initialPathwayCourses]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      const ids = coursesInPathway.map((c) => c.courseId);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const newOrder = arrayMove(ids, oldIndex, newIndex);
      await reorderPathwayCoursesAction(pathwayId, newOrder);
      setCoursesInPathway((prev) => {
        const next = [...prev];
        const [removed] = next.splice(oldIndex, 1);
        next.splice(newIndex, 0, removed);
        return next.map((c, i) => ({ ...c, courseOrder: i }));
      });
      router.refresh();
    },
    [pathwayId, coursesInPathway, router]
  );

  const handleAdd = useCallback(async () => {
    if (!selectedCourseId) {
      return;
    }
    await addCourseToPathwayAction(pathwayId, selectedCourseId);
    setSelectedCourseId("");
    router.refresh();
  }, [pathwayId, selectedCourseId, router]);

  const handleRemove = useCallback(
    async (courseId: string) => {
      await removeCourseFromPathwayAction(pathwayId, courseId);
      setCoursesInPathway((prev) =>
        prev.filter((c) => c.courseId !== courseId)
      );
      router.refresh();
    },
    [pathwayId, router]
  );

  const alreadyInPathway = new Set(coursesInPathway.map((c) => c.courseId));
  const availableCourses = allCourses.filter(
    (c) => !alreadyInPathway.has(c.id)
  );

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Courses in pathway</h2>

      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect
          className="min-w-48"
          onChange={(e) => setSelectedCourseId(e.target.value)}
          value={selectedCourseId}
        >
          <option value="">Add a course…</option>
          {availableCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </NativeSelect>
        <Button disabled={!selectedCourseId} onClick={handleAdd} type="button">
          Add
        </Button>
      </div>

      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext
          items={coursesInPathway.map((c) => c.courseId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {coursesInPathway.length === 0 ? (
              <p className="rounded border border-border border-dashed bg-muted/10 py-6 text-center text-muted-foreground text-sm">
                No courses in this pathway yet. Add one above.
              </p>
            ) : (
              coursesInPathway.map((item) => (
                <SortableCourseItem
                  item={item}
                  key={item.id}
                  onRemove={handleRemove}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
