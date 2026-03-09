import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/packages/utils/cn";

export function OverviewStatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardDescription>{title}</CardDescription>
          <div className="flex size-8 items-center justify-center border bg-muted/50">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl tracking-tight">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}

export function OverviewSectionSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-80 w-full rounded-none", className)} />;
}

export function OverviewStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <OverviewSectionSkeleton className="h-36" key={`stat-${index}`} />
      ))}
    </div>
  );
}

export function OverviewListEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full min-h-56 flex-col items-center justify-center gap-2 border border-dashed p-6 text-center">
      <div className="flex size-10 items-center justify-center border bg-muted/50">
        <ArrowUpRight className="size-4 text-muted-foreground" />
      </div>
      <p className="font-medium text-sm">{title}</p>
      <p className="max-w-sm text-muted-foreground text-xs">{description}</p>
    </div>
  );
}
