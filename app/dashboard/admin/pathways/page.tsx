import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PathwaysPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pathways</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Learning pathway management will appear here. This includes creating
          and managing learning paths, curriculums, and skill tracks.
        </p>
      </CardContent>
    </Card>
  );
}
