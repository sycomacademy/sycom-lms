import {
  BookOpenIcon,
  GraduationCapIcon,
  TrendingUpIcon,
  UserCheckIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Courses",
    value: "12",
    description: "Active courses",
    icon: BookOpenIcon,
  },
  {
    title: "Learners",
    value: "1,284",
    description: "Total enrolled",
    icon: GraduationCapIcon,
  },
  {
    title: "Enrollments",
    value: "3,891",
    description: "This semester",
    icon: TrendingUpIcon,
  },
  {
    title: "Completion",
    value: "78%",
    description: "Average rate",
    icon: UserCheckIcon,
  },
] as const;

export function DashboardStatCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ title, value, description, icon: Icon }) => (
        <Card key={title} size="sm">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">
              {title}
            </CardTitle>
            <span className="rounded-md bg-muted p-2">
              <Icon className="size-4 text-muted-foreground" />
            </span>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-2xl tracking-tight">{value}</p>
            <p className="text-muted-foreground text-xs">{description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
