"use client";

import { useState, useTransition } from "react";
import { z } from "zod";

import { cancelRoleRequest, submitRoleRequest } from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import type { RoleRequestKey } from "@/db/queries/users.queries";

const REQUEST_LABELS: Record<RoleRequestKey, string> = {
  critic: "Critic",
  artist: "Artist",
  admin: "Admin",
};

const roleRequestFormSchema = z.object({
  obrazlozenje: z
    .string()
    .trim()
    .min(10, "Please tell us a bit more about why you want this role.")
    .max(1000, "Reason is too long."),
});

export function RoleRequestModal({
  role,
  requested,
  disabled = false,
}: {
  role: RoleRequestKey;
  requested: boolean;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRequested, setIsRequested] = useState(requested);
  const [obrazlozenje, setObrazlozenje] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError(null);

    const parsed = roleRequestFormSchema.safeParse({ obrazlozenje });

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Please check your request text.",
      );
      return;
    }

    startTransition(async () => {
      try {
        await submitRoleRequest({
          requestedRole: role,
          obrazlozenje: parsed.data.obrazlozenje,
        });
        setIsRequested(true);
        setObrazlozenje("");
        setIsOpen(false);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Could not submit the request right now.",
        );
      }
    });
  };

  const handleCancelRequest = () => {
    setError(null);

    startTransition(async () => {
      try {
        await cancelRoleRequest(role);
        setIsRequested(false);
        setIsOpen(false);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Could not cancel the request right now.",
        );
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant={isRequested ? "outline" : "default"}
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        disabled={disabled}
        className={
          isRequested
            ? "border-[#5c4037] text-[#f0d6cd]"
            : "bg-[linear-gradient(135deg,#ffb59e,#ff5717)] text-[#521300] hover:opacity-95"
        }
      >
        {isRequested
          ? `Cancel Request ${REQUEST_LABELS[role]}`
          : `Request ${REQUEST_LABELS[role]}`}
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-[28px] bg-[#1c1b1b] p-5 text-white shadow-[0_24px_80px_-28px_rgba(0,0,0,0.9)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
                  Role request
                </p>
                <h3 className="mt-2 text-3xl font-serif text-[#f5ebe8]">
                  {requested
                    ? `Cancel ${REQUEST_LABELS[role]} request`
                    : `Request ${REQUEST_LABELS[role]} access`}
                </h3>
              </div>
            </div>

            {isRequested ? (
              <>
                <p className="mt-4 text-sm leading-7 text-[#d7b8ad]">
                  This request is still pending. If you no longer want it under
                  review, you can cancel it now.
                </p>

                {error ? (
                  <p className="mt-4 text-sm text-[#ffb59e]">{error}</p>
                ) : null}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                    className="border-[#5c4037] text-[#f0d6cd]"
                  >
                    Keep request
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancelRequest}
                    disabled={isPending}
                    className="bg-[linear-gradient(135deg,#ffb59e,#ff5717)] text-[#521300] hover:opacity-95"
                  >
                    {isPending ? "Cancelling..." : "Confirm cancellation"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm leading-7 text-[#d7b8ad]">
                  Tell us why this role fits your profile and how you plan to
                  use it inside Vinyld.
                </p>

                <label className="mt-5 block">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
                    Reason
                  </span>
                  <textarea
                    value={obrazlozenje}
                    onChange={(event) => setObrazlozenje(event.target.value)}
                    rows={8}
                    placeholder="Give some context for your request..."
                    className="mt-2 w-full resize-none rounded-2xl border border-[#3b2b26] bg-[#2a2a2a] px-4 py-4 text-sm leading-7 text-[#ecd2c8] outline-none transition focus:border-[#ffb59e]"
                  />
                </label>

                {error ? (
                  <p className="mt-4 text-sm text-[#ffb59e]">{error}</p>
                ) : null}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                    className="border-[#5c4037] text-[#f0d6cd]"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="bg-[linear-gradient(135deg,#ffb59e,#ff5717)] text-[#521300] hover:opacity-95"
                  >
                    {isPending ? "Submitting..." : "Submit request"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
