VALID_COUPONS = {
  "SAVE10" => 10,
  "HELLO5" => 5,
  "SUMMER20" => 20
}

def get_discount(code)
  VALID_COUPONS[code.strip.upcase] || 0
end
