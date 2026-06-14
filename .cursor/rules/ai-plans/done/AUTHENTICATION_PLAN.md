# AWS Cognito Authentication Implementation Plan

## Overview
This plan outlines the implementation of authentication using AWS Cognito for the CodeFreeze Board application.

## Architecture Components

### 1. New Capability: `cfb-authorization`

A new capability module that handles all authentication-related functionality.

#### 1.1 Structure (following template pattern)
```
cfb-authorization/
├── ui-components/
│   ├── src/
│   │   ├── components/
│   │   │   ├── cfb-login-form.js          # Login form component
│   │   │   └── cfb-auth-status.js          # Shows logged in/logged out status with logout
│   │   ├── storage/
│   │   │   └── authenticated-user.js             # IndexedDB storage for tokens with refresh logic
│   │   ├── ports/
│   │   │   └── authorized-fetch.js         # Fetch wrapper with automatic token refresh
│   │   └── authorization-module.js         # Main module class
│   ├── index.js                            # Module exports (includes authorizedFetch)
│   ├── package.json
│   └── README.md
├── functions/
│   ├── src/
│   │   └── auth-utilities.js               # Token verification utilities (if needed)
│   ├── package.json
│   └── index.js
└── contracts/ (optional, if needed)
```

#### 1.2 UI Components Features
- **Login Form Component**: 
  - Username/password input
  - Login button
  - Error handling
  - Uses AWS Cognito JavaScript SDK (`amazon-cognito-identity-js`)
  
- **Auth Status Component**:
  - Shows "Logged in" with username when authenticated
  - Shows login form when not authenticated
  - Includes logout button when authenticated
  - Uses IndexedDB to check stored credentials

- **Logout Functionality**:
  - Clears all tokens from IndexedDB
  - Redirects to `/login.html`
  - Invalidates Cognito session

- **Auth Storage (IndexedDB)**:
  - Stores: ID token, Access token, Refresh token, User info, Token expiration times
  - Provides: `getTokens()`, `saveTokens()`, `clearTokens()`, `isAuthenticated()`, `isTokenExpired()`, `refreshTokens()`

- **Authorized Fetch**:
  - Wrapper around native `fetch()`
  - Automatically adds `Authorization: Bearer <token>` header
  - Implements automatic token refresh (checks token expiration before requests)
  - Exported as: `authorizedFetch(url, options)`

#### 1.3 Integration Points
- Module registered in `ui/index.js` via Shell
- `authorizedFetch` exported from module for use by other capabilities
- Login page at `/login.html` (separate from main app)

### 2. CDK Infrastructure Changes

#### 2.1 Cognito User Pool
- Create Cognito User Pool
- Configure:
  - Sign-in options: Username
  - Password policy
  - MFA (optional, can be disabled initially)
  - App client (for JavaScript SDK)
  - App client settings (callback URLs, OAuth flows)
  - User pool domain (for hosted UI - optional)

#### 2.2 IAM Permissions
- Lambda functions need permission to:
  - `cognito-idp:GetUser` (verify tokens)
  - `cognito-idp:AdminGetUser` (optional, for user details)
  
#### 2.3 Environment Variables

**For Lambda Functions:**
- Pass User Pool ID and App Client ID to Lambda functions via environment variables

**For Frontend (Build-time Configuration):**
- Pass User Pool ID, App Client ID, AWS Region, and Root URL to frontend via build-time injection
- Implementation: Modify `build/build.js` to inject these values into a config object
- Config accessible via `window.CFB_CONFIG` or imported config module
- Values: `userPoolId`, `clientId`, `region`, `rootUrl` (https://cfb.rinkkasatiainen.dev)

#### 2.4 API Gateway Authorizer (Optional)
- Could add Cognito Authorizer to API Gateway
- For now, we'll verify in Lambda handlers (more flexible)

### 3. Function Handler Changes

#### 3.1 Token Verification
- Extract token from `Authorization` header
- Verify token using AWS SDK (`@aws-sdk/client-cognito-identity-provider`)
- Options:
  - **Option A**: Verify JWT locally (faster, but need to fetch JWKS)
  - **Option B**: Use AWS SDK `GetUser` call (simpler, validates with Cognito)

#### 3.2 Response Enhancement
- Add `authorized: true/false` to all response payloads
- Example response structure:
  ```json
  {
    "sections": [...],
    "eventId": "codefreeze-2025",
    "authorized": true
  }
  ```

#### 3.3 Error Handling
- Return `authorized: false` if no token provided
- Return `authorized: false` if token invalid
- Still return data (non-blocking approach per user request)

### 4. UI Component Updates

#### 4.1 Update Existing Fetch Calls
- Replace `fetch()` with `authorizedFetch()` in:
  - `cfb-session-discovery/ui-components/src/loads-sections/ports/cfb-retrieves-schedules.js`
  - Any other components making API calls

#### 4.2 Login Page (`/login.html`)
- Standalone HTML page
- Imports authorization module
- Shows login form when not authenticated
- Shows "Already logged in" status with redirect option when authenticated
- Redirects to `/index.html` after successful login

### 5. Dependencies to Add

#### 5.1 UI Components (`cfb-authorization/ui-components`)
- `amazon-cognito-identity-js` - Cognito JavaScript SDK
- `idb` (or similar) - IndexedDB wrapper (optional, can use native API)

#### 5.2 Functions (`cfb-authorization/functions` or in existing functions)
- `@aws-sdk/client-cognito-identity-provider` - For token verification

### 6. Implementation Order

1. **Create `cfb-authorization` capability structure**
   - Copy from template
   - Set up basic module structure

2. **Implement storage layer (IndexedDB)**
   - Token storage/retrieval
   - Authentication state management

3. **Implement login form component**
   - Basic login UI
   - Cognito authentication flow

4. **Implement `authorizedFetch`**
   - Token injection
   - Automatic token refresh (check expiration before requests)
   - Error handling

5. **Create `/login.html` page**
   - Standalone login interface

6. **Update CDK stack**
   - Add Cognito User Pool
   - Configure app client
   - Update Lambda permissions
   - Pass environment variables

7. **Update Lambda handlers**
   - Add token verification logic
   - Add `authorized` field to responses

8. **Update existing UI components**
   - Replace `fetch` with `authorizedFetch`

9. **Integration testing**
   - Test login flow
   - Test API calls with auth
   - Test automatic token refresh
   - Test logout flow

### 7. Considerations & Decisions Needed

#### 7.1 Token Type
- **ID Token**: Contains user identity info (email, username, etc.)
- **Access Token**: Used for API authorization
- **Decision**: Use Access Token for API calls (standard practice)

#### 7.2 Token Refresh
- **Option A**: Implement automatic refresh in `authorizedFetch`
- **Option B**: Handle on 401 responses
- **Decision**: Start with Option B (simpler), can enhance later

#### 7.3 User Registration
- Allow self-registration or admin-only?
- **Decision**: Start with admin-only user creation, can add self-registration later

#### 7.4 Authorization vs Authentication
- Currently only checking if user is authenticated (token valid)
- Future: Could check user groups/roles for resource-level authorization
- **Decision**: Start simple (just authenticated check), can enhance later

#### 7.5 Frontend Configuration
- How to pass Cognito config to frontend?
- **Option A - Build-time environment variables**: 
  - Values are injected into the JavaScript bundle during the build process
  - Configured in `build/build.js` or via environment variables passed to build script
  - Values become part of the code (visible in bundled JS)
  - Requires rebuild to change values
  - Pros: Simple, no extra requests, works immediately
  - Cons: Cannot change without rebuilding, values visible in client code
- **Option B - Runtime config endpoint**:
  - App fetches config from an API endpoint (e.g., `/api/config`) when it loads
  - Values stored in memory after fetch
  - Pros: Can change without rebuild, values not in bundle
  - Cons: Requires extra API call, adds complexity
- **Option C - CloudFront response headers**:
  - Values injected by CloudFront as custom headers
  - Read via JavaScript from response headers
  - Pros: Centralized in CDK, not in bundle
  - Cons: Only works for same-origin requests, more complex setup
- **Decision**: Option A (build-time) - Values injected during build process in `build/build.js`

#### 7.6 Login Page Routing
- How to handle routing to `/login.html`?
- CloudFront can serve it as static file (already configured)
- **Decision**: Static HTML file works fine
- After login: Redirect to `/index.html`
- After logout: Redirect to `/login.html`

### 8. Missing Pieces to Consider

1. **Error Handling**: ✅ Automatic token refresh handles expired tokens
2. **Logout**: ✅ Implemented - clears tokens, redirects to `/login.html`
3. **Session Management**: ✅ Token expiration and refresh token handling implemented in `authorizedFetch`
4. **Security**: HTTPS only, secure token storage in IndexedDB
5. **Testing**: How to test Cognito integration (mocking strategies)
6. **User Feedback**: Loading states, error messages
7. **Redirect Logic**: ✅ After login → `/index.html`, After logout → `/login.html`
8. **Token Validation**: Should we validate token format before sending to API?

## Next Steps

Once approved, we'll proceed with implementation in the order outlined above.

