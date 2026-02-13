"use client";

import Link from "next/link";
import { InstallmentRow } from "@/components/molecules/InstallmentRow";
import { Button } from "@/components/atoms/Button";
import type { ScheduleResponse } from "@/types/schedule";

export interface RentScheduleProps {
  schedule: ScheduleResponse;
}

export function RentSchedule({ schedule }: RentScheduleProps) {
  const pendingInstallments = schedule.installments.filter(
    (i) => i.status === "pending"
  );
  const hasPending = pendingInstallments.length > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Rent Payment Schedule
        </h2>
        {schedule.property_name && (
          <p className="mt-1 text-sm text-slate-500">{schedule.property_name}</p>
        )}
      </div>
      <div className="divide-y divide-slate-100 px-6">
        {schedule.installments.map((installment) => (
          <InstallmentRow key={installment.id} installment={installment} />
        ))}
      </div>
      {hasPending && (
        <div className="border-t border-slate-200 px-6 py-4">
          <Link href="/checkout">
            <Button fullWidth>Pay Rent</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
