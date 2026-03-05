"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";

const createUserSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().optional(),
    role: z.enum(["admin", "instructor", "student"]),
    sendInvite: z.boolean(),
  })
  .refine(
    (data) => data.sendInvite || (data.password && data.password.length >= 8),
    {
      message: "Password must be at least 8 characters",
      path: ["password"],
    }
  );

type CreateUserInput = z.infer<typeof createUserSchema>;

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  instructor: "Instructor",
  student: "Student",
};

export function CreateUserDialog() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
      sendInvite: true,
    },
  });

  const sendInvite = form.watch("sendInvite") ?? true;

  const createMutation = useMutation(
    trpc.admin.createUser.mutationOptions({
      onSuccess: (_data, variables) => {
        toastManager.add({
          title: "User created",
          description: variables.sendInvite
            ? "An invite email has been sent to set their password."
            : "The user has been created. A verification email has been sent.",
          type: "success",
        });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.listUsers.queryKey(),
        });
        form.reset();
        setOpen(false);
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to create user",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const onSubmit = (data: CreateUserInput) => {
    createMutation.mutate({
      name: data.name,
      email: data.email,
      role: data.role,
      sendInvite: data.sendInvite,
      ...(!data.sendInvite && { password: data.password }),
    });
  };

  return (
    <Dialog
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          form.reset();
        }
      }}
      open={open}
    >
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon />
        Add user
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>Add a new user to the platform.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogPanel scrollFade={false}>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel className="text-xs">Name</FieldLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel className="text-xs">Email</FieldLabel>
                        <FormControl>
                          <Input
                            placeholder="user@example.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
                  <Label className="text-xs" htmlFor="send-invite">
                    Send invite link
                    <span className="block font-normal text-muted-foreground">
                      User sets their own password via email
                    </span>
                  </Label>
                  <Switch
                    checked={sendInvite}
                    id="send-invite"
                    onCheckedChange={(checked) => {
                      form.setValue("sendInvite", checked);
                      if (checked) {
                        form.setValue("password", "");
                        form.clearErrors("password");
                      }
                    }}
                    size="sm"
                  />
                </div>
                {!sendInvite && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <Field>
                          <FieldLabel className="text-xs">Password</FieldLabel>
                          <FormControl>
                            <Input
                              placeholder="Min. 8 characters"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </Field>
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel className="text-xs">Role</FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue>
                                {ROLE_LABELS[field.value]}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="instructor">
                              Instructor
                            </SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />
              </div>
            </DialogPanel>
            <DialogFooter>
              <Button
                disabled={createMutation.isPending}
                size="sm"
                type="submit"
              >
                {createMutation.isPending ? <Spinner /> : null}
                {sendInvite ? "Create & send invite" : "Create user"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
