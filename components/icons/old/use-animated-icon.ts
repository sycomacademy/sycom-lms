"use client";

import { type RefObject, useCallback, useRef } from "react";

/** Handle exposed by animated icon components (startAnimation / stopAnimation). */
export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export type AnimatedIconTrigger = "hover" | "click" | "focus";

export interface UseAnimatedIconOptions {
  /** Event to drive the icon animation. Default: "hover". */
  trigger?: AnimatedIconTrigger;
}

export interface AnimatedIconHoverHandlers {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export interface AnimatedIconClickHandlers {
  onClick: () => void;
}

export interface AnimatedIconFocusHandlers {
  onFocus: () => void;
  onBlur: () => void;
}

type AnimatedIconHandlers =
  | AnimatedIconHoverHandlers
  | AnimatedIconClickHandlers
  | AnimatedIconFocusHandlers;

/**
 * Hook to drive an animated icon from a parent element’s events (e.g. button
 * hover or click) instead of the icon’s own hover.
 *
 * Usage:
 * - Pass the returned ref to the icon component.
 * - Spread the returned handlers onto the element that should trigger the
 *   animation (e.g. DropdownMenuItem, Button).
 *
 * @example
 * // Animate icon when the menu item is hovered (not the icon)
 * const [userIconRef, hoverHandlers] = useAnimatedIcon();
 * <DropdownMenuItem {...hoverHandlers} render={<Link href="/account" />}>
 *   <UserIcon ref={userIconRef} />
 *   <span>Profile</span>
 * </DropdownMenuItem>
 *
 * @example
 * // Animate icon on button click
 * const [iconRef, clickHandlers] = useAnimatedIcon({ trigger: "click" });
 * <Button {...clickHandlers}>
 *   <SomeIcon ref={iconRef} />
 *   Submit
 * </Button>
 */
export function useAnimatedIcon<
  T extends AnimatedIconHandle = AnimatedIconHandle,
>(
  options: UseAnimatedIconOptions = {}
): [RefObject<T | null>, AnimatedIconHandlers] {
  const { trigger = "hover" } = options;
  const ref = useRef<T>(null);

  const start = useCallback(() => ref.current?.startAnimation(), []);
  const stop = useCallback(() => ref.current?.stopAnimation(), []);

  if (trigger === "hover") {
    return [ref, { onMouseEnter: start, onMouseLeave: stop }];
  }
  if (trigger === "click") {
    return [ref, { onClick: start }];
  }
  if (trigger === "focus") {
    return [ref, { onFocus: start, onBlur: stop }];
  }

  return [ref, { onMouseEnter: start, onMouseLeave: stop }];
}
