import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

type UploadPathPrefixResolver = (userId: string) => string;

export async function handleScopedBlobUpload(
  request: Request,
  resolveExpectedPrefix: UploadPathPrefixResolver,
): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const expectedPrefix = resolveExpectedPrefix(session.user.id);

        if (!pathname.startsWith(expectedPrefix)) {
          throw new Error("Invalid upload path.");
        }

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
          ],
          maximumSizeInBytes: 5 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed.",
      },
      { status: 400 },
    );
  }
}
