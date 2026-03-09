"use client";

import { useEffect, useRef } from "react";
import { identify } from "@/packages/analytics/client";

interface SessionIdentifyProps {
  user: {
    email: string;
    id: string;
    name: string;
  };
}

export function SessionIdentify({ user }: SessionIdentifyProps) {
  const lastIdentifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (lastIdentifiedUserId.current === user.id) {
      return;
    }

    identify(user.email, {
      email: user.email,
      name: user.name,
      userId: user.id,
    });
    lastIdentifiedUserId.current = user.id;
  }, [user.email, user.id, user.name]);

  return null;
}
