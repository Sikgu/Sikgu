# Plant Subscription Service (식구)

## Overview

This is a frontend-only Korean plant subscription e-commerce service called "식구" (Plant Family). The platform allows users to browse plants, subscribe to monthly plant delivery plans, manage shopping carts, and visualize plants in a 3D interior design tool. The application features a modern, responsive web interface with JWT-based authentication and a comprehensive subscription management system.

**IMPORTANT**: This project focuses on frontend development only. The backend is developed and maintained separately by teammates and runs independently on localhost:8080. Replit's deployment features are NOT used for this project.

## User Preferences

Preferred communication style: Simple, everyday language.

## Project Setup

- **Frontend Development Only**: This Replit workspace is used exclusively for React frontend development
- **Backend Server**: Managed by teammates, runs on localhost:8080
- **No Replit Deployment**: This project does not use Replit's deployment/publishing features
- **Development Server**: Vite dev server runs on port 5000 with proxy to backend on port 8080

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- React 18 with TypeScript as the core framework
- Vite for fast development and optimized production builds
- Wouter for lightweight client-side routing instead of React Router

**State Management**
- TanStack React Query for server state management and caching
- React Context API for cart state with custom CartContext provider
- Session storage for JWT token persistence

**UI & Styling**
- Tailwind CSS for utility-first styling with custom design tokens
- shadcn/ui component library (New York variant) built on Radix UI primitives
- Noto Sans KR font for Korean language optimization
- Custom color palette with forest green primary colors (hsl(82 57% 23%))

**Form Handling**
- React Hook Form for performant form state management
- Zod for runtime schema validation and type safety
- Custom validation rules for email formats and password requirements

**3D Visualization**
- Three.js for 3D rendering with WebGL
- OrbitControls for camera manipulation
- GLTF loader for 3D model imports
- Custom skybox implementation for immersive backgrounds

### Backend Architecture

**Framework & Runtime**
- Spring Boot (Java-based backend) serving RESTful APIs
- Swagger/OpenAPI for API documentation (accessible at /swagger-ui/index.html)
- JWT (JSON Web Tokens) for stateless authentication

**API Structure**
- `/auth` - Authentication endpoints (signup, login, password reset)
- `/users` - User profile management
- `/carts` - Shopping cart operations
- `/subscriptions` - Subscription plan management and cancellations
- `/api` - General API endpoints

**Authentication & Authorization**
- JWT-based authentication with Bearer token scheme
- Tokens stored in sessionStorage on client side
- Authorization header injection for protected routes
- Custom authentication manager with Spring Security

### Database Architecture

The application appears to use a relational database (likely PostgreSQL based on Drizzle configuration references) with the following domain models:

**Core Entities**
- Users - email, password, coins (virtual currency), address, phone number
- Plants - id, name, size, price, light conditions, difficulty, humidity requirements
- Cart Items - plantId, quantity, itemTotal mapped to user carts
- Subscriptions - planId, paidAmount, paymentStatus, startDate, endDate
- Reviews - user ratings and feedback

**Business Logic**
- Coin-based pricing system (1-10 coins per subscription plan)
- Insufficient coins validation before purchases
- Cart total calculation based on plant prices and quantities

### Design System

**Color Palette**
- Primary: Forest green (--forest: hsl(82 57% 23%))
- Secondary: Olive green (--olive: hsl(76 44% 35%))
- Accent: Light green (--light-green: hsl(120 73% 75%))
- Background: Soft neutral (--bg-soft: hsl(0 0% 98%))

**Typography**
- Primary font: Noto Sans KR (weights 300-700)
- Fallback: System font stack

**Component Patterns**
- Consistent use of Card components for content containers
- Toast notifications for user feedback
- Alert dialogs for confirmations
- Responsive breakpoints: mobile-first with Tailwind's default system

### Development Workflow

**Build & Development**
- Vite dev server on port 5000 with hot module replacement
- Proxy configuration routing API calls to backend on port 8080
- Separate client and server builds
- Runtime error overlay plugin for development debugging

**Code Organization**
- `/client/src/pages` - Route-level page components
- `/client/src/components` - Reusable UI components
- `/client/src/contexts` - React Context providers
- `/client/src/hooks` - Custom React hooks
- `/client/src/lib` - Utility functions and API helpers
- Path aliases configured (@/ for src, @assets for attached_assets)

**Git Workflow**
- Main branch for stable releases (no direct commits)
- Dev branch for integration
- Feature branches with naming convention: feature/frontend-* or feature/backend-*
- Conventional commit messages with prefixes: [feat], [fix], [docs], [style], [refactor], [test], [chore]

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack React Query v5
- **Routing**: Wouter (lightweight alternative to React Router)
- **Build Tools**: Vite with TypeScript support, @vitejs/plugin-react
- **UI Components**: Radix UI primitives (@radix-ui/*), shadcn/ui components

### Styling & Design
- **CSS Framework**: Tailwind CSS with PostCSS and Autoprefixer
- **Utility Libraries**: clsx, tailwind-merge for class name management
- **Component Variants**: class-variance-authority (cva)
- **Animations**: Framer Motion for advanced animations

### 3D Graphics
- **Three.js**: Core 3D rendering library
- **Loaders**: GLTFLoader for 3D model imports
- **Controls**: OrbitControls via @three-ts/orbit-controls package

### HTTP & Data Fetching
- **HTTP Client**: Axios for API requests
- **Query Management**: TanStack React Query for server state caching and synchronization

### Backend (Spring Boot)
- **Framework**: Spring Boot with Spring Security
- **Authentication**: JWT token utilities
- **API Documentation**: Swagger/OpenAPI (springdoc-openapi)
- **Database**: Likely PostgreSQL (inferred from Drizzle references)

### Development Tools
- **Error Handling**: @replit/vite-plugin-runtime-error-modal
- **Type Safety**: TypeScript with strict mode enabled
- **Code Quality**: ESLint and Prettier (implied by project structure)

### UI Enhancement Libraries
- **Carousel**: embla-carousel-react
- **Icons**: lucide-react
- **Date Handling**: date-fns
- **Command Palette**: cmdk
- **Form Validation**: @hookform/resolvers with Zod
- **Input Components**: input-otp for OTP inputs