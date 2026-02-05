import { cn } from "@/packages/utils/cn";

function BlockWrapper({
  title,
  children,
  className,
  containerClassName,
  ...props
}: React.ComponentProps<"div"> & {
  title?: string;
  containerClassName?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full min-w-0 max-w-lg flex-col gap-1 self-stretch lg:max-w-none",
        containerClassName
      )}
      data-slot="example"
      {...props}
    >
      {title && (
        <div className="px-1.5 py-2 font-medium text-muted-foreground text-xs">
          {title}
        </div>
      )}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col items-start gap-6 border border-dashed bg-background p-4 text-foreground sm:p-6 *:[div:not([class*='w-'])]:w-full",
          className
        )}
        data-slot="example-content"
      >
        {children}
      </div>
    </div>
  );
}

export { BlockWrapper };
