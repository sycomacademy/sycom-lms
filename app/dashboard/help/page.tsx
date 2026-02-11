import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardHelpPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Help</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Documentation and support resources will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
