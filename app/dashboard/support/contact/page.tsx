import { ContactInfo } from "@/components/dashboard/support/contact-info";
import { dashboardGuard } from "@/packages/auth/helper";

export default async function SupportContactPage() {
  await dashboardGuard();
  return (
    <div className="flex flex-col gap-6">
      <ContactInfo />
    </div>
  );
}
