"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/templates/PageLayout";
import { Button } from "@/components/atoms/Button";

function FeedbackContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";

  return (
    <PageLayout>
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {success ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-600"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">
              Payment Successful
            </h1>
            <p className="mt-2 text-slate-600">
              Your rent payment has been processed successfully.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-600"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">
              Payment Failed
            </h1>
            <p className="mt-2 text-slate-600">
              Something went wrong. Please try again or contact support.
            </p>
          </>
        )}
        <Link href="/" className="mt-6 block">
          <Button fullWidth>Back to Schedule</Button>
        </Link>
      </div>
    </PageLayout>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-500">Loading...</p>
          </div>
        </PageLayout>
      }
    >
      <FeedbackContent />
    </Suspense>
  );
}
