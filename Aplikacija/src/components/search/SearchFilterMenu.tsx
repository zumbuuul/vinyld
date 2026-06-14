"use client";

import { cn } from "@/lib/utils";

type SearchFilterMenuProps<T extends string> = {
  options: Array<{
    label: string;
    value: T;
    description?: string;
  }>;
  selectedValue: T;
  onSelect: (value: T) => void;
  align?: "left" | "center" | "right";
};

export function SearchFilterMenu<T extends string>({
  options,
  selectedValue,
  onSelect,
  align = "left",
}: SearchFilterMenuProps<T>) {
  return (
    <div
      className={cn(
        "absolute top-full z-30 mt-3 w-72 rounded-2xl bg-[#1c1b1b] p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.82)]",
        align === "left" && "left-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "right" && "right-0",
      )}
    >
      <ul className="space-y-1">
        {options.map((option) => {
          const isSelected = option.value === selectedValue;

          return (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => onSelect(option.value)}
                className={cn(
                  "flex w-full flex-col rounded-xl px-3 py-3 text-left transition",
                  isSelected
                    ? "bg-[#2a2a2a] text-[#f5ebe8]"
                    : "bg-transparent text-[#d7b8ad] hover:bg-[#252323] hover:text-white",
                )}
              >
                <span className="text-sm font-medium">{option.label}</span>
                {option.description ? (
                  <span className="mt-1 text-xs text-[#8f7b74]">
                    {option.description}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
