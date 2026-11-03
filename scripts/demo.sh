#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
DEMO_PASSWORD="demoPassword"
SUFFIX="$(date +%s)_${RANDOM}"
EMAIL="summit-demo@example.com"
USERNAME="demoUser"
COMMUNITY="demoCommunity"
TOKEN=""
LAST_JSON=""
TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

for command in curl jq; do
  command -v "$command" >/dev/null 2>&1 || {
    printf 'Missing required command: %s\n' "$command" >&2
    exit 1
  }
done

printf '\nSUMMIT — SPRINT TWO API DEMO\n'

pause() {
  local reply
  read -r -p $'\nPress Enter to run this request (q to quit): ' reply
  case "$reply" in q|Q) printf 'Demo stopped.\n'; exit 0 ;; esac
}

# run_step DESCRIPTION METHOD PATH EXPECTED_STATUS AUTH_MODE [JSON_BODY]
# AUTH_MODE is either public or bearer.
run_step() {
  local description="$1" method="$2" path="$3" expected="$4" auth_mode="$5"
  local body="${6:-}" status
  local -a args=(--silent --show-error --request "$method" --output "$TMP_FILE" --write-out '%{http_code}')

  printf '\n============================================================\n'
  printf '%s\n' "$description"
  printf '============================================================\n'
  printf 'curl -X %s "%s%s"' "$method" "$BASE_URL" "$path"
  if [[ "$auth_mode" == bearer ]]; then
    printf ' \\\n  -H "Authorization: Bearer <JWT>"'
  fi
  if [[ -n "$body" ]]; then
    printf ' \\\n  -H "Content-Type: application/json" \\\n  -d '\''%s'\''' "$body"
  fi
  printf '\nExpected status: %s\n' "$expected"
  pause

  if [[ "$auth_mode" == bearer ]]; then
    [[ -n "$TOKEN" ]] || { printf 'Missing JWT.\n' >&2; exit 1; }
    args+=(-H "Authorization: Bearer $TOKEN")
  fi
  if [[ -n "$body" ]]; then
    args+=(-H 'Content-Type: application/json' --data "$body")
  fi

  status="$(curl "${args[@]}" "$BASE_URL$path")" || {
    printf '\nRequest failed. Is the backend running at %s?\n' "$BASE_URL" >&2
    exit 1
  }
  printf '\nHTTP %s (expected %s)\n' "$status" "$expected"
  LAST_JSON="$(cat "$TMP_FILE")"
  if ! jq . "$TMP_FILE"; then
    cat "$TMP_FILE"
    printf '\n'
  fi
  if [[ "$status" != "$expected" ]]; then
    printf '\nUnexpected status: stopping so the remaining requests do not use invalid data.\n' >&2
    exit 1
  fi
}

extract_number() {
  local filter="$1" label="$2" result
  result="$(jq -er "$filter | numbers" <<< "$LAST_JSON")" || {
    printf 'Unable to find %s in the response.\n' "$label" >&2
    exit 1
  }
  printf '%s' "$result"
}

register_body="$(jq -nc --arg email "$EMAIL" --arg username "$USERNAME" --arg password "$DEMO_PASSWORD" '{email:$email,username:$username,password:$password}')"
login_body="$(jq -nc --arg email "$EMAIL" --arg password "$DEMO_PASSWORD" '{email:$email,password:$password}')"

run_step '0. Ping the server' GET "/api/ping/server" 200 public
run_step '1. Ping the database' GET "/api/ping/database" 200 public

run_step '2. Register an account (code appears in SERVER terminal)' POST /api/auth/register 201 public "$register_body"
run_step '3. Show that unverified accounts cannot log in' POST /api/auth/login 403 public "$login_body"

printf '\nLook at the terminal running Express for the six-digit verification code for %s.\n' "$EMAIL"
while :; do
  read -r -p 'Enter verification code: ' CODE
  [[ "$CODE" =~ ^[0-9]{6}$ ]] && break
  printf 'Enter exactly six digits.\n'
done
verify_body="$(jq -nc --arg email "$EMAIL" --arg code "$CODE" '{email:$email,code:$code}')"
run_step '4. Verify email' POST /api/auth/verify-email 200 public "$verify_body"
run_step '5. Log in to receive a JWT' POST /api/auth/login 200 public "$login_body"
TOKEN="$(jq -er '.token | select(type=="string" and length>0)' <<< "$LAST_JSON")" || {
  printf 'Login did not return a token.\n' >&2; exit 1;
}

run_step '6. Retrieve all communities (public endpoint)' GET "/api/communities" 200 public
community_body="$(jq -nc --arg name "$COMMUNITY" '{name:$name,description:"Sprint Two live demonstration",topic:"Technology",subtopic:"Programming"}')"
run_step '7. Create a community' POST /api/communities 201 bearer "$community_body"
COMMUNITY_ID="$(extract_number '.community.id' 'community.id')"
printf '\nCaptured COMMUNITY_ID=%s\n' "$COMMUNITY_ID"
run_step '8. Retrieve the new community (public endpoint)' GET "/api/communities/$COMMUNITY" 200 public

run_step '9. Retrieve all posts (public endpoint)' GET "/api/posts" 200 public
post_body="$(jq -nc --argjson communityId "$COMMUNITY_ID" '{communityId:$communityId,title:"Summit Sprint Two Demo",body:"This post was created with curl."}')"
run_step '10. Create a post in the community' POST /api/posts 201 bearer "$post_body"
POST_ID="$(extract_number '.post.id' 'post.id')"
printf '\nCaptured POST_ID=%s\n' "$POST_ID"
run_step '11. Retrieve the community feed' GET "/api/communities/$COMMUNITY/posts" 200 public
