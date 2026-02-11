import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardAccountPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Profile and preferences will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
