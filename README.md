# GITTE Sewing Machines - E-Commerce Website

This is a full-stack e-commerce website for GITTE Sewing Machines, built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- 🛒 Complete e-commerce functionality
- 🔐 User authentication (login/register)
- 📦 Product catalog with search and filtering
- 🛍️ Shopping cart and checkout
- 📱 Responsive design
- 💳 Order management

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Setup

The project uses SQLite with Drizzle ORM. The database is automatically initialized when the app starts.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite + Drizzle ORM
- **Authentication:** Better Auth
- **UI Components:** Shadcn/UI + Radix UI
- **Icons:** Lucide React

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable UI components
├── db/              # Database schema and seeds
├── lib/             # Utility functions and configurations
└── hooks/           # Custom React hooks
```

## Push to New Repository

To push this project to a new repository:

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: GITTE Sewing Machines e-commerce website"

# Add your remote repository
git remote add origin <your-repository-url>

# Push to main branch
git push -u origin main
```