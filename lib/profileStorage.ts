"use client";

import type { PayrProfileInput } from "@/types/payr";

const PROFILES_KEY = "best_homes_profiles";

export interface StoredProfile extends Omit<PayrProfileInput, "student_id"> {
  student_id?: number;
  isOnboardedToPayr?: boolean;
}

function getProfiles(): Record<string, StoredProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setProfiles(profiles: Record<string, StoredProfile>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function getProfile(email: string): StoredProfile | null {
  const profiles = getProfiles();
  const key = email.trim().toLowerCase();
  return profiles[key] ?? null;
}

export function setProfile(email: string, profile: PayrProfileInput): StoredProfile {
  const profiles = getProfiles();
  const key = email.trim().toLowerCase();
  const existing = profiles[key];
  const studentId = existing?.student_id ?? Math.floor(100000000000 + Math.random() * 900000000000);
  const payload: StoredProfile = {
    ...profile,
    student_id: studentId,
    isOnboardedToPayr: existing?.isOnboardedToPayr ?? false,
  };
  profiles[key] = payload;
  setProfiles(profiles);
  return payload;
}

export function markOnboarded(email: string): void {
  const profiles = getProfiles();
  const key = email.trim().toLowerCase();
  const existing = profiles[key];
  if (existing) {
    profiles[key] = { ...existing, isOnboardedToPayr: true };
    setProfiles(profiles);
  }
}
