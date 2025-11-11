import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate receipt number from device ID and creation date
export function generateReceiptNumber(deviceId: string, createdAt: string): string {
  const date = createdAt ? new Date(createdAt) : new Date();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const shortId = deviceId.toString().slice(-2);
  return `SolNet-${month}${day}${shortId}`;
}
