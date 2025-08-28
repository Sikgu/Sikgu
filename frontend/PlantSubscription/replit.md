# Plant Subscription Service (식구)

## Overview

This is a Korean plant subscription service called "식구" (Plant Family) that allows users to discover and subscribe to premium plants for their spaces. The application features a modern, responsive web interface built with React and a Node.js/Express backend. The service offers different subscription tiers with a coin-based system, plant care guides, expert consultation, and user reviews.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **UI Components**: Comprehensive set of Radix UI primitives wrapped in custom components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: Korean language support with Noto Sans KR font

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: Hot reload with Vite integration for development
- **Storage**: In-memory storage implementation with interface for future database integration
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session store

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: Configured for PostgreSQL with Neon Database serverless connection
- **Schema**: User management with username/password authentication
- **Migrations**: Drizzle Kit for database schema management

### Design System
- **Theme**: Custom color palette with forest green primary colors
- **Components**: shadcn/ui "new-york" style variant
- **Typography**: Korean-optimized font stack with Noto Sans KR
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### Development Workflow
- **Build Process**: Separate client and server builds with esbuild for server bundling
- **Development Server**: Integrated Vite dev server with Express API routes
- **Type Safety**: Strict TypeScript configuration with shared types
- **Code Quality**: Path mapping for clean imports and consistent file organization

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18 with React DOM, React Hook Form, and TanStack React Query
- **Backend**: Express.js with TypeScript support via tsx
- **Build Tools**: Vite for frontend bundling, esbuild for server bundling

### UI and Styling
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Icons**: Lucide React icon library
- **Utilities**: clsx and tailwind-merge for conditional styling

### Database and Validation
- **Database**: Drizzle ORM with PostgreSQL support via @neondatabase/serverless
- **Validation**: Zod for schema validation and type safety
- **Sessions**: connect-pg-simple for PostgreSQL session storage

### Development Tools
- **Development**: Replit-specific plugins for error overlay and debugging
- **Date Handling**: date-fns for date manipulation
- **Carousel**: Embla Carousel for image galleries
- **Command Interface**: cmdk for command palette functionality

### External Services
- **Database Hosting**: Neon Database for serverless PostgreSQL
- **Image Assets**: Unsplash for plant photography
- **Fonts**: Google Fonts for Noto Sans KR typography