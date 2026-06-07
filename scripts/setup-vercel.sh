#!/bin/bash
# DLavie OS — Vercel Setup Script
# Run this to configure all ENV vars on Vercel

VERCEL_TOKEN="${VERCEL_TOKEN}"
VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID}"
VERCEL_ORG_ID="${VERCEL_ORG_ID}"

if [ -z "$VERCEL_TOKEN" ] || [ -z "$VERCEL_PROJECT_ID" ]; then
  echo "ERROR: VERCEL_TOKEN and VERCEL_PROJECT_ID must be set"
  exit 1
fi

set_env() {
  local key=$1
  local value=$2
  local target=${3:-"production,preview,development"}
  echo "Setting $key..."
  curl -s -X POST "https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env" \
    -H "Authorization: Bearer ${VERCEL_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"${key}\",\"value\":\"${value}\",\"type\":\"encrypted\",\"target\":[\"production\",\"preview\"]}" \
    | jq -r '.key + " => " + (.created | tostring)' 2>/dev/null || echo "  (done)"
}

echo "=== Configuring Vercel project ==="

# These will be read from your local environment
set_env "SUPABASE_URL" "${SUPABASE_URL}"
set_env "SUPABASE_SERVICE_ROLE_KEY" "${SUPABASE_SERVICE_ROLE_KEY}"
set_env "SUPABASE_ANON_KEY" "${SUPABASE_ANON_KEY}"
set_env "VITE_SUPABASE_URL" "${SUPABASE_URL}"
set_env "VITE_SUPABASE_ANON_KEY" "${SUPABASE_ANON_KEY}"
set_env "DATABASE_URL" "${DATABASE_URL}"
set_env "NODE_ENV" "production"

# Optional — set these manually if you have them
# set_env "XAI_API_KEY" "your-xai-key"
# set_env "GEMINI_API_KEY" "your-gemini-key"
# set_env "MIDTRANS_SERVER_KEY" "your-midtrans-key"
# set_env "MIDTRANS_CLIENT_KEY" "your-midtrans-client-key"

echo "=== Done! Trigger a deployment with: ==="
echo "vercel --prod --token \$VERCEL_TOKEN"
