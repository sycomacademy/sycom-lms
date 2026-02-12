"use client";

import { useEffect } from "react";

interface KeyboardBinding {
  /**
   * The keyboard key to listen for, e.g. "d", "Escape".
   * Comparison is done case-insensitively.
   */
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  /**
   * Handler invoked when the binding matches.
   */
  onKey: (event: KeyboardEvent) => void;
  /**
   * Prevent the browser default for this key when the binding matches.
   * Defaults to false.
   */
  preventDefault?: boolean;
  /**
   * When true (default), the binding will be ignored while typing in
   * editable elements (inputs, textareas, selects, or contentEditable).
   */
  ignoreInputs?: boolean;
}

interface UseKeyboardOptions {
  bindings: KeyboardBinding[];
  /**
   * Enables or disables all bindings.
   * Defaults to true.
   */
  enabled?: boolean;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    return true;
  }

  return false;
}

function shouldHandleEventForBinding(
  event: KeyboardEvent,
  binding: KeyboardBinding
): boolean {
  if ((binding.ignoreInputs ?? true) && isEditableTarget(event.target)) {
    return false;
  }

  const normalizedKey = event.key.toLowerCase();
  if (normalizedKey !== binding.key.toLowerCase()) {
    return false;
  }

  const isMetaPressed = !!event.metaKey;
  const isCtrlPressed = !!event.ctrlKey;
  const isShiftPressed = !!event.shiftKey;
  const isAltPressed = !!event.altKey;

  const metaMatches = isMetaPressed === !!binding.meta;
  const ctrlMatches = isCtrlPressed === !!binding.ctrl;
  const shiftMatches = isShiftPressed === !!binding.shift;
  const altMatches = isAltPressed === !!binding.alt;

  return metaMatches && ctrlMatches && shiftMatches && altMatches;
}

export function useKeyboard({ bindings, enabled = true }: UseKeyboardOptions) {
  useEffect(() => {
    if (!enabled || bindings.length === 0) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const binding of bindings) {
        if (!shouldHandleEventForBinding(event, binding)) {
          continue;
        }

        if (binding.preventDefault) {
          event.preventDefault();
        }

        binding.onKey(event);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [bindings, enabled]);
}
