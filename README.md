# Multi-Tenant Personal Scheduling App

A modern, responsive multi-tenant personal scheduling web application built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Clerk Authentication, and MongoDB Atlas.

---

## 🚀 Features

- **Multi-Tenant User Accounts**: Authentication provided by Clerk with complete data isolation per user.
- **Interactive Time Grid**: View schedule by Day, Week, or Weekend views with drag-to-create interface.
- **Event Management**: Create, edit, categorize, prioritize, and delete events with customizable reminders and locations.
- **MongoDB Atlas Storage**: User-scoped document storage with fast serverless querying.
- **Vercel Ready**: Fully optimized for serverless deployment on Vercel.

---

## 📋 Prerequisites

- **Node.js** 18.x or later
- **npm** or **pnpm** / **yarn**
- **Git**
- **MongoDB Atlas Connection String**
- **Clerk Application Keys** (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`)

---

## 🔐 Setting Up Clerk Authentication

1. Create a free account at [Clerk Dashboard](https://dashboard.clerk.com/).
2. Create a new application (e.g. `LifePlanner`).
3. Copy your API Keys from the Clerk Dashboard:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

---

## 🌐 Deploying to Vercel

1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) and import your repository.
3. Under **Environment Variables**, add:
   - **`MONGODB_URI`**: `mongodb+srv://flexstore27_db_user:o0lOqsGqidAZubTl@cluster0.wmczric.mongodb.net/?appName=Cluster0`
   - **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`**: `pk_test_...`
   - **`CLERK_SECRET_KEY`**: `sk_test_...`
   - *(Optional)* **`MONGODB_DB`**: `life_management`
4. Click **Deploy**.

---

## 💻 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_GITHUB_USERNAME/premium-personal-scheduling-app.git
   cd premium-personal-scheduling-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up local environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your `MONGODB_URI`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY`.

4. **Run development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Typecheck & Linting**:
   ```bash
   npm run typecheck
   npm run lint
   ```

6. **Production Build Test**:
   ```bash
   npx next build --webpack
   ```
