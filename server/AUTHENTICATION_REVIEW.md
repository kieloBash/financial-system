# Authentication Code Review

## Issues Found

### 1. ❌ **Schema Mismatch - Phone Field**
**Location**: `users.service.ts` → `createUser` method
**Issue**: The service accepts a `phone` parameter, but the Prisma schema doesn't have a `phone` field.
**Impact**: Will cause database error when trying to register with a phone number.

**Fix**: Remove `phone` from the createUser method or add it to the schema.

### 2. ❌ **Missing Duplicate Email Check**
**Location**: `auth.service.ts` → `register` method
**Issue**: No check if user with email already exists before creating.
**Impact**: Will cause database unique constraint error or allow duplicate registrations.

**Fix**: Add check before creating user.

### 3. ⚠️ **JWT Payload Mismatch**
**Location**: `jwt.strategy.ts` → `validate` method
**Issue**: Strategy expects `role` in payload, but auth service only sets `sub` and `email`.
**Impact**: `payload.role` will be `undefined` in the validated user object.

**Fix**: Either remove role from strategy or add role to JWT payload.

### 4. ⚠️ **Missing googleId in Registration**
**Location**: `auth.service.ts` → `register` method
**Issue**: Not explicitly setting `googleId` to `null` when creating email/password users.
**Impact**: Should work since it's optional, but better to be explicit.

**Fix**: Explicitly set `googleId: null` when registering.

### 5. ✅ **Password Hashing** - Working correctly
**Location**: `auth.service.ts`
**Status**: Using bcrypt correctly with 10 salt rounds.

### 6. ✅ **JWT Token Generation** - Working correctly
**Location**: `auth.service.ts` → `login` method
**Status**: Properly generating JWT tokens.

### 7. ✅ **Public Decorator** - Working correctly
**Location**: `auth.controller.ts`
**Status**: Register and login endpoints are properly marked as public.

## Recommended Fixes

See the fixes below in the code files.
