import java.util.Map;

public class CouponUtils {
    static Map<String, Integer> validCoupons = Map.of(
        "SAVE10", 10,
        "HELLO5", 5,
        "SUMMER20", 20
    );

    public static int getDiscount(String code) {
        return validCoupons.getOrDefault(code.trim().toUpperCase(), 0);
    }
}
