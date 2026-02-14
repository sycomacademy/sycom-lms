"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/packages/trpc/client";
import { passwordSchema } from "@/packages/types/auth";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  role: z.enum(["admin", "instructor", "student"]),
});

export function CreateUserDialog({
  open,
  onOpenChange,
}: CreateUserDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "instructor" | "student">(
    "student"
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation(
    trpc.admin.createUser.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [["admin", "listUsers"]] });
        onOpenChange(false);
        // Reset form
        setName("");
        setEmail("");
        setPassword("");
        setRole("student");
        setErrors({});
      },
      onError: (error) => {
        setErrors({ form: error.message });
      },
    })
  );

  const validate = () => {
    const result = createUserSchema.safeParse({ name, email, password, role });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of result.error.issues) {
        const key = err.path[0];
        if (typeof key === "string") {
          fieldErrors[key] = err.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleCreate = () => {
    if (validate()) {
      createMutation.mutate({
        name,
        email,
        password,
        role,
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setName("");
      setEmail("");
      setPassword("");
      setRole("student");
      setErrors({});
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New User</AlertDialogTitle>
          <AlertDialogDescription>
            Create a new user account. The user will receive an email to verify
            their account.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {errors.form && (
            <div className="rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive text-sm">
              {errors.form}
            </div>
          )}

          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter user name..."
              value={name}
            />
            {errors.name && <FieldError>{errors.name}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              type="email"
              value={email}
            />
            {errors.email && <FieldError>{errors.email}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, uppercase, lowercase, number"
              type="password"
              value={password}
            />
            {errors.password && <FieldError>{errors.password}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Role</FieldLabel>
            <Select
              onValueChange={(value) =>
                setRole(value as "admin" | "instructor" | "student")
              }
              value={role}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel size="sm" variant="outline">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={createMutation.isPending}
            onClick={handleCreate}
            size="sm"
          >
            {createMutation.isPending ? "Creating..." : "Create User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
