import { cn } from "@/lib/utils";

export interface BadgeProps {
  status: "pending" | "paid" | "failed";
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  const styles = {
    pending:
      "bg-amber-100 text-amber-800 border-amber-200",
    paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
    failed: "bg-red-100 text-red-800 border-red-200",
  };

  const labels = {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}
