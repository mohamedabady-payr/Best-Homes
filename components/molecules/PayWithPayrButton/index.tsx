"use client";

import Image from "next/image";
import { Button } from "@/components/atoms/Button";

export interface PayWithPayrButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function PayWithPayrButton({ onClick, disabled }: PayWithPayrButtonProps) {
  return (
    <Button
      variant="primary"
      fullWidth
      disabled={disabled}
      onClick={onClick}
      className="flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 focus:ring-blue-300 py-3"
    >
      <Image
        src="/app_logo_header.webp"
        alt="Payr"
        width={32}
        height={32}
        className="h-8 w-8"
      />
      <span>Pay with Payr</span>
    </Button>
  );
}
