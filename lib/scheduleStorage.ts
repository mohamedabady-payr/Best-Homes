"use client";

import type { ScheduleResponse } from "@/types/schedule";

const SCHEDULES_KEY = "best_homes_schedules";

export function getTenancyId(email: string): string {
  const slug = email.trim().toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  return `bh-${slug || "tenant"}`;
}

function getSchedules(): Record<string, ScheduleResponse> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SCHEDULES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setSchedules(schedules: Record<string, ScheduleResponse>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
}

export function getSchedule(email: string): ScheduleResponse | null {
  const schedules = getSchedules();
  const key = email.trim().toLowerCase();
  return schedules[key] ?? null;
}

export function setSchedule(email: string, schedule: ScheduleResponse): void {
  const schedules = getSchedules();
  const key = email.trim().toLowerCase();
  const tenancyId = schedule.tenancy_id || getTenancyId(email);
  schedules[key] = { ...schedule, tenancy_id: tenancyId };
  setSchedules(schedules);
}

export function markFirstPendingPaid(email: string): void {
  const schedules = getSchedules();
  const key = email.trim().toLowerCase();
  const schedule = schedules[key];
  if (!schedule) return;

  const firstPendingIdx = schedule.installments.findIndex((i) => i.status === "pending");
  if (firstPendingIdx < 0) return;

  const updated = [...schedule.installments];
  updated[firstPendingIdx] = {
    ...updated[firstPendingIdx],
    status: "paid",
  };
  schedules[key] = { ...schedule, installments: updated };
  setSchedules(schedules);
}
