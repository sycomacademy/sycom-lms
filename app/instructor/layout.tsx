import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { InstructorHeader } from "@/components/instructor/instructor-header";
import { InstructorSidebar } from "@/components/instructor/instructor-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/packages/auth/auth";
import { getInstructorByUserId } from "@/packages/db/queries/instructor";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in?redirect=/instructor");
  }

  const instructor = await getInstructorByUserId(session.user.id);
  if (!instructor) {
    redirect("/dashboard");
  }

  return (
    <SidebarProvider>
      <InstructorSidebar />
      <SidebarInset>
        <InstructorHeader />
        <div className="flex-1 px-4 py-8 sm:px-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
