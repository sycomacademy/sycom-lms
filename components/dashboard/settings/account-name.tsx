"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { useUserMutation, useUserQuery } from "@/packages/hooks/use-user";
import { nameSchema } from "@/packages/types/auth";

const NAME_WORDS = /\s+/;

const accountNameSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
});

type AccountNameInput = z.infer<typeof accountNameSchema>;

export function AccountName() {
  const { user } = useUserQuery();
  const mutation = useUserMutation();
  const parts = user?.name?.trim().split(NAME_WORDS) ?? [];
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ") ?? "";

  const form = useForm<AccountNameInput>({
    resolver: zodResolver(accountNameSchema),
    defaultValues: { firstName, lastName },
  });

  const onSubmit = (data: AccountNameInput) => {
    const name = [data.firstName, data.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (!name) {
      return;
    }
    const currentName = user?.name?.trim() ?? "";
    if (name === currentName) {
      return;
    }
    mutation.mutate(
      { name },
      {
        onSuccess: () => {
          toastManager.add({
            title: "Name updated",
            type: "success",
          });
        },
      }
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-medium text-foreground text-sm">Full name</h3>
          <p className="text-muted-foreground text-xs">
            Your display name across the platform.
          </p>
        </div>
        <Form {...form}>
          <form
            className="mt-3 flex flex-col gap-3"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel className="text-xs">First name</FieldLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                    </Field>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel className="text-xs">Last name</FieldLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                    </Field>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button
                disabled={mutation.isPending || !form.formState.isDirty}
                size="sm"
                type="submit"
              >
                {mutation.isPending ? (
                  <Spinner className="mr-2 size-3" />
                ) : null}
                Save
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
