"use client";

import { BlockWrapper } from "@/components/demo/wrapper";
import { Button } from "@/components/ui/button";

export function ButtonsDemo() {
  return (
    <BlockWrapper title="Buttons">
      <div className="flex flex-wrap gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
    </BlockWrapper>
  );
}
