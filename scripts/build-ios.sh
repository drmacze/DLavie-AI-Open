#!/bin/bash
# DLavie OS — iOS Build Script
# Builds the web app and syncs to Capacitor for iOS
set -e

echo "=== DLavie OS iOS Build ==="

# 1. Build frontend
echo "→ Building frontend..."
cd artifacts/dlavie-os
PORT=3000 BASE_PATH=/ pnpm run build
cd ../..

# 2. Sync with Capacitor
echo "→ Syncing with Capacitor..."
if ! command -v npx &> /dev/null; then
  echo "ERROR: npx not found"
  exit 1
fi

npx cap sync ios

# 3. Open in Xcode (macOS only)
if [[ "$(uname)" == "Darwin" ]]; then
  echo "→ Opening Xcode..."
  npx cap open ios
  echo ""
  echo "=== iOS Build Ready ==="
  echo "Steps in Xcode:"
  echo "1. Select your team in Signing & Capabilities"
  echo "2. Set Bundle ID to: com.dlavie.os"
  echo "3. Product > Archive"
  echo "4. Distribute to App Store or export IPA"
else
  echo ""
  echo "=== iOS Build Files Ready ==="
  echo "Transfer ios/ folder to a Mac with Xcode to build the IPA"
  echo "Then open with: npx cap open ios"
fi
