# Pending Authentication Issues

## Status: TO BE FIXED LATER

## Issues Identified

### 1. Login with Credentials Not Working
- **Problem**: Users cannot login with email/password credentials
- **Error**: `CredentialsSignin` error in NextAuth v5
- **Possible Causes**:
  - NextAuth v5 beta has breaking changes with CredentialsProvider + PrismaAdapter combination
  - Password hashing mismatch (though we verified the hash is correct)
  - Session strategy conflict (JWT vs Database sessions)

### 2. Wizard Registration Flow
- **Problem**: When a new user completes the wizard, they might not be properly registered and data might not be saved
- **Impact**: Users completing onboarding might lose their data
- **Needs Investigation**:
  - Check wizard completion flow
  - Verify user creation and profile setup
  - Test data persistence after wizard

## Attempted Fixes (Reverted)

1. **Removed PrismaAdapter** - NextAuth v5 beta doesn't work well with CredentialsProvider + Adapter
2. **Updated password hash** - Generated new bcrypt hash and updated database
3. **Added debug logging** - To identify where authentication fails

## Recommended Solutions (For Later)

### Option 1: Downgrade NextAuth
- Downgrade from v5 beta to v4 stable
- v4 has better compatibility with CredentialsProvider
- More stable and documented

### Option 2: Use Only OAuth Providers
- Remove CredentialsProvider completely
- Force users to use Google/GitHub OAuth
- Simpler but less flexible

### Option 3: Custom Auth Solution
- Implement custom JWT-based auth
- More control but more code to maintain
- Use jose or jsonwebtoken

### Option 4: Fix NextAuth v5 Properly
- Deep dive into NextAuth v5 beta documentation
- Implement proper session handling
- May require significant refactoring

## Current Workaround

**NONE** - Authentication is currently broken for credentials-based login.

Users would need to:
1. Use OAuth (Google) if configured
2. OR wait for auth fix
3. OR be manually created in database and use some bypass

## Priority

**MEDIUM** - This should be fixed before production, but for now the focus is on completing other core features.

## Testing Data

- Email: demo@legal-analysis.com
- Password: demo123
- Hash: $2a$10$5f7wNc6aNN9K7VeQcXKlrOY4lX2IwgButetly8pZvINWqAN7fMq.6

## Related Files

- `/src/lib/auth.ts` - NextAuth configuration
- `/src/app/api/auth/[...nextauth]/route.ts` - Auth API route
- `/src/app/auth/signin/page.tsx` - Login page
- `/prisma/seed-complete.ts` - Seed script with user data
