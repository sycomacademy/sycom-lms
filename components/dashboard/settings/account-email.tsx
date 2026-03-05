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
import { emailSchema } from "@/packages/utils/schema";

const accountEmailSchema = z.object({
  email: emailSchema,
});

type AccountEmailInput = z.infer<typeof accountEmailSchema>;

export function AccountEmail() {
  const { user } = useUserQuery();
  const mutation = useUserMutation();

  const form = useForm<AccountEmailInput>({
    resolver: zodResolver(accountEmailSchema),
    defaultValues: { email: user?.email ?? "" },
  });

  const onSubmit = (data: AccountEmailInput) => {
    const currentEmail = (user?.email ?? "").trim();
    if ((data.email ?? "").trim() === currentEmail) {
      return;
    }
    mutation.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          toastManager.add({
            title: "Email updated",
            description:
              "If you changed your email, check your inbox to verify.",
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
          <h3 className="font-medium text-foreground text-sm">Email address</h3>
          <p className="text-muted-foreground text-xs">
            Used for sign-in, notifications, and account recovery. Contact
            support if you need to change your email address.
          </p>
        </div>
        <Form {...form}>
          <form
            className="mt-3 flex flex-col gap-3"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Field>
                    <FieldLabel className="text-xs">Email</FieldLabel>
                    <FormControl>
                      <Input
                        disabled
                        placeholder="you@example.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                  </Field>
                </FormItem>
              )}
            />
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
