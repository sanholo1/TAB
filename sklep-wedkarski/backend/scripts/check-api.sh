#!/usr/bin/env bash
set -eu

BASE_URL="${BASE_URL:-http://localhost:3000}"

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


TEST_EMAIL="apitest_$(date +%s)@example.com"
TEST_PASS="Test1234!"

request "POST" "/auth/register" "{\"username\":\"apitest$(date +%s)\",\"firstName\":\"API\",\"lastName\":\"Test\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\",\"confirmPassword\":\"$TEST_PASS\"}"
if [ "$STATUS" != "201" ]; then
  echo "[WARN] Register failed ($STATUS), trying login with existing account..."
fi

request "POST" "/auth/login" "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}"
if [ "$STATUS" != "200" ]; then
  echo "[FAIL] Login failed -> $STATUS"
  echo "Body: $BODY"
  exit 1
fi

TOKEN="$(printf '%s\n' "$BODY" | sed -E 's/.*"accessToken":"([^"]+)".*/\1/')"
echo "[OK] Auth token obtained"
echo ""

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

echo ""
echo "=== PRODUCTS ==="

request "GET" "/products"
assert_status "200" "$STATUS" "GET /products"
printf '%s\n' "$BODY" | grep -q '\[' || { echo "[FAIL] /products should return array"; exit 1; }
echo "[OK] /products returns array"

request "GET" "/products?search=a"
assert_status "200" "$STATUS" "GET /products?search=a"

request "GET" "/products?min_price=10&max_price=500"
assert_status "200" "$STATUS" "GET /products?min_price=10&max_price=500"

if [ -n "$FIRST_CATEGORY_ID" ] && [ "$FIRST_CATEGORY_ID" != "$BODY" ]; then
  request "GET" "/products?category=$FIRST_CATEGORY_ID"
  assert_status "200" "$STATUS" "GET /products?category=$FIRST_CATEGORY_ID"
fi

FIRST_PRODUCT_ID="$(printf '%s\n' "$BODY" | sed -E 's/.*"id_przedmiotu":([0-9]+).*/\1/' | head -1)"
if [ -n "$FIRST_PRODUCT_ID" ] && [ "$FIRST_PRODUCT_ID" != "$BODY" ]; then
  request "GET" "/products/$FIRST_PRODUCT_ID"
  assert_status "200" "$STATUS" "GET /products/$FIRST_PRODUCT_ID"
  printf '%s\n' "$BODY" | grep -q "\"id_przedmiotu\":$FIRST_PRODUCT_ID" || { echo "[FAIL] product id mismatch"; exit 1; }
  echo "[OK] /products/:id returns correct product"

  request "GET" "/products/$FIRST_PRODUCT_ID/reviews"
  assert_status "200" "$STATUS" "GET /products/$FIRST_PRODUCT_ID/reviews"
  printf '%s\n' "$BODY" | grep -q '\[' || { echo "[FAIL] /reviews should return array"; exit 1; }
  echo "[OK] /products/:id/reviews returns array"

  request "POST" "/products/$FIRST_PRODUCT_ID/reviews" "{\"ocena\":10,\"komentarz\":\"za wysokie\"}" "$TOKEN"
  assert_status "400" "$STATUS" "POST /products/:id/reviews invalid rating"

  request "POST" "/products/$FIRST_PRODUCT_ID/reviews" "{\"ocena\":4,\"komentarz\":\"dobry produkt\"}" "$TOKEN"
  assert_status "201" "$STATUS" "POST /products/:id/reviews valid"
fi

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
fi

echo ""
echo "All API checks passed."
