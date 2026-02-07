import { HeartIcon } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/packages/auth/auth";
import { getWishlistByUserId } from "@/packages/db/queries/enrollment";

export default async function DashboardWishlistPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const wishlistItems = await getWishlistByUserId(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-semibold text-2xl tracking-tight">
          Wishlist
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Courses you&apos;ve saved for later
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <HeartIcon className="size-10 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">Wishlist is empty</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Save courses you&apos;re interested in for later
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map(({ wishlist: wl, course: c }) => (
            <Card className="group overflow-hidden" key={wl.id}>
              <div className="relative aspect-video bg-secondary">
                {c.thumbnailUrl ? (
                  <Image
                    alt={c.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={c.thumbnailUrl}
                  />
                ) : null}
              </div>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">{c.category}</Badge>
                  <Badge variant="secondary">{c.level}</Badge>
                </div>
                <h3 className="mb-1 font-semibold text-sm transition-colors group-hover:text-primary">
                  <Link href={`/courses/${c.slug}`}>{c.title}</Link>
                </h3>
                <p className="line-clamp-2 text-muted-foreground text-xs">
                  {c.shortDescription}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold text-sm">
                    £{(c.price / 100).toFixed(2)}
                  </span>
                  <Button
                    nativeButton={false}
                    render={<Link href={`/courses/${c.slug}`} />}
                    size="sm"
                    variant="outline"
                  >
                    View Course
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
