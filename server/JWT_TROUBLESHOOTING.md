# JWT Authentication Troubleshooting

## Issue: Getting "Unauthorized" after login with valid token

## Fixes Applied

1. ✅ **Fixed Guard Return Type** - Properly typed the `canActivate` method
2. ✅ **JWT Strategy uses ConfigService** - Now uses ConfigService for consistent secret reading
3. ✅ **Exported JwtStrategy** - Strategy is now exported from AuthModule for global use

## Common Issues to Check

### 1. JWT Secret Mismatch
**Most Common Issue!**

Make sure the `JWT_SECRET` used to **sign** the token (in AuthService) matches the secret used to **verify** the token (in JwtStrategy).

**Check:**
- Both `auth.module.ts` and `jwt.strategy.ts` use the same secret source
- Your `.env` file has `JWT_SECRET` set
- The server was restarted after changing `.env`

**Solution:**
```bash
# In your .env file
JWT_SECRET=your-secret-key-here
```

### 2. Token Format
Make sure you're sending the token with the "Bearer " prefix:

**Correct:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Wrong:**
```
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Token Expiration
Check if your token has expired. Default expiration is 1 day.

### 4. API Prefix
Remember your API has a global prefix `/api`:

**Correct endpoints:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users` (protected)

### 5. CORS Issues
If testing from a browser, make sure CORS is configured correctly in `main.ts`.

## Testing Steps

1. **Register a new user:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

2. **Copy the `access_token` from the response**

3. **Test protected route:**
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Debugging

Add logging to see what's happening:

1. Check if the token is being extracted:
   - The JWT strategy should log if token extraction fails
   
2. Check the payload:
   - The `validate` method in JwtStrategy receives the decoded payload
   - Make sure `payload.sub` (user ID) exists

3. Check environment variables:
```bash
# In your server directory
echo $JWT_SECRET
```

## Expected Behavior

- ✅ Register/Login endpoints are public (no token needed)
- ✅ `/api/users` requires a valid JWT token
- ✅ Invalid or missing token returns 401 Unauthorized
- ✅ Valid token allows access and sets `request.user` with `{ userId, email }`
