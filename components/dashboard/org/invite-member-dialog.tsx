"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toastManager } from "@/components/ui/toast";
import { authClient } from "@/packages/auth/auth-client";

const inviteSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["org_admin", "org_auditor", "org_teacher", "org_student"]),
});

type InviteInput = z.infer<typeof inviteSchema>;

const ROLE_OPTIONS: { value: InviteInput["role"]; label: string }[] = [
  { value: "org_admin", label: "Admin" },
  { value: "org_auditor", label: "Auditor" },
  { value: "org_teacher", label: "Teacher" },
  { value: "org_student", label: "Student" },
];

const BETTER_AUTH_ROLE_MAP: Record<InviteInput["role"], string> = {
  org_admin: "admin",
  org_auditor: "auditor",
  org_teacher: "teacher",
  org_student: "student",
};

interface InviteMemberDialogProps {
  children: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InviteMemberDialog({
  children,
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "org_student",
    },
  });

  const onSubmit = async (data: InviteInput) => {
    setIsPending(true);
    const { error } = await authClient.organization.inviteMember({
      email: data.email,
      role: BETTER_AUTH_ROLE_MAP[data.role] as
        | "admin"
        | "auditor"
        | "teacher"
        | "student",
    });
    setIsPending(false);
    if (error) {
      toastManager.add({
        title: "Failed to send invitation",
        description: error.message ?? "Unknown error",
        type: "error",
      });
      return;
    }
    toastManager.add({
      title: "Invitation sent",
      description: `An invitation was sent to ${data.email}`,
      type: "success",
    });
    queryClient.invalidateQueries();
    form.reset();
    onOpenChange?.(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger render={children} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogPanel scrollFade={false}>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel className="text-xs">Email</FieldLabel>
                        <FormControl>
                          <Input
                            placeholder="colleague@example.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel className="text-xs">Role</FieldLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />
              </div>
            </DialogPanel>
            <DialogFooter>
              <Button disabled={isPending} size="sm" type="submit">
                {isPending && <Loader2Icon className="size-4 animate-spin" />}
                Send invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
