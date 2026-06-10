"use client";

import { useState, useTransition } from "react";

import { getRoleRequests } from "@/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { RoleRequestItem } from "@/components/admin/RoleRequestItem";
import type {
  AdminRoleRequestRow,
  RoleRequestStatus,
} from "@/db/queries/admin.queries";
import type { RoleRequestKey } from "@/db/queries/users.queries";

const COLUMN_LABELS: Record<RoleRequestKey, string> = {
  critic: "Critic Requests",
  artist: "Artist Requests",
  admin: "Admin Requests",
};

const FILTERS: RoleRequestStatus[] = ["pending", "approved", "rejected"];

export function RoleRequestColumn({
  role,
  initialRequests,
}: {
  role: RoleRequestKey;
  initialRequests: AdminRoleRequestRow[];
}) {
  const [activeStatus, setActiveStatus] = useState<RoleRequestStatus>("pending");
  const [requests, setRequests] = useState(initialRequests);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadRequests = (status: RoleRequestStatus) => {
    setError(null);

    startTransition(async () => {
      try {
        const nextRequests = await getRoleRequests(role, status);
        setActiveStatus(status);
        setRequests(nextRequests);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Could not load these requests right now.",
        );
      }
    });
  };

  return (
    <section className="rounded-[28px] bg-[#1c1b1b] p-5 sm:p-6">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
            {COLUMN_LABELS[role]}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#d7b8ad]">
            Showing up to 10 {activeStatus} requests.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((status) => (
            <Button
              key={status}
              type="button"
              variant={activeStatus === status ? "default" : "outline"}
              onClick={() => loadRequests(status)}
              disabled={isPending}
              className={
                activeStatus === status
                  ? "bg-[linear-gradient(135deg,#ffb59e,#ff5717)] text-[#521300] hover:opacity-95"
                  : "border-[#5c4037] text-[#f0d6cd]"
              }
            >
              {status}
            </Button>
          ))}
        </div>

        {error ? <p className="text-sm text-[#ffb59e]">{error}</p> : null}

        <div className="space-y-3">
          {requests.length > 0 ? (
            requests.map((request) => (
              <RoleRequestItem
                key={request.id}
                request={request}
                onResolved={(requestId) => {
                  setRequests((current) =>
                    current.filter((item) => item.id !== requestId),
                  );
                }}
              />
            ))
          ) : (
            <div className="rounded-2xl bg-[#2a2a2a] px-4 py-5 text-sm text-[#d7b8ad]">
              No {activeStatus} requests in this column right now.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
