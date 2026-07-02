# Master Account Information

## 🔐 Master Account Credentials

**IMPORTANT: Save these credentials securely!**

```
Email:    master@aistudio.com
Password: Master@123456
Role:     master
Credits:  Unlimited (∞)
```

## What Can the Master Account Do?

### ✅ Full Platform Access
- **Unlimited Credits**: Generate unlimited images and videos
- **All AI Models**: Access to all current and future AI providers
- **No Restrictions**: No rate limits or quotas

### 👥 User Management (Admin Panel)
- Create new user accounts
- Modify user credits
- Change subscription tiers
- Assign roles (user, admin, master)
- Delete user accounts
- View all user activity

### 🎨 Content Generation
- Text to Image
- Text to Video
- Image to Video
- All generation types without credit deduction

### ⚙️ System Administration
- View platform statistics
- Monitor user activity
- Manage system settings
- Access all admin features

## Creating Additional Accounts

### Via Admin Panel (Recommended)
1. Login with master account
2. Navigate to `/admin`
3. Click "Create User"
4. Fill in details:
   - Email
   - Password
   - Name (optional)
   - Role (user/admin/master)
   - Credits
   - Subscription Tier
5. Click "Create User"

### Via Registration Page
1. Go to `/register`
2. Sign up normally
3. New users get:
   - Role: user
   - Credits: 100
   - Subscription: free

### Via API
```bash
POST /api/admin/users
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name",
  "role": "user",
  "credits": 100,
  "subscriptionTier": "free"
}
```

## User Roles Explained

### 👤 User (Default)
- Can generate content
- Limited by subscription credits
- Cannot access admin panel
- Cannot manage other users

### 🛡️ Admin
- All user permissions
- Can access admin panel
- Can manage users
- Can modify credits
- Cannot create master accounts

### 👑 Master (You)
- All admin permissions
- Unlimited credits
- Can create admin and master accounts
- Full system access
- Cannot be deleted by other admins

## Subscription Tiers

### Free Tier
- 100 credits/month
- All AI models
- HD quality
- Standard processing
- Cost: $0/month

### Basic Tier
- 1,000 credits/month
- All AI models
- Full HD quality
- Faster processing
- Cost: $19/month

### Pro Tier
- 2,000 credits/month
- Premium AI models
- 4K quality
- Priority processing
- Cost: $29/month

### Unlimited Tier
- Unlimited credits
- All models (including beta)
- 8K quality
- Fastest processing
- Cost: $99/month

## Managing Credits

### View Credits
- Header shows current credits (or ∞ for unlimited)
- Admin panel shows all users' credits

### Add Credits to User
1. Go to Admin Panel
2. Find user in table
3. Click Edit icon
4. Enter new credit amount
5. Click Save Changes

### Set Unlimited Credits
1. Set subscription tier to "unlimited"
2. Set role to "master"
3. Credits will show as ∞

## Credit Costs

| Generation Type | Credits Required |
|----------------|------------------|
| Text to Image | 1 credit |
| Text to Video | 10 credits |
| Image to Video | 15 credits |

**Note:** Master account doesn't consume credits

## Security Best Practices

### 🔒 Protect Master Account
- Change the default password immediately
- Use a strong, unique password
- Enable 2FA when available (future feature)
- Don't share master credentials
- Use admin accounts for day-to-day operations

### 👥 Create Admin Accounts
Instead of using master account daily:
1. Create admin accounts for team members
2. Use master only for critical operations
3. Regularly audit admin activities

### 📝 Password Requirements
- Minimum 6 characters (recommend 12+)
- Mix of letters, numbers, symbols
- Avoid common words
- Don't reuse passwords

## Common Tasks

### Give User Unlimited Credits
1. Login as master
2. Go to `/admin`
3. Find user
4. Click Edit
5. Set subscription tier: "unlimited"
6. Save changes

### Create Team Admin
1. Go to Admin Panel
2. Click "Create User"
3. Set role: "admin"
4. Set credits: 10000 (or unlimited)
5. Set tier: "pro" or "unlimited"

### Reset User Password
Currently via database:
```sql
-- Generate new hash for password "newpassword123"
-- Use bcrypt with 10 rounds
UPDATE users 
SET password = '$2a$10$hash...' 
WHERE email = 'user@example.com';
```

### Delete Test Users
1. Admin Panel
2. Find user
3. Click Delete (trash icon)
4. Confirm deletion

**Note:** Cannot delete master account

## Database Direct Access

### Connect to Database
```bash
psql "your-database-url"
```

### Useful Queries

**List all users:**
```sql
SELECT email, role, credits, subscription_tier 
FROM users 
ORDER BY created_at DESC;
```

**Count generations by user:**
```sql
SELECT u.email, COUNT(g.id) as total_generations
FROM users u
LEFT JOIN generations g ON u.id = g.user_id
GROUP BY u.email;
```

**Total credits used:**
```sql
SELECT SUM(credits_used) as total_credits 
FROM generations;
```

**Users by subscription:**
```sql
SELECT subscription_tier, COUNT(*) 
FROM users 
GROUP BY subscription_tier;
```

## Troubleshooting

### Cannot Login with Master Account
1. Check password is exactly: `Master@123456`
2. Check email is exactly: `master@aistudio.com`
3. Verify database has the user
4. Check browser console for errors

### Master Account Shows Limited Credits
1. Check role is "master" not "admin"
2. Check subscription_tier is "unlimited"
3. Refresh the page

### Cannot Access Admin Panel
1. Verify role is "master" or "admin"
2. Check URL is `/admin`
3. Clear cookies and login again

## Monitoring

### User Activity
- Admin panel shows all users
- Check recent generations
- Monitor credit usage

### System Health
- Database connection status
- API response times
- Error rates

### Generation Statistics
```sql
-- Success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM generations
GROUP BY status;
```

## Backup Master Account

### Export User Data
```sql
-- Get master account details
SELECT * FROM users WHERE role = 'master';
```

### Create Backup Master
```bash
# Via seed script (already creates one)
npx tsx scripts/seed.ts

# Or manually in database
INSERT INTO users (email, password, name, role, credits, subscription_tier)
VALUES (
  'backup-master@aistudio.com',
  -- bcrypt hash of 'Master@123456'
  '$2a$10$...',
  'Backup Master',
  'master',
  999999999,
  'unlimited'
);
```

## Support & Maintenance

### Regular Tasks
- **Daily:** Check error logs
- **Weekly:** Review user growth
- **Monthly:** Audit admin actions
- **Quarterly:** Update passwords

### Emergency Access
If locked out:
1. Access database directly
2. Reset password hash
3. Or create new master account via SQL

## Next Steps

1. ✅ Login with master account
2. ✅ Test all features in studio
3. ✅ Create test user accounts
4. ✅ Test admin panel
5. ✅ Change master password
6. ✅ Create team admin accounts
7. ✅ Set up monitoring
8. ✅ Deploy to production

---

**Keep This Document Secure! 🔐**

These credentials provide full access to your AI Studio platform.
