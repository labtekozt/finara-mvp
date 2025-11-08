import { format } from "date-fns";

export function generateTransactionNumber(prefix: string): string {
  const date = format(new Date(), "yyyyMMdd");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${date}-${random}`;
}

export function generateKasirNumber(): string {
  return generateTransactionNumber("KSR");
}

export function generateMasukNumber(): string {
  return generateTransactionNumber("MSK");
}

export function generateKeluarNumber(): string {
  return generateTransactionNumber("KLR");
}
