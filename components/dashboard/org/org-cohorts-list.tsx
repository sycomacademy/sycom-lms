"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  CameraIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { authClient } from "@/packages/auth/auth-client";
import { uploadFile } from "@/packages/storage/upload";
import { useTRPC } from "@/packages/trpc/client";
import { getInitials } from "@/packages/utils/string";
import {
  getCohortImageUploadParams,
  persistCohortImageAsset,
} from "./cohort-image-actions";
import { CohortsCourseAssigner } from "./cohorts-course-assigner";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 1024 * 1024 * 4;

interface OrgMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
}

interface CohortMember {
  id: string;
  memberId: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
}

// ---------------------------------------------------------------------------
// OrgCohortsList
// ---------------------------------------------------------------------------

export function OrgCohortsList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [newCohortName, setNewCohortName] = useState("");
  const [expandedCohortId, setExpandedCohortId] = useState<string | null>(null);

  const { data } = useSuspenseQuery(trpc.org.listCohorts.queryOptions());
  const { data: activeMember } = authClient.useActiveMember();

  const canManage = ["owner", "admin", "org_owner", "org_admin"].includes(
    activeMember?.role ?? ""
  );

  const { data: orgMembersData } = useQuery({
    ...trpc.org.listMembers.queryOptions(),
    enabled: canManage,
  });
  const allOrgMembers: OrgMember[] = orgMembersData?.members ?? [];

  const createMutation = useMutation(
    trpc.org.createCohort.mutationOptions({
      onSuccess: (cohort) => {
        toastManager.add({
          title: "Cohort created",
          description: `"${cohort.name}" has been created.`,
          type: "success",
        });
        queryClient.invalidateQueries({
          queryKey: trpc.org.listCohorts.queryKey(),
        });
        setNewCohortName("");
        setCreateOpen(false);
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to create cohort",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const handleCreate = () => {
    const name = newCohortName.trim();
    if (!name) {
      toastManager.add({ title: "Name required", type: "warning" });
      return;
    }
    createMutation.mutate({ name });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medium text-foreground text-sm">Cohorts</h2>
          <p className="text-muted-foreground text-xs">
            {canManage
              ? "Organize members into groups and assign courses."
              : "Browse your cohorts and assigned courses."}
          </p>
        </div>
        {canManage && (
          <Dialog onOpenChange={setCreateOpen} open={createOpen}>
            <DialogTrigger
              render={
                <Button size="sm">
                  <PlusIcon className="size-4" />
                  New cohort
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create cohort</DialogTitle>
                <DialogDescription>
                  Create a new cohort for your organization. You can add members
                  and assign courses after creation.
                </DialogDescription>
              </DialogHeader>
              <DialogPanel>
                <div className="space-y-4">
                  <div>
                    <label
                      className="mb-1.5 block text-muted-foreground text-xs"
                      htmlFor="new-cohort-name"
                    >
                      Name
                    </label>
                    <Input
                      id="new-cohort-name"
                      onChange={(e) => setNewCohortName(e.target.value)}
                      placeholder="e.g. Fall 2025"
                      value={newCohortName}
                    />
                  </div>
                </div>
              </DialogPanel>
              <DialogFooter>
                <Button
                  disabled={createMutation.isPending || !newCohortName.trim()}
                  onClick={handleCreate}
                  size="sm"
                >
                  {createMutation.isPending && (
                    <Loader2Icon className="size-4 animate-spin" />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {data.cohorts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            No cohorts yet.
            {canManage &&
              " Create a cohort to organize members and assign courses."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.cohorts.map((cohort) => (
            <CohortCard
              allOrgMembers={allOrgMembers}
              canManage={canManage}
              cohort={cohort}
              expanded={expandedCohortId === cohort.id}
              key={cohort.id}
              onExpandToggle={() =>
                setExpandedCohortId((id) =>
                  id === cohort.id ? null : cohort.id
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AddMemberContent
// ---------------------------------------------------------------------------

function AddMemberContent({
  cohortId,
  cohortMemberUserIds,
  allOrgMembers,
  onClose,
}: {
  cohortId: string;
  cohortMemberUserIds: Set<string>;
  allOrgMembers: OrgMember[];
  onClose: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const assignMutation = useMutation(
    trpc.org.assignMemberToCohort.mutationOptions({
      onSuccess: () => {
        toastManager.add({ title: "Member added to cohort", type: "success" });
        queryClient.invalidateQueries({
          queryKey: trpc.org.listCohortMembers.queryKey({ cohortId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.org.listMembers.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.org.listCohorts.queryKey(),
        });
        onClose();
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to add member",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const searchLower = search.trim().toLowerCase();
  const available = allOrgMembers.filter(
    (m) => !cohortMemberUserIds.has(m.userId)
  );
  const filtered = searchLower
    ? available.filter(
        (m) =>
          m.name.toLowerCase().includes(searchLower) ||
          m.email.toLowerCase().includes(searchLower)
      )
    : available;

  return (
    <div className="space-y-3">
      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          className="pl-8"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          value={search}
        />
      </div>
      <div className="max-h-64 space-y-0.5 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground text-sm">
            No members available to add
          </p>
        ) : (
          filtered.map((m) => (
            <button
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted disabled:opacity-50"
              disabled={assignMutation.isPending}
              key={m.id}
              onClick={() =>
                assignMutation.mutate({ memberId: m.id, cohortId })
              }
              type="button"
            >
              <Avatar className="size-7 shrink-0">
                <AvatarImage alt={m.name} src={m.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(m.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate font-medium text-sm">{m.name}</div>
                <div className="truncate text-muted-foreground text-xs">
                  {m.email}
                </div>
              </div>
              {assignMutation.isPending && (
                <Spinner className="ml-auto size-3.5 shrink-0" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CohortMembersList
// ---------------------------------------------------------------------------

function CohortMembersList({
  members,
  isLoading,
  onRemove,
  removeIsPending,
}: {
  members: CohortMember[] | undefined;
  isLoading: boolean;
  onRemove: (memberId: string) => void;
  removeIsPending: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner className="size-4" />
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No members yet. Add members using the button above.
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      {members.map((m) => (
        <div
          className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
          key={m.id}
        >
          <Avatar className="size-7 shrink-0">
            <AvatarImage alt={m.name} src={m.image ?? undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(m.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-sm">{m.name}</div>
            <div className="truncate text-muted-foreground text-xs">
              {m.email}
            </div>
          </div>
          <button
            aria-label={`Remove ${m.name} from cohort`}
            className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-50"
            disabled={removeIsPending}
            onClick={() => onRemove(m.memberId)}
            type="button"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CohortCard
// ---------------------------------------------------------------------------

function CohortCard({
  cohort,
  canManage,
  expanded,
  onExpandToggle,
  allOrgMembers,
}: {
  cohort: {
    id: string;
    name: string;
    image?: string | null;
    memberCount?: number;
    courseCount?: number;
  };
  canManage: boolean;
  expanded: boolean;
  onExpandToggle: () => void;
  allOrgMembers: OrgMember[];
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadPending, setUploadPending] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(cohort.name);

  const { data: membersData, isFetching: membersFetching } = useQuery({
    ...trpc.org.listCohortMembers.queryOptions({ cohortId: cohort.id }),
    enabled: expanded && canManage,
  });
  const { data: coursesData } = useQuery({
    ...trpc.course.listCohortCourses.queryOptions({ cohortId: cohort.id }),
    enabled: expanded,
  });

  const invalidateCohortData = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.org.listCohortMembers.queryKey({ cohortId: cohort.id }),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.org.listMembers.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.org.listCohorts.queryKey(),
    });
  };

  const updateMutation = useMutation(
    trpc.org.updateCohort.mutationOptions({
      onSuccess: () => {
        toastManager.add({ title: "Cohort updated", type: "success" });
        queryClient.invalidateQueries({
          queryKey: trpc.org.listCohorts.queryKey(),
        });
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to update cohort",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const removeMemberMutation = useMutation(
    trpc.org.removeMemberFromCohort.mutationOptions({
      onSuccess: () => {
        toastManager.add({
          title: "Member removed from cohort",
          type: "success",
        });
        invalidateCohortData();
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to remove member",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const handleSaveName = () => {
    const name = editName.trim();
    if (name && name !== cohort.name) {
      updateMutation.mutate({ cohortId: cohort.id, name });
    }
    setIsEditingName(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      toastManager.add({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image",
        type: "error",
      });
      return;
    }
    if (file.size > MAX_SIZE) {
      toastManager.add({
        title: "File too large",
        description: "Maximum file size is 4MB",
        type: "error",
      });
      return;
    }
    setUploadPending(true);
    try {
      const signedParams = await getCohortImageUploadParams(cohort.id);
      if (!signedParams) {
        toastManager.add({
          title: "Upload failed",
          description: "Authentication required",
          type: "error",
        });
        return;
      }
      const result = await uploadFile({ file, signedParams });
      const persistResult = await persistCohortImageAsset(result, cohort.id);
      if (!persistResult.success) {
        toastManager.add({
          title: "Upload failed",
          description: persistResult.error,
          type: "error",
        });
        return;
      }
      updateMutation.mutate({ cohortId: cohort.id, image: result.secureUrl });
    } catch (err) {
      toastManager.add({
        title: "Upload failed",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
      });
    } finally {
      setUploadPending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const cohortMemberUserIds = new Set(
    membersData?.members.map((m) => m.userId) ?? []
  );
  const memberCount = cohort.memberCount ?? membersData?.members.length ?? 0;
  const courseCount = cohort.courseCount ?? coursesData?.courses.length ?? 0;

  return (
    <Card>
      <Collapsible onOpenChange={() => onExpandToggle()} open={expanded}>
        <CardContent className="p-0">
          <div className="flex items-center gap-3 p-4">
            {canManage ? (
              <div className="relative">
                <Avatar>
                  <AvatarImage
                    alt={cohort.name}
                    src={cohort.image ?? undefined}
                  />
                  <AvatarFallback className="text-xs">
                    {cohort.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  aria-label="Change cohort image"
                  className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background disabled:opacity-50"
                  disabled={uploadPending}
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  {uploadPending ? (
                    <Spinner className="size-2.5" />
                  ) : (
                    <CameraIcon className="size-2.5" />
                  )}
                </button>
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  tabIndex={-1}
                  type="file"
                />
              </div>
            ) : (
              <Avatar>
                <AvatarImage
                  alt={cohort.name}
                  src={cohort.image ?? undefined}
                />
                <AvatarFallback className="text-xs">
                  {cohort.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            <div className="flex flex-1 items-center gap-2">
              {isEditingName && canManage ? (
                <Input
                  autoFocus
                  className="h-8 flex-1 text-sm"
                  onBlur={handleSaveName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveName();
                    } else if (e.key === "Escape") {
                      setEditName(cohort.name);
                      setIsEditingName(false);
                    }
                  }}
                  value={editName}
                />
              ) : (
                <div className="flex flex-1 items-center gap-1.5">
                  <span className="font-medium text-sm">{cohort.name}</span>
                  {canManage && (
                    <button
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setIsEditingName(true)}
                      type="button"
                    >
                      <PencilIcon className="size-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <CollapsibleTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <span className="text-xs">
                {memberCount} {memberCount === 1 ? "member" : "members"}
                {` · ${courseCount} ${courseCount === 1 ? "course" : "courses"}`}
              </span>
              {expanded ? (
                <ChevronDownIcon className="size-4" />
              ) : (
                <ChevronRightIcon className="size-4" />
              )}
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="space-y-5 border-t px-4 pt-3 pb-4">
              {canManage && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium text-muted-foreground text-xs">
                      Members ({membersData?.members.length ?? 0})
                    </h3>
                    <Dialog
                      onOpenChange={setAddMemberOpen}
                      open={addMemberOpen}
                    >
                      <DialogTrigger
                        render={
                          <Button
                            className="h-6 gap-1 px-2 text-xs"
                            size="sm"
                            variant="ghost"
                          >
                            <UserPlusIcon className="size-3" />
                            Add member
                          </Button>
                        }
                      />
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add member to cohort</DialogTitle>
                          <DialogDescription>
                            Select a member to add to &ldquo;{cohort.name}
                            &rdquo;.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogPanel>
                          <AddMemberContent
                            allOrgMembers={allOrgMembers}
                            cohortId={cohort.id}
                            cohortMemberUserIds={cohortMemberUserIds}
                            onClose={() => setAddMemberOpen(false)}
                          />
                        </DialogPanel>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <CohortMembersList
                    isLoading={membersFetching && !membersData}
                    members={membersData?.members}
                    onRemove={(memberId) =>
                      removeMemberMutation.mutate({
                        memberId,
                        cohortId: cohort.id,
                      })
                    }
                    removeIsPending={removeMemberMutation.isPending}
                  />
                </div>
              )}

              {coursesData && canManage && (
                <div>
                  <h3 className="mb-1 font-medium text-muted-foreground text-xs">
                    Assigned courses
                  </h3>
                  <CohortsCourseAssigner
                    cohortId={cohort.id}
                    currentCourses={coursesData.courses}
                  />
                </div>
              )}

              {coursesData && !canManage && coursesData.courses.length > 0 && (
                <div>
                  <h3 className="font-medium text-muted-foreground text-xs">
                    Courses
                  </h3>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {coursesData.courses.map((c) => (
                      <span
                        className="rounded bg-muted px-2 py-0.5 text-xs"
                        key={c.courseId}
                      >
                        {c.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
