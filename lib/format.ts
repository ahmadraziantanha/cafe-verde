export function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Display: (xxx) xxx-xxxx from +1xxxxxxxxxx or any 10-digit string.
export function formatPhoneUS(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^1/, '');
  if (digits.length !== 10) return raw;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Store: +1xxxxxxxxxx (E.164 for Supabase phone auth)
export function toE164US(raw: string): string | null {
  const digits = raw.replace(/\D/g, '').replace(/^1/, '');
  if (digits.length !== 10) return null;
  return `+1${digits}`;
}
