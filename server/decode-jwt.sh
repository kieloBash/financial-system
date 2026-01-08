#!/bin/bash

# Decode JWT Token
# Usage: ./decode-jwt.sh <token>

TOKEN=$1

if [ -z "$TOKEN" ]; then
    echo "Usage: ./decode-jwt.sh <jwt-token>"
    exit 1
fi

# Extract the payload (middle part between dots)
PAYLOAD=$(echo "$TOKEN" | cut -d'.' -f2)

# Decode the payload
echo "Payload (decoded):"
echo "$PAYLOAD" | base64 -d 2>/dev/null

# Try to format as JSON if jq is available
if command -v jq &> /dev/null; then
    echo ""
    echo "Payload (formatted JSON):"
    echo "$PAYLOAD" | base64 -d 2>/dev/null | jq .
fi
