// utils/coupons.ts
export const validCoupons = {
  SAVE10: 10,
  HELLO5: 5,
  SUMMER20: 20,
};

export function getDiscountForCoupon(code: string): number {
  if (!code) return 0;
  const normalized = code.trim().toUpperCase();
  return validCoupons[normalized] || 0;
}
