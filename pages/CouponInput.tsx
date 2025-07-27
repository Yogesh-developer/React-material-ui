// components/CouponInput.tsx
import React from "react";

type Props = {
  onApply: (code: string) => void;
};

export function CouponInput({ onApply }: Props) {
  const [code, setCode] = React.useState("");

  return (
    <div>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter coupon code"
      />
      <button onClick={() => onApply(code)}>Apply</button>
    </div>
  );
}
