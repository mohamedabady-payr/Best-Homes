"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/templates/PageLayout";
import { CheckoutSummary } from "@/components/organisms/CheckoutSummary";
import { PayrModal } from "@/components/organisms/PayrModal";
import { useAuth } from "@/lib/AuthContext";
import { getProfile, markOnboarded } from "@/lib/profileStorage";
import { fetchOnce, invalidateFetch } from "@/lib/fetchOnce";
import { formatAmountToTwoDecimals } from "@/lib/utils";
import type { PayrOnboardingPayload } from "@/types/payr";
import type { ScheduleResponse } from "@/types/schedule";

function isProfileComplete(profile: ReturnType<typeof getProfile>): boolean {
  if (!profile) return false;
  return !!(
    profile.email &&
    profile.first_name &&
    profile.last_name &&
    profile.phone_number &&
    profile.date_of_birth &&
    profile.tenant?.[0]?.address_1 &&
    profile.tenant?.[0]?.city &&
    profile.tenant?.[0]?.post_code &&
    profile.tenant?.[0]?.country &&
    profile.tenant?.[0]?.start_rent_date &&
    profile.tenant?.[0]?.end_rent_date &&
    profile.tenant?.[0]?.amount
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [profile, setProfileState] = useState<ReturnType<typeof getProfile>>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [payrLoading, setPayrLoading] = useState(false);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  const hasProfile = isProfileComplete(profile);

  const fetchSchedule = (markPaid = false) => {
    const url = markPaid
      ? "/api/schedule?mark_first_pending_paid=true"
      : "/api/schedule";
    return fetch(url).then((res) => res.json()) as Promise<ScheduleResponse>;
  };

  useEffect(() => {
    if (!user?.email) return;
    fetchOnce("checkout-schedule", () =>
      fetch("/api/schedule").then((res) => res.json()) as Promise<ScheduleResponse>
    )
      .then((scheduleData) => {
        setSchedule(scheduleData);
        setProfileState(getProfile(user.email));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    return () => void setTimeout(() => invalidateFetch("checkout-schedule"), 100);
  }, [user?.email]);

  const handlePayWithPayr = async () => {
    if (!user?.email || !profile) return;
    setPayrLoading(true);
    try {
      const tenantWithFormattedAmount = profile.tenant?.map((t) => ({
        ...t,
        amount: formatAmountToTwoDecimals(t.amount),
      })) ?? [];
      const { student_id: _legacy, ...profileRest } = profile as typeof profile & { student_id?: number };
      const payload: PayrOnboardingPayload = {
        ...profileRest,
        user_id: profile.user_id ?? _legacy ?? Math.floor(100000000000 + Math.random() * 900000000000),
        tenant: tenantWithFormattedAmount,
      };
      const res = await fetch("/api/payr-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: payload,
          isOnboardedToPayr: profile.isOnboardedToPayr ?? false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 400 && data.error?.includes("Profile required")) {
          router.push("/profile");
          return;
        }
        throw new Error(data.error || "Onboarding failed");
      }

      if (!(profile.isOnboardedToPayr ?? false)) {
        markOnboarded(user.email);
      }

      let url = data.url;
      if (typeof url === "string" && schedule?.tenancy_id) {
        const parsed = new URL(url);
        parsed.searchParams.set("tenancy_id", schedule.tenancy_id);
        url = parsed.toString();
      }
      setIframeSrc(url ?? "");
      setModalOpen(true);
    } catch (err) {
      console.error("Payr error:", err instanceof Error ? err.message : "Failed to start payment", err);
    } finally {
      setPayrLoading(false);
    }
  };

  const handlePaymentComplete = (isSuccess: boolean) => {
    setModalOpen(false);
    setIframeSrc(null);
    fetchSchedule(true).then((data) => {
      setSchedule(data);
      router.push(
        `/checkout/feedback?success=${isSuccess ? "true" : "false"}`
      );
    });
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setIframeSrc(null);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">Loading...</p>
        </div>
      </PageLayout>
    );
  }

  if (!schedule) {
    return (
      <PageLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">Failed to load checkout data</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
        <CheckoutSummary
          schedule={schedule}
          onPayWithPayr={handlePayWithPayr}
          isPayrLoading={payrLoading}
          hasProfile={hasProfile}
        />
      </div>

      <PayrModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        iframeSrc={iframeSrc ?? ""}
        onPaymentComplete={handlePaymentComplete}
      />
    </PageLayout>
  );
}
