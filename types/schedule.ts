export type InstallmentStatus = "pending" | "paid" | "failed";

export interface Installment {
  id: number;
  installment_number: number;
  due_date: string;
  amount: string;
  status: InstallmentStatus;
}

export interface ScheduleResponse {
  installments: Installment[];
  tenancy_id: string;
  property_name?: string;
  total_rent?: number;
}
