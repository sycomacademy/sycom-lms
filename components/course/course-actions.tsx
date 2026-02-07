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

  return <AuthenticatedActions courseId={courseId} courseSlug={courseSlug} />;
}

function EnrollmentProgressBar({ progress }: { progress: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function EnrollSection({
  isEnrolled,
  progress,
  hasStarted,
  courseSlug,
  isMutating,
  enrollLoading,
  onEnroll,
  onUnenroll,
  enrollPending,
  unenrollPending,
}: {
  isEnrolled: boolean;
  progress: number;
  hasStarted: boolean;
  courseSlug: string;
  isMutating: boolean;
  enrollLoading: boolean;
  onEnroll: () => void;
  onUnenroll: () => void;
  enrollPending: boolean;
  unenrollPending: boolean;
}) {
  if (isEnrolled) {
    return (
      <>
        {hasStarted && <EnrollmentProgressBar progress={progress} />}
        <Button
          className="w-full"
          nativeButton={false}
          render={<Link href={`/courses/${courseSlug}/learn`} />}
          size="lg"
        >
          {hasStarted ? "Continue" : "Start Learning"}
        </Button>
        <Button
          className="w-full"
          disabled={isMutating}
          onClick={onUnenroll}
          size="lg"
          variant="outline"
        >
          {unenrollPending ? <Loader2Icon className="animate-spin" /> : null}
          Unenroll
        </Button>
      </>
    );
  }
  return (
    <Button
      className="w-full"
      disabled={isMutating || enrollLoading}
      onClick={onEnroll}
      size="lg"
    >
      {enrollPending ? <Loader2Icon className="animate-spin" /> : null}
      Enroll Now
    </Button>
  );
}

function AuthenticatedActions({
  courseId,
  courseSlug,
}: {
  courseId: string;
  courseSlug: string;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: enrollmentData, isLoading: enrollLoading } = useQuery({
    ...trpc.enrollment.isEnrolled.queryOptions({ courseId }),
  });

  const { data: wishlistData, isLoading: wishlistLoading } = useQuery({
    ...trpc.enrollment.isWishlisted.queryOptions({ courseId }),
  });

  const invalidateEnrollment = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.enrollment.isEnrolled.queryOptions({ courseId }).queryKey,
    });
    queryClient.invalidateQueries({
      queryKey: trpc.enrollment.list.queryOptions().queryKey,
    });
    router.refresh();
  };

  const invalidateWishlist = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.enrollment.isWishlisted.queryOptions({ courseId })
        .queryKey,
    });
    queryClient.invalidateQueries({
      queryKey: trpc.enrollment.wishlist.queryOptions().queryKey,
    });
  };

  const enrollMutation = useMutation({
    ...trpc.enrollment.enroll.mutationOptions(),
    onSuccess: invalidateEnrollment,
  });

  const unenrollMutation = useMutation({
    ...trpc.enrollment.unenroll.mutationOptions(),
    onSuccess: invalidateEnrollment,
  });

  const addWishlistMutation = useMutation({
    ...trpc.enrollment.addToWishlist.mutationOptions(),
    onSuccess: invalidateWishlist,
  });

  const removeWishlistMutation = useMutation({
    ...trpc.enrollment.removeFromWishlist.mutationOptions(),
    onSuccess: invalidateWishlist,
  });

  const isEnrolled = enrollmentData?.enrolled ?? false;
  const enrollment = enrollmentData?.enrollment ?? null;
  const progress = enrollment?.progress ?? 0;
  const hasStarted = progress > 0;
  const isWishlisted = wishlistData?.wishlisted ?? false;
  const isMutating =
    enrollMutation.isPending ||
    unenrollMutation.isPending ||
    addWishlistMutation.isPending ||
    removeWishlistMutation.isPending;

  const enrollButton = (
    <EnrollSection
      courseSlug={courseSlug}
      enrollLoading={enrollLoading}
      enrollPending={enrollMutation.isPending}
      hasStarted={hasStarted}
      isEnrolled={isEnrolled}
      isMutating={isMutating}
      onEnroll={() => enrollMutation.mutate({ courseId })}
      onUnenroll={() => unenrollMutation.mutate({ courseId })}
      progress={progress}
      unenrollPending={unenrollMutation.isPending}
    />
  );

  const wishlistButton = isWishlisted ? (
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
  );

  return (
    <div className="space-y-4">
      {enrollButton}
      {wishlistButton}
    </div>
  );
}
