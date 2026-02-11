import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardCoursesPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Course management will appear here. Create, edit, and publish
            courses.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
