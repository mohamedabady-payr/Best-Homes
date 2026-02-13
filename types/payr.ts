export interface PayrTenant {
  post_code: string;
  address_1: string;
  city: string;
  country: string;
  is_primary: boolean;
  start_rent_date: string;
  end_rent_date: string;
  rent_due_day: number;
  amount: string;
  frequency: string;
  is_active: boolean;
  payment_reference: string;
  recipient_bank_sort_code: string;
  recipient_bank_account_number: string;
  recipient_bank_account_name: string;
  agreement: string;
}

export interface PayrKyc {
  photo: string | null;
  pii_front: string | null;
  pii_back: string | null;
  status: string;
}

export interface PayrOnboardingPayload {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
  tenant: PayrTenant[];
  kyc: PayrKyc;
  installments: unknown[];
}

export type PayrProfileInput = Omit<PayrOnboardingPayload, "user_id"> & {
  user_id?: never;
};
