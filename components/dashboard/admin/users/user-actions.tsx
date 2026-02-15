"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BanIcon,
  EyeIcon,
  MoreHorizontalIcon,
  ShieldIcon,
  Trash2Icon,
  UserCheckIcon,
} from "lucide-react";
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { useUserQuery } from "@/packages/hooks/use-user";
import { useTRPC } from "@/packages/trpc/client";

type UserRole = "admin" | "instructor" | "student";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  instructor: "Instructor",
  student: "Student",
};

interface UserActionsProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  isBanned: boolean;
}

export function UserActions({
  userId,
  userName,
  userEmail,
  userRole,
  isBanned,
}: UserActionsProps) {
  const { user: currentUser } = useUserQuery();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const isTargetAdmin = userRole === "admin";
  const isSelf = userId === currentUser.id;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [impersonateOpen, setImpersonateOpen] = useState(false);

  const [banReason, setBanReason] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(userRole);

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.admin.listUsers.queryKey(),
    });
  };

  const deleteMutation = useMutation(
    trpc.admin.deleteUser.mutationOptions({
      onSuccess: () => {
        toastManager.add({
          title: "User deleted",
          description: `${userName} has been removed.`,
          type: "success",
        });
        invalidate();
        setDeleteOpen(false);
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to delete user",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const banMutation = useMutation(
    trpc.admin.banUser.mutationOptions({
      onSuccess: () => {
        toastManager.add({
          title: "User banned",
          description: `${userName} has been banned.`,
          type: "success",
        });
        invalidate();
        setBanOpen(false);
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to ban user",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const unbanMutation = useMutation(
    trpc.admin.unbanUser.mutationOptions({
      onSuccess: () => {
        toastManager.add({
          title: "User unbanned",
          description: `${userName} has been unbanned.`,
          type: "success",
        });
        invalidate();
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to unban user",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const setRoleMutation = useMutation(
    trpc.admin.setRole.mutationOptions({
      onSuccess: () => {
        toastManager.add({
          title: "Role updated",
          description: `${userName} is now ${ROLE_LABELS[selectedRole]}.`,
          type: "success",
        });
        invalidate();
        setRoleOpen(false);
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

  const impersonateMutation = useMutation(
    trpc.admin.impersonateUser.mutationOptions({
      onSuccess: () => {
        toastManager.add({
          title: "Impersonating user",
          description: `You are now logged in as ${userName}.`,
          type: "success",
        });
        window.location.href = "/dashboard";
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to impersonate",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon-xs" variant="ghost" />}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {!(isTargetAdmin || isSelf) && (
            <DropdownMenuItem onClick={() => setRoleOpen(true)}>
              <ShieldIcon />
              Change role
            </DropdownMenuItem>
          )}
          {!(isTargetAdmin || isSelf) && (
            <DropdownMenuItem onClick={() => setImpersonateOpen(true)}>
              <EyeIcon />
              Impersonate
            </DropdownMenuItem>
          )}
          {!(isTargetAdmin || isSelf) && <DropdownMenuSeparator />}
          {!isTargetAdmin &&
            (isBanned ? (
              <DropdownMenuItem
                disabled={unbanMutation.isPending}
                onClick={() => unbanMutation.mutate({ userId })}
              >
                <UserCheckIcon />
                Unban user
              </DropdownMenuItem>
            ) : (
              !isSelf && (
                <DropdownMenuItem onClick={() => setBanOpen(true)}>
                  <BanIcon />
                  Ban user
                </DropdownMenuItem>
              )
            ))}
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            variant="destructive"
          >
            <Trash2Icon />
            Delete user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete confirmation */}
      <AlertDialog onOpenChange={setDeleteOpen} open={deleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{userName}</strong> (
              {userEmail}). All their data will be removed. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate({ userId })}
              variant="destructive"
            >
              {deleteMutation.isPending ? <Spinner /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban confirmation */}
      <AlertDialog onOpenChange={setBanOpen} open={banOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban user</AlertDialogTitle>
            <AlertDialogDescription>
              This will ban <strong>{userName}</strong> from the platform. They
              will not be able to sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-4">
            <Label className="text-xs" htmlFor="ban-reason">
              Reason (optional)
            </Label>
            <Input
              className="mt-1"
              id="ban-reason"
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason for banning..."
              value={banReason}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={banMutation.isPending}
              onClick={() =>
                banMutation.mutate({
                  userId,
                  banReason: banReason || undefined,
                })
              }
              variant="destructive"
            >
              {banMutation.isPending ? <Spinner /> : null}
              Ban
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change role dialog */}
      <AlertDialog onOpenChange={setRoleOpen} open={roleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change role</AlertDialogTitle>
            <AlertDialogDescription>
              Update the role for <strong>{userName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-4">
            <Label className="text-xs" htmlFor="role-select">
              Role
            </Label>
            <Select
              onValueChange={(value) => setSelectedRole(value as UserRole)}
              value={selectedRole}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue>{ROLE_LABELS[selectedRole]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={setRoleMutation.isPending || selectedRole === userRole}
              onClick={() =>
                setRoleMutation.mutate({ userId, role: selectedRole })
              }
            >
              {setRoleMutation.isPending ? <Spinner /> : null}
              Update role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Impersonate confirmation */}
      <AlertDialog onOpenChange={setImpersonateOpen} open={impersonateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Impersonate user</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed in as <strong>{userName}</strong> ({userEmail}
              ). You can stop impersonating from the user menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={impersonateMutation.isPending}
              onClick={() => impersonateMutation.mutate({ userId })}
            >
              {impersonateMutation.isPending ? <Spinner /> : null}
              Impersonate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
