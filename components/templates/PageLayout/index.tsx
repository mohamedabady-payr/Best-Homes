"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/atoms/AuthGuard";
import { useAuth } from "@/lib/AuthContext";

export interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="text-xl font-bold text-slate-900">
              Best Homes
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Schedule
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Profile
              </Link>
              <Link
                href="/checkout"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Checkout
              </Link>
              {user && (
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Logout
                </button>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
