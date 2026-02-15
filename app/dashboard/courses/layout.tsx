import { instructorGuard } from "@/packages/auth/helper";
import { HydrateClient, prefetch, trpc } from "@/packages/trpc/server";

export default async function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await instructorGuard();

  await prefetch(
    trpc.course.list.queryOptions({
      limit: 10,
      offset: 0,
      sortBy: "updatedAt",
      sortDirection: "desc",
    })
  );

  return (
    <HydrateClient>
      <div className="md:ml-12">{children}</div>
    </HydrateClient>
  );
}
