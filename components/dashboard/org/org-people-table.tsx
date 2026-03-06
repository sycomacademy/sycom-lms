"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon, SearchIcon, UserPlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { InviteMemberDialog } from "@/components/dashboard/org/invite-member-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";
import { getInitials } from "@/packages/utils/string";

const ORG_ROLE_LABELS: Record<string, string> = {
  org_owner: "Owner",
  org_admin: "Admin",
  org_auditor: "Auditor",
  org_teacher: "Teacher",
  org_student: "Student",
};

const ASSIGNABLE_ROLES: Array<
  "org_admin" | "org_auditor" | "org_teacher" | "org_student"
> = ["org_admin", "org_auditor", "org_teacher", "org_student"];

interface MemberRow {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
  cohorts: { id: string; name: string }[];
}

function MemberCohortsCell({
  cohorts,
}: {
  cohorts: { id: string; name: string }[];
}) {
  if (cohorts.length === 0) {
    return <span className="text-muted-foreground text-xs">No cohorts</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {cohorts.map((cohort) => (
        <Badge key={cohort.id} variant="secondary">
          {cohort.name}
        </Badge>
      ))}
    </div>
  );
}

interface MemberActionsProps {
  member: MemberRow;
  allCohorts: { id: string; name: string }[];
  onRoleChange: (
    memberId: string,
    role: "org_admin" | "org_auditor" | "org_teacher" | "org_student"
  ) => void;
  onAssignToCohort: (memberId: string, cohortId: string) => void;
  onMoveToCohort: (memberId: string, cohortId: string) => void;
  onRemoveFromCohort: (memberId: string, cohortId: string) => void;
}

function MemberActions({
  member,
  allCohorts,
  onRoleChange,
  onAssignToCohort,
  onMoveToCohort,
  onRemoveFromCohort,
}: MemberActionsProps) {
  if (member.role === "org_owner") {
    return null;
  }

  const memberCohortIds = new Set(member.cohorts.map((cohort) => cohort.id));
  const availableAssignCohorts = allCohorts.filter(
    (cohort) => !memberCohortIds.has(cohort.id)
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="sm" variant="ghost">
            <MoreHorizontalIcon className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Change role</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {ASSIGNABLE_ROLES.filter((role) => role !== member.role).map(
              (role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => onRoleChange(member.id, role)}
                >
                  {ORG_ROLE_LABELS[role]}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Assign to cohort</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {availableAssignCohorts.length === 0 ? (
              <DropdownMenuItem disabled>No cohorts available</DropdownMenuItem>
            ) : (
              availableAssignCohorts.map((cohort) => (
                <DropdownMenuItem
                  key={cohort.id}
                  onClick={() => onAssignToCohort(member.id, cohort.id)}
                >
                  {cohort.name}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Move to cohort</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {allCohorts.length === 0 ? (
              <DropdownMenuItem disabled>No cohorts available</DropdownMenuItem>
            ) : (
              allCohorts.map((cohort) => (
                <DropdownMenuItem
                  key={cohort.id}
                  onClick={() => onMoveToCohort(member.id, cohort.id)}
                >
                  {cohort.name}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Remove from cohort</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {member.cohorts.length === 0 ? (
              <DropdownMenuItem disabled>No cohorts assigned</DropdownMenuItem>
            ) : (
              member.cohorts.map((cohort) => (
                <DropdownMenuItem
                  key={cohort.id}
                  onClick={() => onRemoveFromCohort(member.id, cohort.id)}
                >
                  {cohort.name}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function OrgPeopleTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: membersData } = useSuspenseQuery(
    trpc.org.listMembers.queryOptions()
  );
  const { data: cohortsData } = useSuspenseQuery(
    trpc.org.listCohorts.queryOptions()
  );

  const allCohorts = cohortsData.cohorts.map((cohort) => ({
    id: cohort.id,
    name: cohort.name,
  }));

  const invalidateOrgTables = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.org.listMembers.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.org.listCohorts.queryKey(),
    });
  };

  const updateRoleMutation = useMutation(
    trpc.org.updateMemberRole.mutationOptions({
      onSuccess: () => {
        toastManager.add({ title: "Role updated", type: "success" });
        invalidateOrgTables();
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to update role",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const assignToCohortMutation = useMutation(
    trpc.org.assignMemberToCohort.mutationOptions({
      onSuccess: () => {
        toastManager.add({ title: "Member assigned", type: "success" });
        invalidateOrgTables();
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to assign member",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const moveToCohortMutation = useMutation(
    trpc.org.moveMemberToCohort.mutationOptions({
      onSuccess: () => {
        toastManager.add({ title: "Member moved", type: "success" });
        invalidateOrgTables();
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to move member",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const removeFromCohortMutation = useMutation(
    trpc.org.removeMemberFromCohort.mutationOptions({
      onSuccess: () => {
        toastManager.add({ title: "Member removed", type: "success" });
        invalidateOrgTables();
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

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return membersData.members;
    }

    return membersData.members.filter((member) => {
      return (
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        (ORG_ROLE_LABELS[member.role] ?? member.role)
          .toLowerCase()
          .includes(query) ||
        member.cohorts.some((cohort) =>
          cohort.name.toLowerCase().includes(query)
        )
      );
    });
  }, [membersData.members, search]);

  const columns = useMemo<ColumnDef<MemberRow, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        size: 220,
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  alt={member.name}
                  src={member.image ?? undefined}
                />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate font-medium text-sm">
                  {member.name}
                </div>
                <div className="truncate text-muted-foreground text-xs">
                  {member.email}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 120,
        cell: ({ row }) => {
          const role = row.original.role;
          return (
            <Badge variant="outline">{ORG_ROLE_LABELS[role] ?? role}</Badge>
          );
        },
      },
      {
        id: "cohorts",
        header: "Cohorts",
        size: 260,
        cell: ({ row }) => <MemberCohortsCell cohorts={row.original.cohorts} />,
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        size: 140,
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <span className="text-muted-foreground text-xs tabular-nums">
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          );
        },
      },
      {
        id: "actions",
        size: 56,
        enableSorting: false,
        cell: ({ row }) => (
          <MemberActions
            allCohorts={allCohorts}
            member={row.original}
            onAssignToCohort={(memberId, cohortId) =>
              assignToCohortMutation.mutate({ memberId, cohortId })
            }
            onMoveToCohort={(memberId, cohortId) =>
              moveToCohortMutation.mutate({ memberId, cohortId })
            }
            onRemoveFromCohort={(memberId, cohortId) =>
              removeFromCohortMutation.mutate({ memberId, cohortId })
            }
            onRoleChange={(memberId, role) =>
              updateRoleMutation.mutate({ memberId, role })
            }
          />
        ),
      },
    ],
    [
      allCohorts,
      assignToCohortMutation,
      moveToCohortMutation,
      removeFromCohortMutation,
      updateRoleMutation,
    ]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search people..."
            value={search}
          />
        </div>

        <InviteMemberDialog onOpenChange={setInviteOpen} open={inviteOpen}>
          <Button size="sm">
            <UserPlusIcon className="size-4" />
            Invite
          </Button>
        </InviteMemberDialog>
      </div>

      <DataTable columns={columns} data={filteredMembers} />
    </div>
  );
}
