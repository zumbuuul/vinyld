import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
};

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb59e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#131313] disabled:pointer-events-none disabled:opacity-50",
        variant === "default" &&
          "bg-[#ffb59e] text-[#521300] hover:bg-[#ff9d7c]",
        variant === "outline" &&
          "border border-[#3b2b26] bg-transparent text-[#ffb59e] hover:bg-[#241d1a]",
        variant === "ghost" &&
          "bg-transparent text-[#e6beb2] hover:bg-[#241d1a] hover:text-white",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-8 px-3 text-xs",
        size === "icon" && "h-8 w-8",
        className,
      )}
      {...props}
    />
  );
}
