#!/bin/bash

# JWT Token decoder helper
# Usage: ./decode-token.sh <token>

TOKEN=$1

if [ -z "$TOKEN" ]; then
    echo "Usage: ./decode-token.sh <jwt-token>"
    exit 1
fi

# Split token into parts
IFS='.' read -r header payload signature <<< "$TOKEN"

echo "=== JWT Token Analysis ==="
echo ""
echo "Header:"
echo "$header" | base64 -d 2>/dev/null | jq . 2>/dev/null || echo "$header" | base64 -d 2>/dev/null
echo ""
echo "Payload:"
echo "$payload" | base64 -d 2>/dev/null | jq . 2>/dev/null || echo "$payload" | base64 -d 2>/dev/null
echo ""
echo "Signature: (base64 encoded, not decoded)"
echo "$signature"
