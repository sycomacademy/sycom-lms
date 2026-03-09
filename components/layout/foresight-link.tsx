"use client";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ForesightRegisterOptions } from "js.foresight";
import type { Route } from "next";
import type { LinkProps } from "next/link";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import useForesight from "@/packages/hooks/use-foresight";

interface ForesightLinkProps
  extends Omit<LinkProps<Route>, "prefetch">,
    Omit<ForesightRegisterOptions, "element" | "callback">,
    useRender.ComponentProps<"a"> {
  href: Route;
}

export function Link({
  render,
  children,
  className,
  ref,
  ...props
}: ForesightLinkProps) {
  const router = useRouter();
  const { elementRef: foresightRef } = useForesight<HTMLAnchorElement>({
    callback: () => {
      router.prefetch(props.href);
    },
    hitSlop: props.hitSlop,
    name: props.name,
    meta: props.meta,
    reactivateAfter: props.reactivateAfter,
  });

  const defaultProps: useRender.ElementProps<"a"> = {
    className,
    children,
  };

  const element = useRender({
    defaultTagName: "a",
    render: render || <NextLink href={props.href} prefetch={false} />,
    ref: ref ? [foresightRef, ref] : foresightRef,
    props: mergeProps<"a">(defaultProps, props),
  });

  return element;
}
