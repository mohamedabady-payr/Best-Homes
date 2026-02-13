import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", fullWidth, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variant === "primary" &&
            "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
          variant === "secondary" &&
            "bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-400",
          variant === "outline" &&
            "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400",
          variant === "ghost" &&
            "text-slate-600 hover:bg-slate-100 focus:ring-slate-400",
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
