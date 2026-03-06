"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { MoreHorizontalIcon, UserPlusIcon } from "lucide-react";
import { useState } from "react";
import { InviteMemberDialog } from "@/components/dashboard/org/invite-member-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function OrgPeopleTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data } = useSuspenseQuery(trpc.org.listMembers.queryOptions());

  const updateRoleMutation = useMutation(
    trpc.org.updateMemberRole.mutationOptions({
      onSuccess: () => {
        toastManager.add({ title: "Role updated", type: "success" });
        queryClient.invalidateQueries({
          queryKey: trpc.org.listMembers.queryKey(),
        });
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medium text-foreground text-sm">Members</h2>
          <p className="text-muted-foreground text-xs">
            Manage who has access to your organization.
          </p>
        </div>
        <InviteMemberDialog onOpenChange={setInviteOpen} open={inviteOpen}>
          <Button size="sm">
            <UserPlusIcon className="size-4" />
            Invite
          </Button>
        </InviteMemberDialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {data.members.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No members yet. Invite people to get started.
            </div>
          ) : (
            <div className="divide-y">
              {data.members.map((member) => (
                <div
                  className="flex items-center justify-between px-4 py-3"
                  key={member.id}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        alt={member.name}
                        src={member.image ?? undefined}
                      />
                      <AvatarFallback>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {ORG_ROLE_LABELS[member.role] ?? member.role}
                    </Badge>
                    {member.role !== "org_owner" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button size="sm" variant="ghost">
                              <MoreHorizontalIcon className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          {[
                            "org_admin",
                            "org_auditor",
                            "org_teacher",
                            "org_student",
                          ]
                            .filter((role) => role !== member.role)
                            .map((role) => (
                              <DropdownMenuItem
                                key={role}
                                onClick={() =>
                                  updateRoleMutation.mutate({
                                    memberId: member.id,
                                    role: role as
                                      | "org_admin"
                                      | "org_auditor"
                                      | "org_teacher"
                                      | "org_student",
                                  })
                                }
                              >
                                Change to {ORG_ROLE_LABELS[role]}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
