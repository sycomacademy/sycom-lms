"use client";

import {
  Edit2Icon,
  MinusIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export function ButtonsDemo() {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="xs">Extra Small</Button>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
      <div className="flex flex-wrap gap-8">
        <ButtonGroup>
          <Button size={"icon"}>
            <SaveIcon />
          </Button>
          <Button size={"icon"}>
            <Edit2Icon />
          </Button>
          <Button size={"icon"}>
            <TrashIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroup orientation="vertical">
          <Button size={"icon"}>
            <PlusIcon />
          </Button>
          <Button size={"icon"}>
            <MinusIcon />
          </Button>
        </ButtonGroup>
      </div>
    </>
  );
}
