import { cn } from "@/packages/utils/cn";

interface SectionLabelProps {
  number?: string;
  label: string;
  className?: string;
}

export function SectionLabel({ number, label, className }: SectionLabelProps) {
  return (
    <div
      className={cn("mb-4 flex items-center justify-center gap-3", className)}
    >
      {number && (
        <>
          <span className="font-medium text-primary text-sm">{number}</span>
          <span className="h-px w-8 bg-primary" />
        </>
      )}
      <span className="font-medium text-muted-foreground text-sm uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}
