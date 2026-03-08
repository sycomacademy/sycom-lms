"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2Icon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Link } from "@/components/layout/foresight-link";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";
import { ROLE_LABELS, resetPasswordSchema } from "@/packages/utils/schema";

type InvitePasswordInput = z.infer<typeof resetPasswordSchema>;

function InviteState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="w-full space-y-4 text-center">
      <div className="space-y-2">
        <h1 className="font-medium text-lg tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Button
        className="w-full"
        nativeButton={false}
        render={<Link href="/sign-in" />}
      >
        Go to sign in
      </Button>
    </div>
  );
}

export function PublicInviteForm({ token }: { token: string }) {
  const trpc = useTRPC();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const inviteQuery = useQuery(trpc.invite.getByToken.queryOptions({ token }));
  const form = useForm<InvitePasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { confirmPassword: "", password: "" },
  });

  const acceptMutation = useMutation(
    trpc.invite.accept.mutationOptions({
      onSuccess: () => {
        toastManager.add({
          title: "Account ready",
          description: "Your invite has been accepted. Sign in to continue.",
          type: "success",
        });
        router.push("/sign-in");
      },
      onError: (error) => {
        toastManager.add({
          title: "Could not accept invite",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const rejectMutation = useMutation(
    trpc.invite.reject.mutationOptions({
      onSuccess: () => {
        inviteQuery.refetch();
      },
      onError: (error) => {
        toastManager.add({
          title: "Could not decline invite",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const onSubmit = (data: InvitePasswordInput) => {
    acceptMutation.mutate({ password: data.password, token });
  };

  if (inviteQuery.isPending) {
    return (
      <div className="flex w-full justify-center py-12">
        <Spinner className="size-5" />
      </div>
    );
  }

  if (inviteQuery.error || !inviteQuery.data) {
    return (
      <InviteState
        description="This invite is invalid or no longer exists."
        title="Invite not found"
      />
    );
  }

  if (inviteQuery.data.status === "accepted") {
    return (
      <InviteState
        description="This invite has already been used."
        title="Invite already accepted"
      />
    );
  }

  if (inviteQuery.data.status === "expired") {
    return (
      <InviteState
        description="This invite expired. Ask an admin to send a new one."
        title="Invite expired"
      />
    );
  }

  if (inviteQuery.data.status === "revoked") {
    return (
      <InviteState
        description="This invite has been revoked by an administrator."
        title="Invite revoked"
      />
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/30">
          <CheckCircle2Icon className="size-5 text-success-foreground" />
        </div>
        <h1 className="font-medium text-lg tracking-tight">
          Set your password
        </h1>
        <p className="text-muted-foreground text-sm">
          {inviteQuery.data.name} has been invited as a{" "}
          {ROLE_LABELS[inviteQuery.data.role]}. This link expires on{" "}
          {new Date(inviteQuery.data.expiresAt).toLocaleString()}.
        </p>
      </div>

      <Form {...form}>
        <form
          className="flex flex-col gap-3"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field>
                  <FieldLabel className="text-muted-foreground text-xs">
                    New password
                  </FieldLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        autoComplete="new-password"
                        autoFocus
                        placeholder="Min. 8 characters"
                        required
                        type={showPassword ? "text" : "password"}
                        {...field}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowPassword((value) => !value)}
                          size="icon-xs"
                          variant="ghost"
                        >
                          {showPassword ? (
                            <EyeOffIcon className="size-3.5" />
                          ) : (
                            <EyeIcon className="size-3.5" />
                          )}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FieldError reserveSpace>
                    {fieldState.error?.message ?? (
                      <span className="text-muted-foreground/70">
                        Must include uppercase, lowercase, and a number.
                      </span>
                    )}
                  </FieldError>
                </Field>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field>
                  <FieldLabel className="text-muted-foreground text-xs">
                    Confirm password
                  </FieldLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        required
                        type={showConfirm ? "text" : "password"}
                        {...field}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            showConfirm ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowConfirm((value) => !value)}
                          size="icon-xs"
                          variant="ghost"
                        >
                          {showConfirm ? (
                            <EyeOffIcon className="size-3.5" />
                          ) : (
                            <EyeIcon className="size-3.5" />
                          )}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FieldError reserveSpace>
                    {fieldState.error?.message}
                  </FieldError>
                </Field>
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              disabled={rejectMutation.isPending}
              onClick={() => rejectMutation.mutate({ token })}
              type="button"
              variant="outline"
            >
              {rejectMutation.isPending ? <Spinner /> : null}
              Decline invite
            </Button>
            <Button
              className="flex-1"
              disabled={acceptMutation.isPending}
              type="submit"
            >
              {acceptMutation.isPending ? <Spinner /> : null}
              Accept invite
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
