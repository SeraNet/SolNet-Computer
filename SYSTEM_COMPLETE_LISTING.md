# SolNetComputer Management System - Complete Listing

**Version:** 1.0  
**Last Updated:** October 16, 2025  
**Document Type:** System Component Listing

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Core Functionalities](#core-functionalities)
3. [Database Tables](#database-tables)
4. [Application Pages](#application-pages)
5. [Technology Stack](#technology-stack)
6. [External Services](#external-services)

---

## System Overview

**SolNetComputer** is a comprehensive multi-location repair shop management system designed for computer and device repair businesses.

### What This System Does

- **Device Repair Management** - Track devices from registration to delivery
- **Point of Sale (POS)** - Sell products and accessories
- **Inventory Management** - Manage stock, purchase orders, and suppliers
- **Customer Relationship Management (CRM)** - Manage customer data and communications
- **Financial Management** - Track expenses, budgets, and loan invoices
- **Staff Management** - Manage workers with role-based access control
- **Multi-Location Support** - Operate multiple branches with centralized management
- **Analytics & Reporting** - Business insights and performance metrics
- **SMS Notifications** - Automated customer communication
- **Appointment Scheduling** - Service appointment calendar

---

## Core Functionalities

### 1. **Device Registration & Repair Tracking**
- Register devices for repair
- Assign to technicians
- Track repair status (registered → in_progress → completed → delivered)
- Diagnosis and repair notes
- Estimate and final cost calculation
- Receipt generation
- Priority management
- Warranty tracking
- Status history logging

### 2. **Point of Sale (POS)**
- Create sales transactions
- Multiple payment methods (cash, card, mobile)
- Product search and selection
- Tax and discount calculation
- Receipt generation
- Customer assignment (optional)
- Inventory auto-deduction

### 3. **Inventory Management**
- Unified inventory for parts and products
- Stock level monitoring
- Low stock alerts
- Reorder point automation
- Purchase order creation and management
- Supplier management
- SKU and barcode tracking
- Multi-category organization
- Stock predictions
- Import/Export capabilities

### 4. **Customer Management**
- Customer registration
- Contact information management
- Service history tracking
- Multi-location customer data
- Customer feedback collection
- SMS communication
- Loan invoice tracking

### 5. **Financial Management**
- Expense tracking by category
- Budget management (monthly/quarterly/yearly)
- Loan invoices with payment tracking
- Payment method tracking
- Vendor management
- Receipt storage
- Financial analytics

### 6. **Staff & User Management**
- Role-based access control (Admin, Technician, Sales)
- User profiles with photos
- Location assignment
- Activity tracking
- Permission management
- Worker performance metrics

### 7. **Appointment Scheduling**
- Service appointment calendar
- Customer scheduling
- Technician assignment
- Duration management
- Status tracking
- Reminder notifications

### 8. **Analytics & Reporting**
- Revenue analytics
- Sales performance
- Repair metrics
- Inventory analytics
- Expense analytics
- Customer retention
- Technician performance
- Location comparisons

### 9. **Communication System**
- SMS notifications (Twilio + Ethiopian providers)
- SMS campaigns
- SMS templates
- Recipient groups
- Customer messages
- In-app notifications
- Email notifications

### 10. **Multi-Location Management**
- Multiple branch support
- Location-based data filtering
- Branch-specific users
- Location-specific inventory
- Cross-location analytics
- Centralized admin control

### 11. **Public Landing Page**
- Business profile display
- Services showcase
- Products display
- Contact information
- Customer testimonials
- Business statistics
- Team showcase

### 12. **System Administration**
- Business profile management
- System settings
- Category management
- Service type management
- Device type/brand/model management
- Backup and restore
- Import/export tools
- System health monitoring

---

## Database Tables

**Total Tables: 41** (Corrected - see SYSTEM_LISTING_ADDENDUM.md for details)

### Core Business Tables (10)

1. **locations** - Branch/location information
2. **users** - Staff and worker accounts
3. **customers** - Customer information
4. **devices** - Devices registered for repair
5. **inventory_items** - Unified inventory (parts + products)
6. **sales** - Sales transaction headers
7. **sale_items** - Sales transaction line items
8. **purchase_orders** - Purchase order headers
9. **purchase_order_items** - Purchase order line items
10. **suppliers** - Supplier directory

### Financial Management Tables (5)

11. **expenses** - Business expense records
12. **expense_categories** - Expense category definitions
13. **budgets** - Budget allocations
14. **loan_invoices** - Customer loan/credit invoices
15. **loan_invoice_payments** - Loan payment records

### Device & Service Reference Tables (6)

16. **device_types** - Device type definitions (phone, laptop, tablet, etc.)
17. **brands** - Device brand definitions (Apple, Samsung, HP, etc.)
18. **models** - Device model definitions
19. **service_types** - Service type definitions
20. **categories** - General category definitions
21. **accessories** - Accessory items (legacy, links to inventory_items)

### Communication & Notification Tables (13)

22. **notifications** - In-app notification records
23. **notification_types** - Notification type definitions
24. **notification_templates** - Notification message templates
25. **notification_preferences** - User notification preferences
26. **sms_templates** - SMS message templates
27. **sms_campaigns** - SMS campaign headers
28. **sms_campaign_recipients** - SMS campaign recipient list
29. **sms_settings** - SMS configuration settings
30. **ethiopian_sms_settings** - Ethiopian SMS provider settings
31. **recipient_groups** - Customer group definitions
32. **recipient_group_members** - Customer group memberships
33. **customer_messages** - Customer message log
34. **customer_feedback** - Customer feedback records

### Tracking & History Tables (4)

35. **device_status_history** - Device status change log
36. **device_problems** - Device problem records
37. **device_feedback** - Device service feedback
38. **warranties** - Warranty records (if exists)

### Additional System Tables (3)

39. **appointments** - Service appointment records
40. **business_profile** - Business information and settings
41. **system_settings** - System configuration key-value pairs

---

## Application Pages

**Total Pages: 33**

### Public Pages (2)

#### 1. **Public Landing Page** (`/` or `/landing`)
- Hero section with business introduction
- Services showcase
- Products/accessories display
- Customer testimonials
- Business statistics
- Contact information
- About us section
- Team members
- Why choose us

#### 2. **Login Page** (`/login`)
- Username/password authentication
- Remember me option
- Login form

### Protected Pages (31)

#### 3. **Dashboard** (`/dashboard`)
**Tabs/Sections:**
- Overview statistics
- Revenue charts
- Recent devices
- Low stock alerts
- Quick actions
- Performance metrics
- Recent activities

#### 4. **Device Registration** (`/device-registration`)
**Tabs/Sections:**
- All Devices
- Registered
- In Progress
- Completed
- Delivered
- Register New Device form
- Device details modal
- Status update
- Receipt printing

#### 5. **Repair Tracking** (`/repair-tracking`)
**Tabs/Sections:**
- Active Repairs
- Pending
- In Progress
- Waiting Parts
- Completed
- Search and filters
- Technician assignment
- Status updates
- Repair notes

#### 6. **Point of Sale** (`/point-of-sale`)
**Tabs/Sections:**
- Product selection
- Cart management
- Customer search/select
- Payment processing
- Receipt generation
- Transaction summary

#### 7. **Sales** (`/sales`)
**Tabs/Sections:**
- Sales list
- Sales filters (date, customer, location)
- Sale details
- Sales analytics
- Export options

#### 8. **Inventory Management** (`/inventory-management`)
**Tabs/Sections:**
- All Items
- Low Stock
- Out of Stock
- Categories
- Add/Edit Item form
- Stock adjustments
- Import/Export

#### 9. **Inventory Predictions** (`/inventory-predictions`)
**Tabs/Sections:**
- Stock predictions
- Reorder suggestions
- Demand forecasting
- Sales velocity analysis

#### 10. **Customers** (`/customers`)
**Tabs/Sections:**
- Customer list
- Customer search
- Add/Edit Customer form
- Customer details
- Service history
- Device history
- Contact information

#### 11. **Appointments** (`/appointments`)
**Tabs/Sections:**
- Calendar view
- List view
- Scheduled
- Confirmed
- Completed
- Cancelled
- Add appointment form
- Appointment details

#### 12. **Locations** (`/locations`)
**Tabs/Sections:**
- Location list
- Add/Edit Location form
- Location details
- Branch settings
- Manager information

#### 13. **Workers** (`/workers`)
**Tabs/Sections:**
- Worker list
- Add/Edit Worker form
- Worker details
- Role assignment
- Location assignment
- Performance metrics

#### 14. **Owner Profile** (`/owner-profile`)
**Tabs/Sections:**
- Personal Information
- Business Information
- Profile photo upload
- Contact details
- Business statistics

#### 15. **Worker Profile** (`/worker-profile`)
**Tabs/Sections:**
- Personal Information
- Profile photo
- Contact details
- Work statistics
- Change password

#### 16. **Expenses** (`/expenses`)
**Tabs/Sections:**
- All Expenses
- By Category
- By Date
- Add Expense form
- Expense details
- Receipt upload
- Categories management

#### 17. **Expense Analytics** (`/expense-analytics`)
**Tabs/Sections:**
- Expense trends
- Category breakdown
- Budget vs actual
- Monthly comparisons
- Charts and graphs

#### 18. **Loan Invoices** (`/loan-invoices`)
**Tabs/Sections:**
- Active Invoices
- Pending
- Paid
- Overdue
- Create Invoice form
- Payment recording
- Invoice details
- Payment history

#### 19. **Analytics Hub** (`/analytics-hub`)
**Tabs/Sections:**
- Overview
- Revenue Analytics
- Sales Analytics
- Inventory Analytics
- Customer Analytics
- Technician Performance
- Location Comparison

#### 20. **Advanced Analytics** (`/advanced-analytics`)
**Tabs/Sections:**
- Advanced charts
- Custom date ranges
- Multi-metric analysis
- Export reports
- Predictive analytics

#### 21. **Service Management** (`/service-management`)
**Tabs/Sections:**
- Service Types
- Device Types
- Brands
- Models
- Add/Edit forms
- Pricing management

#### 22. **Customer Feedback** (`/customer-feedback`)
**Tabs/Sections:**
- All Feedback
- Positive Reviews
- Negative Reviews
- Pending Response
- Feedback details
- Response management
- Ratings overview

#### 23. **Settings** (`/settings`)
**Tabs/Sections:**
- General Settings
- Business Profile
- Location Settings
- System Settings
- Notification Settings
- SMS Settings
- Email Settings
- Security Settings
- Backup Settings

#### 24. **Notification Preferences** (`/notification-preferences`)
**Tabs/Sections:**
- Notification types
- Email preferences
- SMS preferences
- In-app preferences
- Notification templates

#### 25. **System Health** (`/system-health`)
**Tabs/Sections:**
- System Status
- Database Health
- API Performance
- Error Logs
- Resource Usage
- Activity Monitor

#### 26. **Backup & Restore** (`/backup-restore`)
**Tabs/Sections:**
- Create Backup
- Restore from Backup
- Backup History
- Auto-backup Settings
- Export Data

#### 27. **Import/Export Management** (`/import-export`)
**Tabs/Sections:**
- Import Data
- Export Data
- Import History
- Export History
- Template Downloads
- Data Validation

#### 28. **Customer Portal** (`/customer-portal`)
**Tabs/Sections:**
- My Devices
- Repair Status
- Service History
- Invoices
- Feedback

#### 29. **Design System** (`/design-system`)
**Tabs/Sections:**
- Colors
- Typography
- Components
- Buttons
- Forms
- Tables
- Icons
- Spacing

#### 30. **Sales (Alternative)** (`/sales`)
**Tabs/Sections:**
- Sales Overview
- Daily Sales
- Monthly Sales
- Product Performance
- Sales by Location

#### 31. **Not Found** (`/404`)
- 404 error page
- Navigation links

#### Debug Pages (Development Only)
- `/debug` - Authentication debug
- `/test-simple-dashboard` - Simple test page
- `/test-dashboard` - Dashboard test
- `/basic-test` - React test
- `/simple-test` - Routing test

---

## Technology Stack

### Frontend Technologies

1. **React** v18.3.1 - UI library
2. **TypeScript** v5.6.3 - Type safety
3. **Vite** v7.1.5 - Build tool and dev server
4. **Wouter** v3.3.5 - Routing
5. **TanStack Query** (React Query) v5.60.5 - Data fetching and caching
6. **React Hook Form** v7.55.0 - Form management
7. **Zod** v3.24.2 - Schema validation
8. **Tailwind CSS** v3.4.17 - Styling
9. **Radix UI** - Component primitives:
   - Alert Dialog
   - Avatar
   - Checkbox
   - Dialog
   - Dropdown Menu
   - Label
   - Progress
   - Select
   - Separator
   - Slot
   - Switch
   - Tabs
   - Toast
   - Tooltip
10. **Recharts** v2.15.2 - Charts and graphs
11. **Lucide React** v0.453.0 - Icons
12. **Framer Motion** v11.13.1 - Animations
13. **Date-fns** v3.6.0 - Date manipulation
14. **Sonner** v2.0.7 - Toast notifications
15. **Class Variance Authority** v0.7.1 - Component variants
16. **clsx** & **tailwind-merge** - CSS class management
17. **cmdk** v1.1.1 - Command palette
18. **input-otp** v1.4.2 - OTP input
19. **next-themes** v0.4.6 - Theme management
20. **react-day-picker** v8.10.1 - Date picker
21. **react-icons** v5.4.0 - Additional icons

### Backend Technologies

1. **Node.js** v20+ - Runtime environment
2. **Express** v4.21.2 - Web framework
3. **TypeScript** v5.6.3 - Type safety
4. **Drizzle ORM** v0.39.1 - Database ORM
5. **PostgreSQL** v15+ - Database
6. **Neon Serverless** v0.10.4 - Database driver
7. **bcrypt** v6.0.0 - Password hashing
8. **jsonwebtoken** v9.0.2 - JWT authentication
9. **Passport** v0.7.0 - Authentication middleware
10. **passport-local** v1.0.0 - Local auth strategy
11. **Multer** v1.4.5 - File uploads
12. **Helmet** v8.1.0 - Security headers
13. **express-rate-limit** v8.0.1 - Rate limiting
14. **dotenv** v17.2.1 - Environment variables
15. **nanoid** v5.1.5 - ID generation
16. **uuid** v11.1.0 - UUID generation
17. **ws** v8.18.0 - WebSocket support
18. **ExcelJS** v4.4.0 - Excel import/export
19. **QRCode** v1.5.4 - QR code generation
20. **speakeasy** v2.0.0 - 2FA/TOTP
21. **memoizee** v0.4.17 - Function memoization

### Database & ORM

1. **PostgreSQL** v15+ - Primary database
2. **Drizzle ORM** v0.39.1 - Type-safe ORM
3. **drizzle-kit** v0.31.4 - Schema management
4. **drizzle-zod** v0.7.0 - Zod integration
5. **pg** v8.16.3 - PostgreSQL driver

### Security & Authentication

1. **bcrypt/bcryptjs** - Password hashing
2. **jsonwebtoken** - JWT tokens
3. **Passport.js** - Authentication
4. **Helmet** - Security headers
5. **express-rate-limit** - Rate limiting
6. **speakeasy** - 2FA support

### Communication & Notifications

1. **Twilio** v5.8.0 - SMS (International)
2. **Custom Ethiopian SMS Service** - Local SMS
3. **WebSocket** (ws) - Real-time notifications
4. **node-fetch** v3.3.2 - HTTP requests

### Development Tools

1. **tsx** v4.19.1 - TypeScript execution
2. **esbuild** v0.25.0 - Fast bundling
3. **concurrently** v9.2.0 - Parallel scripts
4. **cross-env** v10.0.0 - Environment variables
5. **dotenv-cli** v10.0.0 - CLI env support
6. **Vite plugins**:
   - @vitejs/plugin-react
   - @replit/vite-plugin-cartographer
   - @replit/vite-plugin-runtime-error-modal

### Build & Deployment

1. **Docker** - Containerization
2. **Docker Compose** - Multi-container orchestration
3. **Vite** - Frontend build
4. **esbuild** - Backend build
5. **PostCSS** v8.4.47 - CSS processing
6. **Autoprefixer** v10.4.20 - CSS vendor prefixes
7. **Terser** v5.43.1 - JavaScript minification

### Testing & Quality

1. **TypeScript** - Type checking
2. **Stylelint** v16.23.1 - CSS linting
3. **ESLint** (implied) - JavaScript linting

### Utilities & Helpers

1. **date-fns** - Date manipulation
2. **ExcelJS** - Excel files
3. **QRCode** - QR code generation
4. **zod-validation-error** - Better error messages

---

## External Services

### 1. **SMS Services**

#### Twilio (International)
- SMS delivery
- Message tracking
- Delivery status
- Campaign support

#### Ethiopian SMS Providers
- Ethio Telecom
- Local aggregators
- Custom endpoints
- Sender ID support

### 2. **File Storage**

#### Local Storage
- File uploads (multer)
- Image storage
- Receipt storage
- Profile photos
- Business logos

#### Future: Cloud Storage (Optional)
- AWS S3
- Cloudinary
- DigitalOcean Spaces

### 3. **Database Hosting**

#### Neon Serverless PostgreSQL
- Serverless PostgreSQL
- Auto-scaling
- Connection pooling
- Branch support

#### Alternative Options
- Railway
- Render
- DigitalOcean
- AWS RDS
- Self-hosted PostgreSQL

### 4. **Deployment Platforms**

#### Supported Platforms
- Railway
- Render
- DigitalOcean App Platform
- AWS (EC2, ECS, Elastic Beanstalk)
- Google Cloud Run
- Heroku
- Vercel (frontend)
- Netlify (frontend)
- Docker-based hosting

### 5. **Authentication**

#### Current Implementation
- Local authentication (Passport Local)
- JWT tokens
- Session management

#### Future Options (Supported Libraries Installed)
- OAuth 2.0 (openid-client installed)
- 2FA/TOTP (speakeasy installed)
- Social login integration

### 6. **Email (Future)**

#### Planned Integration
- Transactional emails
- Customer notifications
- Invoice delivery
- Marketing campaigns

#### Suggested Providers
- SendGrid
- Mailgun
- AWS SES
- Postmark

### 7. **Payment Processing (Future)**

#### Potential Integration
- Credit card processing
- Mobile money (for Ethiopian market)
- PayPal
- Stripe
- Square

### 8. **Monitoring & Analytics (Future)**

#### Suggested Services
- Sentry (error tracking)
- LogRocket (session replay)
- Google Analytics
- Mixpanel
- PostHog

---

## System Enums & Status Values

### Device Status
- `registered` - Device registered
- `diagnosed` - Diagnosis completed
- `in_progress` - Repair in progress
- `waiting_parts` - Waiting for parts
- `completed` - Repair completed
- `ready_for_pickup` - Ready for customer pickup
- `delivered` - Delivered to customer
- `cancelled` - Repair cancelled

### Priority Levels
- `normal` - Normal priority
- `high` - High priority
- `urgent` - Urgent priority

### Payment Status
- `pending` - Payment pending
- `paid` - Fully paid
- `partial` - Partially paid
- `refunded` - Refunded

### Appointment Status
- `scheduled` - Appointment scheduled
- `confirmed` - Customer confirmed
- `in_progress` - Service in progress
- `completed` - Service completed
- `cancelled` - Appointment cancelled

### User Roles
- `admin` - Administrator (full access)
- `manager` - Manager (limited admin)
- `technician` - Repair technician
- `sales` - Sales staff
- `customer_service` - Customer service

### Notification Types
- `info` - Information
- `warning` - Warning
- `error` - Error
- `success` - Success

### Notification Status
- `unread` - Not read
- `read` - Read
- `archived` - Archived

### SMS Status
- `pending` - Pending send
- `sent` - Sent
- `delivered` - Delivered
- `failed` - Failed
- `cancelled` - Cancelled

### Message Status
- `draft` - Draft message
- `sent` - Sent
- `delivered` - Delivered
- `read` - Read by recipient
- `failed` - Delivery failed

### Expense Status
- `pending` - Pending approval
- `approved` - Approved
- `rejected` - Rejected
- `paid` - Paid

### Budget Period
- `monthly` - Monthly budget
- `quarterly` - Quarterly budget
- `yearly` - Yearly budget

### Inventory Status
- `in_stock` - In stock
- `low_stock` - Low stock
- `out_of_stock` - Out of stock
- `discontinued` - Discontinued

### Order Status
- `draft` - Draft order
- `pending` - Pending approval
- `confirmed` - Confirmed
- `shipped` - Shipped
- `delivered` - Delivered
- `cancelled` - Cancelled
- `returned` - Returned

---

## User Permissions by Role

### Admin
- Full system access
- Manage all locations
- Manage users
- Manage inventory
- View all analytics
- Manage settings
- Financial management
- Backup & restore
- Import/export

### Manager
- Location-specific access
- Manage location users
- View analytics
- Inventory management
- Customer management
- Expense approval

### Technician
- Device registration
- Repair tracking
- Update repair status
- Customer communication
- View inventory
- Basic analytics

### Sales
- Point of sale
- Customer management
- Sales transactions
- Inventory viewing
- Create invoices
- Basic analytics

### Customer Service
- Customer management
- Appointment scheduling
- Device status updates
- Customer communication
- Feedback management

---

## Key Features Summary

### Business Management
✓ Multi-location support  
✓ Role-based access control  
✓ Business profile management  
✓ Staff management  
✓ Customer relationship management  

### Operations
✓ Device repair tracking  
✓ Point of sale  
✓ Inventory management  
✓ Appointment scheduling  
✓ Service management  

### Financial
✓ Expense tracking  
✓ Budget management  
✓ Loan/credit invoices  
✓ Payment tracking  
✓ Financial analytics  

### Communication
✓ SMS notifications (Twilio + Ethiopian)  
✓ SMS campaigns  
✓ In-app notifications  
✓ Customer messaging  
✓ Email support (future)  

### Analytics & Reporting
✓ Revenue analytics  
✓ Sales performance  
✓ Inventory analytics  
✓ Customer analytics  
✓ Expense analytics  
✓ Technician performance  
✓ Location comparison  

### Advanced Features
✓ Import/Export (Excel)  
✓ Backup & Restore  
✓ System health monitoring  
✓ Predictive inventory  
✓ Customer feedback  
✓ Receipt generation  
✓ QR codes  
✓ Public landing page  

---

## Database Statistics

- **Total Tables:** 41
- **Core Business Tables:** 10
- **Financial Tables:** 5
- **Reference Tables:** 6
- **Communication Tables:** 13
- **Tracking Tables:** 4
- **System Tables:** 3

**Relationships:**
- Foreign keys: 80+
- Unique constraints: 20+
- Indexes: Auto-generated on primary/foreign keys
- Enums: 11 PostgreSQL enums

---

## API Endpoint Categories

### Authentication
- POST `/api/login`
- POST `/api/logout`
- GET `/api/user`

### Devices
- GET `/api/devices`
- POST `/api/devices`
- GET `/api/devices/:id`
- PUT `/api/devices/:id`
- DELETE `/api/devices/:id`
- PUT `/api/devices/:id/status`

### Customers
- GET `/api/customers`
- POST `/api/customers`
- GET `/api/customers/:id`
- PUT `/api/customers/:id`
- DELETE `/api/customers/:id`

### Inventory
- GET `/api/inventory`
- POST `/api/inventory`
- GET `/api/inventory/:id`
- PUT `/api/inventory/:id`
- DELETE `/api/inventory/:id`

### Sales
- GET `/api/sales`
- POST `/api/sales`
- GET `/api/sales/:id`

### Purchase Orders
- GET `/api/purchase-orders`
- POST `/api/purchase-orders`
- GET `/api/purchase-orders/:id`
- PUT `/api/purchase-orders/:id`

### Expenses
- GET `/api/expenses`
- POST `/api/expenses`
- PUT `/api/expenses/:id`
- DELETE `/api/expenses/:id`

### Appointments
- GET `/api/appointments`
- POST `/api/appointments`
- PUT `/api/appointments/:id`
- DELETE `/api/appointments/:id`

### Analytics
- GET `/api/analytics/dashboard`
- GET `/api/analytics/revenue`
- GET `/api/analytics/inventory`

### SMS
- POST `/api/sms/send`
- GET `/api/sms/campaigns`
- POST `/api/sms/campaigns`

### Notifications
- GET `/api/notifications`
- PUT `/api/notifications/:id/read`

### Settings
- GET `/api/settings`
- PUT `/api/settings`
- GET `/api/business-profile`
- PUT `/api/business-profile`

### Locations
- GET `/api/locations`
- POST `/api/locations`
- PUT `/api/locations/:id`

### Users/Workers
- GET `/api/users`
- POST `/api/users`
- PUT `/api/users/:id`
- DELETE `/api/users/:id`

### Feedback
- GET `/api/feedback`
- POST `/api/feedback`
- PUT `/api/feedback/:id/response`

### File Upload
- POST `/api/upload`

---

## System Architecture Pattern

**Architecture:** Monolithic Full-Stack Application  
**Pattern:** MVC (Model-View-Controller)  
**Database:** PostgreSQL with Drizzle ORM  
**API:** RESTful API  
**Frontend:** SPA (Single Page Application)  
**Authentication:** JWT-based  
**Real-time:** WebSocket support  

---

**End of System Listing Document**

*This document provides a complete overview of all components, pages, tables, and technologies used in the SolNetComputer Management System.*

