import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db/db";
import { roleRequest, user, userPreferences } from "@/db/schema";
import type { RoleRequestKey } from "@/db/queries/users.queries";

export type RoleRequestStatus = "pending" | "approved" | "rejected";

export type AdminRoleRequestRow = {
  id: string;
  userId: string;
  userName: string;
  requestedRole: RoleRequestKey;
  status: RoleRequestStatus;
  obrazlozenje: string | null;
  dateCreated: string;
};

export async function getRoleRequestsByTypeAndStatus(
  requestedRole: RoleRequestKey,
  status: RoleRequestStatus,
  limit = 10,
): Promise<AdminRoleRequestRow[]> {
  const rows = await db
    .select({
      id: roleRequest.id,
      userId: roleRequest.userId,
      userName: user.name,
      requestedRole: roleRequest.requestedRole,
      status: roleRequest.status,
      obrazlozenje: roleRequest.obrazlozenje,
      dateCreated: roleRequest.dateCreated,
    })
    .from(roleRequest)
    .innerJoin(user, eq(user.id, roleRequest.userId))
    .where(
      and(
        eq(roleRequest.requestedRole, requestedRole),
        eq(roleRequest.status, status),
      ),
    )
    .orderBy(desc(roleRequest.dateCreated), desc(roleRequest.id))
    .limit(limit);

  return rows.map((row) => ({
    id: String(row.id),
    userId: String(row.userId),
    userName: String(row.userName),
    requestedRole: row.requestedRole as RoleRequestKey,
    status: row.status as RoleRequestStatus,
    obrazlozenje: row.obrazlozenje ? String(row.obrazlozenje) : null,
    dateCreated: String(row.dateCreated),
  }));
}

export async function getRoleRequestById(requestId: string): Promise<{
  id: string;
  userId: string;
  requestedRole: RoleRequestKey;
  status: RoleRequestStatus;
} | null> {
  const [row] = await db
    .select({
      id: roleRequest.id,
      userId: roleRequest.userId,
      requestedRole: roleRequest.requestedRole,
      status: roleRequest.status,
    })
    .from(roleRequest)
    .where(eq(roleRequest.id, requestId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    userId: String(row.userId),
    requestedRole: row.requestedRole as RoleRequestKey,
    status: row.status as RoleRequestStatus,
  };
}

export async function updateRoleRequestDecision(values: {
  requestId: string;
  status: Exclude<RoleRequestStatus, "pending">;
  resolvedBy: string;
}): Promise<void> {
  await db
    .update(roleRequest)
    .set({
      status: values.status,
      resolvedBy: values.resolvedBy,
      dateResolved: new Date().toISOString(),
    })
    .where(eq(roleRequest.id, values.requestId));
}

export async function updateUserRoleRecord(
  userId: string,
  role: RoleRequestKey,
): Promise<void> {
  await db
    .update(userPreferences)
    .set({
      role,
    })
    .where(eq(userPreferences.userId, userId));
}

export async function revertApprovedRoleRequestRecord(values: {
  requestId: string;
  userId: string;
}): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(userPreferences)
      .set({
        role: "user",
      })
      .where(eq(userPreferences.userId, values.userId));

    await tx
      .delete(roleRequest)
      .where(
        and(
          eq(roleRequest.id, values.requestId),
          eq(roleRequest.userId, values.userId),
          eq(roleRequest.status, "approved"),
        ),
      );
  });
}
