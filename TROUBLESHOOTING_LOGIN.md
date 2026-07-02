# Login Troubleshooting Guide

## Issue: Login Button Not Working / Stays on Login Page

### Quick Diagnosis Checklist

Open browser DevTools (Press F12) and follow these steps:

#### 1. Check Console for Errors
**What to do:**
- Go to Console tab
- Click "Sign In" button
- Look for red error messages

**Common errors and fixes:**

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `Failed to fetch` | API not accessible | Check if server is running |
| `DATABASE_URL is not configured` | Missing database | Add DATABASE_URL to .env |
| `Invalid email or password` | Wrong credentials | Use exact credentials below |
| `Network request failed` | CORS issue | Check credentials: 'include' in fetch |

#### 2. Check Network Tab
**What to do:**
- Go to Network tab  
- Clear (trash icon)
- Click "Sign In"
- Look for `login` request

**What to check:**

✅ **Request sent**
- Should see POST to `/api/auth/login`
- Status should be 200 (success) or 401 (wrong password)

❌ **No request sent**
- Form validation preventing submit
- JavaScript error (check console)
- Button disabled state stuck

✅ **Response received**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "master@aistudio.com",
    ...
  }
}
```

❌ **Error response**
```json
{
  "error": "Invalid email or password"
}
```

#### 3. Check Cookies
**What to do:**
- Go to Application tab (Chrome) or Storage tab (Firefox)
- Click Cookies → `http://localhost:3000`
- Click "Sign In"
- Refresh the cookies list

**What to check:**

✅ **Cookie set correctly**
- Name: `auth-token`
- Value: Long string (JWT token)
- HttpOnly: ✓
- Path: /
- Expires: 7 days from now

❌ **No cookie**
- Cookie not being set by server
- Browser blocking cookies
- Same-site cookie issue

## Master Account Credentials

**IMPORTANT: Use these EXACT credentials**

```
Email:    master@aistudio.com
Password: Master@123456
```

**Common mistakes:**
- ❌ Extra spaces: `master@aistudio.com ` (space at end)
- ❌ Wrong case: `Master@aistudio.com` (capital M)
- ❌ Wrong password: `master@123456` (lowercase m)
- ❌ Extra characters: `Master@123456!` (exclamation)

**To verify:**
```javascript
// Paste in browser console
console.log('Email:', document.querySelector('#email').value);
console.log('Password:', document.querySelector('#password').value);
// Should show exact match
```

## Step-by-Step Debugging

### Test 1: Verify Server is Running

```bash
# In terminal
npm run dev

# Should see:
# ▲ Next.js 16.2.6
# - Local: http://localhost:3000
```

**If not running:**
```bash
# Kill any existing process
killall node

# Start fresh
npm run dev
```

### Test 2: Test Login API Directly

```bash
# In a new terminal (while server runs)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"master@aistudio.com","password":"Master@123456"}' \
  -c cookies.txt \
  -v
```

**Expected response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "master@aistudio.com",
    "name": "Master Admin",
    "role": "master",
    "credits": 999999999,
    "subscriptionTier": "unlimited"
  }
}
```

**And cookie in cookies.txt:**
```
localhost   FALSE   /   FALSE   0   auth-token   eyJhbGc...
```

### Test 3: Check Database

```bash
# Connect to database
psql "$DATABASE_URL"

# Check if master account exists
SELECT email, role, credits FROM users WHERE email = 'master@aistudio.com';
```

**Expected result:**
```
         email          | role   |  credits  
------------------------+--------+-----------
 master@aistudio.com    | master | 999999999
```

**If no rows:**
```bash
# Create master account
npx tsx scripts/seed.ts
```

### Test 4: Verify Password Hash

```bash
# In psql
SELECT email, substring(password, 1, 7) as hash_prefix 
FROM users 
WHERE email = 'master@aistudio.com';
```

**Expected:**
```
         email          | hash_prefix
------------------------+-------------
 master@aistudio.com    | $2a$10$
```

Password should start with `$2a$10$` (bcrypt hash)

**If wrong or missing:**
```bash
# Re-seed database
npx tsx scripts/seed.ts
```

## Common Issues & Solutions

### Issue: "Cannot read properties of undefined"

**Cause:** Frontend trying to access user data before it's loaded

**Solution:** Already fixed in code with proper loading states

### Issue: Redirects but immediately back to login

**Cause:** Cookie not persisting between requests

**Solution:**
1. Check cookie is set (see step 3 above)
2. Verify `credentials: 'include'` in fetch calls
3. Check SameSite cookie settings

**Fixed in code:**
```typescript
// login/page.tsx
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // ← This is important
  body: JSON.stringify({ email, password }),
});
```

### Issue: Button stays disabled after clicking

**Cause:** `loading` state not reset on error

**Already fixed:** Error handling resets `setLoading(false)`

### Issue: CORS error in production

**Cause:** Cookie settings incompatible with deployment

**Solution:** Already configured in API routes:
```typescript
response.cookies.set('auth-token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'lax', // ← Allows cookies across redirects
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
});
```

## Browser-Specific Issues

### Chrome/Edge
- Clear all cookies: DevTools → Application → Clear storage
- Disable cookie blocking: Settings → Privacy → Cookies → Allow all
- Check CORS errors in console

### Firefox
- Clear cookies: DevTools → Storage → Cookies → Delete all
- Check cookie settings: about:preferences#privacy
- Ensure "Enhanced Tracking Protection" not blocking

### Safari
- Clear cookies: Preferences → Privacy → Manage Website Data
- Disable "Prevent cross-site tracking"
- Enable "Website tracking: Ask websites not to track me"

## Environment-Specific Issues

### Development (localhost)

**Issue:** Login works but immediately logs out

**Cause:** JWT_SECRET changed between login and page load

**Solution:**
```bash
# Check .env file
cat .env | grep JWT_SECRET

# Should be same value every time
# If changing, restart server:
npm run dev
```

### Production (Netlify/Vercel)

**Issue:** Login works locally but not in production

**Cause:** Environment variables not set

**Solution:**
1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Verify:
   - `DATABASE_URL` is set
   - `JWT_SECRET` is set (min 32 chars)
4. Redeploy site

## Testing Script

Create a file `test-login.html` in project root:

```html
<!DOCTYPE html>
<html>
<head><title>Test Login</title></head>
<body>
  <h1>Test Login API</h1>
  <button onclick="testLogin()">Test Login</button>
  <pre id="result"></pre>

  <script>
    async function testLogin() {
      const result = document.getElementById('result');
      result.textContent = 'Testing...';
      
      try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: 'master@aistudio.com',
            password: 'Master@123456'
          })
        });
        
        const data = await response.json();
        result.textContent = JSON.stringify({
          status: response.status,
          success: response.ok,
          data: data
        }, null, 2);
        
        // Check cookie
        console.log('Cookies:', document.cookie);
        
      } catch (error) {
        result.textContent = 'Error: ' + error.message;
      }
    }
  </script>
</body>
</html>
```

**Run:**
1. Open `test-login.html` in browser
2. Click "Test Login"
3. Check result
4. Open DevTools → Application → Cookies
5. Should see `auth-token` cookie

## Still Not Working?

### Complete Reset

```bash
# 1. Stop server
# Ctrl+C

# 2. Clear all data
rm -rf node_modules .next

# 3. Reinstall
npm install

# 4. Rebuild
npm run build

# 5. Reset database
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS users, generations, transactions, api_keys CASCADE;"
npx drizzle-kit push
npx tsx scripts/seed.ts

# 6. Start fresh
npm run dev
```

### Get Debug Info

```bash
# Run this and share output for help
echo "=== System Info ==="
node --version
npm --version

echo "=== Database Connection ==="
psql "$DATABASE_URL" -c "SELECT version();" 2>&1 | head -5

echo "=== Master Account ==="
psql "$DATABASE_URL" -c "SELECT email, role FROM users WHERE role='master';"

echo "=== Environment ==="
cat .env | grep -v "PASSWORD\|SECRET" | head -5

echo "=== Build Status ==="
npm run build 2>&1 | tail -10
```

## Contact Support

If still having issues, provide:

1. **Browser console logs** (screenshot)
2. **Network tab** showing login request/response
3. **Cookie information** (screenshot of DevTools → Cookies)
4. **Server logs** from terminal
5. **Database check** results from above

---

**The login should work! Follow these steps carefully and you'll find the issue.** ✅
