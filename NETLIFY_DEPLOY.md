# Netlify Deployment Guide - Step by Step

## ✅ Pre-Deployment Checklist

Before deploying to Netlify, ensure:
- [ ] Code is pushed to GitHub
- [ ] PostgreSQL database is ready (Railway, Supabase, or Neon)
- [ ] You have the database connection string
- [ ] `.env` file is NOT committed to git

## 🗄️ Step 1: Setup Database (Choose One)

### Option A: Railway (Easiest)
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Click on PostgreSQL → "Connect" tab
5. Copy "Postgres Connection URL"
6. It should look like: `postgresql://postgres:password@containers-us-west-123.railway.app:6543/railway`

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database setup (2-3 minutes)
4. Go to Settings → Database
5. Scroll to "Connection string" → "Transaction" mode
6. Copy the connection string
7. Replace `[YOUR-PASSWORD]` with your actual password

### Option C: Neon
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create project
3. Copy the connection string from dashboard

## 📦 Step 2: Push Code to GitHub

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - AI Studio Platform"

# Create repository on GitHub, then add remote
git remote add origin https://github.com/YOUR_USERNAME/ai-studio.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🚀 Step 3: Deploy to Netlify

### A. Connect Repository
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Authorize Netlify (if first time)
5. Select your `ai-studio` repository

### B. Configure Build Settings
**IMPORTANT:** Use these exact settings:

| Setting | Value |
|---------|-------|
| **Build command** | `npm run build` |
| **Publish directory** | `.next` |
| **Node version** | 18 |

### C. Add Environment Variables
Click "Show advanced" → "New variable"

Add these variables ONE BY ONE:

#### Required Variables:
```
DATABASE_URL = your-postgres-connection-string
JWT_SECRET = any-random-string-min-32-characters-long
```

**Example JWT_SECRET:**
```
JWT_SECRET = ai-studio-production-secret-key-change-this-to-something-random-32chars
```

#### Optional Variables (for real AI generation):
```
REPLICATE_API_TOKEN = r8_your_token_here
```

**Important Notes:**
- Click "Add" after each variable
- Don't include quotes around values
- DATABASE_URL should start with `postgresql://`
- JWT_SECRET should be at least 32 characters

### D. Deploy
1. Click "Deploy site"
2. Wait 3-5 minutes
3. Check build logs if it fails

## 🔧 Step 4: Initialize Database

After successful deployment, you need to setup your database tables.

### Method 1: Local Machine
```bash
# Export your production database URL
export DATABASE_URL="your-production-database-url"

# Push schema
npx drizzle-kit push

# Create master account
npx tsx scripts/seed.ts
```

### Method 2: Railway Dashboard (if using Railway)
1. Go to Railway dashboard
2. Click on your PostgreSQL service
3. Click "Data" tab
4. Click "Query" 
5. Run this SQL:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  credits INTEGER NOT NULL DEFAULT 100,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  subscription_ends_at TIMESTAMP,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create generations table
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  settings JSONB,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  result_url TEXT,
  thumbnail_url TEXT,
  error TEXT,
  credits_used INTEGER NOT NULL DEFAULT 0,
  processing_time INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  credits INTEGER,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL UNIQUE,
  api_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create master account
INSERT INTO users (email, password, name, role, credits, subscription_tier)
VALUES (
  'master@aistudio.com',
  '$2a$10$YourHashedPasswordHere',
  'Master Admin',
  'master',
  999999999,
  'unlimited'
);
```

**Note:** You'll need to hash the password first. Use this online: https://bcrypt-generator.com/ with rounds=10

## ✅ Step 5: Verify Deployment

1. **Visit your site**
   - Netlify gives you a URL like: `https://amazing-name-123456.netlify.app`
   - Open it in your browser

2. **Test login**
   - Go to `/login`
   - Email: `master@aistudio.com`
   - Password: `Master@123456`
   - Should redirect to `/studio` ✅

3. **Test generation**
   - Click "Text to Image"
   - Enter a prompt
   - Click Generate
   - Should work (placeholder without API key) ✅

## 🐛 Troubleshooting

### Build Failed

#### Error: "Build script returned non-zero exit code: 2"
**Solution:**
1. Check build logs in Netlify dashboard
2. Look for the actual error message
3. Common issues:
   - Missing environment variables → Add DATABASE_URL and JWT_SECRET
   - Node version mismatch → We set it to 18 in `.nvmrc`
   - TypeScript errors → Check locally with `npm run build`

#### Error: "DATABASE_URL is required"
**Solution:**
- The app can build WITHOUT database
- If you see this, check that `DATABASE_URL` is in Netlify env vars
- Go to Site settings → Environment variables → Add `DATABASE_URL`

#### Error: "Module not found"
**Solution:**
```bash
# Locally, clear and reinstall
rm -rf node_modules package-lock.json
npm install
git add .
git commit -m "Fix dependencies"
git push
```

### Login Not Working

#### Stays on login page after clicking "Sign In"
**Check these:**

1. **Open browser console (F12)**
   - Look for errors
   - Check if login API is returning success

2. **Check cookies**
   - Open DevTools → Application → Cookies
   - Should see `auth-token` after login
   - If not, there's a cookie issue

3. **Check database**
   - Make sure master account exists
   - Run: `SELECT * FROM users WHERE email = 'master@aistudio.com'`
   - Password should be bcrypt hash starting with `$2a$`

4. **Environment variables**
   - Verify `JWT_SECRET` is set in Netlify
   - Must be at least 32 characters

#### Error: "Invalid email or password"
**Solutions:**
- Make sure email is exactly: `master@aistudio.com`
- Password is exactly: `Master@123456`
- Check if master account was created in database
- Re-run seed script if needed

### Database Connection Issues

#### Error: "Connection refused"
**Check:**
1. Database is running (check Railway/Supabase dashboard)
2. Connection string is correct
3. Database allows external connections
4. SSL mode is correct (usually `?sslmode=require`)

#### Error: "password authentication failed"
**Solutions:**
- Check username and password in connection string
- Ensure no special characters are URL-encoded
- Test connection locally first

### Site Loads but Features Don't Work

#### Images/videos don't generate
**Expected behavior:**
- Without `REPLICATE_API_TOKEN`: Uses placeholder images/videos ✅
- With `REPLICATE_API_TOKEN`: Uses real AI models

**To fix:**
1. Get API token from replicate.com
2. Add to Netlify env vars
3. Redeploy

#### Admin panel shows error
**Check:**
1. Logged in as master or admin
2. Database has users table
3. Network tab shows 200 response from `/api/admin/users`

## 🔄 Updating Deployment

After making code changes:

```bash
# Commit changes
git add .
git commit -m "Your changes"
git push

# Netlify auto-deploys from main branch
# Watch progress in Netlify dashboard
```

## 🌐 Custom Domain (Optional)

1. **Buy domain** (Namecheap, GoDaddy, etc.)

2. **In Netlify:**
   - Site settings → Domain management
   - Add custom domain
   - Follow DNS instructions

3. **Update DNS** (at your registrar):
   - Add records as shown by Netlify
   - Wait 5-30 minutes for propagation

4. **SSL Certificate:**
   - Netlify auto-provisions (free)
   - Enable "Force HTTPS"

## 📊 Post-Deployment Checklist

After successful deployment:

- [ ] Login works
- [ ] Registration works  
- [ ] Studio page loads
- [ ] Can generate images (placeholder)
- [ ] Admin panel accessible
- [ ] All pages responsive on mobile
- [ ] No console errors
- [ ] Master account has unlimited credits

## 🎯 Environment Variables Reference

### Production (.env for Netlify)

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Optional - AI Generation
REPLICATE_API_TOKEN=r8_token_here

# Optional - Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Optional - Other
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Development (.env for local)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_studio
JWT_SECRET=dev-secret-key-for-local-testing-only
REPLICATE_API_TOKEN=r8_your_token
```

## 🚨 Common Mistakes to Avoid

❌ **Don't:**
- Commit `.env` file to git
- Use short JWT_SECRET (must be 32+ chars)
- Forget to push database schema
- Use development database URL in production
- Forget to create master account

✅ **Do:**
- Use different databases for dev/prod
- Set strong JWT_SECRET
- Test build locally first
- Check environment variables are set
- Monitor Netlify build logs

## 📱 Testing Production

After deploy, test these flows:

### New User Flow
1. Go to `/register`
2. Create account
3. Should get 100 credits
4. Should redirect to studio
5. Try generating an image

### Admin Flow
1. Login as master
2. Go to `/admin`
3. Create a test user
4. Modify their credits
5. Delete the test user

### Generation Flow
1. Login
2. Go to studio
3. Select "Text to Image"
4. Enter prompt: "A sunset over mountains"
5. Click Generate
6. Wait for result
7. Download image

## 🎉 Success!

If you can:
- ✅ Login with master account
- ✅ Generate images/videos
- ✅ Access admin panel
- ✅ Site loads on mobile

**You're live! 🚀**

## 📞 Need Help?

1. Check browser console (F12)
2. Check Netlify build logs
3. Check database logs (Railway/Supabase dashboard)
4. Verify all environment variables
5. Test locally first with `npm run build && npm start`

## 🔗 Useful Links

- **Netlify Dashboard:** https://app.netlify.com
- **Railway Dashboard:** https://railway.app/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **Replicate:** https://replicate.com
- **Stripe Dashboard:** https://dashboard.stripe.com

---

**Good luck with your deployment! 🎊**
