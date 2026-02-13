"use client";

import Link from "next/link";

export function ProfileWarningCard() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 shrink-0 text-amber-600"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <p className="text-sm font-medium">Please complete your profile to be able to pay rent.</p>
          <Link
            href="/profile"
            className="mt-2 inline-block text-sm font-medium text-amber-700 underline hover:text-amber-900"
          >
            Go to Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
