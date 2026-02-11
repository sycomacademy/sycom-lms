import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            User management, roles, invitations, impersonation, and other admin
            tools will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
