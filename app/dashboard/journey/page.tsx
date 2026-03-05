import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardJourneyPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>My journey</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Your progress and learning pathways will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
