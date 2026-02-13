"use client";

import { ProfileWarningCard } from "@/components/molecules/ProfileWarningCard";
import { PayWithPayrButton } from "@/components/molecules/PayWithPayrButton";
import type { ScheduleResponse } from "@/types/schedule";

export interface CheckoutSummaryProps {
  schedule: ScheduleResponse;
  onPayWithPayr: () => void;
  isPayrLoading?: boolean;
  hasProfile?: boolean;
}

export function CheckoutSummary({
  schedule,
  onPayWithPayr,
  isPayrLoading = false,
  hasProfile = true,
}: CheckoutSummaryProps) {
  const nextDue = schedule.installments.find((i) => i.status === "pending");
  const amountDue = nextDue ? parseFloat(nextDue.amount) : schedule.total_rent ?? 0;
  const canPay = hasProfile && nextDue;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Checkout</h2>
      {schedule.property_name && (
        <p className="mt-1 text-sm text-slate-500">{schedule.property_name}</p>
      )}
      <div className="mt-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Amount due</span>
          <span className="font-semibold text-slate-900">£{amountDue.toFixed(2)}</span>
        </div>
      </div>
      {!hasProfile && (
        <div className="mt-6">
          <ProfileWarningCard />
        </div>
      )}
      <div className="mt-8">
        <PayWithPayrButton
          onClick={onPayWithPayr}
          disabled={isPayrLoading || !canPay}
        />
      </div>
    </div>
  );
}
