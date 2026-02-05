"use client";

import { BlockWrapper } from "@/components/demo/wrapper";
import { Badge } from "@/components/ui/badge";

export function BadgesDemo() {
  return (
    <BlockWrapper title="Badges">
      <div className="flex flex-wrap gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="ghost">Ghost</Badge>
      </div>
    </BlockWrapper>
  );
}
