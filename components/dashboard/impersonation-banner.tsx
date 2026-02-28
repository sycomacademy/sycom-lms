"use client";

export function ImpersonationBanner() {
  // const { session, user } = useUserQuery();
  // const trpc = useTRPC();

  // const stopMutation = useMutation(
  //   trpc.admin.stopImpersonating.mutationOptions({
  //     onSuccess: () => {
  //       window.location.href = "/dashboard/admin";
  //     },
  //     onError: (error) => {
  //       toastManager.add({
  //         title: "Failed to stop impersonating",
  //         description: error.message,
  //         type: "error",
  //       });
  //     },
  //   })
  // );

  // if (!session.impersonatedBy) {
  //   return null;
  // }

  return (
    <div className="flex items-center justify-between gap-2 bg-warning/15 px-4 py-1.5 text-warning-foreground text-xs">
      <span>
        You are impersonating
        {/* <strong>{user.name}</strong> ({user.email}) */}
      </span>
      {/* <Button
        disabled={stopMutation.isPending}
        onClick={() => stopMutation.mutate()}
        size="xs"
        variant="outline"
      >
        {stopMutation.isPending ? (
          <Spinner />
        ) : (
          <EyeOffIcon className="size-3" />
        )}
        Stop impersonating
      </Button> */}
    </div>
  );
}
