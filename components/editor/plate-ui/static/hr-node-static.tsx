import type { PlateElementProps } from "platejs/react";
import { PlateElement } from "platejs/react";

import { cn } from "@/packages/utils/cn";

export function HrElementStatic(props: PlateElementProps) {
  return (
    <PlateElement {...props}>
      <div className="cursor-text py-6" contentEditable={false}>
        <hr
          className={cn(
            "h-0.5 rounded-sm border-none bg-muted bg-clip-content"
          )}
        />
      </div>
      {props.children}
    </PlateElement>
  );
}
