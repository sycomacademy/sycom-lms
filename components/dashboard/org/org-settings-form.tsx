"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";

const slugRegex = /^[a-z0-9-]+$/;

const orgSettingsSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(60)
    .regex(slugRegex, "Lowercase letters, numbers, and hyphens only"),
});

type OrgSettingsInput = z.infer<typeof orgSettingsSchema>;

export function OrgSettingsForm() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: org } = useSuspenseQuery(
    trpc.org.getOrganization.queryOptions()
  );
  const updateMutation = useMutation(
    trpc.org.updateOrganization.mutationOptions({
      onSuccess: () => {
        toastManager.add({ title: "Organization updated", type: "success" });
        queryClient.invalidateQueries({
          queryKey: trpc.org.getOrganization.queryKey(),
        });
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to update organization",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const form = useForm<OrgSettingsInput>({
    resolver: zodResolver(orgSettingsSchema),
    defaultValues: {
      name: org.name,
      slug: org.slug,
    },
    values: {
      name: org.name,
      slug: org.slug,
    },
  });

  const onSubmit = (data: OrgSettingsInput) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-medium text-foreground text-sm">
          General settings
        </h2>
        <p className="text-muted-foreground text-xs">
          Only the organization owner can change these settings.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel className="text-xs">
                        Organization name
                      </FieldLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel className="text-xs">Slug</FieldLabel>
                      <FormControl>
                        <Input
                          placeholder="acme-corp"
                          {...field}
                          onChange={(e) => {
                            field.onChange(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, "-")
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  disabled={updateMutation.isPending || !form.formState.isDirty}
                  size="sm"
                  type="submit"
                >
                  <span className="relative inline-flex items-center justify-center">
                    <span
                      className={
                        updateMutation.isPending ? "invisible" : undefined
                      }
                    >
                      Save changes
                    </span>
                    {updateMutation.isPending && (
                      <Spinner className="absolute size-3" />
                    )}
                  </span>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
