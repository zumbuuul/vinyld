"use client";

import type { ReactNode } from "react";

import { ProtectedAction } from "@/components/ProtectedAction";
import { Button } from "@/components/ui/button";

const STAR_PATH =
  "M12 3.75 14.6 9l5.8.84-4.2 4.1.99 5.78L12 16.98l-5.19 2.74.99-5.78-4.2-4.1L9.4 9Z";

export function getStarFill(rating10: number, starIndex: number): number {
  const remaining = rating10 / 2 - starIndex;

  if (remaining >= 1) {
    return 1;
  }

  if (remaining >= 0.5) {
    return 0.5;
  }

  return 0;
}

function StarButton({
  fill,
  onSelect,
  emptyColorClass,
  filledColorClass,
}: {
  fill: number;
  onSelect: (rating10: number) => void;
  emptyColorClass: string;
  filledColorClass: string;
}) {
  return (
    <div className="relative h-7 w-7">
      <svg
        viewBox="0 0 24 24"
        className={`h-7 w-7 fill-none ${emptyColorClass}`}
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d={STAR_PATH} />
      </svg>
      {fill > 0 ? (
        <span
          className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${fill * 100}%` }}
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-7 w-7 ${filledColorClass}`}
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d={STAR_PATH} />
          </svg>
        </span>
      ) : null}
      <button
        type="button"
        onClick={() => onSelect(1)}
        className="absolute inset-y-0 left-0 w-1/2"
        aria-label="Select half star"
      />
      <button
        type="button"
        onClick={() => onSelect(2)}
        className="absolute inset-y-0 right-0 w-1/2"
        aria-label="Select full star"
      />
    </div>
  );
}

export function FormShell({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <section className={`space-y-6 rounded-[28px] p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9)] sm:p-7 ${className}`}>
      <div className="space-y-2">
        <h1 className="text-4xl font-serif leading-none sm:text-5xl">{title}</h1>
        <p className="max-w-xl text-sm sm:text-base">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function FormField({
  label,
  labelClassName,
  children,
}: {
  label: string;
  labelClassName: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className={labelClassName}>{label}</p>
      {children}
    </div>
  );
}

export function RatingInput({
  rating10,
  onChange,
  label,
  labelClassName,
  valueClassName,
  emptyStarClassName,
  filledStarClassName,
}: {
  rating10: number;
  onChange: (rating10: number) => void;
  label: string;
  labelClassName: string;
  valueClassName: string;
  emptyStarClassName: string;
  filledStarClassName: string;
}) {
  return (
    <FormField label={label} labelClassName={labelClassName}>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 5 }, (_, index) => (
          <StarButton
            key={index}
            fill={getStarFill(rating10, index)}
            onSelect={(value) => onChange(index * 2 + value)}
            emptyColorClass={emptyStarClassName}
            filledColorClass={filledStarClassName}
          />
        ))}
      </div>
      <p className={valueClassName}>{(rating10 / 2).toFixed(1)} / 5</p>
    </FormField>
  );
}

export function SubmitAction({
  isAuthenticated,
  redirectUrl,
  onAction,
  disabled,
  pendingLabel,
  idleLabel,
  className,
}: {
  isAuthenticated: boolean;
  redirectUrl: string;
  onAction: () => void | Promise<void>;
  disabled: boolean;
  pendingLabel: string;
  idleLabel: string;
  className: string;
}) {
  return (
    <ProtectedAction
      isAuthenticated={isAuthenticated}
      redirectUrl={redirectUrl}
      onAction={onAction}
    >
      {({ onClick }) => (
        <Button onClick={onClick} disabled={disabled} className={className}>
          {disabled ? pendingLabel : idleLabel}
        </Button>
      )}
    </ProtectedAction>
  );
}

export function HeartToggle({
  filled,
  disabled,
  isAuthenticated,
  redirectUrl,
  onAction,
}: {
  filled: boolean;
  disabled: boolean;
  isAuthenticated: boolean;
  redirectUrl: string;
  onAction: () => void;
}) {
  return (
    <ProtectedAction
      isAuthenticated={isAuthenticated}
      redirectUrl={redirectUrl}
      onAction={onAction}
    >
      {({ onClick }) => (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-pressed={filled}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/8 bg-[#1d1b1b] transition hover:bg-[#262323] disabled:opacity-60"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-5 w-5 ${
              filled ? "fill-[#ff8f6a] text-[#ff8f6a]" : "fill-none text-[#8f7269]"
            }`}
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M12 20.5 4.8 13.9a4.9 4.9 0 0 1 0-7 4.95 4.95 0 0 1 6.97 0L12 7.14l.23-.24a4.95 4.95 0 0 1 6.97 0 4.9 4.9 0 0 1 0 7Z" />
          </svg>
        </button>
      )}
    </ProtectedAction>
  );
}
