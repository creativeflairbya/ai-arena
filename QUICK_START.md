# Quick Start Guide - AI Studio

## 🚀 Get Running in 5 Minutes

### Option 1: Automated Setup (Recommended)

```bash
# Clone and setup
git clone <your-repo-url>
cd ai-studio

# Run automated setup
./setup.sh

# Start development server
npm run dev
```

Open http://localhost:3000/login

### Option 2: Manual Setup

```bash
# 1. Clone
git clone <your-repo-url>
cd ai-studio

# 2. Install
npm install

# 3. Setup environment
cat > .env << 'EOF'
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-random-32-character-secret-key-here
REPLICATE_API_TOKEN=
EOF

# 4. Database
npx drizzle-kit push
npx tsx scripts/seed.ts

# 5. Run
npm run dev
```

## 🔐 Login

```
URL:      http://localhost:3000/login
Email:    master@aistudio.com
Password: Master@123456
```

After login → Redirects to `/studio` ✅

## 🌐 Deploy to Netlify

### Step 1: Get Database (Free Options)

**Railway** (Easiest):
1. https://railway.app → Sign up
2. New Project → PostgreSQL
3. Copy connection URL

**Supabase**:
1. https://supabase.com → New project
2. Settings → Database → Connection string
3. Copy URL (use Transaction mode)

**Neon**:
1. https://neon.tech → New project  
2. Copy connection string

### Step 2: Deploy

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/ai-studio.git
git push -u origin main

# On Netlify:
# 1. Import from GitHub
# 2. Build: npm run build
# 3. Publish: .next
# 4. Add env vars:
#    DATABASE_URL = your-postgres-url
#    JWT_SECRET = random-32-char-string
# 5. Deploy
```

### Step 3: Initialize Database

```bash
# On your local machine
export DATABASE_URL="your-production-database-url"
npx drizzle-kit push
npx tsx scripts/seed.ts
```

### Step 4: Test

Visit: `https://your-site.netlify.app/login`

Login with master credentials → Should work! ✅

## 🐛 Issues?

### Login not working?
1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for login request
4. See: **TROUBLESHOOTING_LOGIN.md**

### Build failing on Netlify?
1. Check build logs
2. Verify env vars are set
3. See: **NETLIFY_DEPLOY.md**

## 📚 Documentation

| File | Purpose |
|------|---------|
| **README.md** | Overview & features |
| **QUICK_START.md** | This file - fast setup |
| **DEPLOYMENT_GUIDE.md** | Detailed deployment |
| **NETLIFY_DEPLOY.md** | Netlify-specific guide |
| **TROUBLESHOOTING_LOGIN.md** | Login debugging |
| **TESTING_GUIDE.md** | Testing procedures |
| **MASTER_ACCOUNT.md** | Account management |
| **FIXES_APPLIED.md** | Recent fixes |

## ✅ What Works

- ✅ Login/Register with email/password
- ✅ JWT authentication with secure cookies
- ✅ Master account with unlimited credits
- ✅ AI generation (4 types)
- ✅ Admin panel for user management
- ✅ Subscription tiers
- ✅ Credits system
- ✅ Fully responsive design
- ✅ Header/Footer on all pages
- ✅ Ready for payments (Stripe)
- ✅ Works without AI API keys (fallback mode)

## 🎯 Next Steps

1. ✅ Test locally (http://localhost:3000)
2. ✅ Deploy to Netlify
3. ✅ Test production site
4. 🔜 Add Replicate API key (optional)
5. 🔜 Configure Stripe (optional)
6. 🔜 Custom domain (optional)
7. 🔜 Monitor and optimize

## 💡 Pro Tips

### Testing Without API Keys
The platform works in "fallback mode" without any AI API keys:
- Images: Uses placeholder images
- Videos: Uses sample video
- Perfect for testing the platform

### Real AI Generation
1. Get Replicate API token: https://replicate.com
2. Add to .env: `REPLICATE_API_TOKEN=r8_...`
3. Restart server
4. Now generates real AI content! 🎨

### Master Account Power
- Unlimited credits (∞)
- Create other users
- Manage all credits
- Change subscription tiers
- Access everything

## 🎨 Try It Now

```bash
# Start server
npm run dev

# Open browser
open http://localhost:3000/login

# Login
# Email: master@aistudio.com
# Password: Master@123456

# Generate an image
# Go to Studio → Text to Image
# Prompt: "A beautiful sunset over mountains"
# Click Generate → Wait 3-5 seconds → See result! 🎉
```

## 📞 Need Help?

**Check Documentation:**
- Login issues → TROUBLESHOOTING_LOGIN.md
- Deploy issues → NETLIFY_DEPLOY.md  
- General setup → README.md

**Debug Steps:**
1. Check browser console (F12)
2. Check server logs in terminal
3. Verify environment variables
4. Test database connection
5. Review error messages

**Still stuck?**
- Read TROUBLESHOOTING_LOGIN.md
- Check all environment variables
- Try the automated setup script
- Verify database is accessible

---

**Get started in minutes! Happy creating! 🚀**
