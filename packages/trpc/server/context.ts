import type { NextRequest } from "next/server";
import { cache } from "react";
import { auth } from "@/packages/auth/auth";
import { db } from "@/packages/db";

export const createContext = cache(async (req: NextRequest) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  return {
    session,
    db,
  };
});

export type Context = Awaited<ReturnType<typeof createContext>>;
