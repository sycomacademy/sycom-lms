"use client";

import { useEffect, useRef } from "react";
import { broadcastAuthEvent } from "@/packages/utils/auth-broadcast";

export function VerifyEmailBroadcast() {
  const hasBroadcasted = useRef(false);

  useEffect(() => {
    if (hasBroadcasted.current) {
      return;
    }

    broadcastAuthEvent({ type: "signed_in" });
    hasBroadcasted.current = true;
  }, []);

  return null;
}
