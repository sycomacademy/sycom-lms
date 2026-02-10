import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-xl tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back. Your learning overview will appear here.
        </p>
      </div>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>
            Mock placeholder. Courses and progress will be listed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-xs">
            No courses yet. Content will be added when the app is wired to data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
