# LeulNet Computer Management System

## Overview

LeulNet is a comprehensive computer repair shop management system built with a modern full-stack architecture. The application handles device registration, repair tracking, point-of-sale transactions, inventory management, customer relations, and appointment scheduling for a computer services business.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack monorepo structure with clear separation between client, server, and shared components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds
- **Module Resolution**: Path aliases configured for clean imports (@/, @shared/, etc.)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **API Pattern**: RESTful API with JSON responses
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for server bundling

### Database Architecture
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Schema**: Comprehensive schema with enums, relations, and constraints
- **Connection**: Neon serverless with WebSocket support via ws package
- **Type Safety**: Full TypeScript integration with schema inference

## Key Components

### Core Business Entities
1. **Users**: Role-based system (admin, technician, sales)
2. **Customers**: Customer information and contact details
3. **Devices**: Device registration with type, brand, model classification
4. **Repairs**: Device status tracking through repair lifecycle
5. **Inventory**: Stock management for parts and products
6. **Sales**: Point-of-sale system with transaction tracking
7. **Appointments**: Scheduling system for customer interactions

### Application Features
- **Dashboard**: Business metrics and quick actions with device registration and receipt printing
- **Device Registration**: New device intake with automatic receipt printing
- **Repair Tracking**: Status monitoring through repair stages
- **Point of Sale**: Transaction processing with shopping cart and inventory integration
- **Inventory Management**: Stock levels, product catalog with item registration forms
- **Service Management**: Device types, brands, models, and service types configuration
- **Customer Management**: Contact information and service history
- **Appointment Scheduling**: Calendar and booking system
- **Analytics**: Business reporting and metrics
- **Settings**: Comprehensive business configuration, notifications, system preferences, and receipt customization

### UI/UX Design
- **Design System**: Consistent component library with variants
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Accessibility**: ARIA-compliant components from Radix UI
- **Theming**: Light/dark mode support with CSS custom properties
- **Print Support**: Specialized templates for invoices and receipts

## Data Flow

### Client-Server Communication
1. **API Requests**: Fetch-based HTTP client with credential handling
2. **Error Handling**: Centralized error boundaries with user feedback
3. **Caching**: TanStack Query for intelligent data caching and synchronization
4. **Real-time Updates**: Query invalidation for data consistency

### Database Operations
1. **Connection Management**: Pooled connections via Neon serverless
2. **Type Safety**: End-to-end TypeScript types from database to UI
3. **Migrations**: Drizzle Kit for schema versioning
4. **Relationships**: Proper foreign key constraints and joins

### Business Logic Flow
1. **Device Registration**: Customer → Device → Service Type → Repair Tracking
2. **Sales Process**: Inventory → Cart → Transaction → Receipt Generation
3. **Repair Workflow**: Registration → Diagnosis → In Progress → Completion → Pickup
4. **Inventory Management**: Stock Tracking → Reorder Points → Purchase Orders

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **react-hook-form**: Form handling and validation
- **zod**: Schema validation
- **wouter**: Lightweight routing
- **tailwindcss**: Utility-first CSS framework

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development
- **esbuild**: Production server bundling
- **drizzle-kit**: Database migration management

### Third-Party Integrations
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit**: Development environment integration
- **WebSocket**: Real-time database connections

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite HMR for client-side development
- **Type Checking**: Continuous TypeScript validation
- **Database**: Direct connection to Neon serverless instance
- **Environment Variables**: DATABASE_URL configuration required

### Production Build
1. **Client Build**: Vite builds optimized static assets to dist/public
2. **Server Build**: esbuild bundles server code to dist/index.js
3. **Database**: Production Neon instance with connection pooling
4. **Static Serving**: Express serves built client assets in production

### Configuration Management
- **Environment Variables**: DATABASE_URL for database connection
- **Build Scripts**: Separate development and production workflows
- **Port Configuration**: Dynamic port assignment for deployment platforms
- **Asset Paths**: Configurable paths for static asset serving

The architecture prioritizes type safety, developer experience, and scalability while maintaining simplicity in deployment and maintenance. The monorepo structure allows for shared types and utilities while keeping clear boundaries between frontend and backend concerns.