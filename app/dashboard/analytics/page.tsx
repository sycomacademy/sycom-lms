import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Reports and insights will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
