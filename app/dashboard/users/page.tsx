import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Learner and instructor management will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
