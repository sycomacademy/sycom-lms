import { useEffect, useState } from "react";

/**
 * Returns a delayed version of a boolean value.
 *
 * - `true → false` is delayed by `delay` ms (e.g. wait for a collapse animation).
 * - `false → true` is applied immediately (e.g. remove overrides before expand starts).
 */
export function useDelayedValue(value: boolean, delay: number): boolean {
  const [delayed, setDelayed] = useState(value);

  useEffect(() => {
    if (value) {
      // Opening: apply immediately
      setDelayed(true);
      return;
    }

    // Closing: wait for animation to finish
    const timer = setTimeout(() => setDelayed(false), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return delayed;
}
