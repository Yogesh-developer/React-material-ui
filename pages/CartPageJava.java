public class CartPage {
    public int applyCoupon(String code, int total) {
        int discount = CouponUtils.getDiscount(code);
        return total - discount;  // ❌ Could go below 0
    }
}
