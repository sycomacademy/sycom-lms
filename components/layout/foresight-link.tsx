"use client";
import type { ForesightRegisterOptions } from "js.foresight";
import type { Route } from "next";
import type { LinkProps } from "next/link";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import useForesight from "@/packages/hooks/use-foresight";

interface ForesightLinkProps
  extends Omit<LinkProps<Route>, "prefetch">,
    Omit<ForesightRegisterOptions, "element" | "callback"> {
  children?: React.ReactNode;
  className?: string;
  href: Route;
}

export function Link({ children, className, ...props }: ForesightLinkProps) {
  const router = useRouter(); // import from "next/navigation" not "next/router"
  const { elementRef } = useForesight<HTMLAnchorElement>({
    callback: () => {
      router.prefetch(props.href);
    },
    hitSlop: props.hitSlop,
    name: props.name,
    meta: props.meta,
    reactivateAfter: props.reactivateAfter,
  });

  return (
    <NextLink
      {...props}
      className={className}
      prefetch={false}
      ref={elementRef}
    >
      {children}
    </NextLink>
  );
}
