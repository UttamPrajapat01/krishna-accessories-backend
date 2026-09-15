#!/bin/bash
# =============================================================================
# generate-keystore.sh — Krishna Accessories Android Release Keystore Generator
# =============================================================================
# This script generates a Java keystore file for signing the Krishna Accessories
# release APK/AAB. Run this once and keep the .jks file secure.
#
# Prerequisites:
#   - Java JDK (keytool command)
#   - Copy the generated path into eas.json or local.properties
# =============================================================================

set -e

KEYSTORE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/android/keystores"
KEYSTORE_FILE="${KEYSTORE_DIR}/krishna-accessories-release.jks"
KEY_ALIAS="krishna-accessories"
VALIDITY_DAYS=9125          # 25 years
DNAME="CN=Krishna Accessories, OU=Mobile Engineering, O=Krishna Accessories Pvt Ltd, L=Mumbai, S=Maharashtra, C=IN"

echo ""
echo "========================================================"
echo "  KRISHNA ACCESSORIES — Android Keystore Generator"
echo "========================================================"
echo ""

# Check for keytool
if ! command -v keytool &> /dev/null; then
  echo "❌ Error: 'keytool' not found. Please install Java JDK."
  exit 1
fi

mkdir -p "${KEYSTORE_DIR}"

if [ -f "${KEYSTORE_FILE}" ]; then
  echo "⚠️  Keystore already exists at: ${KEYSTORE_FILE}"
  echo "   Delete it manually if you want to regenerate."
  exit 0
fi

echo "Enter a KEYSTORE password (store password):"
read -s STORE_PASS
echo ""
echo "Confirm KEYSTORE password:"
read -s STORE_PASS_CONFIRM
echo ""

if [ "${STORE_PASS}" != "${STORE_PASS_CONFIRM}" ]; then
  echo "❌ Passwords do not match. Aborting."
  exit 1
fi

echo "Enter a KEY password (can be same as keystore password):"
read -s KEY_PASS
echo ""

keytool -genkeypair \
  -v \
  -keystore "${KEYSTORE_FILE}" \
  -storetype JKS \
  -keyalg RSA \
  -keysize 4096 \
  -validity ${VALIDITY_DAYS} \
  -alias "${KEY_ALIAS}" \
  -dname "${DNAME}" \
  -storepass "${STORE_PASS}" \
  -keypass "${KEY_PASS}"

echo ""
echo "========================================================"
echo "  ✅  Keystore generated successfully!"
echo "========================================================"
echo "  Location  : ${KEYSTORE_FILE}"
echo "  Key Alias : ${KEY_ALIAS}"
echo ""
echo "  ⚠️  SECURITY: Keep this file secure. Never commit it to Git."
echo "      Add android/keystores/ to your .gitignore"
echo ""
echo "  📋 Update eas.json with:"
echo '      "credentialsSource": "local"'
echo "      \"keystorePath\": \"${KEYSTORE_FILE}\""
echo "      \"keystoreAlias\": \"${KEY_ALIAS}\""
echo "========================================================"
