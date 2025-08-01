<?php
function getDiscount($code) {
  $coupons = [
    'SAVE10' => 10,
    'HELLO5' => 5,
    'SUMMER20' => 20
  ];
  $code = strtoupper(trim($code));
  return $coupons[$code] ?? 0;
}
?>
