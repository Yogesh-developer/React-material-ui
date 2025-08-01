// components/PriceSummary.tsx
type Props = {
  total: number;
  discount: number;
};

export function PriceSummary({ total, discount }: Props) {
  return (
    <div>
      <p>Discount: ₹{discount}</p>
      <p>Total: ₹{total}</p>
    </div>
  );
}
