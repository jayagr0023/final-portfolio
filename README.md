# Personal Portfolio

A full-stack personal portfolio and project showcase built for a developer profile. The app presents an overview of the owner, skills, featured projects, resume, and contact information, with a lightweight Express backend and a React + Vite front end.

## Overview

This project is designed as a portfolio website with:

- A landing page with hero content and skill highlights
- A dedicated projects section showcasing major and minor work
- A resume section with profile details and experience
- A contact form that submits messages through an API
- Optional MongoDB persistence for contact submissions
- Live coding-stat fetches for platforms such as LeetCode and GeeksforGeeks

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Wouter for routing
- Framer Motion for UI animation
- React Query
- Radix UI + shadcn-style component patterns

### Backend
- Node.js
- Express
- TypeScript
- MongoDB with MongoDB Node Driver
- Drizzle (configured in the project tooling and schema layer)

### Deployment / Tooling
- Vite build pipeline
- esbuild server bundling
- Vercel-friendly config
- dotenv-based environment configuration

## Project Structure

```text
.
├── api/                  # Serverless API routes used for deployment
├── client/               # Frontend React app source
│   └── src/
├── server/               # Express server and API logic
├── shared/               # Shared schema and types
├── dist/                 # Production build output
├── .env                  # Local environment variables (not committed in some setups)
├── package.json          # Root scripts and dependencies
├── tailwind.config.ts    # Tailwind config
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
├── vercel.json           # Vercel deployment settings
├── .gitignore
└── README.md             # Project documentation
```

## Working Details

The app uses a hybrid frontend/backend setup:

- The frontend is built with Vite and served through the dev server during local development.
- The Node/Express application initializes the API layer and handles backend routes.
- In development, the server starts with `tsx server/index.ts` and uses Vite middleware for hot reloading.
- In production, the server is bundled and served from the `dist` folder.
- If `MONGODB_URI` is present, the app connects to MongoDB for persistence; otherwise, it logs a warning and falls back to in-memory behavior for contact data.

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 20 or above
- npm or another package manager compatible with the lock file
- A MongoDB connection string (optional but recommended for persistent contact storage)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Techie-AgrawalJi/final-portfolio.git
cd final-portfolio
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the project root if needed and add at least:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>
```

Notes:
- `PORT` is optional; the app defaults to `3000`.
- `MONGODB_URI` is optional for local development. If it is not provided, the app still starts but contact storage may fall back to in-memory handling.

## Running the Project

### Development mode

```bash
npm run dev
```

This starts the Express server and serves the frontend through Vite. The app will usually run at:

```text
http://localhost:3000
```

### Production build

```bash
npm run build
```

### Production start

```bash
npm start
```

## Available Scripts

```bash
npm run dev       # Start the application in development mode
npm run build     # Generate the production build
npm run start     # Run the built production server
npm run check     # Run TypeScript validation
npm run db:push   # Push database changes with Drizzle
```

## Notes

- The portfolio includes initiative-heavy sections such as project cards, a contact form, and coding activity stats that are fetched from public developer platforms.
- Some external platform responses may vary over time, so status values may fall back gracefully if a live fetch fails.
- The app is also ready for deployment on Vercel and follows a configuration pattern commonly used for React + Express projects.

## License

This project is distributed under the MIT license.
