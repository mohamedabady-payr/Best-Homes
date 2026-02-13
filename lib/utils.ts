import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format amount string to exactly 2 decimal places (Payr backend requires this) */
export function formatAmountToTwoDecimals(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return "0.00";
  return (Math.round(num * 100) / 100).toFixed(2);
}

/** Recursively format all "amount" fields in an object to 2 decimal places */
export function formatAmountsInPayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => formatAmountsInPayload(item)) as T;
  }
  if (typeof obj === "object") {
    const result = {} as Record<string, unknown>;
    for (const [key, value] of Object.entries(obj)) {
      result[key] =
        key === "amount"
          ? formatAmountToTwoDecimals(value as string | number)
          : formatAmountsInPayload(value);
    }
    return result as T;
  }
  return obj;
}
