// pages/CartPage.tsx
import { useState } from "react";
import { CouponInput } from "./CouponInput";
import { PriceSummary } from "./PriceSummary";
import { getDiscountForCoupon } from "./utils/coupons"; // cross-file

export default function CartPage() {
  const [total, setTotal] = useState(200);
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState("");

  const applyCoupon = (code: string) => {
    const discountAmount = getDiscountForCoupon(code); // ❌ missing validation
    if (discountAmount === 0) {
      setError("Invalid coupon code");
    }
    setDiscount(discountAmount);
    setTotal(total - discountAmount); // ❌ No min cap, could go negative
  };

  return (
    <div>
      <h1>Your Cart</h1>
      <CouponInput onApply={applyCoupon} />
      {error && <div>{error}</div>}
      <PriceSummary total={total} discount={discount} />
    </div>
  );
}
