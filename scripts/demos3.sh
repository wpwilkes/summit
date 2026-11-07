#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
set -a
source "$ROOT/.env"
set +a

BASE_URL="http://localhost:3000"
PASSWORD="demoPassword123!"
SUFFIX="$(date +%s)$RANDOM"

EMAIL_A="demo-a-${SUFFIX}@example.com"
EMAIL_B="demo-b-${SUFFIX}@example.com"
USER_A="demoa${SUFFIX}"
USER_B="demob${SUFFIX}"
COMMUNITY="demo${SUFFIX}"

# ============================================================
# AUTOMATIC USER SETUP
# ============================================================

echo "Creating demo users..."

for letter in A B; do
  if [[ "$letter" == A ]]; then
    email="$EMAIL_A"
    username="$USER_A"
  else
    email="$EMAIL_B"
    username="$USER_B"
  fi

  curl -fsS -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "$(jq -nc \
      --arg email "$email" \
      --arg username "$username" \
      --arg password "$PASSWORD" \
      '{email:$email,username:$username,password:$password}')" \
    >/dev/null
done

(
  cd "$ROOT/app/server"

  echo "UPDATE users SET \"emailVerified\" = true
        WHERE email IN ('$EMAIL_A', '$EMAIL_B');" |
    npx prisma db execute --stdin
)

LOGIN_A="$(curl -fsS -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "$(jq -nc --arg email "$EMAIL_A" --arg password "$PASSWORD" \
    '{email:$email,password:$password}')")"

LOGIN_B="$(curl -fsS -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "$(jq -nc --arg email "$EMAIL_B" --arg password "$PASSWORD" \
    '{email:$email,password:$password}')")"

TOKEN_A="$(jq -er '.token' <<< "$LOGIN_A")"
TOKEN_B="$(jq -er '.token' <<< "$LOGIN_B")"

echo "User A: $USER_A"
echo "User B: $USER_B"
echo "Both users registered and logged in."
echo
echo "SUMMIT — ANONYMOUS CONTENT API DEMO"

# ============================================================
# INTERACTIVE DEMO
# ============================================================

LAST_JSON=""

run_step() {
  local description="$1" method="$2" path="$3"
  local expected="$4" auth="$5" body="${6:-}"
  local token="" status response
  local -a args=(-sS -X "$method")

  case "$auth" in
    A) token="$TOKEN_A" ;;
    B) token="$TOKEN_B" ;;
    public) ;;
  esac

  printf '\n============================================================\n'
  echo "$description"
  printf '============================================================\n'
  printf 'curl -X %s "%s%s"' "$method" "$BASE_URL" "$path"

  if [[ -n "$token" ]]; then
    printf ' \\\n  -H "Authorization: Bearer <JWT for user %s>"' "$auth"
    args+=(-H "Authorization: Bearer $token")
  fi

  if [[ -n "$body" ]]; then
    printf ' \\\n  -H "Content-Type: application/json"'
    printf ' \\\n  -d '\''%s'\''' "$body"
    args+=(-H "Content-Type: application/json" -d "$body")
  fi

  printf '\nExpected status: %s\n' "$expected"

  read -r -p $'\nPress Enter to run (q to quit): ' reply
  [[ "$reply" != q && "$reply" != Q ]] || exit 0

  response="$(curl "${args[@]}" -w $'\n%{http_code}' "$BASE_URL$path")"
  status="${response##*$'\n'}"
  LAST_JSON="${response%$'\n'*}"

  printf '\nHTTP %s (expected %s)\n' "$status" "$expected"
  jq . <<< "$LAST_JSON" || printf '%s\n' "$LAST_JSON"

  [[ "$status" == "$expected" ]] || exit 1
}

# ============================================================
# COMMUNITY
# ============================================================

run_step '1. Create community' \
  POST /api/communities 201 A \
  "$(jq -nc --arg name "$COMMUNITY" '{
    name:$name,
    description:"Anonymous demo",
    topic:"Technology",
    subtopic:"Programming"
  }')"

COMMUNITY_ID="$(jq -er '.community.id' <<< "$LAST_JSON")"

# ============================================================
# POSTS
# ============================================================

run_step '2. Create normal post' \
  POST /api/posts 201 A \
  "$(jq -nc --argjson id "$COMMUNITY_ID" '{
    communityId:$id,
    title:"Normal Post",
    body:"My username is visible.",
    isAnonymous:false
  }')"

run_step '3. Create anonymous post' \
  POST /api/posts 201 A \
  "$(jq -nc --argjson id "$COMMUNITY_ID" '{
    communityId:$id,
    title:"Anonymous Post",
    body:"My username should be hidden.",
    isAnonymous:true
  }')"

POST_ID="$(jq -er '.post.id' <<< "$LAST_JSON")"

run_step '4. Retrieve anonymous post' \
  GET "/api/posts/$POST_ID" 200 public

run_step '5. Retrieve community feed' \
  GET "/api/communities/$COMMUNITY/posts" 200 public

run_step '6. User B cannot edit User A post' \
  PATCH "/api/posts/$POST_ID" 403 B \
  '{"title":"Unauthorized edit"}'

run_step '7. User A edits anonymous post' \
  PATCH "/api/posts/$POST_ID" 200 A \
  '{"title":"Updated Anonymous Post"}'

# ============================================================
# AUTHORIZATION
# ============================================================

run_step '15. Cannot create anonymous post without login' \
  POST /api/posts 401 public \
  "$(jq -nc --argjson id "$COMMUNITY_ID" '{
    communityId:$id,
    title:"Unauthorized Post",
    body:"Should fail.",
    isAnonymous:true
  }')"

echo
echo "=========================================="
echo "DEMO COMPLETE"
echo "=========================================="
