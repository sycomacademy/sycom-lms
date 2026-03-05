import { ReportsTable } from "@/components/dashboard/admin/reports/reports-table";
import { adminGuard } from "@/packages/auth/helper";

export default async function ReportsPage() {
  await adminGuard();
  return <ReportsTable />;
}
