import { Suspense } from "react";
import { OrgSettingsForm } from "@/components/dashboard/org/org-settings-form";
import { Spinner } from "@/components/ui/spinner";
import { orgOwnerGuard } from "@/packages/auth/helper";

export default async function OrgSettingsPage() {
  await orgOwnerGuard();
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner className="size-5" />
        </div>
      }
    >
      <OrgSettingsForm />
    </Suspense>
  );
}
