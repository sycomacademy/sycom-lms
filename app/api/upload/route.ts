import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/packages/auth/auth";
import { createFileMetadata } from "@/packages/storage/metadata";
import { uploadFile } from "@/packages/storage/upload";

export async function POST(request: Request) {
  // Authenticate
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const pathPrefix = (formData.get("pathPrefix") as string) ?? undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload to Vercel Blob
    const uploadResult = await uploadFile(file.name, file, { pathPrefix });

    // Store metadata in Neon
    const metadata = await createFileMetadata({
      id: nanoid(),
      url: uploadResult.url,
      pathname: uploadResult.pathname,
      filename: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      uploadedById: session.user.id,
    });

    return NextResponse.json({
      id: metadata.id,
      url: metadata.url,
      filename: metadata.filename,
      size: metadata.size,
      mimeType: metadata.mimeType,
    });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
