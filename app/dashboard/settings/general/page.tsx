import { MailIcon, UserIcon } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/packages/auth/auth";

export default async function SettingsGeneralPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const user = session.user;
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <div className="space-y-6">
      {/* Avatar section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile picture</CardTitle>
          <p className="text-muted-foreground text-sm">
            Your avatar is visible to other learners on the platform.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage
                alt={user.name ?? ""}
                src={user.image ?? undefined}
              />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{user.name ?? "Unnamed"}</p>
              <p className="text-muted-foreground text-sm">Learner</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Name section */}
      <Card>
        <CardHeader>
          <CardTitle>Full name</CardTitle>
          <p className="text-muted-foreground text-sm">
            Your name as it appears on the platform.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <UserIcon className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Full Name</p>
              <p className="font-medium text-sm">{user.name ?? "Not set"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Email section */}
      <Card>
        <CardHeader>
          <CardTitle>Email address</CardTitle>
          <p className="text-muted-foreground text-sm">
            The email address associated with your account.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <MailIcon className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Email</p>
              <p className="font-medium text-sm">{user.email ?? "Not set"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
