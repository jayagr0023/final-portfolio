# Modern Personal Portfolio Website

## Overview

This is a modern, visually-rich personal portfolio website built as a full-stack application. The project showcases professional experience, skills, and provides a contact mechanism. It features a dark, immersive design inspired by purple-themed aesthetics with smooth animations, gradient effects, and interactive elements.

The application is built using React with TypeScript on the frontend, Express.js on the backend, and is designed to be deployed on Replit. It uses shadcn/ui components for a polished, professional UI and includes database capabilities through Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, providing fast hot module replacement
- Wouter for lightweight client-side routing (alternative to React Router)
- Single-page application (SPA) architecture with all routes handled client-side

**UI Component System**
- shadcn/ui component library using Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- Custom CSS variables for theming (dark mode focused)
- Component composition pattern using Radix UI's Slot component for flexible APIs

**Design Approach**
- Dark-first design system with deep purple backgrounds (#1a0b2e)
- Gradient accents (purple-to-pink, blue-to-purple) for visual hierarchy
- Card-based layouts with glassmorphism effects (backdrop blur, semi-transparent backgrounds)
- Smooth scroll animations and hover effects for interactivity
- Responsive grid system (12-column) with mobile-first breakpoints

**State Management**
- TanStack Query (React Query) for server state management
- React Hook Form for form state and validation
- Zod for runtime schema validation (shared between client and server)
- Context API for UI state (toasts, tooltips)

**Key Pages & Sections**
- Hero section with animated typewriter effect cycling through professional titles
- About section showcasing work experience with gradient-styled cards
- Skills section displaying technical competencies in categorized cards
- Contact section with validated form submission

### Backend Architecture

**Server Framework**
- Express.js server with TypeScript
- Custom middleware for request logging and JSON parsing
- HTTP server created using Node's native `http` module (for future WebSocket support)

**Development & Production**
- Dual-mode operation: Vite integration in development, static file serving in production
- Development: Vite middleware integrated into Express for hot reload
- Production: Pre-built static assets served from dist/public
- tsx for running TypeScript directly in development

**API Design**
- RESTful API endpoints under `/api` prefix
- Contact form endpoints: POST /api/contacts, GET /api/contacts, GET /api/contacts/:id
- Centralized error handling with appropriate HTTP status codes
- Request/response logging for API routes only

**Data Layer**
- Storage abstraction through `IStorage` interface for flexibility
- In-memory storage (MemStorage) as default implementation
- Drizzle ORM configured for PostgreSQL (ready for database integration)
- Schema defined in shared directory for type-safe client-server communication

**Validation Strategy**
- Shared Zod schemas between frontend and backend
- drizzle-zod for automatic schema generation from Drizzle tables
- Server-side validation on all POST endpoints
- Detailed error responses with validation failures

### Data Storage Solutions

**Contacts — MongoDB**
- Contacts are stored in a MongoDB `portfolio` database, `contacts` collection
- Connection via `MONGODB_URI` environment variable (set a real URI in Secrets to enable)
- Falls back gracefully to an in-memory Map when `MONGODB_URI` is a placeholder or unreachable
- UUID generation for contact IDs using Node's crypto module
- Automatic timestamp generation for createdAt fields
- Data sorted by creation date (newest first)

**Projects — Static / Hardcoded**
- Projects are defined as a static array in `client/src/pages/Projects.tsx`
- No database integration; the owner edits the `PROJECTS` array in that file to add/update projects
- No API routes exist for projects

**Schema Design**
- `shared/schema.ts` uses pure Zod (no Drizzle) for contact validation
- `Contact` and `Project` are plain TypeScript interfaces
- PostgreSQL/Drizzle ORM has been fully removed from the project

### External Dependencies

**UI & Components**
- Radix UI: Comprehensive set of unstyled, accessible component primitives (accordion, dialog, dropdown, popover, toast, etc.)
- shadcn/ui: Pre-styled component collection built on Radix UI
- lucide-react: Icon library for consistent iconography
- class-variance-authority: Type-safe component variant management
- tailwind-merge & clsx: Utility for merging Tailwind classes safely

**Form Management**
- react-hook-form: Performant form state management
- @hookform/resolvers: Integration layer for validation libraries
- Zod: Runtime type validation and schema definition

**Data Fetching & State**
- @tanstack/react-query: Server state management with caching, background updates
- Custom apiRequest wrapper for fetch with credential handling

**Development Tools**
- Vite plugins specific to Replit (@replit/vite-plugin-runtime-error-modal, @replit/vite-plugin-cartographer, @replit/vite-plugin-dev-banner)
- PostCSS with Tailwind CSS and Autoprefixer
- TypeScript with strict mode enabled

**Fonts**
- Google Fonts: Architects Daughter, DM Sans, Fira Code, Geist Mono
- Preconnected to fonts.googleapis.com and fonts.gstatic.com for performance

**Database & ORM**
- Drizzle ORM: Type-safe SQL query builder
- @neondatabase/serverless: Serverless PostgreSQL driver
- drizzle-zod: Automatic Zod schema generation from Drizzle schemas
- connect-pg-simple: PostgreSQL session store (configured but not actively used)

**Utility Libraries**
- date-fns: Date formatting and manipulation
- nanoid: Unique ID generation
- embla-carousel-react: Carousel/slider components

**Path Resolution**
- Custom path aliases configured in both TypeScript and Vite:
  - @/: client/src directory
  - @shared/: shared directory
  - @assets/: attached_assets directory