"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/packages/trpc/client";
import type { User } from "./columns";

interface BanUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BAN_DURATIONS = [
  { label: "1 hour", value: 3600 },
  { label: "24 hours", value: 86_400 },
  { label: "7 days", value: 604_800 },
  { label: "30 days", value: 2_592_000 },
  { label: "Permanent", value: 0 },
] as const;

export function BanUserDialog({
  user,
  open,
  onOpenChange,
}: BanUserDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState<number>(0);

  const banMutation = useMutation(
    trpc.admin.banUser.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [["admin", "listUsers"]] });
        onOpenChange(false);
        setBanReason("");
        setBanDuration(0);
      },
    })
  );

  const handleBan = () => {
    banMutation.mutate({
      userId: user.id,
      banReason: banReason || undefined,
      banExpiresIn: banDuration > 0 ? banDuration : undefined,
    });
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ban User</AlertDialogTitle>
          <AlertDialogDescription>
            Ban <span className="font-medium text-foreground">{user.name}</span>{" "}
            from accessing the platform. They will be signed out and unable to
            sign in until unbanned.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <Field>
            <FieldLabel>Reason (optional)</FieldLabel>
            <Input
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter reason for ban..."
              value={banReason}
            />
          </Field>

          <Field>
            <FieldLabel>Duration</FieldLabel>
            <Select
              items={BAN_DURATIONS}
              onValueChange={(value) => setBanDuration(value as number)}
              value={banDuration}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {BAN_DURATIONS.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel size="sm" variant="outline">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={banMutation.isPending}
            onClick={handleBan}
            size="sm"
            variant="destructive"
          >
            {banMutation.isPending ? "Banning..." : "Ban User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
