"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MoreHorizontalIcon,
  ShieldIcon,
  TrashIcon,
  UserCheckIcon,
  UserIcon,
  UserXIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/packages/trpc/client";
import { BanUserDialog } from "./ban-user-dialog";
import type { User } from "./columns";

interface UserActionsProps {
  user: User;
}

export function UserActions({ user }: UserActionsProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);

  const setRoleMutation = useMutation(
    trpc.admin.setRole.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [["admin", "listUsers"]] });
      },
    })
  );

  const unbanMutation = useMutation(
    trpc.admin.unbanUser.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [["admin", "listUsers"]] });
        setShowUnbanDialog(false);
      },
    })
  );

  const deleteMutation = useMutation(
    trpc.admin.deleteUser.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [["admin", "listUsers"]] });
        setShowDeleteDialog(false);
      },
    })
  );

  const impersonateMutation = useMutation(
    trpc.admin.impersonateUser.mutationOptions({
      onSuccess: () => {
        router.push("/dashboard");
      },
    })
  );

  const handleSetRole = (role: "admin" | "instructor" | "student") => {
    setRoleMutation.mutate({ userId: user.id, role });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ShieldIcon className="mr-2 h-4 w-4" />
              Set Role
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                disabled={user.role === "admin"}
                onClick={() => handleSetRole("admin")}
              >
                Admin
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={user.role === "instructor"}
                onClick={() => handleSetRole("instructor")}
              >
                Instructor
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={user.role === "student"}
                onClick={() => handleSetRole("student")}
              >
                Student
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem
            disabled={impersonateMutation.isPending}
            onClick={() => impersonateMutation.mutate({ userId: user.id })}
          >
            <UserIcon className="mr-2 h-4 w-4" />
            Impersonate
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {user.banned ? (
            <DropdownMenuItem onClick={() => setShowUnbanDialog(true)}>
              <UserCheckIcon className="mr-2 h-4 w-4" />
              Unban User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setShowBanDialog(true)}>
              <UserXIcon className="mr-2 h-4 w-4" />
              Ban User
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete User Dialog */}
      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{user.name}</span>?
              This action cannot be undone. All user data will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm" variant="outline">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate({ userId: user.id })}
              size="sm"
              variant="destructive"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unban User Dialog */}
      <AlertDialog onOpenChange={setShowUnbanDialog} open={showUnbanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unban{" "}
              <span className="font-medium text-foreground">{user.name}</span>?
              They will be able to sign in again.
              {user.banReason && (
                <span className="mt-2 block text-xs">
                  Ban reason: {user.banReason}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm" variant="outline">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={unbanMutation.isPending}
              onClick={() => unbanMutation.mutate({ userId: user.id })}
              size="sm"
              variant="default"
            >
              {unbanMutation.isPending ? "Unbanning..." : "Unban User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban User Dialog */}
      <BanUserDialog
        onOpenChange={setShowBanDialog}
        open={showBanDialog}
        user={user}
      />
    </>
  );
}
