# Deployment Guide - AI Studio to Netlify

## Prerequisites

- GitHub account
- Netlify account (free tier works)
- PostgreSQL database (can use free tier from Railway, Supabase, or Neon)

## Step 1: Prepare Your Database

### Option A: Railway (Recommended for beginners)
1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Copy the "Postgres Connection URL"

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (Transaction mode)

### Option C: Neon
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

## Step 2: Push Code to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - AI Studio Platform"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-studio.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Netlify

### Via Netlify Dashboard (Recommended)

1. **Login to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with GitHub

2. **Import Project**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your repositories
   - Select your `ai-studio` repository

3. **Configure Build Settings**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - Click "Show advanced" → "New variable"

4. **Add Environment Variables**
   Add these one by one:
   
   | Key | Value | Example |
   |-----|-------|---------|
   | `DATABASE_URL` | Your PostgreSQL URL | `postgresql://user:pass@host:5432/dbname` |
   | `JWT_SECRET` | Random secure string | `my-super-secret-jwt-key-min-32-characters-long` |
   | `REPLICATE_API_TOKEN` | (Optional) Your Replicate key | `r8_...` |
   | `NODE_VERSION` | 18 | `18` |

5. **Deploy**
   - Click "Deploy site"
   - Wait 2-3 minutes for build to complete

### Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize site
netlify init

# Set environment variables
netlify env:set DATABASE_URL "your-postgres-url"
netlify env:set JWT_SECRET "your-secret-key-min-32-chars"
netlify env:set REPLICATE_API_TOKEN "your-replicate-token" # Optional

# Deploy
netlify deploy --prod
```

## Step 4: Setup Database Schema

After deployment, you need to initialize your database:

### Method 1: Local Setup then Deploy
```bash
# In your local project
export DATABASE_URL="your-production-database-url"
npx drizzle-kit push
npx tsx scripts/seed.ts
```

### Method 2: Via Netlify Functions (Advanced)
You can create a one-time function to run migrations.

## Step 5: Verify Deployment

1. **Visit Your Site**
   - Netlify will give you a URL like: `https://your-site-name.netlify.app`
   - Visit the URL

2. **Test Login**
   - Go to `/login`
   - Use master credentials:
     - Email: `master@aistudio.com`
     - Password: `Master@123456`
   - Should redirect to `/studio`

3. **Test Generation**
   - Try creating an image or video
   - Verify it works (will use placeholders without API key)

## Step 6: Custom Domain (Optional)

1. **In Netlify Dashboard**
   - Go to Site Settings → Domain management
   - Click "Add custom domain"
   - Enter your domain (e.g., `aistudio.com`)

2. **Configure DNS**
   - Add A record or CNAME as instructed by Netlify
   - Wait for DNS propagation (5-30 minutes)

3. **Enable HTTPS**
   - Netlify automatically provisions SSL certificate
   - Force HTTPS in Site Settings

## Step 7: Configure Payment Processing (Optional)

### For Stripe Integration

1. **Get Stripe Keys**
   - Sign up at [stripe.com](https://stripe.com)
   - Get your Secret and Publishable keys
   - Get Webhook secret

2. **Add to Netlify**
   ```bash
   netlify env:set STRIPE_SECRET_KEY "sk_live_..."
   netlify env:set STRIPE_PUBLISHABLE_KEY "pk_live_..."
   netlify env:set STRIPE_WEBHOOK_SECRET "whsec_..."
   ```

3. **Redeploy**
   - Trigger a new deployment for env vars to take effect

### For Pakistani Payment Methods

You'll need to integrate:
- **JazzCash:** [JazzCash Merchant Portal](https://sandbox.jazzcash.com.pk/)
- **Easypaisa:** [Easypaisa for Business](https://easypaisa.com.pk/business/)

## Environment Variables Reference

### Required
```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-key-change-this-min-32-chars
```

### Optional - AI Generation
```env
REPLICATE_API_TOKEN=r8_your_token_here
```

### Optional - Payments
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Optional - App Configuration
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_VERSION=18
```

## Troubleshooting

### Build Fails
```bash
# Check build logs in Netlify dashboard
# Common issues:
# 1. Missing environment variables
# 2. Database connection issues
# 3. TypeScript errors
```

### Database Connection Issues
```bash
# Test connection locally first
psql "your-connection-string"

# Make sure:
# 1. Database exists
# 2. SSL mode is correct (usually require or prefer)
# 3. IP whitelist includes Netlify IPs
```

### Login Not Working
```bash
# Check:
# 1. JWT_SECRET is set in Netlify
# 2. Database has users table
# 3. Master account was seeded
# 4. Check browser console for errors
```

### Images/Videos Not Loading
```bash
# If using Replicate:
# 1. Check API token is valid
# 2. Check Replicate account has credits

# If no API token:
# App will use placeholder content (this is normal)
```

## Performance Optimization

### 1. Enable Netlify Edge Functions
- For faster API responses
- Better caching

### 2. Database Connection Pooling
Already configured in the code via `pg.Pool`

### 3. Image Optimization
Next.js automatically optimizes images

### 4. Caching
Configure in `netlify.toml`:
```toml
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## Monitoring

### Netlify Analytics
- Enable in Site Settings → Analytics
- Track page views, performance

### Database Monitoring
- Use your database provider's dashboard
- Monitor connection counts
- Check slow queries

### Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for session replay

## Backup Strategy

### Database Backups
```bash
# Automated via your database provider
# Railway/Supabase/Neon all have automatic backups

# Manual backup
pg_dump "your-database-url" > backup.sql
```

### Code Backups
- GitHub acts as version control
- Netlify keeps deployment history

## Scaling

### Free Tier Limits
- Netlify: 100GB bandwidth/month
- Railway: 500 hours/month
- Supabase: 500MB database

### Upgrade When
- Traffic > 100k visits/month
- Database > 500MB
- Need better performance

### Upgrade Path
1. Netlify Pro ($19/month)
2. Better database plan
3. Add Redis for caching
4. Consider separate API server

## Security Checklist

✅ Environment variables set securely in Netlify  
✅ Database uses SSL connection  
✅ JWT_SECRET is random and secure  
✅ HTTPS enabled with valid certificate  
✅ httpOnly cookies for auth tokens  
✅ Password hashing with bcrypt  
✅ SQL injection protection via ORM  
✅ Rate limiting (consider adding)  

## Post-Deployment

1. **Test Everything**
   - All pages load
   - Login/register works
   - Generation works
   - Admin panel works
   - Mobile responsive

2. **Monitor First Week**
   - Check error logs daily
   - Monitor performance
   - Get user feedback

3. **Set Up Analytics**
   - Google Analytics
   - Netlify Analytics
   - User behavior tracking

4. **Marketing**
   - Share on social media
   - Submit to directories
   - SEO optimization

## Getting Help

- **Netlify Support:** [community.netlify.com](https://community.netlify.com)
- **Database Issues:** Check your provider's docs
- **Next.js Issues:** [nextjs.org/docs](https://nextjs.org/docs)
- **App Issues:** Check GitHub issues or create one

## Maintenance

### Weekly
- Check error logs
- Monitor database size
- Review user feedback

### Monthly
- Update dependencies
- Review and optimize queries
- Backup database

### Quarterly
- Security audit
- Performance optimization
- Feature updates

---

**You're Ready to Deploy! 🚀**

Need help? Check the TESTING_GUIDE.md for testing procedures.
