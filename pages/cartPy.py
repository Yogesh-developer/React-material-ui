from couponsPy import get_discount

def apply_coupon(code, total):
    discount = get_discount(code)
    new_total = total - discount  # ❌ No check for negative total
    return new_total
