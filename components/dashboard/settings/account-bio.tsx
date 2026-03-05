"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toastManager } from "@/components/ui/toast";
import { useUserMutation, useUserQuery } from "@/packages/hooks/use-user";

const accountBioSchema = z.object({
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

type AccountBioInput = z.infer<typeof accountBioSchema>;

export function AccountBio() {
  const { profile } = useUserQuery();
  const mutation = useUserMutation();

  const form = useForm<AccountBioInput>({
    resolver: zodResolver(accountBioSchema),
    defaultValues: { bio: profile?.bio ?? "" },
  });

  const onSubmit = (data: AccountBioInput) => {
    const currentBio = profile?.bio ?? "";
    const newBio = data.bio ?? "";
    if (newBio === currentBio) {
      return;
    }
    mutation.mutate(
      { bio: data.bio ?? "" },
      {
        onSuccess: () => {
          toastManager.add({
            title: "Bio updated",
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
          <h3 className="font-medium text-foreground text-sm">Bio</h3>
          <p className="text-muted-foreground text-xs">
            A short description about yourself. Visible on your profile.
          </p>
        </div>
        <Form {...form}>
          <form
            className="mt-3 flex flex-col gap-3"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <Field>
                    <FieldLabel className="text-xs">Bio</FieldLabel>
                    <FormControl>
                      <Textarea
                        className="resize-none"
                        placeholder="Tell us a little about yourself..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                  </Field>
                </FormItem>
              )}
            />
            <p className="text-muted-foreground text-xs">
              Maximum 500 characters.
            </p>
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
