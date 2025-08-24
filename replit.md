# Overview

BudgetTogether is a collaborative household budget management application built with React, Express, and PostgreSQL. The application enables household members to track expenses, set budgets, and manage financial goals together. Key features include receipt scanning with OCR for expense extraction, category-based budget tracking, and real-time dashboard analytics showing spending patterns and budget progress.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with pages for Dashboard, Expenses, and Budgets
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component system for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js as the web framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints organized in `/api` routes
- **File Processing**: Multer for file uploads, Sharp for image processing, and Tesseract.js for OCR receipt scanning
- **Development**: Vite middleware integration for hot module replacement in development

## Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless in production)
- **Schema**: Shared schema definitions between client and server using Drizzle-Zod integration
- **Migrations**: Drizzle Kit for database schema migrations and management

## Data Models
The application uses a multi-tenant household structure with the following core entities:
- **Households**: Top-level organization unit for families/groups
- **Users**: Individual members belonging to households with authentication
- **Categories**: Spending categories (groceries, utilities, etc.) with icons and colors
- **Budgets**: Monthly/periodic spending limits per category
- **Expenses**: Individual transactions linked to categories and users
- **Receipts**: OCR-processed receipt images attached to expenses

## Development Tools
- **Component System**: shadcn/ui configuration with customized Tailwind theme
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Path Aliases**: Configured for clean imports (`@/`, `@shared/`)
- **Development Experience**: Runtime error overlays and Replit-specific development tools

## Key Features Architecture
- **Receipt Scanning**: File upload → Sharp image processing → Tesseract OCR → expense auto-fill
- **Real-time Dashboard**: Aggregated spending analytics with category progress tracking
- **Responsive Design**: Mobile-first approach with desktop navigation and mobile-optimized layouts
- **Form Validation**: Zod schemas shared between client and server for consistent validation

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI and Styling
- **Radix UI**: Headless component primitives for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Inter font family for typography

## File Processing and OCR
- **Multer**: Multipart form data handling for file uploads
- **Sharp**: High-performance image processing for receipt optimization
- **Tesseract.js**: Client-side OCR processing for receipt text extraction

## Development and Build Tools
- **Vite**: Fast development server and build tool with React plugin
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment plugins and error handling

## Form and Data Management
- **React Hook Form**: Performant form library with minimal re-renders
- **TanStack Query**: Server state management with caching and synchronization
- **date-fns**: Date manipulation and formatting utilities
- **Zod**: Runtime type validation for forms and API data

## Authentication and Security
- **Express Session**: Session-based authentication (configured but not fully implemented)
- **CORS and Security**: Standard Express security middleware setup