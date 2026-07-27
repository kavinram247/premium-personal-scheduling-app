# Premium Personal Scheduling App

A modern, responsive personal scheduling and calendar web application built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, and MongoDB.

---

## 🚀 Features

- **Interactive Time Grid**: View schedule by Day, Week, or Weekend views with drag-and-drop / click-to-create interface.
- **Event Management**: Create, edit, categorize, prioritize, and delete events with customizable reminders and locations.
- **MongoDB Integration**: Persistence powered by MongoDB Atlas.
- **Vercel Ready**: Optimized for serverless deployment on Vercel.

---

## 📋 Prerequisites

- **Node.js** 18.x or later
- **npm** or **pnpm** / **yarn**
- **Git**
- **MongoDB Atlas Connection String** (or local MongoDB instance)

---

## 🛠️ Step 1: Prepare & Push to GitHub

The repository is already initialized with Git locally and configured with `.gitignore` to prevent sensitive environment variables (`.env`) or build output (`node_modules`, `.next`) from being pushed.

### Option A: Using GitHub CLI (`gh`)
If you have `gh` installed:
```bash
gh repo create premium-personal-scheduling-app --public --source=. --remote=origin --push
```

### Option B: Manual Push via GitHub Web Interface
1. Go to [GitHub - New Repository](https://github.com/new).
2. Set Repository Name to `premium-personal-scheduling-app` (or any preferred name).
3. Leave "Initialize this repository with a README" **unchecked**.
4. Click **Create repository**.
5. Run the following commands in your terminal:
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/premium-personal-scheduling-app.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Click **Import Repository** and select your GitHub repository `premium-personal-scheduling-app`.
3. Under **Environment Variables**, add the following required key:
   - **`MONGODB_URI`**: `mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>.mongodb.net/?retryWrites=true&w=majority`
   - *(Optional)* **`MONGODB_DB`**: `life_management` (defaults to `life_management` if omitted)
4. Click **Deploy**. Vercel will automatically build and publish your project!

### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally (if not already installed)
npm i -g vercel

# Login and deploy
vercel

# Deploy to production environment
vercel --prod
```

> ⚠️ **Important MongoDB Atlas Network Access Note**:
> Because Vercel serverless functions use dynamic IP addresses, ensure your MongoDB Atlas cluster allows connections from anywhere (`0.0.0.0/0`) under **Security > Network Access** in your MongoDB Atlas dashboard, or configure MongoDB Atlas Network Peering / PrivateLink.

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
   Edit `.env` and insert your `MONGODB_URI`.

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

---

## 📁 Project Structure

```text
├── src/
│   ├── app/                # Next.js App Router (pages & API routes)
│   │   ├── api/            # Serverless API Endpoints (/api/events, /api/health)
│   │   ├── globals.css     # Global styles & Tailwind configuration
│   │   └── page.tsx        # Main application page
│   ├── components/         # React UI components (PlannerApp, TimeGrid, EventModal, etc.)
│   ├── db/                 # MongoDB connection & document schema mapping
│   └── lib/                # API client, types, date utilities & category constants
├── .env.example            # Template for required environment variables
├── .gitignore              # Git ignore configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies & npm scripts
└── tsconfig.json           # TypeScript configuration
```
