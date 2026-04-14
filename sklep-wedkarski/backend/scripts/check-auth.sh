#!/usr/bin/env bash
set -eu

BASE_URL="${BASE_URL:-http://localhost:3000}"
TS="$(date +%s)"
USERNAME="test_user_${TS}"
EMAIL="test_${TS}@example.com"
PASSWORD="haslo1234"

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

request "POST" "/auth/register" "{\"username\":\"$USERNAME\",\"firstName\":\"Jan\",\"lastName\":\"Kowalski\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"confirmPassword\":\"$PASSWORD\"}"
assert_status "201" "$STATUS" "register success"
printf '%s\n' "$BODY" | grep -q '"redirectTo":"/profile"' || { echo "[FAIL] register redirect missing"; echo "Body: $BODY"; exit 1; }
echo "[OK] register redirect /profile"

request "POST" "/auth/register" "{\"username\":\"$USERNAME\",\"firstName\":\"Jan\",\"lastName\":\"Kowalski\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"confirmPassword\":\"$PASSWORD\"}"
assert_status "409" "$STATUS" "register duplicate"

request "POST" "/auth/login" "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
assert_status "200" "$STATUS" "login success"
printf '%s\n' "$BODY" | grep -q '"redirectTo":"/dashboard"' || { echo "[FAIL] login redirect missing"; echo "Body: $BODY"; exit 1; }
TOKEN="$(printf '%s\n' "$BODY" | sed -E 's/.*"accessToken":"([^"]+)".*/\1/')"
if [ -z "$TOKEN" ] || [ "$TOKEN" = "$BODY" ]; then
  echo "[FAIL] accessToken missing"
  echo "Body: $BODY"
  exit 1
fi
echo "[OK] login redirect /dashboard"
echo "[OK] accessToken present"

request "POST" "/auth/login" "{\"email\":\"$EMAIL\",\"password\":\"zlehaslo\"}"
assert_status "401" "$STATUS" "login invalid password"

request "GET" "/profile" "" "$TOKEN"
assert_status "200" "$STATUS" "profile read"
printf '%s\n' "$BODY" | grep -q "\"email\":\"$EMAIL\"" || { echo "[FAIL] profile email mismatch"; echo "Body: $BODY"; exit 1; }
echo "[OK] profile contains created user"

request "PATCH" "/profile" "{\"newPassword\":\"Nowehaslo123\"}" "$TOKEN"
assert_status "400" "$STATUS" "profile change password without current"

request "PATCH" "/profile" "{\"firstName\":\"Janusz\"}" "$TOKEN"
assert_status "200" "$STATUS" "profile update firstName"

request "GET" "/profile"
assert_status "401" "$STATUS" "profile read without token"

echo "All auth/profile checks passed."
