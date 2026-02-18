"use client";

import { useCallback, useEffect, useState } from "react";
import { PageLayout } from "@/components/templates/PageLayout";
import { ProfileWarningCard } from "@/components/molecules/ProfileWarningCard";
import { RentSchedule } from "@/components/organisms/RentSchedule";
import { useAuth } from "@/lib/AuthContext";
import { getProfile } from "@/lib/profileStorage";
import { getSchedule, setSchedule, getTenancyId } from "@/lib/scheduleStorage";
import { generateInstallments } from "@/lib/generateInstallments";
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

export default function HomePage() {
  const { user } = useAuth();
  const [schedule, setScheduleState] = useState<ScheduleResponse | null>(null);
  const [profile, setProfileState] = useState<ReturnType<typeof getProfile>>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    const stored = getSchedule(user.email);
    setScheduleState(
      stored ?? { tenancy_id: getTenancyId(user.email), installments: [] }
    );
    setLoading(false);
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      setProfileState(getProfile(user.email));
    }
  }, [user?.email]);

  const handleGenerateInstallments = useCallback(() => {
    if (!user?.email || !profile) return;
    setGenerating(true);
    try {
      const tenant = profile.tenant?.[0];
      const { installments, propertyName } = generateInstallments(tenant);
      const totalRent =
        installments.length > 0
          ? installments.reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0)
          : undefined;
      const newSchedule: ScheduleResponse = {
        tenancy_id: getTenancyId(user.email),
        property_name: propertyName,
        total_rent: totalRent,
        installments,
      };
      setSchedule(user.email, newSchedule);
      setScheduleState(newSchedule);
    } catch (err) {
      console.error("Generate installments error:", err);
    } finally {
      setGenerating(false);
    }
  }, [user?.email, profile]);

  const showProfileWarning = !isProfileComplete(profile);
  const hasNoInstallments = !!(schedule && schedule.installments.length === 0);
  const showGenerateButton = !showProfileWarning && hasNoInstallments;

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Your Rent Schedule
        </h1>
        {showProfileWarning && <ProfileWarningCard />}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">Loading schedule...</p>
          </div>
        ) : schedule ? (
          <RentSchedule
            schedule={schedule}
            showGenerateButton={showGenerateButton}
            onGenerateInstallments={handleGenerateInstallments}
            isGenerating={generating}
          />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">Failed to load schedule</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
