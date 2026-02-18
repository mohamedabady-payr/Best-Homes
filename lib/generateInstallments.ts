import type { Installment } from "@/types/schedule";
import type { PayrTenant } from "@/types/payr";
import { formatAmountToTwoDecimals } from "./utils";

const FREQUENCY_MONTHS: Record<string, number> = {
  every_1_month: 1,
  every_2_month: 2,
  every_3_month: 3,
  every_half_year: 6,
  every_year: 12,
};

export function generateInstallments(tenant: PayrTenant | undefined): {
  installments: Installment[];
  propertyName: string;
} {
  if (!tenant) {
    return { installments: [], propertyName: "Unknown Property" };
  }

  const { start_rent_date, end_rent_date, rent_due_day, amount, frequency } = tenant;
  const intervalMonths = FREQUENCY_MONTHS[frequency] ?? 1;
  const amountStr = formatAmountToTwoDecimals(amount);

  const propertyName =
    tenant.address_1 && tenant.city
      ? `${tenant.address_1}, ${tenant.city}`
      : tenant.address_1 || tenant.city || "Unknown Property";

  const start = new Date(start_rent_date + "T00:00:00");
  const end = new Date(end_rent_date + "T23:59:59");

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    return { installments: [], propertyName };
  }

  const installments: Installment[] = [];
  const day = Math.min(rent_due_day, 28);
  const current = new Date(start.getFullYear(), start.getMonth(), day);

  while (current < start && current <= end) {
    current.setMonth(current.getMonth() + intervalMonths);
    current.setDate(day);
  }

  let id = 1;
  while (current <= end) {
    installments.push({
      id: id++,
      installment_number: installments.length + 1,
      due_date: current.toISOString().slice(0, 10),
      amount: amountStr,
      status: "pending",
    });

    current.setMonth(current.getMonth() + intervalMonths);
    current.setDate(Math.min(rent_due_day, 28));
  }

  return { installments, propertyName };
}
