import { NextRequest, NextResponse } from "next/server";
import type { ScheduleResponse } from "@/types/schedule";

const MOCK_TENANCY_ID = "bh-tenant-001";

let simulatedPaymentComplete = false;

const MOCK_SCHEDULE: ScheduleResponse = {
  tenancy_id: MOCK_TENANCY_ID,
  property_name: "Campus View - Room 42",
  total_rent: 650,
  installments: [
    {
      id: 1,
      installment_number: 1,
      due_date: "2025-01-01",
      amount: "650.00",
      status: "paid",
    },
    {
      id: 2,
      installment_number: 2,
      due_date: "2025-02-01",
      amount: "650.00",
      status: "pending",
    },
    {
      id: 3,
      installment_number: 3,
      due_date: "2025-03-01",
      amount: "650.00",
      status: "pending",
    },
    {
      id: 4,
      installment_number: 4,
      due_date: "2025-04-01",
      amount: "650.00",
      status: "pending",
    },
    {
      id: 5,
      installment_number: 5,
      due_date: "2025-05-01",
      amount: "650.00",
      status: "pending",
    },
  ],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const markFirstPendingPaid =
    searchParams.get("mark_first_pending_paid") === "true";

  if (markFirstPendingPaid) {
    simulatedPaymentComplete = true;
  }

  const schedule: ScheduleResponse = {
    ...MOCK_SCHEDULE,
    installments: [...MOCK_SCHEDULE.installments],
  };

  if (simulatedPaymentComplete) {
    const firstPendingIdx = schedule.installments.findIndex(
      (i) => i.status === "pending"
    );
    if (firstPendingIdx >= 0) {
      schedule.installments[firstPendingIdx] = {
        ...schedule.installments[firstPendingIdx],
        status: "paid",
      };
    }
  }

  return NextResponse.json(schedule);
}
