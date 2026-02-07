"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HeartIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "@/packages/auth/auth-client";
import { trpc } from "@/packages/trpc/client";

interface CourseActionsProps {
  courseId: string;
  courseSlug: string;
}

export function CourseActions({ courseId, courseSlug }: CourseActionsProps) {
  const { data: session } = useSession();

  const signInUrl = `/sign-in?callbackUrl=/courses/${courseSlug}`;

  // If not signed in, show links to sign-in
  if (!session) {
    return (
      <div className="space-y-4">
        <Button
          className="w-full"
          nativeButton={false}
          render={<Link href={signInUrl} />}
          size="lg"
        >
          Enroll Now
        </Button>
        <Button
          className="w-full"
          nativeButton={false}
          render={<Link href={signInUrl} />}
          size="lg"
          variant="outline"
        >
          <HeartIcon className="size-4" />
          Add to Wishlist
        </Button>
      </div>
    );
  }

  return <AuthenticatedActions courseId={courseId} />;
}

function AuthenticatedActions({ courseId }: { courseId: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: enrollmentData, isLoading: enrollLoading } = useQuery({
    ...trpc.enrollment.isEnrolled.queryOptions({ courseId }),
  });

  const { data: wishlistData, isLoading: wishlistLoading } = useQuery({
    ...trpc.enrollment.isWishlisted.queryOptions({ courseId }),
  });

  const enrollMutation = useMutation({
    ...trpc.enrollment.enroll.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.enrollment.isEnrolled.queryOptions({ courseId })
          .queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: trpc.enrollment.list.queryOptions().queryKey,
      });
      router.refresh();
    },
  });

  const unenrollMutation = useMutation({
    ...trpc.enrollment.unenroll.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.enrollment.isEnrolled.queryOptions({ courseId })
          .queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: trpc.enrollment.list.queryOptions().queryKey,
      });
      router.refresh();
    },
  });

  const addWishlistMutation = useMutation({
    ...trpc.enrollment.addToWishlist.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.enrollment.isWishlisted.queryOptions({ courseId })
          .queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: trpc.enrollment.wishlist.queryOptions().queryKey,
      });
    },
  });

  const removeWishlistMutation = useMutation({
    ...trpc.enrollment.removeFromWishlist.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.enrollment.isWishlisted.queryOptions({ courseId })
          .queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: trpc.enrollment.wishlist.queryOptions().queryKey,
      });
    },
  });

  const isEnrolled = enrollmentData?.enrolled ?? false;
  const isWishlisted = wishlistData?.wishlisted ?? false;
  const isMutating =
    enrollMutation.isPending ||
    unenrollMutation.isPending ||
    addWishlistMutation.isPending ||
    removeWishlistMutation.isPending;

  return (
    <div className="space-y-4">
      {isEnrolled ? (
        <Button
          className="w-full"
          disabled={isMutating}
          onClick={() => unenrollMutation.mutate({ courseId })}
          size="lg"
          variant="outline"
        >
          {unenrollMutation.isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : null}
          Unenroll
        </Button>
      ) : (
        <Button
          className="w-full"
          disabled={isMutating || enrollLoading}
          onClick={() => enrollMutation.mutate({ courseId })}
          size="lg"
        >
          {enrollMutation.isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : null}
          Enroll Now
        </Button>
      )}

      {isWishlisted ? (
        <Button
          className="w-full"
          disabled={isMutating || wishlistLoading}
          onClick={() => removeWishlistMutation.mutate({ courseId })}
          size="lg"
          variant="outline"
        >
          {removeWishlistMutation.isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : null}
          <HeartIcon className="size-4 fill-current" />
          Remove from Wishlist
        </Button>
      ) : (
        <Button
          className="w-full"
          disabled={isMutating || wishlistLoading}
          onClick={() => addWishlistMutation.mutate({ courseId })}
          size="lg"
          variant="outline"
        >
          {addWishlistMutation.isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : null}
          <HeartIcon className="size-4" />
          Add to Wishlist
        </Button>
      )}
    </div>
  );
}
