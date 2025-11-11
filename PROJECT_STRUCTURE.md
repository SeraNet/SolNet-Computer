# 📁 SolNet Management System - Project Structure

## 🏗️ Overall Architecture

```
SolNetManage/
├── client/                 # Frontend React Application
├── server/                 # Backend Express.js API
├── shared/                 # Shared TypeScript types and schemas
├── scripts/                # Database scripts and utilities
├── drizzle/                # Database migrations
└── migrations/             # Legacy migrations (to be cleaned)
```

## 🎯 Frontend Structure (`client/src/`)

### 📄 Pages (`pages/`)

- **Core Business Pages:**

  - `dashboard.tsx` - Main dashboard with KPIs and quick actions
  - `customers.tsx` - Customer management with search and highlighting
  - `device-registration-fixed.tsx` - Device registration workflow
  - `repair-tracking.tsx` - Device repair status tracking
  - `point-of-sale.tsx` - Sales and transactions
  - `inventory-management.tsx` - Inventory control
  - `service-management.tsx` - Services, brands, models, accessories

- **Analytics & Reports:**

  - `analytics-hub.tsx` - Main analytics dashboard
  - `advanced-analytics.tsx` - Advanced analytics features
  - `expense-analytics.tsx` - Expense tracking and analysis

- **Administrative:**

  - `settings.tsx` - System configuration (needs refactoring)
  - `workers.tsx` - User/employee management
  - `locations.tsx` - Location management
  - `appointments.tsx` - Appointment scheduling

- **Financial:**

  - `expenses.tsx` - Expense management
  - `loan-invoices.tsx` - Loan and invoice management

- **System:**
  - `login.tsx` - Authentication
  - `owner-profile.tsx` - User profile management
  - `customer-portal.tsx` - Customer-facing portal
  - `public-landing.tsx` - Public landing page

### 🧩 Components (`components/`)

#### Core Components:

- `search-results.tsx` - Global search results with highlighting
- `RoleGuard.tsx` - Role-based access control
- `receipt-template.tsx` - Receipt generation
- `report-generator.tsx` - Report generation
- `import-export.tsx` - Data import/export functionality

#### Layout Components (`layout/`):

- `app-layout.tsx` - Main application layout
- `header.tsx` - Header with global search
- `sidebar.tsx` - Navigation sidebar

#### UI Components (`ui/`):

- Standard shadcn/ui components
- Custom form components
- Data visualization components

#### Feature Components (`features/`):

- Business-specific feature components
- Reusable business logic components

### 🪝 Hooks (`hooks/`)

- `useAuth.ts` - Authentication management
- `useLocation.ts` - Location context
- `useSearchHighlight.ts` - Search result highlighting
- `useToast.ts` - Toast notifications

### 📚 Libraries (`lib/`)

- `queryClient.ts` - React Query configuration
- `currency.ts` - Currency formatting utilities
- `utils.ts` - General utilities

### 🏷️ Types (`types/`)

- TypeScript type definitions
- API response types
- Business entity types

## 🔧 Backend Structure (`server/`)

### Core Files:

- `index.ts` - Main server entry point
- `routes.ts` - API route definitions (needs refactoring)
- `storage.ts` - Database operations (needs refactoring)
- `db.ts` - Database connection

### Middleware (`middleware/`):

- Authentication middleware
- Request validation
- Error handling

## 🗄️ Database (`shared/` & `drizzle/`)

### Schema (`shared/schema.ts`):

- Drizzle ORM schema definitions
- Table structures
- Relationships

### Migrations (`drizzle/`):

- Database migration files
- Schema version control

## 🧹 Cleanup Recommendations

### 1. **Immediate Actions:**

- ✅ Remove console.log statements
- ✅ Delete duplicate files (analytics.tsx, inventory-complete.tsx)
- ✅ Remove temporary documentation files
- ✅ Clean up scripts directory

### 2. **Code Organization:**

- 🔄 Break down large files (settings.tsx - 3279 lines)
- 🔄 Split storage.ts into domain-specific modules
- 🔄 Organize routes.ts by feature
- 🔄 Create feature-based component structure

### 3. **Performance Optimizations:**

- 🔄 Implement code splitting
- 🔄 Optimize bundle size
- 🔄 Add proper error boundaries
- 🔄 Implement proper loading states

### 4. **Code Quality:**

- 🔄 Add TypeScript strict mode
- 🔄 Implement proper error handling
- 🔄 Add unit tests
- 🔄 Add integration tests
- 🔄 Implement proper logging

## 🚀 Next Steps

1. **Refactor Large Components:**

   - Break down settings.tsx into smaller components
   - Split service-management.tsx by tabs
   - Organize dashboard.tsx into feature components

2. **Optimize Backend:**

   - Split storage.ts into domain modules
   - Organize routes by feature
   - Implement proper error handling

3. **Add Testing:**

   - Unit tests for components
   - Integration tests for API
   - E2E tests for critical flows

4. **Performance:**

   - Implement React.memo for expensive components
   - Add proper loading states
   - Optimize database queries

5. **Documentation:**
   - API documentation
   - Component documentation
   - Deployment guide
