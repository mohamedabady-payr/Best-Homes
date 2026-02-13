"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/templates/PageLayout";
import { ProfileWarningCard } from "@/components/molecules/ProfileWarningCard";
import { RentSchedule } from "@/components/organisms/RentSchedule";
import { useAuth } from "@/lib/AuthContext";
import { getProfile } from "@/lib/profileStorage";
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
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [profile, setProfileState] = useState<ReturnType<typeof getProfile>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/schedule")
      .then((res) => res.json())
      .then((data) => setSchedule(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.email) {
      setProfileState(getProfile(user.email));
    }
  }, [user?.email]);

  const showProfileWarning = !isProfileComplete(profile);

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
          <RentSchedule schedule={schedule} />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">Failed to load schedule</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
