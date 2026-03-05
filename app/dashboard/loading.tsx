import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level loading skeleton shown during navigation between dashboard pages.
 * Mirrors the general shape of the dashboard overview page.
 */
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {["stat-1", "stat-2", "stat-3", "stat-4"].map((id) => (
          <Skeleton className="h-28 w-full rounded-lg" key={id} />
        ))}
      </div>

      {/* Chart + Activity row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-lg lg:col-span-2" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    </div>
  );
}
