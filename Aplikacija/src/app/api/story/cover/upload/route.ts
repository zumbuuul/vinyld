import { NextResponse } from "next/server";

import { handleScopedBlobUpload } from "@/lib/blob-upload";

export async function POST(request: Request): Promise<NextResponse> {
  return handleScopedBlobUpload(request, (userId) => `stories/${userId}/`);
}
