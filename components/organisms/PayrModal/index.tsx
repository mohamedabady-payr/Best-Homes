"use client";

import { useEffect, useCallback } from "react";

const PAYR_ORIGIN = "https://stage.mypayr.co.uk";

export interface PayrModalProps {
  isOpen: boolean;
  onClose: () => void;
  iframeSrc: string;
  onPaymentComplete?: (isSuccess: boolean) => void;
}

export function PayrModal({
  isOpen,
  onClose,
  iframeSrc,
  onPaymentComplete,
}: PayrModalProps) {
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== PAYR_ORIGIN) return;
      const data = event.data;
      if (data && data.type === "payr-payment-complete") {
        onPaymentComplete?.(data.isSuccess ?? false);
        onClose();
      }
    },
    [onClose, onPaymentComplete]
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isOpen, handleMessage]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="flex-1 overflow-hidden rounded-lg">
          <iframe
            src={iframeSrc}
            title="Pay with Payr"
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  );
}
