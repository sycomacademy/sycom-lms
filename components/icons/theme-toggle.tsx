/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: <foff> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <foff> */
"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { cn } from "@/packages/utils/cn";

export interface ThemeToggleIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ThemeToggleIconProps {
  className?: string;
  size?: number;
  /** When set, icon rotates 180° for dark and 0° for light; animates on change. No hover wiggle. */
  theme?: "light" | "dark";
  onMouseEnter?: React.MouseEventHandler<HTMLSpanElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLSpanElement>;
}

const ROTATE_TRANSITION = { duration: 0.35, ease: "easeInOut" as const };

const ICON_VARIANTS: Variants = {
  normal: { rotate: 0 },
  animate: {
    rotate: [0, -20, 20, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  light: { rotate: 0, transition: ROTATE_TRANSITION },
  dark: { rotate: 180, transition: ROTATE_TRANSITION },
};

const ThemeToggleIcon = forwardRef<ThemeToggleIconHandle, ThemeToggleIconProps>(
  (
    { className, size = 24, theme: themeProp, onMouseEnter, onMouseLeave },
    ref
  ) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);
    const isThemeDriven = themeProp !== undefined;

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    useEffect(() => {
      if (isThemeDriven && themeProp) {
        controls.start(themeProp);
      }
    }, [isThemeDriven, themeProp, controls]);

    const handleMouseEnter = useCallback(
      (event: React.MouseEvent<HTMLSpanElement>) => {
        if (isThemeDriven) {
          onMouseEnter?.(event);
        } else if (isControlledRef.current) {
          onMouseEnter?.(event);
        } else {
          controls.start("animate");
        }
      },
      [isThemeDriven, controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (event: React.MouseEvent<HTMLSpanElement>) => {
        if (isThemeDriven) {
          onMouseLeave?.(event);
        } else if (isControlledRef.current) {
          onMouseLeave?.(event);
        } else {
          controls.start("normal");
        }
      },
      [isThemeDriven, controls, onMouseLeave]
    );

    const initial = isThemeDriven ? themeProp : "normal";

    return (
      <motion.span
        animate={controls}
        aria-hidden="true"
        className={cn(className)}
        initial={initial}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="presentation"
        variants={ICON_VARIANTS}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Toggle theme</title>
          <path d="M0 0h24v24H0z" fill="none" stroke="none" />
          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          <path d="M12 3l0 18" />
          <path d="M12 9l4.65 -4.65" />
          <path d="M12 14.3l7.37 -7.37" />
          <path d="M12 19.6l8.85 -8.85" />
        </svg>
      </motion.span>
    );
  }
);

ThemeToggleIcon.displayName = "ThemeToggleIcon";

export { ThemeToggleIcon };
