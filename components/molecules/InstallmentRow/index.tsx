import { Badge } from "@/components/atoms/Badge";
import type { Installment } from "@/types/schedule";

export interface InstallmentRowProps {
  installment: Installment;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function InstallmentRow({ installment }: InstallmentRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-3 last:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <span className="text-sm font-medium text-slate-700">
          Installment {installment.installment_number}
        </span>
        <span className="text-sm text-slate-500">
          Due {formatDate(installment.due_date)}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-slate-900">
          £{installment.amount}
        </span>
        <Badge status={installment.status} />
      </div>
    </div>
  );
}
