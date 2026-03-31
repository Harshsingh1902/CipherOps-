# 🌙 Luna Health — Women's Wellness Companion

A premium, AI-powered women's health tracking web app built with **Next.js 14**, **Supabase**, and **Claude AI**. Inspired by Flo but reimagined with a 24/7 AI assistant, real-time voice chat, image analysis, and a dark premium UI.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌙 **Cycle Tracking** | Calendar view, period logging, predictions (next period, ovulation, fertile window) |
| 😊 **Mood & Symptoms** | Daily logging with emoji moods, energy sliders, symptom tags, 14-day trend chart |
| 🥗 **Nutrition** | Meal logging, calorie tracking, water intake with wave progress UI |
| 😴 **Sleep** | Bedtime/wake time tracking, quality scoring, 14-day bar chart |
| 🤖 **Luna AI Chat** | 24/7 streaming text chat powered by Claude API |
| 🎤 **Voice Input** | Browser Speech Recognition for hands-free queries |
| 🔊 **Voice Output** | Web Speech Synthesis for AI voice responses |
| 📸 **Image Analysis** | Upload nutrition labels, health reports, or symptoms for AI analysis |
| 🔐 **Auth** | Email/password + Google OAuth via Supabase Auth |
| 📊 **Dashboard** | Real-time overview with cycle ring, mood, hydration, sleep, AI insights |

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion, custom CSS variables
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Charts**: Recharts
- **Deploy**: Vercel

---

## 🚀 Quick Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/luna-health.git
cd luna-health
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to **SQL Editor** → Run the migration file:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Go to **Authentication** → **Providers** → Enable Google OAuth (optional)
4. Copy your project URL and API keys from **Settings → API**

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Get your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key → Copy it to `ANTHROPIC_API_KEY`

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel

### Option A: VS Code + GitHub (recommended)

1. **Initialize git in VS Code**:
   ```bash
   git init
   git add .
   git commit -m "Initial Luna Health commit"
   ```

2. **Push to GitHub** (use VS Code Source Control panel or):
   ```bash
   gh repo create luna-health --public
   git push -u origin main
   ```

3. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) → New Project
   - Import your GitHub repo
   - Add **Environment Variables** (same as `.env.local` contents)
   - Deploy!

4. **Update Supabase**:
   - Go to Supabase → **Authentication → URL Configuration**
   - Add your Vercel URL: `https://your-app.vercel.app`
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel
# Follow prompts, add env vars when asked
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── middleware.ts             # Auth middleware
│   ├── auth/
│   │   ├── login/page.tsx        # Sign in
│   │   ├── signup/page.tsx       # Register
│   │   └── callback/route.ts    # OAuth callback
│   ├── onboarding/page.tsx      # 4-step onboarding
│   ├── dashboard/
│   │   ├── layout.tsx           # Sidebar + mobile nav
│   │   ├── page.tsx             # Overview
│   │   ├── DashboardClient.tsx  # Dashboard UI
│   │   ├── cycle/page.tsx       # Cycle tracker
│   │   ├── mood/page.tsx        # Mood & symptoms
│   │   ├── nutrition/page.tsx   # Nutrition tracker
│   │   └── sleep/page.tsx       # Sleep tracker
│   ├── assistant/
│   │   ├── layout.tsx           # Full-screen layout
│   │   └── page.tsx             # AI chat interface
│   └── api/
│       ├── chat/route.ts        # Claude streaming chat
│       ├── voice/route.ts       # Voice → Claude response
│       └── analyze/route.ts     # Image analysis
├── components/
│   └── layout/
│       ├── Sidebar.tsx          # Desktop navigation
│       └── MobileNav.tsx        # Bottom mobile nav
├── lib/
│   ├── utils.ts                 # Helper functions
│   └── supabase/
│       ├── client.ts            # Browser Supabase client
│       └── server.ts            # Server Supabase client
├── types/index.ts               # TypeScript types
└── styles/globals.css           # Global styles + CSS vars
```

---

## 🔒 Security & Privacy

- All data protected with **Row Level Security (RLS)** — users can only access their own data
- Auth managed by Supabase with JWT tokens
- Claude API calls made server-side only (API key never exposed to browser)
- No health data sold or shared

---

## 🎨 Customization

- **Colors**: Edit CSS variables in `src/styles/globals.css`
- **AI Personality**: Edit `SYSTEM_PROMPT` in `src/app/api/chat/route.ts`
- **App Name**: Change "Luna" throughout or make it configurable via env vars

---

## 📦 Adding More Features

- **Push Notifications**: Add Supabase Edge Functions + Web Push API
- **Export Data**: Add CSV export endpoint
- **Partner sharing**: Add Supabase RLS policies for shared access
- **Premium tier**: Integrate Stripe for subscriptions

---

## 🐛 Common Issues

| Issue | Fix |
|---|---|
| Supabase auth redirect error | Add your domain to Supabase Auth allowed URLs |
| Claude API 401 | Check `ANTHROPIC_API_KEY` is set correctly in Vercel env vars |
| Voice not working | HTTPS required — voice works on Vercel/production, not `http://localhost` always |
| Build fails | Run `npm run build` locally first to catch TS errors |

---

## 📝 License

MIT — build freely, credit appreciated 🌙
