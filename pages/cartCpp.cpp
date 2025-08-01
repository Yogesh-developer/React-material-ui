#include "couponsh.h"
#include <iostream>

int applyCoupon(std::string code, int total) {
    int discount = getDiscount(code);
    return total - discount;  // ❌ Unsafe math
}
