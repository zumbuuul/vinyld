"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import {
  getRoleRequestById,
  getRoleRequestsByTypeAndStatus,
  updateRoleRequestDecision,
  updateUserRoleRecord,
  type AdminRoleRequestRow,
  type RoleRequestStatus,
} from "@/db/queries/admin.queries";
import { getUserPreferences, type RoleRequestKey } from "@/db/queries/users.queries";
import { auth } from "@/lib/auth";

const roleRequestFilterSchema = z.object({
  requestedRole: z.enum(["critic", "artist", "admin"]),
  status: z.enum(["pending", "approved", "rejected"]),
});

const roleRequestDecisionSchema = z.object({
  requestId: z.string().trim().min(1),
});

async function requireAdminUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const preferences = await getUserPreferences(session.user.id);

  if (preferences?.role !== "admin") {
    throw new Error("Forbidden");
  }

  return session.user.id;
}

export async function getRoleRequests(
  requestedRole: RoleRequestKey,
  status: RoleRequestStatus,
): Promise<AdminRoleRequestRow[]> {
  await requireAdminUserId();
  const parsed = roleRequestFilterSchema.parse({ requestedRole, status });

  return getRoleRequestsByTypeAndStatus(
    parsed.requestedRole,
    parsed.status,
    10,
  );
}

export async function approveRoleRequest(
  requestId: string,
): Promise<{ success: true }> {
  const adminUserId = await requireAdminUserId();
  const parsed = roleRequestDecisionSchema.parse({ requestId });
  const requestRecord = await getRoleRequestById(parsed.requestId);

  if (!requestRecord) {
    throw new Error("Role request not found.");
  }

  if (requestRecord.status !== "pending") {
    throw new Error("This request has already been resolved.");
  }

  await updateRoleRequestDecision({
    requestId: parsed.requestId,
    status: "approved",
    resolvedBy: adminUserId,
  });
  await updateUserRoleRecord(requestRecord.userId, requestRecord.requestedRole);

  revalidatePath("/admin");
  revalidatePath(`/user/${requestRecord.userId}`);

  return { success: true };
}

export async function declineRoleRequest(
  requestId: string,
): Promise<{ success: true }> {
  const adminUserId = await requireAdminUserId();
  const parsed = roleRequestDecisionSchema.parse({ requestId });
  const requestRecord = await getRoleRequestById(parsed.requestId);

  if (!requestRecord) {
    throw new Error("Role request not found.");
  }

  if (requestRecord.status !== "pending") {
    throw new Error("This request has already been resolved.");
  }

  await updateRoleRequestDecision({
    requestId: parsed.requestId,
    status: "rejected",
    resolvedBy: adminUserId,
  });

  revalidatePath("/admin");
  revalidatePath(`/user/${requestRecord.userId}`);

  return { success: true };
}
