# Authentication Documentation

## Overview

The authentication system in this project uses JWT (JSON Web Tokens) with refresh token rotation for secure user authentication. It implements role-based access control (RBAC) and provides various security features to protect user data and system resources.

## Authentication Flow

### 1. Registration

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

- Validates user input
- Checks for existing users
- Hashes password using bcrypt
- Creates new user account
- Returns user data (excluding sensitive information)

### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 3. Token Refresh

```http
POST /api/auth/refresh
Authorization: Bearer {refresh_token}
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 4. Logout

```http
POST /api/auth/logout
Authorization: Bearer {access_token}
```

## Token Management

### Access Token

- Short-lived (default: 15 minutes)
- Contains user information and roles
- Used for API authentication
- JWT format with signature

### Refresh Token

- Long-lived (default: 7 days)
- Stored in database (hashed)
- Used to obtain new access tokens
- Rotated on use
- One refresh token per user

## Security Measures

### Password Hashing

- Uses bcrypt with salt rounds
- Passwords never stored in plain text
- Minimum password requirements enforced

### Token Security

- Signed with secure secrets
- Contains expiration time
- Blacklisting of revoked tokens
- Rate limiting on auth endpoints

### Session Management

- Token rotation on refresh
- Automatic logout on security events
- Concurrent session handling

## Role-Based Access Control

### Available Roles

- ADMIN: Full system access
- USER: Basic user privileges
- STORE_OWNER: Store management access
- STORE_STAFF: Limited store access

### Role Assignment

```typescript
@Roles(UserRole.ADMIN)
@Get('admin/users')
async getUsers() {
  // Only accessible by admins
}
```

### Role Hierarchy

```typescript
const roleHierarchy = {
  ADMIN: ["USER", "STORE_OWNER", "STORE_STAFF"],
  STORE_OWNER: ["STORE_STAFF"],
  STORE_STAFF: [],
  USER: [],
};
```

## Guards

### JWT Auth Guard

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: UserEntity) {
  return user;
}
```

### Local Auth Guard

```typescript
@UseGuards(LocalAuthGuard)
@Post('login')
async login(@Request() req) {
  return this.authService.login(req.user);
}
```

### Roles Guard

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get('admin/dashboard')
getDashboard() {
  // Only accessible by admins
}
```

## Public Routes

```typescript
@Public()
@Post('register')
async register(@Body() registerDto: RegisterDto) {
  return this.authService.register(registerDto);
}
```

## Error Handling

### Authentication Errors

- InvalidCredentialsException
- UserNotFoundException
- TokenExpiredException
- TokenBlacklistedException

### Authorization Errors

- UnauthorizedException
- ForbiddenException
- RoleNotFoundException

## Rate Limiting

```typescript
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 requests per minute
@Post('login')
async login() {
  // Rate limited endpoint
}
```

## Best Practices

1. Token Storage

   - Store access token in memory
   - Store refresh token in HTTP-only cookie
   - Never store sensitive data in local storage

2. API Security

   - Use HTTPS only
   - Implement CORS properly
   - Set secure headers
   - Rate limit authentication endpoints

3. Password Requirements

   - Minimum length: 8 characters
   - Require mixed case
   - Require numbers
   - Require special characters

4. Error Messages
   - Generic error messages
   - No sensitive information in responses
   - Proper error logging

## Example Usage

### Protected Route

```typescript
@Controller("protected")
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get()
  @Roles(UserRole.USER)
  getData(@CurrentUser() user: UserEntity) {
    return {
      message: "Protected data",
      user: user.email,
    };
  }
}
```

### Custom Guard

```typescript
@Injectable()
export class StoreOwnerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user;
    return user?.roles.includes(UserRole.STORE_OWNER);
  }
}
```

## Testing

### Unit Tests

```typescript
describe("AuthService", () => {
  it("should validate user credentials", async () => {
    const result = await authService.validateUser(
      "test@example.com",
      "password123"
    );
    expect(result).toBeDefined();
  });
});
```

### E2E Tests

```typescript
describe("Authentication", () => {
  it("should authenticate user", () => {
    return request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "test@example.com",
        password: "password123",
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      });
  });
});
```
