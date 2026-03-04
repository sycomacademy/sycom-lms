import { NextResponse } from "next/server";
import { auth } from "@/packages/auth/auth";

export async function POST(req: Request) {
  return auth.handler(req);
}

export async function GET(req: Request) {
  return NextResponse.redirect(new URL("/", req.url));
}
