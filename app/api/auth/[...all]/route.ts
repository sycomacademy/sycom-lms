import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/packages/auth/auth";

export const { GET, POST, PUT, PATCH, DELETE } = toNextJsHandler(auth);
