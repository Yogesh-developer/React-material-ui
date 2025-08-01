use std::collections::HashMap;

pub fn get_discount(code: &str) -> i32 {
    let valid = HashMap::from([
        ("SAVE10", 10),
        ("HELLO5", 5),
        ("SUMMER20", 20),
    ]);
    *valid.get(&code.trim().to_uppercase() as &str).unwrap_or(&0)
}
