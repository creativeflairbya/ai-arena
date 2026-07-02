# AI Studio - Testing Guide

## Master Account Access

Use these credentials to test the full platform with unlimited access:

**Email:** master@aistudio.com  
**Password:** Master@123456

## Testing Checklist

### 1. Authentication Flow
- [ ] Visit the homepage at `/`
- [ ] Click "Sign Up" and create a new test account
- [ ] Verify you get redirected to `/studio` after signup
- [ ] Verify you receive 100 free credits
- [ ] Logout and login again with the master account
- [ ] Verify redirect to `/studio` after login

### 2. Studio Page (Content Generation)
- [ ] Login with master account
- [ ] Verify credits show as "∞" (unlimited)
- [ ] Test **Text to Image** generation:
  - Select "Text to Image"
  - Enter prompt: "A beautiful sunset over mountains, vibrant colors, photorealistic"
  - Click Generate
  - Wait for completion (should show in Recent Generations)
  - Verify image appears and can be downloaded
  
- [ ] Test **Text to Video** generation:
  - Select "Text to Video"
  - Enter prompt: "A cat playing with a ball of yarn, smooth motion, cinematic"
  - Click Generate
  - Wait for completion
  - Verify video appears and can be played
  
- [ ] Test **Image to Video** generation:
  - Select "Image to Video"
  - Enter image URL: `https://picsum.photos/1024/576`
  - Enter prompt: "Animate this image with gentle motion"
  - Click Generate
  
- [ ] Verify Recent Generations sidebar updates in real-time
- [ ] Test download functionality for completed generations

### 3. Admin Panel
- [ ] Login with master account
- [ ] Navigate to `/admin`
- [ ] Verify you can see:
  - Total users count
  - Free users count
  - Premium users count
  - Users table with all accounts
  
- [ ] Test creating a new user:
  - Click "Create User"
  - Fill in email, password, name
  - Set credits to 500
  - Set subscription tier to "pro"
  - Click Create User
  - Verify user appears in the table
  
- [ ] Test editing a user:
  - Click Edit icon on any user
  - Change credits to 1000
  - Change subscription tier
  - Click Save Changes
  - Verify changes are reflected
  
- [ ] Test deleting a user (not the master account)
  - Click Delete icon
  - Confirm deletion
  - Verify user is removed

### 4. Pricing Page
- [ ] Visit `/pricing`
- [ ] Verify all 4 plans are displayed:
  - Free ($0/month)
  - Basic ($19/month)
  - Pro ($29/month - highlighted)
  - Unlimited ($99/month)
- [ ] Verify payment methods are shown:
  - Visa, Mastercard
  - JazzCash, Easypaisa
  - Bank Transfer
- [ ] Click subscription buttons (will show alert since Stripe not configured)

### 5. Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify header/footer show on all screens
- [ ] Verify mobile menu works properly
- [ ] Verify all forms are usable on mobile

### 6. Header/Footer
- [ ] Verify header shows on all pages
- [ ] Verify footer shows on all pages
- [ ] Test navigation links in header
- [ ] Test credits display in header
- [ ] Test user menu dropdown
- [ ] Test logout functionality

### 7. Error Handling
- [ ] Try logging in with wrong password
  - Verify error message appears
  - Verify stays on login page
- [ ] Try logging in with non-existent email
  - Verify error message appears
- [ ] Try registering with existing email
  - Verify error message appears
- [ ] Try generating without prompt
  - Verify validation message appears
- [ ] Test with insufficient credits (create a free user)
  - Verify error message when credits run out

### 8. Generation Status
- [ ] Start a generation
- [ ] Verify status shows as "processing"
- [ ] Verify spinner animation appears
- [ ] Watch status change to "completed"
- [ ] Verify result appears automatically

### 9. Credit System
- [ ] Create a new free account (100 credits)
- [ ] Generate 1 image (costs 1 credit)
- [ ] Verify credits decrease to 99
- [ ] Generate 1 video (costs 10 credits)
- [ ] Verify credits decrease to 89
- [ ] Try to generate when credits are insufficient
- [ ] Verify error message appears

### 10. Multiple Providers
- [ ] Verify fallback mode works (without REPLICATE_API_TOKEN)
- [ ] Test different generation types
- [ ] Verify all complete successfully with placeholder content

## Notes for Production

### Environment Variables
Make sure to set these in your deployment platform (Netlify):

**Required:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - A secure random string (min 32 characters)

**Optional (for actual AI generation):**
- `REPLICATE_API_TOKEN` - Get from replicate.com

### Database Setup
1. Create PostgreSQL database
2. Run: `npx drizzle-kit push`
3. Run: `npx tsx scripts/seed.ts`

### Deployment to Netlify
1. Push code to GitHub
2. Connect repository to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy!

## Known Limitations (Demo Mode)

Without API keys:
- Generates placeholder images (from Picsum)
- Generates sample video (Big Buck Bunny)
- Perfect for testing the platform flow
- Add `REPLICATE_API_TOKEN` for real AI generation

## Support

For issues:
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify environment variables are set correctly
4. Ensure database is accessible

## Performance Tips

1. **Credits**: Master account has unlimited credits
2. **Processing Time**: Real AI generation takes 10-60 seconds
3. **Polling**: App polls every 2 seconds for generation status
4. **Concurrent Generations**: You can start multiple generations

## Security Notes

✅ Passwords are hashed with bcrypt  
✅ JWT tokens stored in httpOnly cookies  
✅ Server-side session validation  
✅ Role-based access control  
✅ SQL injection protection via Drizzle ORM  

## Next Steps

1. Test all features with the master account
2. Create test users with different subscription tiers
3. Test the complete user journey
4. Verify responsive design on all devices
5. Add your Replicate API key for real AI generation
6. Configure Stripe for actual payments
7. Deploy to production!

---

**Happy Testing! 🚀**
