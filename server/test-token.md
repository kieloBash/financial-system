# JWT Token Decoder

To decode your JWT token, extract the middle part (payload) and decode it:

```bash
# Your token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWs2MmZmeDgwMDAwOWhraG4xODJ6anliIiwiZW1haWwiOiJ0ZXN0MUBnbWFpbC5jb20iLCJpYXQiOjE3Njc5MTU3MDQsImV4cCI6MTc2ODAwMjEwNH0.u9UNuanpqAa_UQDjulX-bfZLJCCCfC_78F4cb0tF5UM

# Decode payload (middle part):
echo "eyJzdWIiOiJjbWs2MmZmeDgwMDAwOWhraG4xODJ6anliIiwiZW1haWwiOiJ0ZXN0MUBnbWFpbC5jb20iLCJpYXQiOjE3Njc5MTU3MDQsImV4cCI6MTc2ODAwMjEwNH0" | base64 -d

# Or with jq for pretty formatting:
echo "eyJzdWIiOiJjbWs2MmZmeDgwMDAwOWhraG4xODJ6anliIiwiZW1haWwiOiJ0ZXN0MUBnbWFpbC5jb20iLCJpYXQiOjE3Njc5MTU3MDQsImV4cCI6MTc2ODAwMjEwNH0" | base64 -d | jq .
```

The payload should show:
- `sub`: user ID
- `email`: user email  
- `iat`: issued at timestamp
- `exp`: expiration timestamp
