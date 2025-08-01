#include "couponsH.h"
#include <algorithm>

std::map<std::string, int> validCoupons = {
    {"SAVE10", 10}, {"HELLO5", 5}, {"SUMMER20", 20}
};

int getDiscount(std::string code) {
    std::transform(code.begin(), code.end(), code.begin(), ::toupper);
    return validCoupons.count(code) ? validCoupons[code] : 0;
}
