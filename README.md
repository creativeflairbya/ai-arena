# AI Studio - Professional AI Media Generation Platform

A comprehensive AI-powered platform for generating images and videos using state-of-the-art models like Veo, Kling, Seedance, FLUX, and more.

## Features

- 🎨 **Text to Image** - Generate stunning images from text descriptions
- 🎬 **Text to Video** - Create professional videos from prompts
- 🖼️ **Image to Video** - Animate static images with AI
- 💳 **Multiple Payment Options** - International (Visa, Mastercard) and Pakistani (JazzCash, Easypaisa, Bank Transfer)
- 👥 **User Management** - Admin panel for managing users and credits
- 🎯 **Subscription Tiers** - Free, Basic, Pro, and Unlimited plans
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- 🔐 **Secure Authentication** - JWT-based authentication system

## Master Account Credentials

For testing and admin access:

**Email:** master@aistudio.com  
**Password:** Master@123456  
**Role:** Master (Unlimited Credits)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or use Railway/Supabase/Neon free tier)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd ai-studio
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env file
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secret-key-min-32-characters-long
REPLICATE_API_TOKEN=optional-for-real-ai-generation
```

4. Initialize database
```bash
# Push schema to database
npx drizzle-kit push

# Create master account
npx tsx scripts/seed.ts
```

5. Run the development server
```bash
npm run dev
```

6. Open browser and login
- URL: [http://localhost:3000/login](http://localhost:3000/login)
- Email: `master@aistudio.com`
- Password: `Master@123456`

## Quick Start (No Database Setup)

The app will build successfully even without a database. You'll need the database only when running the application.

```bash
npm install
npm run build  # ✅ Works without database
```

## Deployment to Netlify

### Option 1: Deploy via Git

1. Push your code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. Connect to Netlify:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`

3. Add environment variables in Netlify:
   - Go to Site settings → Environment variables
   - Add `DATABASE_URL`, `JWT_SECRET`, and any optional API keys

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)

### Optional
- `REPLICATE_API_TOKEN` - For AI generation (app works with fallback if not provided)
- `STRIPE_SECRET_KEY` - For payment processing
- `STRIPE_PUBLISHABLE_KEY` - For Stripe frontend
- `NEXT_PUBLIC_APP_URL` - Your app's URL

## AI Providers

The platform supports multiple AI providers:

1. **Replicate** - Primary provider for all models
   - FLUX Schnell for images
   - Zeroscope V2 XL for text-to-video
   - Stable Video Diffusion for image-to-video

2. **Fallback Mode** - Works without API keys using placeholder content
   - Great for testing the platform
   - Replace with actual API keys for production

## Features by Subscription Tier

### Free
- 100 credits/month
- All AI models
- HD quality
- Standard processing

### Basic ($19/month)
- 1,000 credits/month
- All AI models
- Full HD quality
- Faster processing
- Commercial use

### Pro ($29/month)
- 2,000 credits/month
- Premium AI models
- 4K quality
- Priority processing
- API access
- Commercial use

### Unlimited ($99/month)
- Unlimited credits
- All models including beta
- 8K quality
- Fastest processing
- Full API access
- Team features
- White-label options

## Credit Costs

- Text to Image: 1 credit
- Text to Video: 10 credits
- Image to Video: 15 credits

## Admin Panel

Access at `/admin` with master or admin role:

- View all users
- Create new users
- Manage user credits
- Change subscription tiers
- Assign roles

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Generation
- `POST /api/generate` - Create new generation
- `GET /api/generations` - Get user's generations
- `GET /api/generations/[id]` - Get specific generation

### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

## Database Schema

### Users
- Authentication and profile data
- Credits and subscription info
- Role-based permissions

### Generations
- AI generation requests and results
- Status tracking
- Credit usage

### Transactions
- Payment history
- Credit purchases
- Subscription changes

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** JWT with httpOnly cookies
- **Styling:** Tailwind CSS
- **UI Components:** Custom components with Radix UI primitives
- **AI Providers:** Replicate API
- **Payments:** Stripe (ready for integration)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- httpOnly cookies
- Server-side session validation
- Role-based access control
- Environment variable protection

## Support

For issues or questions:
- Create an issue on GitHub
- Contact support@aistudio.com

## License

Proprietary - All rights reserved

## Credits

Built with ❤️ using Next.js, PostgreSQL, and cutting-edge AI models.
