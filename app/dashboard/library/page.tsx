import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardLibraryPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Library</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Browse learning content and pathways here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
