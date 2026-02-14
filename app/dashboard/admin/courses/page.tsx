import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CoursesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Courses</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Course management features will appear here. This includes creating,
          editing, and managing courses, lessons, and course content.
        </p>
      </CardContent>
    </Card>
  );
}
