// import { FaqList } from "@/components/dashboard/support/faq-list";
import { dashboardGuard } from "@/packages/auth/helper";

export default async function SupportFaqPage() {
  await dashboardGuard();
  return <div className="flex flex-col gap-6">{/* <FaqList /> */}</div>;
}
