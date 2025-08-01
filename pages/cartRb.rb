require_relative 'couponsRb'

def apply_coupon(code, total)
  discount = get_discount(code)
  total - discount  # ❌ No floor check
end
