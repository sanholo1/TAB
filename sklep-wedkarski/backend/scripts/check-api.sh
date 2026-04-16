#!/usr/bin/env bash
set -eu

BASE_URL="${BASE_URL:-http://localhost:3000}"
TS="$(date +%s)"
TEST_EMAIL="apitest_${TS}@example.com"
TEST_PASSWORD="Testpass1"
TOKEN=""
GUEST_TOKEN=""
ALL_PRODUCTS_BODY=""
FIRST_PRODUCT_ID=""

STATUS=""
BODY=""

request() {
  method="$1"
  path="$2"
  body="${3:-}"
  auth="${4:-}"

  tmp_body="$(mktemp)"

  if [ -n "$body" ] && [ -n "$auth" ]; then
    STATUS="$(curl -sS -o "$tmp_body" -w "%{http_code}" -X "$method" "$BASE_URL$path" -H "Content-Type: application/json" -H "Authorization: Bearer $auth" -d "$body")"
  elif [ -n "$body" ]; then
    STATUS="$(curl -sS -o "$tmp_body" -w "%{http_code}" -X "$method" "$BASE_URL$path" -H "Content-Type: application/json" -d "$body")"
  elif [ -n "$auth" ]; then
    STATUS="$(curl -sS -o "$tmp_body" -w "%{http_code}" -X "$method" "$BASE_URL$path" -H "Authorization: Bearer $auth")"
  else
    STATUS="$(curl -sS -o "$tmp_body" -w "%{http_code}" -X "$method" "$BASE_URL$path")"
  fi

  BODY="$(cat "$tmp_body")"
  rm -f "$tmp_body"
}

assert_status() {
  expected="$1"
  actual="$2"
  label="$3"

  if [ "$expected" != "$actual" ]; then
    echo "[FAIL] $label -> expected $expected, got $actual"
    echo "Body: $BODY"
    exit 1
  fi

  echo "[OK] $label -> $actual"
}

echo "BASE_URL=$BASE_URL"
echo ""

# ── Setup: register + login test user ──────────────────────────────────────────
request "POST" "/auth/register" "{\"username\":\"apitest_${TS}\",\"firstName\":\"Api\",\"lastName\":\"Test\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"confirmPassword\":\"$TEST_PASSWORD\"}"
assert_status "201" "$STATUS" "setup: register test user"

request "POST" "/auth/login" "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}"
assert_status "200" "$STATUS" "setup: login test user"
TOKEN="$(printf '%s\n' "$BODY" | sed -E 's/.*"accessToken":"([^"]+)".*/\1/')"
if [ -z "$TOKEN" ] || [ "$TOKEN" = "$BODY" ]; then
  echo "[FAIL] setup: accessToken missing"
  echo "Body: $BODY"
  exit 1
fi
echo "[OK] setup: token obtained"
echo ""

# ── Categories ─────────────────────────────────────────────────────────────────
echo "=== CATEGORIES ==="

request "GET" "/categories"
assert_status "200" "$STATUS" "GET /categories"
printf '%s\n' "$BODY" | grep -q '\[' || { echo "[FAIL] /categories should return array"; exit 1; }
echo "[OK] /categories returns array"

FIRST_CATEGORY_ID="$(printf '%s\n' "$BODY" | sed -E 's/.*"id_kategorii":([0-9]+).*/\1/' | head -1)"
if [ -n "$FIRST_CATEGORY_ID" ] && [ "$FIRST_CATEGORY_ID" != "$BODY" ]; then
  request "GET" "/categories/$FIRST_CATEGORY_ID"
  assert_status "200" "$STATUS" "GET /categories/$FIRST_CATEGORY_ID"
  printf '%s\n' "$BODY" | grep -q "\"id_kategorii\":$FIRST_CATEGORY_ID" || { echo "[FAIL] category id mismatch"; exit 1; }
  echo "[OK] /categories/:id returns correct category"
fi

# ── Products ───────────────────────────────────────────────────────────────────
echo ""
echo "=== PRODUCTS ==="

request "GET" "/products"
assert_status "200" "$STATUS" "GET /products"
printf '%s\n' "$BODY" | grep -q '\[' || { echo "[FAIL] /products should return array"; exit 1; }
echo "[OK] /products returns array"
ALL_PRODUCTS_BODY="$BODY"

FIRST_PRODUCT_ID="$(node -e 'const items = JSON.parse(process.argv[1]); const product = items.find((item) => Number(item.ilosc) > 2); if (product) process.stdout.write(String(product.id_przedmiotu));' "$ALL_PRODUCTS_BODY")"
if [ -z "$FIRST_PRODUCT_ID" ]; then
  echo "[FAIL] no product with stock above 2 available for cart/order checks"
  exit 1
fi

request "GET" "/products?search=a"
assert_status "200" "$STATUS" "GET /products?search=a"

request "GET" "/products?min_price=10&max_price=500"
assert_status "200" "$STATUS" "GET /products?min_price=10&max_price=500"

if [ -n "$FIRST_CATEGORY_ID" ] && [ "$FIRST_CATEGORY_ID" != "$BODY" ]; then
  request "GET" "/products?category=$FIRST_CATEGORY_ID"
  assert_status "200" "$STATUS" "GET /products?category=$FIRST_CATEGORY_ID"
fi

if [ -n "$FIRST_PRODUCT_ID" ] && [ "$FIRST_PRODUCT_ID" != "$BODY" ]; then
  request "GET" "/products/$FIRST_PRODUCT_ID"
  assert_status "200" "$STATUS" "GET /products/$FIRST_PRODUCT_ID"
  printf '%s\n' "$BODY" | grep -q "\"id_przedmiotu\":$FIRST_PRODUCT_ID" || { echo "[FAIL] product id mismatch"; exit 1; }
  echo "[OK] /products/:id returns correct product"

  request "GET" "/products/$FIRST_PRODUCT_ID/reviews"
  assert_status "200" "$STATUS" "GET /products/$FIRST_PRODUCT_ID/reviews"
  printf '%s\n' "$BODY" | grep -q '\[' || { echo "[FAIL] /reviews should return array"; exit 1; }
  echo "[OK] /products/:id/reviews returns array"
fi

# ── Cart ───────────────────────────────────────────────────────────────────────
echo ""
echo "=== CART ==="

request "GET" "/cart" "" "$TOKEN"
assert_status "200" "$STATUS" "GET /cart"
printf '%s\n' "$BODY" | grep -q '\[' || { echo "[FAIL] /cart should return array"; exit 1; }
echo "[OK] /cart returns array"

request "POST" "/cart" "{\"id_przedmiotu\":0,\"ilosc\":0}" "$TOKEN"
assert_status "400" "$STATUS" "POST /cart invalid payload"

if [ -n "$FIRST_PRODUCT_ID" ] && [ "$FIRST_PRODUCT_ID" != "$BODY" ]; then
  request "POST" "/cart" "{\"id_przedmiotu\":$FIRST_PRODUCT_ID,\"ilosc\":2}" "$TOKEN"
  assert_status "201" "$STATUS" "POST /cart add product"

  request "POST" "/cart" "{\"id_przedmiotu\":$FIRST_PRODUCT_ID,\"ilosc\":1}" "$TOKEN"
  assert_status "200" "$STATUS" "POST /cart upsert"

  request "DELETE" "/cart/$FIRST_PRODUCT_ID" "" "$TOKEN"
  assert_status "204" "$STATUS" "DELETE /cart/:id"
fi

# ── Orders ─────────────────────────────────────────────────────────────────────
echo ""
echo "=== ORDERS ==="

if [ -n "$FIRST_PRODUCT_ID" ] && [ "$FIRST_PRODUCT_ID" != "$BODY" ]; then
  request "GET" "/orders" "" "$TOKEN"
  assert_status "200" "$STATUS" "GET /orders before create"
  printf '%s\n' "$BODY" | grep -q '\[' || { echo "[FAIL] /orders should return array"; exit 1; }
  echo "[OK] /orders returns array"

  request "POST" "/cart" "{\"id_przedmiotu\":$FIRST_PRODUCT_ID,\"ilosc\":1}" "$TOKEN"
  assert_status "201" "$STATUS" "setup: POST /cart add product for order"

  request "POST" "/orders" "{}" "$TOKEN"
  assert_status "400" "$STATUS" "POST /orders invalid payload"

  request "POST" "/orders" "{\"email\":\"test@test.pl\",\"miasto\":\"Warszawa\",\"kod_pocztowy\":\"00-001\",\"ulica\":\"Prosta\",\"nr_domu\":\"10A\"}" "$TOKEN"
  assert_status "201" "$STATUS" "POST /orders create order"
  printf '%s\n' "$BODY" | grep -q '"id_transakcji":' || { echo "[FAIL] /orders should return created order"; exit 1; }
  echo "[OK] /orders returns created order"

  CREATED_ORDER_ID="$(printf '%s\n' "$BODY" | sed -nE 's/.*"id_transakcji":([0-9]+).*/\1/p' | head -1)"

 
  request "GET" "/orders/$CREATED_ORDER_ID" "" "$TOKEN"
  assert_status "200" "$STATUS" "GET /orders/:id"
  printf '%s\n' "$BODY" | grep -q "\"id_transakcji\":$CREATED_ORDER_ID" || { echo "[FAIL] order id mismatch"; exit 1; }
  echo "[OK] /orders/:id returns correct order"


  request "PATCH" "/orders/$CREATED_ORDER_ID/status" "{\"stan\":\"ZREALIZOWANE\"}" "$TOKEN"
  assert_status "200" "$STATUS" "PATCH /orders/:id/status"
  printf '%s\n' "$BODY" | grep -q "\"stan\":\"ZREALIZOWANE\"" || { echo "[FAIL] order status update failed"; exit 1; }
  echo "[OK] /orders/:id/status updated successfully"

 
  echo "--- Testing reviews after purchase ---"
  request "POST" "/products/$FIRST_PRODUCT_ID/reviews" "{\"ocena\":10,\"komentarz\":\"za wysokie\"}" "$TOKEN"
  assert_status "400" "$STATUS" "POST /products/:id/reviews invalid rating"

  request "POST" "/products/$FIRST_PRODUCT_ID/reviews" "{\"ocena\":4,\"komentarz\":\"dobry produkt\"}" "$TOKEN"
  assert_status "201" "$STATUS" "POST /products/:id/reviews valid"
  echo "--- Reviews tested successfully ---"

  
  request "GET" "/orders/last-address" "" "$TOKEN"
  assert_status "200" "$STATUS" "GET /orders/last-address"
  printf '%s\n' "$BODY" | grep -q '"address":' || { echo "[FAIL] /orders/last-address failed"; exit 1; }
  echo "[OK] /orders/last-address returns address"

  request "GET" "/cart" "" "$TOKEN"
  assert_status "200" "$STATUS" "GET /cart after order"
  printf '%s\n' "$BODY" | grep -q '^\[\]$' || { echo "[FAIL] /cart should be empty after order"; exit 1; }
  echo "[OK] /cart is empty after order"

  request "GET" "/orders" "" "$TOKEN"
  assert_status "200" "$STATUS" "GET /orders after create"
  printf '%s\n' "$BODY" | grep -q "\"id_transakcji\":$CREATED_ORDER_ID" || { echo "[FAIL] /orders history should include created order"; exit 1; }
  echo "[OK] /orders history contains created order"
fi

request "POST" "/auth/login" "{\"email\":\"gosc@sklep.pl\",\"password\":\"haslo123\"}"
assert_status "200" "$STATUS" "setup: login guest user"
GUEST_TOKEN="$(printf '%s\n' "$BODY" | sed -E 's/.*"accessToken":"([^"]+)".*/\1/')"
if [ -z "$GUEST_TOKEN" ] || [ "$GUEST_TOKEN" = "$BODY" ]; then
  echo "[FAIL] setup: guest accessToken missing"
  echo "Body: $BODY"
  exit 1
fi
echo "[OK] setup: guest token obtained"

request "GET" "/cart" "" "$GUEST_TOKEN"
assert_status "200" "$STATUS" "GET /cart guest before create"
GUEST_CART_IDS="$(node -e 'const items = JSON.parse(process.argv[1]); process.stdout.write(items.map((item) => String(item.id_przedmiotu)).join(" "));' "$BODY")"
if [ -n "$GUEST_CART_IDS" ]; then
  for CART_ITEM_ID in $GUEST_CART_IDS; do
    request "DELETE" "/cart/$CART_ITEM_ID" "" "$GUEST_TOKEN"
    assert_status "204" "$STATUS" "setup: DELETE /cart/$CART_ITEM_ID guest cleanup"
  done
fi

request "POST" "/cart" "{\"id_przedmiotu\":$FIRST_PRODUCT_ID,\"ilosc\":1}" "$GUEST_TOKEN"
if [ "$STATUS" != "201" ] && [ "$STATUS" != "200" ]; then
  echo "[FAIL] setup: POST /cart add product for guest order -> expected 201 or 200, got $STATUS"
  echo "Body: $BODY"
  exit 1
fi
echo "[OK] setup: POST /cart add product for guest order -> $STATUS"

request "POST" "/orders" "{\"email\":\"test@test.pl\",\"miasto\":\"Warszawa\",\"kod_pocztowy\":\"00-001\",\"ulica\":\"Prosta\",\"nr_domu\":\"10A\"}" "$GUEST_TOKEN"
assert_status "201" "$STATUS" "POST /orders guest create order"
printf '%s\n' "$BODY" | grep -q '"id_transakcji":' || { echo "[FAIL] guest /orders should return created order"; exit 1; }
echo "[OK] guest /orders returns created order"

GUEST_ORDER_ID="$(printf '%s\n' "$BODY" | sed -nE 's/.*"id_transakcji":([0-9]+).*/\1/p' | head -1)"

request "GET" "/cart" "" "$GUEST_TOKEN"
assert_status "200" "$STATUS" "GET /cart guest after order"
printf '%s\n' "$BODY" | grep -q '^\[\]$' || { echo "[FAIL] guest /cart should be empty after order"; exit 1; }
echo "[OK] guest /cart is empty after order"

request "GET" "/orders" "" "$GUEST_TOKEN"
assert_status "200" "$STATUS" "GET /orders guest after create"
printf '%s\n' "$BODY" | grep -q "\"id_transakcji\":$GUEST_ORDER_ID" || { echo "[FAIL] guest /orders history should include created order"; exit 1; }
echo "[OK] guest /orders history contains created order"

request "POST" "/orders/guest" "{\"email\":\"test@test.pl\",\"miasto\":\"Warszawa\",\"kod_pocztowy\":\"00-001\",\"ulica\":\"Prosta\",\"nr_domu\":\"10A\",\"items\":[{\"id_przedmiotu\":$FIRST_PRODUCT_ID,\"ilosc\":1}]}"
assert_status "201" "$STATUS" "POST /orders/guest anonymous create order"
printf '%s\n' "$BODY" | grep -q '"id_transakcji":' || { echo "[FAIL] anonymous guest /orders/guest should return created order"; exit 1; }
echo "[OK] anonymous guest /orders/guest returns created order"

ANON_GUEST_ORDER_ID="$(printf '%s\n' "$BODY" | sed -nE 's/.*"id_transakcji":([0-9]+).*/\1/p' | head -1)"

request "GET" "/orders" "" "$GUEST_TOKEN"
assert_status "200" "$STATUS" "GET /orders guest after anonymous create"
printf '%s\n' "$BODY" | grep -q "\"id_transakcji\":$ANON_GUEST_ORDER_ID" || { echo "[FAIL] guest /orders history should include anonymous created order"; exit 1; }
echo "[OK] guest /orders history contains anonymous created order"

echo ""
echo "All API checks passed."
