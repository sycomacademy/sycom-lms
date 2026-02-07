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
import {
  GripVerticalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createLessonAction,
  createModuleAction,
  createSectionAction,
  deleteLessonAction,
  deleteModuleAction,
  deleteSectionAction,
  reorderLessonsAction,
  reorderModulesAction,
  reorderSectionsAction,
  updateLessonAction,
  updateSectionAction,
} from "@/lib/actions/instructor";

interface LessonRow {
  id: string;
  sectionId: string;
  title: string;
  order: number;
  type: string;
  duration: number;
  content: string | null;
  videoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SectionRow {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  lessons: LessonRow[];
}

interface ModuleRow {
  id: string;
  courseId: string;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  sections: SectionRow[];
}

interface CurriculumTreeProps {
  courseId: string;
  courseTitle: string;
  initialModules: ModuleRow[];
}

function SortableModule({
  module: mod,
  courseId,
  onReorderSections: _onReorderSections,
  onReorderLessons: _onReorderLessons,
  onDeleteModule,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}: {
  module: ModuleRow;
  courseId: string;
  onReorderSections: (moduleId: string, orderedIds: string[]) => Promise<void>;
  onReorderLessons: (sectionId: string, orderedIds: string[]) => Promise<void>;
  onDeleteModule: (moduleId: string) => Promise<void>;
  onAddSection: (moduleId: string, title: string) => Promise<void>;
  onEditSection: (sectionId: string, title: string) => Promise<void>;
  onDeleteSection: (sectionId: string) => Promise<void>;
  onAddLesson: (sectionId: string, title: string) => Promise<void>;
  onEditLesson: (lessonId: string, title: string) => Promise<void>;
  onDeleteLesson: (lessonId: string) => Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: mod.id,
    data: { type: "module" as const, moduleId: mod.id },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={
        isDragging ? "opacity-50" : "rounded-lg border border-border bg-card"
      }
      ref={setNodeRef}
      style={style}
    >
      <div className="flex items-center gap-2 border-border border-b p-2">
        <button
          className="cursor-grab touch-none rounded p-1 hover:bg-muted active:cursor-grabbing"
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-4 text-muted-foreground" />
        </button>
        <span className="font-medium text-sm">{mod.title}</span>
        <span className="text-muted-foreground text-xs">Module</span>
        <div className="ml-auto flex gap-1">
          <AddSectionDialog moduleId={mod.id} onAdd={onAddSection} />
          <Button
            onClick={() => onDeleteModule(mod.id)}
            size="icon-xs"
            variant="ghost"
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="p-2 pl-6">
        <SortableContext
          items={mod.sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {mod.sections.map((sec) => (
            <SortableSection
              courseId={courseId}
              key={sec.id}
              onAddLesson={onAddLesson}
              onDeleteLesson={onDeleteLesson}
              onDeleteSection={onDeleteSection}
              onEditLesson={onEditLesson}
              onEditSection={onEditSection}
              onReorderLessons={_onReorderLessons}
              section={sec}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function SortableSection({
  section,
  courseId: _courseId,
  onReorderLessons: _onReorderLessons,
  onEditSection,
  onDeleteSection,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}: {
  section: SectionRow;
  courseId: string;
  onReorderLessons: (sectionId: string, orderedIds: string[]) => Promise<void>;
  onEditSection: (sectionId: string, title: string) => Promise<void>;
  onDeleteSection: (sectionId: string) => Promise<void>;
  onAddLesson: (sectionId: string, title: string) => Promise<void>;
  onEditLesson: (lessonId: string, title: string) => Promise<void>;
  onDeleteLesson: (lessonId: string) => Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    data: {
      type: "section" as const,
      sectionId: section.id,
      moduleId: section.moduleId,
    },
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
          : "mb-2 rounded border border-border bg-muted/20"
      }
      ref={setNodeRef}
      style={style}
    >
      <div className="flex items-center gap-2 p-2">
        <button
          className="cursor-grab touch-none rounded p-1 hover:bg-muted active:cursor-grabbing"
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-4 text-muted-foreground" />
        </button>
        <span className="text-sm">{section.title}</span>
        <span className="text-muted-foreground text-xs">Section</span>
        <div className="ml-auto flex gap-1">
          <AddLessonDialog onAdd={onAddLesson} sectionId={section.id} />
          <EditSectionDialog
            initialTitle={section.title}
            onSave={onEditSection}
            sectionId={section.id}
          />
          <Button
            onClick={() => onDeleteSection(section.id)}
            size="icon-xs"
            variant="ghost"
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="border-border border-t pt-1 pr-2 pb-2 pl-6">
        <SortableContext
          items={section.lessons.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {section.lessons.map((lesson) => (
            <SortableLesson
              key={lesson.id}
              lesson={lesson}
              onDelete={onDeleteLesson}
              onEdit={onEditLesson}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function SortableLesson({
  lesson,
  onEdit,
  onDelete,
}: {
  lesson: LessonRow;
  onEdit: (lessonId: string, title: string) => Promise<void>;
  onDelete: (lessonId: string) => Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lesson.id,
    data: {
      type: "lesson" as const,
      lessonId: lesson.id,
      sectionId: lesson.sectionId,
    },
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
          : "flex items-center gap-2 rounded py-1.5 pl-2 hover:bg-muted/50"
      }
      ref={setNodeRef}
      style={style}
    >
      <button
        className="cursor-grab touch-none rounded p-0.5 active:cursor-grabbing"
        type="button"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-3.5 text-muted-foreground" />
      </button>
      <span className="text-muted-foreground text-xs">{lesson.type}</span>
      <span className="flex-1 text-sm">{lesson.title}</span>
      <EditLessonDialog
        initialTitle={lesson.title}
        lessonId={lesson.id}
        onSave={onEdit}
      />
      <Button
        onClick={() => onDelete(lesson.id)}
        size="icon-xs"
        variant="ghost"
      >
        <Trash2Icon className="size-3.5" />
      </Button>
    </div>
  );
}

function AddModuleDialog({
  courseId: _courseId,
  onAdd,
}: {
  courseId: string;
  onAdd: (title: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    await onAdd(title || "Untitled module");
    setPending(false);
    setTitle("");
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button size="sm">
            <PlusIcon className="mr-1 size-4" />
            Add module
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add module</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="module-title">Title</Label>
            <Input
              className="mt-2"
              id="module-title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Module title"
              value={title}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={pending} type="submit">
              {pending ? "Adding…" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddSectionDialog({
  moduleId,
  onAdd,
}: {
  moduleId: string;
  onAdd: (moduleId: string, title: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    await onAdd(moduleId, title || "Untitled section");
    setPending(false);
    setTitle("");
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button size="icon-sm" variant="outline">
            <PlusIcon className="size-4" />
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add section</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="section-title">Title</Label>
            <Input
              className="mt-2"
              id="section-title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Section title"
              value={title}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={pending} type="submit">
              {pending ? "Adding…" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddLessonDialog({
  sectionId,
  onAdd,
}: {
  sectionId: string;
  onAdd: (sectionId: string, title: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    await onAdd(sectionId, title || "Untitled lesson");
    setPending(false);
    setTitle("");
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button size="icon-xs" variant="ghost">
            <PlusIcon className="size-3.5" />
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add lesson</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="lesson-title">Title</Label>
            <Input
              className="mt-2"
              id="lesson-title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lesson title"
              value={title}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={pending} type="submit">
              {pending ? "Adding…" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditSectionDialog({
  sectionId,
  initialTitle,
  onSave,
}: {
  sectionId: string;
  initialTitle: string;
  onSave: (sectionId: string, title: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    await onSave(sectionId, title || initialTitle);
    setPending(false);
    setOpen(false);
  };

  return (
    <Dialog
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setTitle(initialTitle);
        }
      }}
      open={open}
    >
      <DialogTrigger
        render={
          <Button size="icon-xs" variant="ghost">
            <PencilIcon className="size-3.5" />
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit section</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-section-title">Title</Label>
            <Input
              className="mt-2"
              id="edit-section-title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={pending} type="submit">
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditLessonDialog({
  lessonId,
  initialTitle,
  onSave,
}: {
  lessonId: string;
  initialTitle: string;
  onSave: (lessonId: string, title: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    await onSave(lessonId, title || initialTitle);
    setPending(false);
    setOpen(false);
  };

  return (
    <Dialog
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setTitle(initialTitle);
        }
      }}
      open={open}
    >
      <DialogTrigger
        render={
          <Button size="icon-xs" variant="ghost">
            <PencilIcon className="size-3.5" />
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit lesson</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-lesson-title">Title</Label>
            <Input
              className="mt-2"
              id="edit-lesson-title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={pending} type="submit">
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CurriculumTree({
  courseId,
  courseTitle: _courseTitle,
  initialModules,
}: CurriculumTreeProps) {
  const router = useRouter();
  const [modules, setModules] = useState<ModuleRow[]>(initialModules);

  useEffect(() => {
    setModules(initialModules);
  }, [initialModules]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const applyModuleReorder = useCallback(
    async (orderedIds: string[], oldIndex: number, newIndex: number) => {
      await reorderModulesAction(courseId, orderedIds);
      setModules((prev) => {
        const next = [...prev];
        const [removed] = next.splice(oldIndex, 1);
        next.splice(newIndex, 0, removed);
        return next;
      });
    },
    [courseId]
  );

  const applySectionReorder = useCallback(
    async (
      moduleId: string,
      orderedIds: string[],
      oldIndex: number,
      newIndex: number
    ) => {
      await reorderSectionsAction(courseId, moduleId, orderedIds);
      setModules((prev) =>
        prev.map((m) => {
          if (m.id !== moduleId) {
            return m;
          }
          const nextSections = [...m.sections];
          const [removed] = nextSections.splice(oldIndex, 1);
          nextSections.splice(newIndex, 0, removed);
          return { ...m, sections: nextSections };
        })
      );
    },
    [courseId]
  );

  const applyLessonReorder = useCallback(
    async (
      sectionId: string,
      orderedIds: string[],
      oldIndex: number,
      newIndex: number
    ) => {
      await reorderLessonsAction(courseId, sectionId, orderedIds);
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          sections: m.sections.map((s) => {
            if (s.id !== sectionId) {
              return s;
            }
            const nextLessons = [...s.lessons];
            const [removed] = nextLessons.splice(oldIndex, 1);
            nextLessons.splice(newIndex, 0, removed);
            return { ...s, lessons: nextLessons };
          }),
        }))
      );
    },
    [courseId]
  );

  // Drag-end branches by type (module/section/lesson); complexity is inherent to the logic
  const handleDragEnd = useCallback(
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: branch by drag type
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      const data = active.data.current as
        | { type: "module"; moduleId: string }
        | { type: "section"; sectionId: string; moduleId: string }
        | { type: "lesson"; lessonId: string; sectionId: string }
        | undefined;
      if (!data) {
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      if (data.type === "module") {
        const ids = modules.map((m) => m.id);
        const oldIndex = ids.indexOf(activeId);
        const newIndex = ids.indexOf(overId);
        if (oldIndex === -1 || newIndex === -1) {
          return;
        }
        await applyModuleReorder(
          arrayMove(ids, oldIndex, newIndex),
          oldIndex,
          newIndex
        );
      } else if (data.type === "section") {
        const mod = modules.find((m) => m.id === data.moduleId);
        if (!mod) {
          return;
        }
        const ids = mod.sections.map((s) => s.id);
        const oldIndex = ids.indexOf(activeId);
        const newIndex = ids.indexOf(overId);
        if (oldIndex === -1 || newIndex === -1) {
          return;
        }
        await applySectionReorder(
          data.moduleId,
          arrayMove(ids, oldIndex, newIndex),
          oldIndex,
          newIndex
        );
      } else if (data.type === "lesson") {
        const section = modules
          .flatMap((m) => m.sections)
          .find((s) => s.id === data.sectionId);
        if (!section) {
          return;
        }
        const ids = section.lessons.map((l) => l.id);
        const oldIndex = ids.indexOf(activeId);
        const newIndex = ids.indexOf(overId);
        if (oldIndex === -1 || newIndex === -1) {
          return;
        }
        await applyLessonReorder(
          data.sectionId,
          arrayMove(ids, oldIndex, newIndex),
          oldIndex,
          newIndex
        );
      }
      router.refresh();
    },
    [
      applyLessonReorder,
      applyModuleReorder,
      applySectionReorder,
      modules,
      router,
    ]
  );

  const handleAddModule = useCallback(
    async (title: string) => {
      await createModuleAction(courseId, title);
      router.refresh();
    },
    [courseId, router]
  );

  const handleAddSection = useCallback(
    async (moduleId: string, title: string) => {
      await createSectionAction(moduleId, courseId, title);
      router.refresh();
    },
    [courseId, router]
  );

  const handleAddLesson = useCallback(
    async (sectionId: string, title: string) => {
      await createLessonAction(courseId, sectionId, {
        title,
        type: "article",
        duration: 0,
      });
      router.refresh();
    },
    [courseId, router]
  );

  const handleDeleteModule = useCallback(
    async (moduleId: string) => {
      await deleteModuleAction(courseId, moduleId);
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
      router.refresh();
    },
    [courseId, router]
  );

  const handleEditSection = useCallback(
    async (sectionId: string, title: string) => {
      await updateSectionAction(courseId, sectionId, { title });
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          sections: m.sections.map((s) =>
            s.id === sectionId ? { ...s, title } : s
          ),
        }))
      );
      router.refresh();
    },
    [courseId, router]
  );

  const handleDeleteSection = useCallback(
    async (sectionId: string) => {
      await deleteSectionAction(courseId, sectionId);
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          sections: m.sections.filter((s) => s.id !== sectionId),
        }))
      );
      router.refresh();
    },
    [courseId, router]
  );

  const handleEditLesson = useCallback(
    async (lessonId: string, title: string) => {
      await updateLessonAction(courseId, lessonId, { title });
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          sections: m.sections.map((s) => ({
            ...s,
            lessons: s.lessons.map((l) =>
              l.id === lessonId ? { ...l, title } : l
            ),
          })),
        }))
      );
      router.refresh();
    },
    [courseId, router]
  );

  const handleDeleteLesson = useCallback(
    async (lessonId: string) => {
      await deleteLessonAction(courseId, lessonId);
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          sections: m.sections.map((s) => ({
            ...s,
            lessons: s.lessons.filter((l) => l.id !== lessonId),
          })),
        }))
      );
      router.refresh();
    },
    [courseId, router]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <AddModuleDialog courseId={courseId} onAdd={handleAddModule} />
      </div>

      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext
          items={modules.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {modules.map((mod) => (
              <SortableModule
                courseId={courseId}
                key={mod.id}
                module={mod}
                onAddLesson={handleAddLesson}
                onAddSection={handleAddSection}
                onDeleteLesson={handleDeleteLesson}
                onDeleteModule={handleDeleteModule}
                onDeleteSection={handleDeleteSection}
                onEditLesson={handleEditLesson}
                onEditSection={handleEditSection}
                onReorderLessons={async (sectionId, orderedIds) => {
                  await reorderLessonsAction(courseId, sectionId, orderedIds);
                  router.refresh();
                }}
                onReorderSections={async (moduleId, orderedIds) => {
                  await reorderSectionsAction(courseId, moduleId, orderedIds);
                  router.refresh();
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
