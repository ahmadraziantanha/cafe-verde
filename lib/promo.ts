// Hardcoded promo codes for the demo. Real implementation would query a table.
//
// Discount is expressed as a percentage (10 = 10% off subtotal, before delivery fee).
// Returns null if the code is not recognised.

const CODES: Record<string, { percentOff: number; label: string }> = {
  VERDE10:    { percentOff: 10, label: '10% off' },
  WELCOME:    { percentOff: 15, label: '15% off your first order' },
};

export interface PromoApplied {
  code: string;
  label: string;
  percentOff: number;
  amount: number; // computed dollar discount
}

export function lookupPromo(code: string, subtotal: number): PromoApplied | null {
  const normalized = code.trim().toUpperCase();
  const entry = CODES[normalized];
  if (!entry) return null;
  return {
    code: normalized,
    label: entry.label,
    percentOff: entry.percentOff,
    amount: Number((subtotal * (entry.percentOff / 100)).toFixed(2)),
  };
}
