"use client";

import { useState, useTransition } from "react";

import {
  approveRoleRequest,
  declineRoleRequest,
  revertApprovedRoleRequest,
} from "@/actions/admin.actions";
import { Button } from "@/components/ui/button";
import type { AdminRoleRequestRow } from "@/db/queries/admin.queries";

export function RoleRequestItem({
  request,
  onResolved,
}: {
  request: AdminRoleRequestRow;
  onResolved: (requestId: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    setError(null);

    startTransition(async () => {
      try {
        await approveRoleRequest(request.id);
        onResolved(request.id);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Could not approve this request right now.",
        );
      }
    });
  };

  const handleDecline = () => {
    setError(null);

    startTransition(async () => {
      try {
        await declineRoleRequest(request.id);
        onResolved(request.id);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Could not decline this request right now.",
        );
      }
    });
  };

  const handleRevert = () => {
    setError(null);

    startTransition(async () => {
      try {
        await revertApprovedRoleRequest(request.id);
        onResolved(request.id);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Could not revert this request right now.",
        );
      }
    });
  };

  return (
    <article className="rounded-2xl bg-[#2a2a2a] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-lg font-serif text-[#f5ebe8]">{request.userName}</p>
          <p className="mt-1 text-xs text-[#a68f87]">@{request.userId}</p>
        </div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
          {request.status}
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-[#1c1b1b] px-4 py-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
          Reason
        </p>
        <p className="mt-3 text-sm leading-7 text-[#d7b8ad]">
          {request.obrazlozenje?.trim() || "No reason provided."}
        </p>
      </div>

      {request.status === "pending" ? (
        <div className="mt-4 flex flex-col gap-3">
          {error ? <p className="text-sm text-[#ffb59e]">{error}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={handleApprove}
              disabled={isPending}
              className="w-full bg-[linear-gradient(135deg,#ffb59e,#ff5717)] text-[#521300] hover:opacity-95"
            >
              {isPending ? "Working..." : "Approve"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDecline}
              disabled={isPending}
              className="w-full border-[#5c4037] text-[#f0d6cd]"
            >
              {isPending ? "Working..." : "Decline"}
            </Button>
          </div>
        </div>
      ) : null}

      {request.status === "approved" ? (
        <div className="mt-4 flex flex-col gap-3">
          {error ? <p className="text-sm text-[#ffb59e]">{error}</p> : null}
          <Button
            type="button"
            variant="outline"
            onClick={handleRevert}
            disabled={isPending}
            className="w-full border-[#7a2f22] text-[#ffb59e]"
          >
            {isPending ? "Working..." : "REVERT"}
          </Button>
        </div>
      ) : null}
    </article>
  );
}
