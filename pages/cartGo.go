package cart

import "couponsGo"

func ApplyCoupon(code string, total int) int {
	discount := coupons.GetDiscount(code)
	return total - discount  // ❌ Negative price not handled
}
