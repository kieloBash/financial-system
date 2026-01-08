# Guards and Decorators Usage

## JWT Authentication Guard

The `JwtAuthGuard` is set as a global guard, meaning all routes are protected by default unless marked as public.

### Making a Route Public

Use the `@Public()` decorator to allow unauthenticated access:

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';

@Controller('example')
export class ExampleController {
  @Public()
  @Get('public')
  getPublicData() {
    return { message: 'This is public' };
  }

  @Get('protected')
  getProtectedData(@CurrentUser() user: CurrentUserPayload) {
    return { message: 'This is protected', user };
  }
}
```

## Current User Decorator

Use `@CurrentUser()` to get the authenticated user from the request:

```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrentUser, CurrentUserPayload } from '../decorators/current-user.decorator';

@Controller('profile')
export class ProfileController {
  @Get()
  getProfile(@CurrentUser() user: CurrentUserPayload) {
    return user; // { userId: string, role: string }
  }

  @Get('id')
  getUserId(@CurrentUser('userId') userId: string) {
    return { userId };
  }

  @Get('role')
  getUserRole(@CurrentUser('role') role: string) {
    return { role };
  }
}
```

## Roles Guard

Use `@Roles()` decorator with `RolesGuard` to restrict access by user role:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { UserRole } from '../generated/prisma/enums';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  @Roles(UserRole.ADMIN)
  @Get('dashboard')
  getAdminDashboard(@CurrentUser() user: CurrentUserPayload) {
    return { message: 'Admin dashboard', user };
  }

  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @Get('reports')
  getReports(@CurrentUser() user: CurrentUserPayload) {
    return { message: 'Reports', user };
  }
}
```

## Combining Guards

You can combine multiple guards:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserRole } from '../generated/prisma/enums';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  @Get()
  getAllInvoices(@CurrentUser() user: CurrentUserPayload) {
    // Accessible to all authenticated users
    return { invoices: [] };
  }

  @Roles(UserRole.ADMIN)
  @Get('all')
  getAllInvoicesAdmin(@CurrentUser() user: CurrentUserPayload) {
    // Only accessible to admins
    return { invoices: [] };
  }
}
```
