mod couponsRs;

pub fn apply_coupon(code: &str, total: i32) -> i32 {
    let discount = coupons::get_discount(code);
    total - discount  // ❌ Could be negative
}
