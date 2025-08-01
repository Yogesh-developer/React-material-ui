import "strings"

var validCoupons = map[string]int{
	"SAVE10":   10,
	"HELLO5":   5,
	"SUMMER20": 20,
}

func GetDiscount(code string) int {
	code = strings.ToUpper(strings.TrimSpace(code))
	return validCoupons[code]
}
