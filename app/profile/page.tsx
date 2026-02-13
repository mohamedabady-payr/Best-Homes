"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/templates/PageLayout";
import { Button } from "@/components/atoms/Button";
import { useAuth } from "@/lib/AuthContext";
import { getProfile, setProfile } from "@/lib/profileStorage";
import { formatAmountToTwoDecimals } from "@/lib/utils";
import type { PayrProfileInput, PayrTenant } from "@/types/payr";

const DEFAULT_TENANT: PayrTenant = {
  post_code: "",
  address_1: "",
  city: "",
  country: "United Kingdom",
  is_primary: true,
  start_rent_date: "",
  end_rent_date: "",
  rent_due_day: 17,
  amount: "750",
  frequency: "every_1_month",
  is_active: true,
  payment_reference: "",
  recipient_bank_sort_code: "",
  recipient_bank_account_number: "",
  recipient_bank_account_name: "",
  agreement: "https://pdfobject.com/pdf/sample.pdf",
};

const FREQUENCY_LABELS: Record<string, string> = {
  every_1_month: "Monthly",
  every_2_month: "Every 2 months",
  every_3_month: "Quarterly",
  every_half_year: "Bi-annually",
  every_year: "Annually",
};

const CITIES = ["London", "Manchester", "Birmingham", "Leeds", "Bristol", "Edinburgh", "Glasgow"];
const STREETS = ["High Street", "Church Road", "Park Lane", "Victoria Road", "Station Road", "Main Street"];
const FREQUENCIES = ["every_1_month", "every_2_month", "every_3_month", "every_half_year", "every_year"] as const;

type FormState = PayrProfileInput;

function generateSampleData(
  email: string,
  first_name: string,
  last_name: string
): FormState {
  const year = 1990 + Math.floor(Math.random() * 10);
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0");
  const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, "0");
  const postCodes = ["SW1 1AA", "M1 1AE", "B1 1AA", "LS1 1AB", "E1 6AN", "W1A 1AA", "EC1A 1BB"];
  const postCode = postCodes[Math.floor(Math.random() * postCodes.length)];
  const streetNum = 1 + Math.floor(Math.random() * 300);
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const street = STREETS[Math.floor(Math.random() * STREETS.length)];
  const startYear = 2025;
  const endYear = 2028;
  const rentDueDay = 1 + Math.floor(Math.random() * 28);
  const amount = formatAmountToTwoDecimals(500 + Math.floor(Math.random() * 500));
  const frequency = FREQUENCIES[Math.floor(Math.random() * FREQUENCIES.length)];
  const sortCode = `${String(10 + Math.floor(Math.random() * 90)).padStart(2, "0")}-${String(10 + Math.floor(Math.random() * 90)).padStart(2, "0")}-${String(10 + Math.floor(Math.random() * 90)).padStart(2, "0")}`;
  const accNum = String(10000000 + Math.floor(Math.random() * 90000000));

  return {
    email,
    first_name,
    last_name,
    phone_number: `+44${String(7700000000 + Math.floor(Math.random() * 99999999))}`,
    date_of_birth: `${year}-${month}-${day}`,
    tenant: [
      {
        post_code: postCode,
        address_1: `${streetNum} ${street}`,
        city,
        country: "United Kingdom",
        is_primary: true,
        start_rent_date: `${startYear}-02-12`,
        end_rent_date: `${endYear}-02-12`,
        rent_due_day: rentDueDay,
        amount,
        frequency,
        is_active: true,
        payment_reference: `ref${Math.floor(100 + Math.random() * 900)}`,
        recipient_bank_sort_code: sortCode,
        recipient_bank_account_number: accNum,
        recipient_bank_account_name: "BestHomes Account",
        agreement: "https://pdfobject.com/pdf/sample.pdf",
      },
    ],
    kyc: { photo: null, pii_front: null, pii_back: null, status: "" },
    installments: [],
  };
}

function formatDate(str: string) {
  if (!str) return "—";
  try {
    return new Date(str + "T00:00:00").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return str;
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState<FormState>({
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    date_of_birth: "",
    tenant: [{ ...DEFAULT_TENANT }],
    kyc: { photo: null, pii_front: null, pii_back: null, status: "" },
    installments: [],
  });

  useEffect(() => {
    if (!user?.email) return;
    const stored = getProfile(user.email);
    if (stored) {
      setHasProfile(true);
      setForm({
        email: stored.email,
        first_name: stored.first_name,
        last_name: stored.last_name,
        phone_number: stored.phone_number,
        date_of_birth: stored.date_of_birth,
        tenant: stored.tenant ?? [{ ...DEFAULT_TENANT }],
        kyc: stored.kyc ?? { photo: null, pii_front: null, pii_back: null, status: "" },
        installments: stored.installments ?? [],
      });
    } else {
      setForm((p) => ({
        ...p,
        email: user.email,
        first_name: user.firstName ?? "",
        last_name: user.lastName ?? "",
      }));
    }
    setLoading(false);
  }, [user?.email, user?.firstName, user?.lastName]);

  const updatePersonal = (key: keyof FormState, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const updateTenant = (idx: number, key: keyof PayrTenant, value: string | number | boolean) => {
    setForm((p) => {
      const tenant = [...(p.tenant ?? [])];
      if (!tenant[idx]) tenant[idx] = { ...DEFAULT_TENANT };
      tenant[idx] = { ...tenant[idx], [key]: value };
      return { ...p, tenant };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setSaving(true);
    setMessage(null);
    try {
      const tenantWithFormattedAmount = form.tenant?.map((t) => ({
        ...t,
        amount: formatAmountToTwoDecimals(t.amount),
      })) ?? form.tenant;
      const payload: PayrProfileInput = {
        ...form,
        email: user.email,
        tenant: tenantWithFormattedAmount,
      };
      setProfile(user.email, payload);
      router.push("/checkout");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <PageLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">Loading...</p>
        </div>
      </PageLayout>
    );
  }

  const showPreview = hasProfile && !isEditing;

  return (
    <PageLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-600">
          {showPreview
            ? "Your profile information for Payr payments."
            : "Complete your profile to pay with Payr. This information is used to onboard you with Payr."}
        </p>

        {message && (
          <div
            className={`rounded-lg border p-4 ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {showPreview ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Personal details</h2>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-500">Email</dt>
                  <dd className="font-medium text-slate-900">{form.email || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">First name</dt>
                  <dd className="font-medium text-slate-900">{form.first_name || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Last name</dt>
                  <dd className="font-medium text-slate-900">{form.last_name || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Phone number</dt>
                  <dd className="font-medium text-slate-900">{form.phone_number || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Date of birth</dt>
                  <dd className="font-medium text-slate-900">{formatDate(form.date_of_birth)}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Tenant (property) details</h2>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-500">Address</dt>
                  <dd className="font-medium text-slate-900">
                    {[form.tenant?.[0]?.address_1, form.tenant?.[0]?.city, form.tenant?.[0]?.post_code, form.tenant?.[0]?.country]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Rent period</dt>
                  <dd className="font-medium text-slate-900">
                    {form.tenant?.[0]?.start_rent_date && form.tenant?.[0]?.end_rent_date
                      ? `${formatDate(form.tenant[0].start_rent_date)} – ${formatDate(form.tenant[0].end_rent_date)}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Rent amount</dt>
                  <dd className="font-medium text-slate-900">£{form.tenant?.[0]?.amount || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Rent due day</dt>
                  <dd className="font-medium text-slate-900">{form.tenant?.[0]?.rent_due_day ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Frequency</dt>
                  <dd className="font-medium text-slate-900">
                    {FREQUENCY_LABELS[form.tenant?.[0]?.frequency ?? ""] || form.tenant?.[0]?.frequency || "—"}
                  </dd>
                </div>
                {form.tenant?.[0]?.payment_reference && (
                  <div>
                    <dt className="text-sm text-slate-500">Payment reference</dt>
                    <dd className="font-medium text-slate-900">{form.tenant[0].payment_reference}</dd>
                  </div>
                )}
                {(form.tenant?.[0]?.recipient_bank_sort_code || form.tenant?.[0]?.recipient_bank_account_number) && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm text-slate-500">Bank details</dt>
                    <dd className="font-medium text-slate-900">
                      {form.tenant?.[0]?.recipient_bank_account_name || "—"} • Sort: {form.tenant?.[0]?.recipient_bank_sort_code || "—"} • Acc: {form.tenant?.[0]?.recipient_bank_account_number || "—"}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <Button variant="secondary" onClick={() => setIsEditing(true)} fullWidth>
              Edit profile
            </Button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setForm(
                generateSampleData(form.email, form.first_name, form.last_name)
              )
            }
          >
            Quick fill with sample data
          </Button>
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Personal details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  required
                  readOnly
                  value={form.email}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600"
                  tabIndex={-1}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">First name</span>
                <input
                  type="text"
                  required
                  readOnly
                  value={form.first_name}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600"
                  tabIndex={-1}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">Last name</span>
                <input
                  type="text"
                  required
                  readOnly
                  value={form.last_name}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600"
                  tabIndex={-1}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">Phone number</span>
                <input
                  type="tel"
                  required
                  value={form.phone_number}
                  onChange={(e) => updatePersonal("phone_number", e.target.value)}
                  placeholder="+441234567891"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">Date of birth</span>
                <input
                  type="date"
                  required
                  value={form.date_of_birth}
                  onChange={(e) => updatePersonal("date_of_birth", e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Tenant (property) details</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Address line 1</span>
                  <input
                    type="text"
                    required
                    value={form.tenant?.[0]?.address_1 ?? ""}
                    onChange={(e) => updateTenant(0, "address_1", e.target.value)}
                    placeholder="128 Grand street"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">City</span>
                  <input
                    type="text"
                    required
                    value={form.tenant?.[0]?.city ?? ""}
                    onChange={(e) => updateTenant(0, "city", e.target.value)}
                    placeholder="London"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Post code</span>
                  <input
                    type="text"
                    required
                    value={form.tenant?.[0]?.post_code ?? ""}
                    onChange={(e) => updateTenant(0, "post_code", e.target.value)}
                    placeholder="12345"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Country</span>
                  <input
                    type="text"
                    required
                    value={form.tenant?.[0]?.country ?? ""}
                    onChange={(e) => updateTenant(0, "country", e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Start rent date</span>
                  <input
                    type="date"
                    required
                    value={form.tenant?.[0]?.start_rent_date ?? ""}
                    onChange={(e) => updateTenant(0, "start_rent_date", e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">End rent date</span>
                  <input
                    type="date"
                    required
                    value={form.tenant?.[0]?.end_rent_date ?? ""}
                    onChange={(e) => updateTenant(0, "end_rent_date", e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Rent amount</span>
                  <input
                    type="text"
                    required
                    value={form.tenant?.[0]?.amount ?? ""}
                    onChange={(e) => updateTenant(0, "amount", e.target.value)}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val) updateTenant(0, "amount", formatAmountToTwoDecimals(val));
                    }}
                    placeholder="750.00"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Rent due day</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    required
                    value={form.tenant?.[0]?.rent_due_day ?? 17}
                    onChange={(e) => updateTenant(0, "rent_due_day", parseInt(e.target.value, 10))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Frequency</span>
                  <select
                    value={form.tenant?.[0]?.frequency ?? "every_1_month"}
                    onChange={(e) => updateTenant(0, "frequency", e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  >
                    <option value="every_1_month">Monthly</option>
                    <option value="every_2_month">Every 2 months</option>
                    <option value="every_3_month">Quarterly</option>
                    <option value="every_half_year">Bi-annually</option>
                    <option value="every_year">Annually</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Payment reference</span>
                  <input
                    type="text"
                    value={form.tenant?.[0]?.payment_reference ?? ""}
                    onChange={(e) => updateTenant(0, "payment_reference", e.target.value)}
                    placeholder="ref001"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Bank sort code</span>
                  <input
                    type="text"
                    value={form.tenant?.[0]?.recipient_bank_sort_code ?? ""}
                    onChange={(e) => updateTenant(0, "recipient_bank_sort_code", e.target.value)}
                    placeholder="20-71-75"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Bank account number</span>
                  <input
                    type="text"
                    value={form.tenant?.[0]?.recipient_bank_account_number ?? ""}
                    onChange={(e) => updateTenant(0, "recipient_bank_account_number", e.target.value)}
                    placeholder="13767272"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-700">Bank account name</span>
                  <input
                    type="text"
                    value={form.tenant?.[0]?.recipient_bank_account_name ?? ""}
                    onChange={(e) => updateTenant(0, "recipient_bank_account_name", e.target.value)}
                    placeholder="BesthomesAcc01"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Agreement URL</span>
                  <input
                    type="url"
                    value={form.tenant?.[0]?.agreement ?? ""}
                    onChange={(e) => updateTenant(0, "agreement", e.target.value)}
                    placeholder="https://pdfobject.com/pdf/sample.pdf"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
              </div>
            </div>
          </section>

          <div className={`flex gap-3 ${hasProfile ? "flex-col-reverse sm:flex-row sm:flex-row-reverse" : ""}`}>
            {hasProfile && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="sm:flex-1"
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={saving} className={hasProfile ? "sm:flex-1" : ""} fullWidth={!hasProfile}>
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              "Save profile"
            )}
          </Button>
          </div>
        </form>
        )}
      </div>
    </PageLayout>
  );
}
