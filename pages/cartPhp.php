<?php
require 'couponsPhp.php';

function applyCoupon($code, $total) {
  $discount = getDiscount($code);
  return $total - $discount;  // ❌ Could be negative
}
?>
