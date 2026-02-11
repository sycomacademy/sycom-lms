"use client";

import type { VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Button, type buttonVariants } from "@/components/ui/button";

type BackButtonProps = {
  /** Override the default button label. */
  children?: ReactNode;
  /** Optional extra classes to apply to the button. */
  className?: string;
} & VariantProps<typeof buttonVariants> &
  Omit<
    ComponentPropsWithoutRef<typeof Button>,
    "variant" | "children" | "onClick"
  >;

export function BackButton({
  children = "← Back",
  variant = "link",
  className,
  ...props
}: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      className={className}
      onClick={() => router.back()}
      type="button"
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  );
}
