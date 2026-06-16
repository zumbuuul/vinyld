"use client";

import { useEffect, useRef, useState } from "react";

import { SearchFilterMenu } from "@/components/search/SearchFilterMenu";
import { cn } from "@/lib/utils";

type SearchFilterChipProps<T extends string> = {
  label: string;
  selectedLabel: string;
  options: Array<{
    label: string;
    value: T;
    description?: string;
  }>;
  selectedValue: T;
  onSelect: (value: T) => void;
};

export function SearchFilterChip<T extends string>({
  label,
  selectedLabel,
  options,
  selectedValue,
  onSelect,
}: SearchFilterChipProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-left transition",
          open
            ? "bg-[#2a2a2a] text-white"
            : "bg-[#1c1b1b] text-[#d7b8ad] hover:bg-[#252323] hover:text-white",
        )}
      >
        <span className="text-[11px] uppercase tracking-[0.24em] text-[#8f7b74]">
          {label}
        </span>
        <span className="text-sm font-medium">{selectedLabel}</span>
        <span className="text-xs text-[#ffb59e]">{open ? "−" : "+"}</span>
      </button>

      {open ? (
        <SearchFilterMenu
          options={options}
          selectedValue={selectedValue}
          onSelect={(value) => {
            onSelect(value);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
