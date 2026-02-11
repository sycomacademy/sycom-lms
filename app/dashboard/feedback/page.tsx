import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardFeedbackPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Send us your feedback. A form or contact options will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
