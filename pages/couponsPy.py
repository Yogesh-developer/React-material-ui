VALID_COUPONS = {"SAVE10": 10, "HELLO5": 5, "SUMMER20": 20}

def get_discount(code):
    return VALID_COUPONS.get(code.strip().upper(), 0)
