import { dashboardGuard } from "@/packages/auth/helper";

export default async function SupportReportPage() {
  await dashboardGuard();
  return <div className="flex flex-col gap-6">{/* <ReportForm /> */}</div>;
}
