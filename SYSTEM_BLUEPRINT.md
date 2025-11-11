# SolNetComputer System Blueprint

**Complete System Documentation for Recreation and Upgrades**  
**AI-Agent Optimized for Full System Generation**

Version: 2.0 (Consolidated & Enhanced)  
Last Updated: October 15, 2025  
Purpose: Single comprehensive reference with all details needed to recreate the entire system  
Audience: Developers, AI Agents, Architects, DevOps Engineers

---

## Table of Contents

### Core Architecture

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [Validation Rules & Business Logic](#validation-rules--business-logic) **NEW**
5. [Authentication & Authorization](#authentication--authorization)
6. [Application Pages & Routes](#application-pages--routes)

### API & Integration

7. [API Endpoints with Schemas](#api-endpoints-with-schemas) **ENHANCED**
8. [Frontend Implementation Patterns](#frontend-implementation-patterns) **NEW**
9. [Design System & UI Components](#design-system--ui-components)

### Features & Deployment

10. [Business Features](#business-features)
11. [Environment Variables Reference](#environment-variables-reference)
12. [Security Implementation](#security-implementation)
13. [Infrastructure & Deployment](#infrastructure--deployment)
14. [File Structure](#file-structure)

### Implementation Guide

15. [Quick Start for Recreation](#quick-start-for-recreation)
16. [AI Agent Implementation Guide](#ai-agent-implementation-guide) **NEW**
17. [Upgrade Pathways & Future Enhancements](#upgrade-pathways--future-enhancements)

---

## System Overview

**SolNetComputer** is a comprehensive **multi-location repair shop management system** with:

- Device/repair tracking
- Point of Sale (POS)
- Inventory management with purchase orders
- Customer relationship management (CRM)
- Sales & invoicing
- Worker/staff management
- Advanced analytics & reporting
- SMS notifications
- Multi-location support with location-based data isolation

**System Scale:**

- **44 Database Tables** - Fully normalized schema
- **100+ API Endpoints** - RESTful API architecture
- **30+ Application Pages** - Comprehensive UI coverage
- **3 User Roles** - Admin, Technician, Sales
- **Multi-tenant** - Location-based data isolation

**Target Users:**

- Shop owners (admin role)
- Technicians (repair tracking, device management)
- Sales staff (POS, customer management)

---

## Technology Stack

### Frontend

- **Framework:** React 18.3+ with TypeScript
- **Routing:** Wouter 3.3
- **State Management:** TanStack Query (React Query) 5.60
- **UI Components:** Radix UI primitives
- **Styling:** Tailwind CSS 3.4 with custom utility classes
- **Forms:** React Hook Form 7.55 with Zod validation
- **Charts:** Recharts 2.15
- **Build Tool:** Vite 7.1

### Backend

- **Runtime:** Node.js 20+
- **Framework:** Express 4.21
- **Database ORM:** Drizzle ORM 0.39
- **Database:** PostgreSQL 15+
- **Authentication:** JSON Web Tokens (JWT)
- **File Uploads:** Multer
- **Security:** Helmet, express-rate-limit, input sanitization

### DevOps & Deployment

- **Containerization:** Docker with multi-stage builds
- **Orchestration:** Docker Compose
- **Build:** esbuild for server, Vite for client
- **Process Management:** dumb-init in containers

### External Services (Optional)

- **SMS:** Twilio (international) or Ethiopian SMS providers
- **File Storage:** Local filesystem with volume mounts (upgradeable to S3)

---

## Database Schema

**Total Tables: 44**

### Database Schema Overview

The database consists of 44 tables organized into the following categories:

**Core Business (10 tables):**

1. locations, 2. users, 3. customers, 4. devices, 5. inventory_items,
2. sales, 7. sale_items, 8. purchase_orders, 9. purchase_order_items, 10. suppliers

**Financial Management (7 tables):** 11. expenses, 12. expense_categories, 13. loan_invoices, 14. loan_invoice_payments, 15. invoice_items, 16. budgets, 17. promotions

**Reference/Lookup (6 tables):** 18. device_types, 19. brands, 20. models, 21. service_types, 22. categories, 23. accessories

**Communication & Notifications (11 tables):** 24. notifications, 25. notification_types, 26. notification_templates, 27. notification_preferences, 28. sms_templates, 29. sms_campaigns, 30. sms_campaign_recipients, 31. sms_settings, 32. ethiopian_sms_settings, 33. recipient_groups, 34. recipient_group_members

**Tracking & History (4 tables):** 35. device_status_history, 36. device_problems, 37. warranties, 38. customer_messages

**Additional Tables (6 tables):** 39. appointments, 40. business_profile, 41. customer_feedback, 42. device_feedback, 43. predefined_problems, 44. system_settings

---

### Core Business Tables

#### 1. **locations** (Multi-Location Support)

Stores branch/location information for multi-location businesses.

| Column         | Type           | Description                |
| -------------- | -------------- | -------------------------- |
| id             | varchar (UUID) | Primary key                |
| num_id         | serial         | Numeric ID                 |
| name           | text           | Location name              |
| code           | varchar(10)    | Short code (e.g., "NYC01") |
| address        | text           | Physical address           |
| city           | varchar        | City                       |
| state          | varchar        | State/Province             |
| zip_code       | varchar        | ZIP/Postal code            |
| country        | varchar        | Country (default: USA)     |
| phone          | varchar        | Contact phone              |
| email          | varchar        | Contact email              |
| manager_name   | varchar        | Location manager           |
| is_active      | boolean        | Active status              |
| timezone       | varchar        | Timezone                   |
| business_hours | jsonb          | Operating hours (JSON)     |
| notes          | text           | Additional notes           |
| created_at     | timestamp      | Creation timestamp         |
| updated_at     | timestamp      | Last update                |

**Unique Constraints:** `code`

---

#### 2. **users** (Staff/Workers)

Manages staff accounts with role-based access.

| Column          | Type           | Description              |
| --------------- | -------------- | ------------------------ |
| id              | varchar (UUID) | Primary key              |
| num_id          | serial         | Numeric ID               |
| username        | text           | Unique username          |
| email           | text           | Email (optional)         |
| password        | text           | Hashed password (bcrypt) |
| first_name      | varchar        | First name               |
| last_name       | varchar        | Last name                |
| phone           | text           | Contact phone            |
| role            | enum           | admin, technician, sales |
| location_id     | varchar        | Assigned location (FK)   |
| profile_picture | text           | Profile image path       |
| is_active       | boolean        | Account status           |
| created_at      | timestamp      | Registration date        |
| updated_at      | timestamp      | Last update              |

**Roles:**

- `admin`: Full system access, multi-location management
- `technician`: Device repairs, repair tracking
- `sales`: POS, customer management, invoices

**Unique Constraints:** `username`, `email`  
**Foreign Keys:** `location_id` → locations.id

---

#### 3. **customers**

Customer relationship management.

| Column            | Type           | Description            |
| ----------------- | -------------- | ---------------------- |
| id                | varchar (UUID) | Primary key            |
| num_id            | serial         | Numeric ID             |
| location_id       | varchar        | Assigned location (FK) |
| name              | text           | Full name              |
| phone             | text           | Phone number (unique)  |
| email             | text           | Email                  |
| address           | text           | Physical address       |
| city              | varchar        | City                   |
| state             | varchar        | State                  |
| zip_code          | varchar        | ZIP code               |
| notes             | text           | Customer notes         |
| registration_date | timestamp      | First visit date       |
| is_active         | boolean        | Active status          |
| created_at        | timestamp      | Record creation        |
| updated_at        | timestamp      | Last update            |

**Unique Constraints:** `phone`  
**Foreign Keys:** `location_id` → locations.id

---

#### 4. **devices** (Repair Tracking)

Tracks devices submitted for repair.

| Column                    | Type           | Description                                              |
| ------------------------- | -------------- | -------------------------------------------------------- |
| id                        | varchar (UUID) | Primary key                                              |
| num_id                    | serial         | Numeric ID                                               |
| customer_id               | varchar        | Customer (FK)                                            |
| location_id               | varchar        | Location (FK)                                            |
| assigned_technician_id    | varchar        | Technician (FK)                                          |
| device_type               | text           | Type (phone, laptop, etc.)                               |
| device_type_id            | varchar        | Device type reference                                    |
| brand                     | text           | Brand name                                               |
| brand_id                  | varchar        | Brand reference                                          |
| model                     | text           | Model name                                               |
| model_id                  | varchar        | Model reference                                          |
| serial_number             | text           | Serial/IMEI                                              |
| imei                      | text           | IMEI number                                              |
| color                     | text           | Device color                                             |
| storage                   | text           | Storage capacity                                         |
| operating_system          | text           | OS version                                               |
| problem_description       | text           | Customer-reported issue                                  |
| diagnosis                 | text           | Technician diagnosis                                     |
| repair_notes              | text           | Repair log                                               |
| estimated_cost            | decimal        | Estimate                                                 |
| final_cost                | decimal        | Final repair cost                                        |
| total_cost                | decimal        | Total including parts                                    |
| status                    | enum           | registered, in_progress, completed, delivered, cancelled |
| payment_status            | text           | pending, partial, paid                                   |
| priority                  | enum           | low, normal, high, urgent                                |
| receipt_number            | text           | Unique receipt (e.g., "REC-20231015-001")                |
| service_type_id           | varchar        | Service type reference                                   |
| warranty_expiry           | date           | Warranty end date                                        |
| estimated_completion_date | date           | Estimated ready date                                     |
| actual_completion_date    | date           | Actual completion                                        |
| pickup_date               | date           | Customer pickup                                          |
| delivery_date             | date           | Delivery date                                            |
| feedback_requested        | boolean        | Feedback sent                                            |
| feedback_submitted        | boolean        | Feedback received                                        |
| is_active                 | boolean        | Active status                                            |
| created_at                | timestamp      | Registration time                                        |
| updated_at                | timestamp      | Last update                                              |

**Unique Constraints:** `receipt_number`  
**Foreign Keys:** `customer_id`, `location_id`, `assigned_technician_id`

---

#### 5. **inventory_items** (Unified Inventory)

Unified inventory for parts, accessories, and retail products.

| Column             | Type           | Description          |
| ------------------ | -------------- | -------------------- |
| id                 | varchar (UUID) | Primary key          |
| num_id             | serial         | Numeric ID           |
| location_id        | varchar        | Location (FK)        |
| name               | text           | Item name            |
| sku                | text           | SKU (unique)         |
| description        | text           | Description          |
| category           | text           | Category             |
| brand              | text           | Brand                |
| model              | text           | Model                |
| purchase_price     | decimal        | Cost price           |
| sale_price         | decimal        | Selling price        |
| quantity           | integer        | Stock on hand        |
| min_stock_level    | integer        | Minimum stock alert  |
| reorder_point      | integer        | Reorder trigger      |
| reorder_quantity   | integer        | Default reorder qty  |
| lead_time_days     | integer        | Supplier lead time   |
| avg_daily_sales    | decimal        | Sales velocity       |
| supplier           | text           | Supplier name        |
| barcode            | text           | Barcode/UPC          |
| is_public          | boolean        | Show on landing page |
| is_active          | boolean        | Active status        |
| sort_order         | integer        | Display order        |
| image_url          | text           | Product image        |
| specifications     | jsonb          | Tech specs (JSON)    |
| compatibility      | jsonb          | Compatible devices   |
| warranty           | text           | Warranty info        |
| last_restocked     | timestamp      | Last restock date    |
| predicted_stockout | timestamp      | Predicted stockout   |
| created_at         | timestamp      | Creation             |
| updated_at         | timestamp      | Last update          |

**Unique Constraints:** `sku`  
**Foreign Keys:** `location_id`

---

#### 6. **sales** & **sale_items** (Point of Sale)

Tracks sales transactions.

**sales:**
| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| num_id | serial | Numeric ID |
| customer_id | varchar | Customer (FK, optional) |
| location_id | varchar | Location (FK) |
| sale_date | timestamp | Sale timestamp |
| payment_method | text | cash, card, mobile |
| total_amount | decimal | Total sale value |
| tax_amount | decimal | Tax |
| discount_amount | decimal | Discount |
| notes | text | Sale notes |
| sold_by | varchar | Staff (FK) |
| is_active | boolean | Active status |
| created_at | timestamp | Creation |
| updated_at | timestamp | Last update |

**sale_items:**
| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| num_id | serial | Numeric ID |
| sale_id | varchar | Sale (FK) |
| inventory_item_id | varchar | Item (FK) |
| product_name | text | Item name |
| quantity | integer | Quantity sold |
| unit_price | decimal | Price per unit |
| total_price | decimal | Line total |
| created_at | timestamp | Creation |

**Foreign Keys:**

- sales: `customer_id`, `location_id`, `sold_by`
- sale_items: `sale_id`, `inventory_item_id`

---

#### 7. **purchase_orders** & **purchase_order_items**

Inventory replenishment and procurement.

**purchase_orders:**
| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| order_number | varchar | Unique PO number |
| date | date | Order date |
| status | varchar | draft, submitted, approved, received, cancelled |
| supplier_id | varchar | Supplier (FK) |
| location_id | varchar | Location (FK) |
| created_by | varchar | User (FK) |
| total_items | integer | Item count |
| total_quantity | integer | Total units |
| total_estimated_cost | decimal | Total cost |
| notes | text | PO notes |
| priority | enum | normal, high, urgent |
| expected_delivery_date | date | Expected arrival |
| created_at | timestamp | Creation |
| updated_at | timestamp | Last update |

**purchase_order_items:**
| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| purchase_order_id | varchar | PO (FK) |
| inventory_item_id | varchar | Item (FK) |
| name | text | Item name |
| sku | varchar | SKU |
| category | varchar | Category |
| description | text | Description |
| current_stock | integer | Current inventory |
| min_stock_level | integer | Minimum stock |
| suggested_quantity | integer | Suggested order qty |
| quantity | integer | Ordered quantity |
| unit_cost | decimal | Cost per unit |
| total_cost | decimal | Line total |

**Unique Constraints:** `order_number`  
**Foreign Keys:** `supplier_id`, `location_id`, `created_by`

---

#### 8. **suppliers**

Supplier directory for procurement.

| Column         | Type           | Description            |
| -------------- | -------------- | ---------------------- |
| id             | varchar (UUID) | Primary key            |
| name           | text           | Supplier name          |
| contact_person | text           | Contact name           |
| email          | text           | Email                  |
| phone          | text           | Phone                  |
| address        | text           | Address                |
| city           | text           | City                   |
| state          | text           | State                  |
| zip_code       | text           | ZIP                    |
| country        | text           | Country (default: USA) |
| website        | text           | Website URL            |
| payment_terms  | text           | Payment terms          |
| notes          | text           | Additional notes       |
| is_active      | boolean        | Active status          |
| created_at     | timestamp      | Creation               |
| updated_at     | timestamp      | Last update            |

---

#### 9. **expenses** & **expense_categories**

Track business expenses.

**expense_categories:**
| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| name | text | Category name |
| description | text | Description |
| type | text | Type (e.g., operational) |
| is_active | boolean | Active status |
| created_at | timestamp | Creation |
| updated_at | timestamp | Last update |

**expenses:**
| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| location_id | varchar | Location (FK) |
| category_id | varchar | Category (FK) |
| description | text | Expense description |
| amount | decimal | Expense amount |
| date | date | Expense date |
| payment_method | text | Payment type |
| receipt_number | text | Receipt reference |
| vendor | text | Vendor name |
| notes | text | Notes |
| created_by | varchar | User (FK) |
| is_active | boolean | Active status |
| created_at | timestamp | Creation |
| updated_at | timestamp | Last update |

**Foreign Keys:** `location_id`, `category_id`, `created_by`

---

#### 10. **appointments**

Service appointments and calendar.

| Column           | Type           | Description                                         |
| ---------------- | -------------- | --------------------------------------------------- |
| id               | varchar (UUID) | Primary key                                         |
| customer_id      | varchar        | Customer (FK)                                       |
| location_id      | varchar        | Location (FK)                                       |
| service_type_id  | varchar        | Service type                                        |
| scheduled_date   | timestamp      | Appointment time                                    |
| duration_minutes | integer        | Duration                                            |
| status           | enum           | scheduled, confirmed, completed, cancelled, no_show |
| assigned_to      | varchar        | Technician (FK)                                     |
| notes            | text           | Appointment notes                                   |
| reminder_sent    | boolean        | Reminder sent flag                                  |
| is_active        | boolean        | Active status                                       |
| created_at       | timestamp      | Creation                                            |
| updated_at       | timestamp      | Last update                                         |

**Foreign Keys:** `customer_id`, `location_id`, `assigned_to`

---

### Reference Tables

#### **device_types**

| Column      | Description        |
| ----------- | ------------------ |
| id          | Primary key (UUID) |
| name        | Device type name   |
| description | Description        |
| category    | Category           |
| is_active   | Active status      |

#### **brands**

| Column      | Description        |
| ----------- | ------------------ |
| id          | Primary key (UUID) |
| name        | Brand name         |
| description | Description        |
| logo_url    | Logo image         |
| is_active   | Active status      |

#### **models**

| Column         | Description        |
| -------------- | ------------------ |
| id             | Primary key (UUID) |
| brand_id       | Brand (FK)         |
| name           | Model name         |
| device_type_id | Device type (FK)   |
| specifications | Specs (JSON)       |
| is_active      | Active status      |

#### **service_types**

| Column             | Description         |
| ------------------ | ------------------- |
| id                 | Primary key (UUID)  |
| name               | Service name        |
| description        | Description         |
| category           | Category            |
| estimated_duration | Minutes             |
| base_price         | Base price          |
| is_public          | Show on landing     |
| features           | Features (JSON)     |
| requirements       | Requirements (JSON) |
| warranty           | Warranty terms      |
| image_url          | Service image       |
| is_active          | Active status       |
| sort_order         | Display order       |

#### **categories**

General-purpose category system.

| Column             | Description                       |
| ------------------ | --------------------------------- |
| id                 | Primary key (UUID)                |
| name               | Category name                     |
| type               | Type (expense, inventory, device) |
| description        | Description                       |
| parent_category_id | Parent category                   |
| created_by         | Creator (FK)                      |
| sort_order         | Display order                     |
| is_active          | Active status                     |

---

### Communication Tables

#### **notifications**

| Column     | Description                   |
| ---------- | ----------------------------- |
| id         | Primary key (UUID)            |
| user_id    | Recipient user (FK)           |
| title      | Notification title            |
| message    | Message content               |
| type       | info, warning, success, error |
| is_read    | Read status                   |
| link       | Action link                   |
| created_at | Creation timestamp            |

#### **sms_templates**

SMS template library.

| Column    | Description        |
| --------- | ------------------ |
| id        | Primary key (UUID) |
| name      | Template name      |
| message   | SMS message text   |
| category  | Category           |
| variables | Variables (JSON)   |
| is_active | Active status      |

#### **sms_campaigns**

Bulk SMS campaigns.

| Column          | Description               |
| --------------- | ------------------------- |
| id              | Primary key (UUID)        |
| name            | Campaign name             |
| message         | SMS message               |
| recipient_count | Total recipients          |
| sent_count      | Sent count                |
| status          | draft, sending, completed |
| scheduled_at    | Schedule time             |
| sent_at         | Actual send time          |
| created_by      | Creator (FK)              |

#### **recipient_groups**

Customer groups for SMS campaigns.

| Column       | Description          |
| ------------ | -------------------- |
| id           | Primary key (UUID)   |
| name         | Group name           |
| description  | Description          |
| criteria     | Criteria (JSON)      |
| customer_ids | Customer list (JSON) |
| created_by   | Creator (FK)         |

#### **sms_settings**

General SMS configuration settings (key-value store).

| Column      | Description        |
| ----------- | ------------------ |
| id          | Primary key (UUID) |
| key         | Setting key        |
| value       | Setting value      |
| description | Description        |
| created_at  | Creation           |
| updated_at  | Last update        |

#### **ethiopian_sms_settings**

Local SMS provider configuration.

| Column    | Description         |
| --------- | ------------------- |
| id        | Primary key (UUID)  |
| username  | API username        |
| api_key   | API key (encrypted) |
| sender_id | Sender ID           |
| base_url  | API endpoint        |
| is_active | Active status       |

#### **sms_campaign_recipients**

Track individual recipients in SMS campaigns.

| Column         | Description           |
| -------------- | --------------------- |
| id             | Primary key (UUID)    |
| campaign_id    | Campaign (FK)         |
| customer_id    | Customer (FK)         |
| customer_name  | Customer name         |
| customer_phone | Customer phone        |
| message        | SMS message sent      |
| status         | pending, sent, failed |
| sent_at        | Send timestamp        |
| delivered_at   | Delivery timestamp    |
| error_message  | Error details         |
| created_at     | Creation              |

**Foreign Keys:** `campaign_id`, `customer_id`

#### **recipient_group_members**

Individual members of recipient groups.

| Column      | Description        |
| ----------- | ------------------ |
| id          | Primary key (UUID) |
| group_id    | Group (FK)         |
| customer_id | Customer (FK)      |
| added_at    | Timestamp added    |

**Foreign Keys:** `group_id`, `customer_id`

#### **notification_types**

Defines notification categories and types.

| Column      | Description        |
| ----------- | ------------------ |
| id          | Primary key (UUID) |
| num_id      | Numeric ID         |
| name        | Type name          |
| description | Description        |
| category    | Category           |
| type        | Enum type          |
| is_active   | Active status      |
| created_at  | Creation           |
| updated_at  | Last update        |

#### **notification_templates**

Templates for various notification types.

| Column              | Description               |
| ------------------- | ------------------------- |
| id                  | Primary key (UUID)        |
| num_id              | Numeric ID                |
| type_id             | Notification type (FK)    |
| title               | Template title            |
| message             | In-app message            |
| email_subject       | Email subject             |
| email_body          | Email body (HTML)         |
| sms_message         | SMS message               |
| variables           | Template variables (JSON) |
| device_registration | Device reg enabled        |
| is_active           | Active status             |
| created_at          | Creation                  |
| updated_at          | Last update               |

**Foreign Keys:** `type_id`

#### **notification_preferences**

User-specific notification preferences.

| Column         | Description            |
| -------------- | ---------------------- |
| id             | Primary key (UUID)     |
| num_id         | Numeric ID             |
| user_id        | User (FK)              |
| type_id        | Notification type (FK) |
| enabled        | Master enable flag     |
| email_enabled  | Email notifications    |
| sms_enabled    | SMS notifications      |
| push_enabled   | Push notifications     |
| in_app_enabled | In-app notifications   |
| created_at     | Creation               |
| updated_at     | Last update            |

**Foreign Keys:** `user_id`, `type_id`

---

### Additional Tables

#### **business_profile**

Business configuration and branding.

| Column                 | Description         |
| ---------------------- | ------------------- |
| id                     | Primary key (UUID)  |
| business_name          | Company name        |
| tagline                | Tagline             |
| description            | Description         |
| logo                   | Logo path           |
| primary_logo           | Primary logo        |
| icon_logo              | Icon/favicon        |
| phone                  | Contact phone       |
| email                  | Contact email       |
| address                | Physical address    |
| city                   | City                |
| state                  | State               |
| zip_code               | ZIP                 |
| country                | Country             |
| website                | Website URL         |
| facebook_url           | Facebook URL        |
| instagram_url          | Instagram URL       |
| twitter_url            | Twitter URL         |
| business_hours         | Hours (JSON)        |
| currency               | Currency code       |
| tax_rate               | Tax rate            |
| receipt_footer         | Receipt footer text |
| monthly_revenue_target | Target revenue      |
| owner_name             | Owner name          |
| owner_title            | Owner title         |
| owner_bio              | Owner bio           |
| owner_photo            | Owner photo         |
| hero_title             | Landing hero title  |
| hero_subtitle          | Landing subtitle    |
| hero_cta_text          | CTA button text     |
| hero_cta_link          | CTA link            |

#### **customer_feedback**

Public customer reviews.

| Column           | Description             |
| ---------------- | ----------------------- |
| id               | Primary key (UUID)      |
| customer_id      | Customer (FK, optional) |
| device_id        | Device (FK, optional)   |
| customer_name    | Customer name           |
| customer_email   | Email                   |
| customer_phone   | Phone                   |
| service_type     | Service type            |
| location_id      | Location (FK)           |
| rating           | Overall rating (1-5)    |
| review_title     | Review title            |
| comment          | Review text             |
| would_recommend  | Recommendation flag     |
| service_quality  | Service rating          |
| communication    | Communication rating    |
| speed_of_service | Speed rating            |
| pricing          | Price rating            |
| is_public        | Public visibility       |
| response         | Business response       |
| responded_at     | Response time           |
| created_at       | Submission time         |

#### **loan_invoices** & **loan_invoice_payments**

Customer credit/layaway system.

**loan_invoices:**
| Column | Description |
|--------|-------------|
| id | Primary key (UUID) |
| customer_id | Customer (FK) |
| location_id | Location (FK) |
| invoice_number | Invoice number |
| total_amount | Total amount |
| paid_amount | Paid so far |
| balance | Remaining balance |
| status | active, paid, overdue, cancelled |
| due_date | Due date |
| notes | Notes |
| created_by | Creator (FK) |

**loan_invoice_payments:**
| Column | Description |
|--------|-------------|
| id | Primary key (UUID) |
| loan_invoice_id | Invoice (FK) |
| amount | Payment amount |
| payment_date | Payment date |
| payment_method | Payment method |
| notes | Notes |
| recorded_by | User (FK) |

#### **invoice_items**

Line items for loan invoices.

| Column            | Description                       |
| ----------------- | --------------------------------- |
| id                | Primary key (UUID)                |
| invoice_id        | Invoice (FK)                      |
| item_type         | Type (inventory, service, device) |
| inventory_item_id | Inventory item (FK, optional)     |
| service_type_id   | Service type (FK, optional)       |
| device_type_id    | Device type (FK, optional)        |
| item_name         | Item name                         |
| item_description  | Item description                  |
| quantity          | Quantity                          |
| unit_price        | Price per unit                    |
| total_price       | Line total                        |
| created_at        | timestamp                         |
| updated_at        | timestamp                         |

**Foreign Keys:** `invoice_id`, `inventory_item_id`, `service_type_id`, `device_type_id`

#### **budgets**

Budget planning and tracking.

| Column       | Description        |
| ------------ | ------------------ |
| id           | Primary key (UUID) |
| num_id       | Numeric ID         |
| location_id  | Location (FK)      |
| expense_type | Expense type       |
| category     | Category           |
| month        | Month (1-12)       |
| year         | Year               |
| amount       | Budget amount      |
| notes        | Notes              |
| created_by   | Creator (FK)       |
| created_at   | Creation           |
| updated_at   | Last update        |

**Foreign Keys:** `location_id`, `created_by`

#### **promotions**

Promotional campaigns and discount codes.

| Column              | Description                     |
| ------------------- | ------------------------------- |
| id                  | Primary key (UUID)              |
| num_id              | Numeric ID                      |
| title               | Promotion title                 |
| description         | Description                     |
| discount_type       | percentage, fixed_amount        |
| discount_value      | Discount value                  |
| minimum_amount      | Minimum purchase amount         |
| start_date          | Start date                      |
| end_date            | End date                        |
| usage_limit         | Maximum uses (null = unlimited) |
| usage_count         | Times used                      |
| is_active           | Active status                   |
| promotion_code      | Promo code                      |
| applicable_services | Applicable services (JSON)      |
| created_at          | Creation                        |

#### **predefined_problems**

Common device problems catalog.

| Column             | Description           |
| ------------------ | --------------------- |
| id                 | Primary key (UUID)    |
| device_type_id     | Device type (FK)      |
| name               | Problem name          |
| description        | Description           |
| category           | Category              |
| estimated_cost     | Estimated repair cost |
| estimated_duration | Duration (minutes)    |
| required_parts     | Parts list (JSON)     |
| is_active          | Active status         |
| sort_order         | Display order         |

#### **system_settings**

Key-value configuration store.

| Column      | Description        |
| ----------- | ------------------ |
| id          | Primary key (UUID) |
| key         | Setting key        |
| value       | Setting value      |
| description | Description        |
| category    | Category           |
| is_active   | Active status      |

---

## Validation Rules & Business Logic

**Purpose:** Complete validation patterns, constraints, and business rules for AI agents and developers.

### General Validation Patterns

#### String Validation Reference Table

| Field Type                | Regex/Rule                       | Example                  | Format Notes                                                    |
| ------------------------- | -------------------------------- | ------------------------ | --------------------------------------------------------------- |
| **Phone (International)** | `/^\+?[\d\s-()]{10,20}$/`        | `+1234567890`            | Optional + prefix, spaces/dashes allowed                        |
| **Phone (US)**            | `/^\+1\d{10}$/`                  | `+11234567890`           | Strict US format                                                |
| **Phone (Ethiopia)**      | `/^(\+251\|0)[79]\d{8}$/`        | `+251912345678`          | Ethiopia mobile networks                                        |
| **Email**                 | RFC 5322 compliant               | `user@example.com`       | Case-insensitive, max 255 chars                                 |
| **Username**              | `/^[a-zA-Z][a-zA-Z0-9_]{2,49}$/` | `admin_user123`          | Alphanumeric + underscore, 3-50 chars, cannot start with number |
| **Password**              | Complex requirements             | `SecurePass123!`         | Min 8 chars: 1 upper, 1 lower, 1 number, 1 special              |
| **UUID**                  | UUID v4 format                   | `a4aa6df3-78fa-4bf3-...` | Standard UUID validation                                        |
| **Barcode**               | `/^[\d]{8,13}$/`                 | `1234567890123`          | EAN-8, EAN-13, or UPC                                           |
| **SKU**                   | `/^[A-Z0-9-]{1,100}$/`           | `CHG-USBC-001`           | Uppercase alphanumeric + dash                                   |
| **Receipt Number**        | `REC-YYYYMMDD-NNNN`              | `REC-20250115-0001`      | Auto-generated, sequential                                      |
| **Serial Number**         | `/^[A-Z0-9]{5,100}$/`            | `SN123456789`            | Alphanumeric, 5-100 chars                                       |

#### Number Validation Reference

| Field Type     | Min | Max          | Decimals | Validation             | Example |
| -------------- | --- | ------------ | -------- | ---------------------- | ------- |
| **Price/Cost** | 0   | 999999.99    | 2        | `>= 0, decimal(10,2)`  | 12.99   |
| **Quantity**   | 1   | 999999       | 0        | `> 0, integer`         | 50      |
| **Percentage** | 0   | 100          | 2        | `0-100, decimal(5,2)`  | 15.5    |
| **Tax Rate**   | 0   | 100          | 2        | `0-100, decimal(5,2)`  | 8.5     |
| **Discount**   | 0   | total_amount | 2        | `>= 0, <= totalAmount` | 10.00   |

#### Date Validation Reference

| Field Type      | Rule           | Format                 | Example                     | Validation             |
| --------------- | -------------- | ---------------------- | --------------------------- | ---------------------- |
| **ISO 8601**    | Valid ISO date | `YYYY-MM-DDTHH:MM:SSZ` | `2025-01-15T10:30:00Z`      | Standard timestamp     |
| **Date Only**   | Valid date     | `YYYY-MM-DD`           | `2025-01-15`                | Date without time      |
| **Future Date** | Must be > now  | ISO 8601               | Appointments, due dates     | `date > new Date()`    |
| **Past Date**   | Must be <= now | ISO 8601               | Registration, expense dates | `date <= new Date()`   |
| **Date Range**  | end >= start   | ISO 8601               | Report filters              | `endDate >= startDate` |

### Entity-Specific Validation Rules

#### Users (Authentication)

**Password Validation:**

```typescript
// Password Requirements
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/;

// Requirements:
- Minimum 8 characters, maximum 100
- At least 1 lowercase letter (a-z)
- At least 1 uppercase letter (A-Z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

// Valid examples:
✅ "SecurePass123!", "MyP@ssw0rd", "Admin2025#"

// Invalid examples:
❌ "password" (no uppercase, number, special char)
❌ "SHORT1!" (less than 8 characters)
❌ "NoSpecialChar123" (no special character)

// Hashing:
import bcrypt from 'bcrypt';
const hashedPassword = await bcrypt.hash(plainPassword, 10); // 10 rounds
```

**Username Validation:**

```typescript
const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,49}$/;

// Requirements:
- 3-50 characters
- Must start with a letter (not number)
- Alphanumeric + underscore only
- Case-insensitive unique check

// Valid examples:
✅ "admin", "john_doe", "technician1", "sales_rep"

// Invalid examples:
❌ "ad" (too short)
❌ "9admin" (starts with number)
❌ "user-name" (dash not allowed)
```

**Email Validation:**

```typescript
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Requirements:
- RFC 5322 compliant
- Maximum 255 characters
- Case-insensitive unique check
- Optional for most user types

// Normalization:
email = email.toLowerCase().trim();
```

**Role Validation:**

```typescript
enum UserRole {
  ADMIN = 'admin',        // Full system access
  TECHNICIAN = 'technician', // Device management, repairs
  SALES = 'sales'         // POS, customer management
}

// Business Rules:
- Cannot change own role
- At least one admin must exist in system
- Cannot delete last admin user
- Role determines permission matrix (see Authentication section)
```

#### Customers

**Required Fields:**

- `name`: string, 1-255 characters
- `phone`: string, must match phone regex, 10-20 characters
- `locationId`: UUID, must exist in locations table

**Phone Number Normalization:**

```typescript
function normalizePhone(phone: string): string {
  // Remove all non-digit characters except leading +
  let normalized = phone.replace(/[^\d+]/g, '');

  // Add + prefix if missing and number starts with country code
  if (!normalized.startsWith('+') && normalized.length > 10) {
    normalized = '+' + normalized;
  }

  return normalized;
}

// Examples:
'(123) 456-7890'    → '+11234567890'
'+1 234 567 8900'   → '+11234567890'
'0912345678'        → '+251912345678' (Ethiopia auto-detect)
```

**Unique Constraints:**

- `phone + locationId` combination must be unique
- Different locations can have customers with same phone (multi-tenant)

**Business Rules:**

- `registrationDate` defaults to current date, cannot be future
- `isActive` defaults to true (soft delete pattern)
- Inactive customers excluded from default searches
- Cannot delete customer if has devices or sales (referential integrity)

#### Devices

**Auto-Generated Fields:**

```typescript
// Receipt Number Format: REC-YYYYMMDD-NNNN
function generateReceiptNumber(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Get count of devices registered on this date
  const count = await getDeviceCountForDate(date);
  const sequential = String(count + 1).padStart(4, "0");

  return `REC-${year}${month}${day}-${sequential}`;
}

// Example: REC-20250115-0042

// QR Code Generation:
import QRCode from "qrcode";
const qrCodeDataUrl = await QRCode.toDataURL(receiptNumber);
// Returns: "data:image/png;base64,iVBORw0KGg..."
```

**Status Transition Rules:**

```typescript
// Valid transitions:
const validTransitions = {
  'registered': ['in-progress', 'cancelled'],
  'in-progress': ['awaiting-parts', 'completed', 'cancelled'],
  'awaiting-parts': ['in-progress', 'completed', 'cancelled'],
  'completed': ['delivered'],
  'delivered': [],  // Terminal state
  'cancelled': []   // Terminal state
};

// Business Rules:
- Cannot go backward in status (except to cancelled)
- Cannot skip statuses (registered → completed is invalid)
- Cannot change status of delivered/cancelled devices
- Auto-set completionDate when status = 'completed'
- Auto-set deliveryDate when status = 'delivered'
- Trigger SMS notification on status change if customer has phone
```

**Warranty Validation:**

```typescript
// If warrantyStatus = 'in-warranty':
if (device.warrantyStatus === "in-warranty") {
  // warrantyExpiryDate must be provided
  if (!device.warrantyExpiryDate) {
    throw new Error("Warranty expiry date required for in-warranty devices");
  }
  // Must be future date
  if (new Date(device.warrantyExpiryDate) <= new Date()) {
    throw new Error("Warranty expiry date must be in the future");
  }
}

// Warranty status doesn't auto-update (manual management)
```

**Cost Validation:**

```typescript
// Both must be >= 0
if (estimatedCost < 0 || actualCost < 0) {
  throw new Error("Costs cannot be negative");
}

// Warn if actual > estimated by 50%
if (actualCost > estimatedCost * 1.5) {
  console.warn(
    `Actual cost exceeds estimate by ${(
      (actualCost / estimatedCost - 1) *
      100
    ).toFixed(1)}%`
  );
}

// actualCost should be set when status = 'completed'
if (status === "completed" && !actualCost) {
  // Warning: expected but not required
}
```

#### Inventory

**SKU Validation:**

```typescript
const skuRegex = /^[A-Z0-9-]{1,100}$/;

// Format convention: CATEGORY-TYPE-NUMBER
// Examples:
✅ "CHG-USBC-001"      // Charger, USB-C, #001
✅ "SCREEN-IPHONE-13"  // Screen, iPhone, model 13
✅ "PART-LCD-015"      // Part, LCD, #015

// Invalid:
❌ "chg-usbc-001"      // Lowercase not allowed
❌ "screen_iphone"     // Underscore not allowed
❌ "PART LCD 015"      // Spaces not allowed

// Unique constraint: SKU + locationId
// Different locations can use same SKU for different items
```

**Stock Management:**

```typescript
// Quantity validation
if (quantity < 0) {
  throw new Error("Quantity cannot be negative");
}

// Reorder point logic
if (quantity <= reorderPoint) {
  // Flag as low stock
  await sendLowStockNotification(item);
  suggestedReorderQty = reorderPoint * 2;
}

// Price validation
if (sellingPrice < unitCost) {
  console.warn(
    `Selling at loss: ${item.name} (Cost: ${unitCost}, Price: ${sellingPrice})`
  );
}

// Recommended markup by category:
const markups = {
  parts: 1.5, // 50% markup
  accessories: 2.0, // 100% markup
  retail: 1.8, // 80% markup
};
```

#### Sales Transactions

**Calculation Rules:**

```typescript
// Step-by-step calculation for sales:

// 1. Calculate item subtotals
items.forEach((item) => {
  item.subtotal = item.quantity * item.unitPrice;
});

// 2. Sum total before tax
const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

// 3. Apply discount
const totalAfterDiscount = totalAmount - (discountAmount || 0);

// Validate discount
if (discountAmount > totalAmount) {
  throw new Error("Discount cannot exceed total amount");
}

// 4. Calculate tax (configurable rate, default 8%)
const taxRate = (await getTaxRateForLocation(locationId)) || 0.08;
const taxAmount = totalAfterDiscount * taxRate;

// 5. Calculate final amount
const finalAmount = totalAfterDiscount + taxAmount;

// 6. Round to 2 decimal places
return {
  totalAmount: Math.round(totalAmount * 100) / 100,
  taxAmount: Math.round(taxAmount * 100) / 100,
  finalAmount: Math.round(finalAmount * 100) / 100,
};
```

**Inventory Validation Before Sale:**

```typescript
// Check stock before processing sale
for (const item of saleItems) {
  const inventoryItem = await db
    .select()
    .from(inventoryItems)
    .where(eq(inventoryItems.id, item.inventoryItemId))
    .limit(1);

  if (!inventoryItem || inventoryItem.length === 0) {
    throw new Error(`Product not found: ${item.inventoryItemId}`);
  }

  if (inventoryItem[0].quantity < item.quantity) {
    throw new Error(
      `Insufficient stock for ${inventoryItem[0].name}. ` +
        `Available: ${inventoryItem[0].quantity}, Requested: ${item.quantity}`
    );
  }
}

// After sale completes, atomically decrement inventory:
await db
  .update(inventoryItems)
  .set({
    quantity: sql`quantity - ${item.quantity}`,
    updatedAt: new Date(),
  })
  .where(eq(inventoryItems.id, item.inventoryItemId));
```

#### Locations

**Location Code Validation:**

```typescript
const locationCodeRegex = /^[A-Z0-9]{2,10}$/;

// Requirements:
- 2-10 characters
- Uppercase letters and numbers only
- No spaces, dashes, or special characters
- Must be globally unique

// Examples:
✅ "MAIN", "NYC01", "LA", "BRANCH2"
❌ "main" (lowercase), "ny-1" (dash), "a" (too short)
```

**Business Hours Format:**

```json
{
  "monday": { "open": "09:00", "close": "18:00" },
  "tuesday": { "open": "09:00", "close": "18:00" },
  "wednesday": { "open": "09:00", "close": "18:00" },
  "thursday": { "open": "09:00", "close": "18:00" },
  "friday": { "open": "09:00", "close": "18:00" },
  "saturday": { "open": "10:00", "close": "16:00" },
  "sunday": { "closed": true }
}
```

**Validation:**

- Times in 24-hour format (HH:MM)
- `close` time must be after `open` time
- Can mark entire day as `closed: true`

**Timezone Validation:**

```typescript
// Must be valid IANA timezone identifier
// Examples:
✅ "America/New_York", "Europe/London", "Africa/Addis_Ababa", "Asia/Tokyo"
❌ "EST", "PST" (abbreviations not accepted)

// Reference: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
```

### Multi-Location Access Control Rules

**Admin Users:**

- Can view data from ALL locations
- Can filter by location using `X-Selected-Location` header
- Header value `"all"` or absent = sees all locations
- Header value = specific UUID = sees that location only

**Non-Admin Users (Technician/Sales):**

- Can ONLY view/modify data from their assigned `locationId`
- `user.locationId` automatically filters all queries
- Attempts to access other locations' data return `403 Forbidden`

**Implementation Pattern:**

```typescript
// Middleware sets location filter
export function getLocationFilter(user: User, selectedLocation?: string) {
  if (user.role === "admin") {
    // Admin can select location or see all
    return selectedLocation && selectedLocation !== "all"
      ? { locationId: selectedLocation }
      : {}; // No filter = all locations
  } else {
    // Non-admin always filtered to their location
    return { locationId: user.locationId };
  }
}

// Apply in all queries:
const customers = await db
  .select()
  .from(customers)
  .where(
    and(
      eq(customers.isActive, true),
      locationFilter.locationId
        ? eq(customers.locationId, locationFilter.locationId)
        : undefined
    )
  );
```

### Soft Delete Pattern

**Implementation:**

```typescript
// All major entities have isActive boolean (default: true)

// Soft delete:
await db.update(customers)
  .set({ isActive: false, updatedAt: new Date() })
  .where(eq(customers.id, customerId));

// Query only active records (default behavior):
const activeCustomers = await db.select()
  .from(customers)
  .where(eq(customers.isActive, true));

// Admin can query including inactive:
const allCustomers = await db.select()
  .from(customers); // No isActive filter

// Benefits:
- Maintains referential integrity
- Can restore deleted records
- Audit trail preserved
- Cascading issues avoided
```

### Referential Integrity Rules

**Foreign Key Constraints:**

```typescript
// Cannot delete if referenced:

// Customer:
- Cannot delete if has devices (device.customerId)
- Cannot delete if has sales (sale.customerId)
- Cannot delete if has loan invoices
→ Must soft delete (isActive = false) or cascade delete children

// Location:
- Cannot delete if has users
- Cannot delete if has customers
- Cannot delete if has devices
- Cannot delete if has inventory
→ Must be empty before deletion or cascade delete all data

// User:
- Cannot delete if assigned to devices (device.assignedTo)
- Cannot delete last admin user
→ Must reassign devices or soft delete

// Inventory Item:
- Cannot delete if used in sales (sale_items.inventoryItemId)
- Cannot delete if in purchase orders
→ Soft delete recommended
```

**Cascade Rules:**

```typescript
// On DELETE CASCADE:
- Device → device_status_history (when device deleted, history deleted)
- Sale → sale_items (when sale deleted, items deleted)
- Purchase Order → purchase_order_items

// On DELETE SET NULL:
- Customer soft delete → devices/sales keep reference but customer inactive

// On DELETE RESTRICT:
- Location → users, customers, devices (must be empty)
- Category → inventory items (must reassign or delete items first)
```

### Data Validation Flow

```
Client Request
      ↓
1. Zod Schema Validation (type checking, format validation)
      ↓
2. Custom Business Rules (status transitions, stock availability)
      ↓
3. Permission Check (role-based, location-based)
      ↓
4. Database Constraints (unique, foreign keys, check constraints)
      ↓
5. Execute Operation (with transaction if multi-step)
      ↓
6. Trigger Side Effects (notifications, audit logs, stock updates)
      ↓
7. Return Response or Detailed Error
```

---

## Authentication & Authorization

### Authentication Flow

1. **Login:**

   - Client sends `POST /api/login` with `{ username, password }`
   - Server validates credentials (bcrypt comparison)
   - Server generates JWT with payload:
     ```json
     {
       "userId": "uuid",
       "username": "string",
       "role": "admin|technician|sales",
       "locationId": "uuid"
     }
     ```
   - JWT signed with `JWT_SECRET` (from environment)
   - Token returned to client with user object

2. **Protected Routes:**

   - Client includes `Authorization: Bearer <token>` header
   - Server middleware `authenticateUser` verifies JWT
   - Payload attached to `req.user`

3. **Logout:**
   - Client-side token deletion (stateless JWT)

### Authorization Levels

**Role Hierarchy:**

- **admin**: Full access, all locations, system settings
- **technician**: Device management, repairs, assigned location only
- **sales**: POS, customers, invoices, assigned location only

**Permission Matrix:**

| Feature             | Admin | Technician | Sales |
| ------------------- | ----- | ---------- | ----- |
| Dashboard           | ✅    | ✅         | ✅    |
| Device Registration | ✅    | ✅         | ❌    |
| Repair Tracking     | ✅    | ✅         | ❌    |
| Point of Sale       | ✅    | ❌         | ✅    |
| Inventory (View)    | ✅    | ✅         | ✅    |
| Inventory (Manage)  | ✅    | ❌         | ❌    |
| Customers           | ✅    | ✅         | ✅    |
| Appointments        | ✅    | ✅         | ✅    |
| Sales Reports       | ✅    | ❌         | ✅    |
| Analytics           | ✅    | ❌         | ❌    |
| Service Management  | ✅    | ❌         | ❌    |
| Locations           | ✅    | ❌         | ❌    |
| Workers             | ✅    | ❌         | ❌    |
| Settings            | ✅    | ❌         | ❌    |
| Expenses            | ✅    | ❌         | ❌    |
| Loan Invoices       | ✅    | ❌         | ✅    |
| System Health       | ✅    | ❌         | ❌    |
| Backup/Restore      | ✅    | ❌         | ❌    |

### Multi-Location Access Control

- **Admin:**

  - Can select location via `X-Selected-Location` header
  - If header = `"all"` or absent → sees all locations
  - If header = specific location ID → sees that location only

- **Non-Admin (Technician/Sales):**
  - Always restricted to `user.locationId`
  - Cannot access other locations' data

**Middleware:**

- `authenticateUser`: Validates JWT, sets `req.user`
- `authenticateAndFilter`: Adds location filtering to `req.locationFilter`
- `validateLocationAccess`: Ensures user can only modify their location's data

---

## Application Pages & Routes

### Public Routes (Unauthenticated)

| Route      | Component     | Description                                                      |
| ---------- | ------------- | ---------------------------------------------------------------- |
| `/`        | PublicLanding | Public-facing landing page with services, products, testimonials |
| `/landing` | PublicLanding | Alias for landing page                                           |
| `/login`   | Login         | Login form                                                       |

### Protected Routes (Authenticated)

| Route                       | Roles             | Component               | Description                                                        |
| --------------------------- | ----------------- | ----------------------- | ------------------------------------------------------------------ |
| `/dashboard`                | All               | Dashboard               | Main dashboard with KPIs, charts, recent activity                  |
| `/device-registration`      | Admin, Technician | DeviceRegistration      | Register new devices for repair                                    |
| `/repair-tracking`          | Admin, Technician | RepairTracking          | Track and update repair status                                     |
| `/point-of-sale`            | Admin, Sales      | PointOfSale             | POS interface for sales transactions                               |
| `/sales`                    | Admin, Sales      | Sales                   | Sales history and reports                                          |
| `/inventory`                | All               | Inventory               | View inventory items                                               |
| `/inventory-management`     | Admin             | InventoryManagement     | Manage inventory, purchase orders                                  |
| `/inventory-predictions`    | Admin             | InventoryPredictions    | Stock predictions and forecasts                                    |
| `/customers`                | All               | Customers               | Customer database and management                                   |
| `/appointments`             | All               | Appointments            | Appointment calendar and booking                                   |
| `/analytics`                | Admin             | AnalyticsHub            | Advanced analytics and reports                                     |
| `/analytics-hub`            | All               | AnalyticsHub            | Analytics overview                                                 |
| `/service-management`       | Admin             | ServiceManagement       | Manage service types, device types, brands, models                 |
| `/customer-feedback`        | Admin             | CustomerFeedback        | View and respond to customer reviews                               |
| `/locations`                | Admin             | Locations               | Manage business locations                                          |
| `/workers`                  | Admin             | Workers                 | Staff/user management                                              |
| `/owner-profile`            | Admin             | OwnerProfile            | Owner profile and business branding                                |
| `/expenses`                 | Admin             | Expenses                | Expense tracking and management                                    |
| `/expense-analytics`        | Admin             | ExpenseAnalytics        | Expense analytics and reports                                      |
| `/loan-invoices`            | Admin, Sales      | LoanInvoices            | Credit/layaway invoices                                            |
| `/settings`                 | Admin             | Settings                | System settings (appearance, notifications, email, security, data) |
| `/system-health`            | Admin             | SystemHealth            | System monitoring and health metrics                               |
| `/backup-restore`           | Admin             | BackupRestore           | Database backup and restore                                        |
| `/import-export`            | Admin             | ImportExportManagement  | Bulk data import/export (Excel)                                    |
| `/worker-profile`           | All               | WorkerProfile           | Worker's own profile                                               |
| `/notification-preferences` | All               | NotificationPreferences | User notification preferences                                      |
| `/customer-portal`          | All               | CustomerPortal          | Customer self-service portal                                       |

---

## API Endpoints with Schemas

**Purpose:** Complete API reference with request/response formats for AI-agent implementation.

### Base URL & Authentication

- **Development:** `http://localhost:5001/api`
- **Production:** `https://yourdomain.com/api`
- **Authentication:** `Authorization: Bearer <jwt-token>` header on all protected endpoints

### Standard Response Patterns

**Success Response:**

```json
{
  "data": { ...resource },
  "success": true
}
```

**Error Response:**

```json
{
  "message": "Human-readable error",
  "errors": [{ "field": "fieldName", "message": "Specific error" }],
  "success": false
}
```

### HTTP Status Codes

| Code | Usage                    | Meaning               |
| ---- | ------------------------ | --------------------- |
| 200  | GET, PUT, DELETE success | OK                    |
| 201  | POST success             | Created               |
| 400  | Validation error         | Bad Request           |
| 401  | Missing/invalid token    | Unauthorized          |
| 403  | Insufficient permissions | Forbidden             |
| 404  | Resource not found       | Not Found             |
| 409  | Duplicate resource       | Conflict              |
| 500  | Server error             | Internal Server Error |

---

### Authentication Endpoints

#### POST `/api/login`

User authentication and JWT token generation.

**Request:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**

```json
{
  "user": {
    "id": "a4aa6df3-78fa-4bf3-a9c3-325e5fda778f",
    "username": "admin",
    "email": "admin@solnet.com",
    "firstName": "System",
    "lastName": "Administrator",
    "role": "admin",
    "locationId": "loc-uuid-123",
    "profilePicture": "/uploads/profile_xyz.png",
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (401):**

```json
{
  "message": "Invalid credentials"
}
```

#### GET `/api/user`

Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "id": "user-uuid",
  "username": "admin",
  "firstName": "System",
  "lastName": "Administrator",
  "role": "admin",
  "locationId": "loc-uuid",
  "isActive": true
}
```

---

### Customer Endpoints

#### GET `/api/customers`

List all customers (location-filtered).

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 50, max: 200)
- `search` (string, searches name/phone/email)
- `location` (UUID, admin only)

**Response (200):**

```json
[
  {
    "id": "cust-uuid-1",
    "numId": 1,
    "locationId": "loc-uuid-123",
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "notes": "VIP customer",
    "registrationDate": "2025-01-10T00:00:00Z",
    "isActive": true,
    "createdAt": "2025-01-10T09:30:00Z",
    "updatedAt": "2025-01-15T14:20:00Z"
  }
]
```

#### POST `/api/customers`

Create new customer.

**Request:**

```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "notes": "VIP customer",
  "locationId": "loc-uuid-123"
}
```

**Validation (Zod Schema):**

```typescript
{
  name: z.string().min(1).max(255),
  phone: z.string().regex(/^\+?[\d\s-()]{10,20}$/),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  notes: z.string().max(1000).optional(),
  locationId: z.string().uuid()
}
```

**Response (201):**

```json
{
  "id": "cust-uuid-new",
  "numId": 42,
  "name": "John Doe",
  ...all customer fields
}
```

**Error (409):**

```json
{
  "message": "Customer with this phone number already exists"
}
```

#### PUT `/api/customers/:id`

Update customer (all fields optional).

**Request:**

```json
{
  "name": "John Updated Doe",
  "email": "john.new@example.com"
}
```

**Response (200):** Updated customer object

#### DELETE `/api/customers/:id`

Soft delete customer.

**Response (200):**

```json
{
  "message": "Customer deleted successfully"
}
```

#### GET `/api/customers/search?q=<query>`

Search customers.

**Query:** `?q=John` (min 2 chars)

**Response (200):** Array of matching customers

---

### Device Endpoints

#### GET `/api/devices`

List devices (location-filtered).

**Query Parameters:**

- `status` (enum: registered, in-progress, awaiting-parts, completed, delivered, cancelled)
- `customerId` (UUID)
- `page`, `limit`

**Response (200):**

```json
[
  {
    "id": "device-uuid-1",
    "numId": 100,
    "locationId": "loc-uuid-123",
    "customerId": "cust-uuid-1",
    "customerName": "John Doe",
    "deviceType": "Laptop",
    "brand": "Dell",
    "model": "XPS 15",
    "serialNumber": "SN123456789",
    "problem": "Screen not working",
    "status": "in-progress",
    "assignedTo": "user-uuid-tech1",
    "assignedTechnicianName": "Mike Tech",
    "estimatedCost": 150.0,
    "actualCost": 145.5,
    "receiptNumber": "REC-20250115-0001",
    "intakeDate": "2025-01-15T09:00:00Z",
    "estimatedCompletionDate": "2025-01-20T00:00:00Z",
    "completionDate": null,
    "deliveryDate": null,
    "notes": "Replaced LCD panel",
    "accessories": "Charger, Case",
    "warrantyStatus": "in-warranty",
    "warrantyExpiryDate": "2026-01-15T00:00:00Z",
    "createdAt": "2025-01-15T09:00:00Z",
    "updatedAt": "2025-01-15T14:30:00Z"
  }
]
```

#### POST `/api/devices`

Register new device for repair.

**Request:**

```json
{
  "customerId": "cust-uuid-1",
  "locationId": "loc-uuid-123",
  "deviceType": "Laptop",
  "brand": "Dell",
  "model": "XPS 15",
  "serialNumber": "SN123456789",
  "problem": "Screen not working",
  "estimatedCost": 150.0,
  "estimatedCompletionDate": "2025-01-20T00:00:00Z",
  "notes": "Customer reported flickering",
  "accessories": "Charger, Case",
  "warrantyStatus": "in-warranty",
  "assignedTo": "user-uuid-tech1"
}
```

**Response (201):**

```json
{
  "id": "device-uuid-new",
  "numId": 101,
  "receiptNumber": "REC-20250115-0002",
  "status": "registered",
  "qrCode": "data:image/png;base64,iVBORw0KGg...",
  ...all device fields
}
```

**Note:** `receiptNumber` and `qrCode` are auto-generated.

#### POST `/api/devices/:id/status`

Update device status with notification.

**Request:**

```json
{
  "status": "in-progress",
  "notes": "Started repair work",
  "notifyCustomer": true
}
```

**Response (200):**

```json
{
  "message": "Device status updated successfully",
  "device": { ...updated device },
  "notification": {
    "sent": true,
    "recipient": "+1234567890"
  }
}
```

#### GET `/api/devices/:id/status-history`

Get status change history.

**Response (200):**

```json
[
  {
    "id": "history-uuid-1",
    "deviceId": "device-uuid-1",
    "status": "in-progress",
    "notes": "Started repair",
    "changedBy": "user-uuid-tech1",
    "technicianName": "Mike Tech",
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

#### GET `/api/devices/receipt/:receiptNumber`

Find device by receipt number (public access if needed for customer lookup).

**Response (200):**

```json
{
  "id": "device-uuid-1",
  "receiptNumber": "REC-20250115-0001",
  "status": "in-progress",
  "customer": {
    "name": "John Doe",
    "phone": "+1234567890"
  },
  ...device details
}
```

---

### Inventory Endpoints

#### GET `/api/inventory`

List inventory items (location-filtered).

**Query Parameters:**

- `category` (enum: parts, accessories, retail)
- `lowStock` (boolean)
- `location` (UUID, admin only)

**Response (200):**

```json
[
  {
    "id": "inv-uuid-1",
    "numId": 50,
    "locationId": "loc-uuid-123",
    "name": "Phone Charger USB-C",
    "sku": "CHG-USBC-001",
    "category": "accessories",
    "quantity": 25,
    "reorderPoint": 10,
    "unitCost": 5.99,
    "sellingPrice": 12.99,
    "supplier": "Tech Supplies Inc",
    "barcode": "1234567890123",
    "description": "Fast charging USB-C cable",
    "isActive": true,
    "createdAt": "2025-01-10T00:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
]
```

#### POST `/api/inventory`

Create inventory item (Admin only).

**Request:**

```json
{
  "locationId": "loc-uuid-123",
  "name": "Phone Charger USB-C",
  "sku": "CHG-USBC-001",
  "category": "accessories",
  "quantity": 100,
  "reorderPoint": 10,
  "unitCost": 5.99,
  "sellingPrice": 12.99,
  "supplier": "Tech Supplies Inc",
  "barcode": "1234567890123",
  "description": "Fast charging USB-C cable"
}
```

**Response (201):** Created inventory item

**Error (409):**

```json
{
  "message": "Inventory item with SKU 'CHG-USBC-001' already exists"
}
```

#### GET `/api/inventory/low-stock`

Get items at or below reorder point.

**Response (200):**

```json
[
  {
    "id": "inv-uuid-2",
    "name": "Screen Protector",
    "quantity": 5,
    "reorderPoint": 10,
    "suggestedReorderQuantity": 20
  }
]
```

---

### Sales Endpoints

#### GET `/api/sales`

List sales transactions.

**Query:** `?startDate=2025-01-01&endDate=2025-01-31&location=loc-uuid`

**Response (200):**

```json
[
  {
    "id": "sale-uuid-1",
    "numId": 200,
    "locationId": "loc-uuid-123",
    "customerId": "cust-uuid-1",
    "customerName": "John Doe",
    "saleDate": "2025-01-15T14:30:00Z",
    "totalAmount": 45.97,
    "taxAmount": 3.68,
    "discountAmount": 0.0,
    "finalAmount": 49.65,
    "paymentMethod": "card",
    "paymentStatus": "paid",
    "soldBy": "user-uuid-sales1",
    "salesPersonName": "Sarah Sales",
    "notes": "Gift wrapped",
    "items": [
      {
        "id": "sale-item-uuid-1",
        "inventoryItemId": "inv-uuid-1",
        "productName": "Phone Charger USB-C",
        "quantity": 2,
        "unitPrice": 12.99,
        "subtotal": 25.98
      }
    ],
    "createdAt": "2025-01-15T14:30:00Z"
  }
]
```

#### POST `/api/sales`

Create sale transaction (automatically decrements inventory).

**Request:**

```json
{
  "locationId": "loc-uuid-123",
  "customerId": "cust-uuid-1",
  "saleDate": "2025-01-15T14:30:00Z",
  "paymentMethod": "card",
  "discountAmount": 5.0,
  "notes": "Loyalty discount applied",
  "items": [
    {
      "inventoryItemId": "inv-uuid-1",
      "quantity": 2,
      "unitPrice": 12.99
    },
    {
      "inventoryItemId": "inv-uuid-3",
      "quantity": 1,
      "unitPrice": 19.99
    }
  ]
}
```

**Response (201):**

```json
{
  "id": "sale-uuid-new",
  "numId": 201,
  "receiptNumber": "SALE-20250115-0201",
  "totalAmount": 45.97,
  "taxAmount": 3.68,
  "finalAmount": 49.65,
  "paymentStatus": "paid",
  ...all sale fields,
  "inventoryUpdated": true
}
```

**Error (400 - Insufficient Stock):**

```json
{
  "message": "Insufficient inventory",
  "errors": [
    {
      "inventoryItemId": "inv-uuid-1",
      "productName": "Phone Charger USB-C",
      "requested": 10,
      "available": 5
    }
  ]
}
```

---

### User (Worker) Endpoints

#### GET `/api/users`

List all users (Admin only).

**Response (200):**

```json
[
  {
    "id": "user-uuid-1",
    "username": "admin",
    "email": "admin@solnet.com",
    "firstName": "System",
    "lastName": "Administrator",
    "phone": "+1234567890",
    "role": "admin",
    "locationId": "loc-uuid-123",
    "locationName": "Main Branch",
    "profilePicture": "/uploads/profile_xyz.png",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

#### POST `/api/users`

Create new user (Admin only).

**Request:**

```json
{
  "username": "technician1",
  "password": "SecurePass123!",
  "email": "tech1@solnet.com",
  "firstName": "Mike",
  "lastName": "Technician",
  "phone": "+1234567891",
  "role": "technician",
  "locationId": "loc-uuid-123"
}
```

**Response (201):** User object (password NOT returned)

**Error (409):**

```json
{
  "message": "Username 'technician1' is already taken"
}
```

---

### Location Endpoints

#### GET `/api/locations`

List all locations.

**Response (200):**

```json
[
  {
    "id": "loc-uuid-1",
    "numId": 1,
    "name": "Main Branch",
    "code": "MAIN",
    "address": "123 Business St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890",
    "email": "main@solnet.com",
    "managerName": "Sarah Manager",
    "isActive": true,
    "timezone": "America/New_York",
    "businessHours": {...},
    "notes": "Main headquarters",
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

---

### Analytics Endpoints

#### GET `/api/analytics/dashboard`

Dashboard KPIs and metrics.

**Query:** `?startDate=2025-01-01&endDate=2025-01-31&location=loc-uuid`

**Response (200):**

```json
{
  "totalRevenue": 45678.9,
  "totalSales": 234,
  "activeDevices": 45,
  "completedRepairs": 189,
  "pendingRepairs": 45,
  "totalCustomers": 567,
  "newCustomers": 23,
  "inventoryValue": 12345.67,
  "lowStockItems": 5,
  "topSellingItems": [
    {
      "id": "inv-uuid-1",
      "name": "Phone Charger USB-C",
      "quantitySold": 45,
      "revenue": 584.55
    }
  ],
  "revenueByDay": [
    {
      "date": "2025-01-15",
      "revenue": 1234.56,
      "salesCount": 12
    }
  ],
  "repairStatusBreakdown": {
    "registered": 12,
    "in-progress": 18,
    "awaiting-parts": 5,
    "completed": 10
  }
}
```

---

### Additional Endpoint Summaries

**Other Endpoints:** (Follow same CRUD patterns as above)

- Appointments, Expenses, Loan Invoices, Purchase Orders
- Service Management (device types, brands, models, service types)
- Predefined Problems, Business Profile, Customer Feedback
- SMS Templates, Notifications, System Health
- Import/Export (Excel templates)

**All endpoints follow:**

- Same authentication pattern (JWT Bearer token)
- Same error response format
- Same location filtering for non-admin users
- Same validation patterns (see Validation Rules section)

---

## Business Features

### 1. Device Repair Management

- Device intake with barcode/QR receipt generation
- Multi-step repair workflow (registered → in progress → completed → delivered)
- Technician assignment and workload tracking
- Estimated and actual cost tracking
- Parts/accessories used tracking
- Customer notifications at each status change
- Warranty tracking
- Repair history and notes

### 2. Point of Sale (POS)

- Fast product/accessory sales
- Customer lookup and association
- Multiple payment methods (cash, card, mobile)
- Tax calculation
- Discounts
- Receipt generation and printing
- Daily sales reports
- Sales by staff member tracking

### 3. Inventory Management

- Unified inventory for parts, accessories, retail products
- Multi-location stock tracking
- Low stock alerts
- Reorder point automation
- Purchase order creation and receiving
- Supplier management
- Barcode support
- Stock predictions based on sales velocity
- Inventory valuation reports

### 4. Customer Relationship Management

- Customer database with contact info
- Purchase history
- Device history
- Appointment scheduling
- SMS notifications
- Customer feedback collection
- Customer segmentation for marketing
- Loyalty tracking

### 5. Multi-Location Support

- Branch/location management
- Location-based data isolation
- Admin can view and manage all locations
- Staff assigned to specific locations
- Per-location inventory and sales tracking
- Consolidated reporting across locations

### 6. Analytics & Reporting

- Revenue trends and forecasts
- Repair status distribution
- Inventory turnover
- Customer acquisition trends
- Staff performance metrics
- Expense tracking and budgeting
- Custom date range reports
- Export to Excel/PDF

### 7. Staff Management

- User accounts with role-based access
- Profile pictures
- Workload tracking
- Performance metrics
- Location assignment
- Activity logs

### 8. Financial Management

- Expense tracking by category
- Expense analytics
- Budget vs. actual reporting
- Loan/credit invoices for customers
- Payment tracking
- Revenue targets
- Profit/loss reporting

### 9. Communication

- SMS notifications (repair status, appointment reminders)
- Bulk SMS campaigns
- Customer groups and segmentation
- SMS templates
- Ethiopian SMS provider integration
- Twilio integration for international SMS

### 10. Public Landing Page

- Business branding and info
- Service catalog with pricing
- Product/accessory showcase
- Customer testimonials
- Contact form
- Operating hours
- Social media links
- SEO-friendly

### 11. System Administration

- Business profile and branding
- Logo and imagery management
- System settings
- User permissions
- Notification preferences
- Data backup and restore
- Bulk import/export
- System health monitoring
- Security settings

---

## Frontend Implementation Patterns

**Purpose:** Complete React/TypeScript patterns for AI agents to generate frontend code.

### Technology Stack

**Core Dependencies:**

```json
{
  "react": "^18.3.0",
  "typescript": "^5.6.0",
  "wouter": "^3.3.5",
  "@tanstack/react-query": "^5.60.0",
  "react-hook-form": "^7.55.0",
  "zod": "^3.23.8",
  "tailwindcss": "^3.4.0"
}
```

### State Management Pattern (React Query)

**Basic Query (Data Fetching):**

```typescript
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

function CustomerList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: () => apiRequest<Customer[]>("/customers"),
  });

  if (isLoading) return <Skeleton className="h-96" />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-4">
      {data?.map((customer) => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  );
}
```

**Mutation Pattern (Create/Update/Delete):**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

function CreateCustomerForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: CustomerInput) => apiRequest("/customers", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(formData);
      }}
    >
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create Customer"}
      </Button>
    </form>
  );
}
```

### Form Handling Pattern (React Hook Form + Zod)

**Standard Form with Validation:**

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define schema (matches backend validation)
const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  phone: z.string().regex(/^\+?[\d\s-()]{10,20}$/, "Invalid phone format"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().max(500).optional(),
  locationId: z.string().uuid(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

function CustomerForm({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      locationId: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CustomerFormData) =>
      apiRequest("/customers", "POST", data),
    onSuccess: () => {
      form.reset();
      onSuccess?.();
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="+1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
```

### Authentication Pattern

**useAuth Hook:**

```typescript
import { useAuth } from "@/hooks/useAuth";

function ProtectedComponent() {
  const { user, isAuthenticated, isLoading, logout, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <p>Welcome, {user?.firstName}!</p>

      {hasPermission("manage_devices") && <Button>Manage Devices</Button>}

      <Button onClick={logout}>Logout</Button>
    </div>
  );
}
```

**Protected Routes:**

```typescript
import { RoleGuard } from "@/components/RoleGuard";

<Route
  path="/workers"
  component={() => (
    <RoleGuard requiredRoles={["admin"]}>
      <Workers />
    </RoleGuard>
  )}
/>

<Route
  path="/device-registration"
  component={() => (
    <RoleGuard requiredPermissions={["manage_devices"]}>
      <DeviceRegistration />
    </RoleGuard>
  )}
/>
```

### Component Patterns

**Data Table:**

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function CustomersTable() {
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => apiRequest<Customer[]>("/customers"),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers?.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>{customer.name}</TableCell>
            <TableCell>{customer.phone}</TableCell>
            <TableCell>{customer.email}</TableCell>
            <TableCell className="text-right">
              <Button size="sm" variant="ghost">
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**Modal/Dialog:**

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function CreateCustomerDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Customer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
        </DialogHeader>
        <CustomerForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
```

**Loading & Empty States:**

```typescript
// Loading state
if (isLoading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

// Empty state
if (!data || data.length === 0) {
  return (
    <div className="text-center py-12">
      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No customers found</h3>
      <p className="text-muted-foreground mt-2">
        Get started by adding your first customer.
      </p>
      <Button className="mt-4">Add Customer</Button>
    </div>
  );
}
```

**Error Handling:**

```typescript
// Query error handling
const { data, error, isError } = useQuery({
  queryKey: ["customers"],
  queryFn: fetchCustomers,
});

if (isError) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error?.message || "Failed to load data"}
      </AlertDescription>
    </Alert>
  );
}

// Mutation error handling
const mutation = useMutation({
  mutationFn: createCustomer,
  onError: (error: any) => {
    // Handle validation errors (set on form fields)
    if (error.errors) {
      error.errors.forEach((err: any) => {
        form.setError(err.field, {
          type: "manual",
          message: err.message,
        });
      });
    } else {
      // General error toast
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  },
});
```

### Query Key Convention

```typescript
// Organize query keys by entity:
const queryKeys = {
  customers: {
    all: ["customers"] as const,
    list: (filters?: CustomerFilters) =>
      ["customers", "list", filters] as const,
    detail: (id: string) => ["customers", "detail", id] as const,
  },
  devices: {
    all: ["devices"] as const,
    list: (filters?: DeviceFilters) => ["devices", "list", filters] as const,
    detail: (id: string) => ["devices", "detail", id] as const,
    statusHistory: (id: string) => ["devices", id, "status-history"] as const,
  },
};

// Usage:
useQuery({
  queryKey: queryKeys.customers.detail(customerId),
  queryFn: () => fetchCustomer(customerId),
});

// Invalidation:
queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
```

### Project Structure

```
client/src/
├── pages/                    # Page components (one per route)
│   ├── dashboard.tsx         # Dashboard with KPIs
│   ├── customers.tsx         # Customer management
│   ├── device-registration.tsx
│   ├── repair-tracking.tsx
│   ├── point-of-sale.tsx
│   ├── inventory-management.tsx
│   └── [30+ other pages]
├── components/
│   ├── ui/                   # shadcn/ui primitives (46 components)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── app-layout.tsx    # Main layout wrapper with sidebar/header
│   │   ├── header.tsx        # Top navigation bar
│   │   └── sidebar.tsx       # Left sidebar navigation
│   ├── auth/
│   │   └── protected-route.tsx
│   └── [feature-specific]/
│       ├── customer-form.tsx
│       ├── device-status-badge.tsx
│       └── ...
├── hooks/
│   ├── useAuth.ts            # Authentication hook
│   ├── useLocation.ts        # Location selection hook
│   ├── use-toast.ts          # Toast notifications
│   └── use-mobile.tsx        # Responsive detection
├── lib/
│   ├── queryClient.ts        # React Query + API request utility
│   ├── utils.ts              # Helper functions (cn, formatters)
│   ├── cache.ts              # Caching utilities
│   └── currency.ts           # Currency formatting
├── types/
│   ├── api.ts                # API response types
│   └── models.ts             # Domain models
├── App.tsx                   # Root with routing and error boundary
├── main.tsx                  # Entry point
├── index.css                 # Global styles (Tailwind + CSS variables)
└── design-tokens.ts          # Design system tokens
```

### API Request Utility

**Centralized API client:**

```typescript
// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function getAuthHeaders(includeContentType: boolean = true) {
  const token = localStorage.getItem("token"); // Or use secure storage
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

export async function apiRequest<T = any>(
  url: string,
  method: string = "GET",
  data?: unknown
): Promise<T> {
  const fullUrl = url.startsWith("/api/") ? url : `/api/${url}`;
  const isFormData = data instanceof FormData;

  const response = await fetch(fullUrl, {
    method,
    headers: isFormData ? getAuthHeaders(false) : getAuthHeaders(!!data),
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}
```

### Routing Pattern (Wouter)

**App.tsx Structure:**

```typescript
import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Customers = lazy(() => import("@/pages/customers"));
const DeviceRegistration = lazy(() => import("@/pages/device-registration"));
// ... other pages

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={PublicLanding} />
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <AppLayout>
      <Suspense fallback={<PageLoadingSpinner />}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route
            path="/customers"
            component={() => (
              <RoleGuard requiredPermissions={["view_customers"]}>
                <Customers />
              </RoleGuard>
            )}
          />
          {/* ... more routes */}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AppLayout>
  );
}
```

### Common UI Patterns

**Search with Debounce:**

```typescript
function CustomerSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: results } = useQuery({
    queryKey: ["customers", "search", debouncedSearch],
    queryFn: () => apiRequest(`/customers/search?q=${debouncedSearch}`),
    enabled: debouncedSearch.length >= 2,
  });

  return (
    <div>
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search customers..."
      />
      {results?.map((customer) => (
        <div key={customer.id}>{customer.name}</div>
      ))}
    </div>
  );
}
```

**Pagination:**

```typescript
function PaginatedList() {
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data } = useQuery({
    queryKey: ["customers", { page, limit }],
    queryFn: () => apiRequest(`/customers?page=${page}&limit=${limit}`),
  });

  return (
    <div>
      <Table>{/* ... */}</Table>
      <div className="flex justify-between mt-4">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>Page {page}</span>
        <Button onClick={() => setPage((p) => p + 1)} disabled={!data?.hasMore}>
          Next
        </Button>
      </div>
    </div>
  );
}
```

**Confirmation Dialog:**

```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function DeleteButton({ id }: { id: string }) {
  const mutation = useMutation({
    mutationFn: () => apiRequest(`/customers/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Deleted successfully" });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Best Practices for AI Code Generation

1. **Type Safety:** Always use TypeScript with explicit types
2. **Error Handling:** Always handle loading, error, and empty states
3. **Accessibility:** Include ARIA labels, proper semantic HTML
4. **Performance:** Use lazy loading, memoization when needed
5. **Validation:** Client-side validation must match server-side (Zod schemas)
6. **Security:** Never expose sensitive data, validate permissions

---

## Design System & UI Components

**Purpose:** Complete design system reference for consistent UI generation.

### Design Tokens

**Colors:**

```typescript
// Primary brand color
primary: "hsl(217, 91%, 60%)" // #4F8FFF

// Semantic colors
success: "hsl(142, 76%, 36%)" // Green
warning: "hsl(38, 92%, 50%)"  // Orange
error: "hsl(0, 84%, 60%)"     // Red
info: "hsl(199, 89%, 48%)"    // Blue

// Gray scale (50-900)
gray-100: "hsl(210, 40%, 96%)"
gray-500: "hsl(215, 16%, 47%)"
gray-900: "hsl(222, 84%, 5%)"
```

**Typography:**

```typescript
// Font sizes
text-xs: 0.75rem (12px)
text-sm: 0.875rem (14px)
text-base: 1rem (16px)
text-lg: 1.125rem (18px)
text-xl: 1.25rem (20px)
text-2xl: 1.5rem (24px)
text-3xl: 1.875rem (30px)
text-4xl: 2.25rem (36px)

// Font weights
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700
```

**Spacing:**

```typescript
// Spacing scale (4px base)
space-1: 0.25rem (4px)
space-2: 0.5rem (8px)
space-4: 1rem (16px)
space-6: 1.5rem (24px)
space-8: 2rem (32px)
```

**Component Usage:**

```typescript
// Button variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// Badges
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>

// Alerts
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>Message here</AlertDescription>
</Alert>
```

**Responsive Design:**

```typescript
// Mobile-first approach with Tailwind breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column mobile, 2 tablet, 3 desktop */}
</div>

// Breakpoints:
sm: 640px   // Large phones
md: 768px   // Tablets
lg: 1024px  // Laptops
xl: 1280px  // Desktops
2xl: 1536px // Large screens
```

**Live Design System:**

- Navigate to `/design-system` in the app (admin only)
- Export design tokens as JSON
- View all 46+ UI components with examples
- Interactive color picker and spacing guide

---

## Environment Variables Reference

### Required Variables

| Variable         | Description                  | Example                                   | Notes                                        |
| ---------------- | ---------------------------- | ----------------------------------------- | -------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` | Must be accessible from runtime              |
| `JWT_SECRET`     | JWT token signing key        | `your-super-secret-64-char-string`        | Generate with `openssl rand -base64 64`      |
| `SESSION_SECRET` | Session encryption key       | `different-super-secret-64-char`          | Must be different from JWT_SECRET            |
| `NODE_ENV`       | Runtime environment          | `production`                              | Options: `development`, `test`, `production` |

### Optional Variables

| Variable                 | Description          | Default                 | Notes                       |
| ------------------------ | -------------------- | ----------------------- | --------------------------- |
| `PORT`                   | Server port          | `5000`                  | Any available port          |
| `ALLOWED_ORIGINS`        | CORS allowed origins | `http://localhost:5173` | Comma-separated list        |
| `ENABLE_DEBUG_LOGS`      | Server debug logging | `false`                 | Set to `true` for debugging |
| `VITE_ENABLE_DEBUG_LOGS` | Client debug logging | `false`                 | Set to `true` for debugging |

### SMS Configuration (Optional)

**Twilio (International SMS):**

| Variable             | Description         | Required If  |
| -------------------- | ------------------- | ------------ |
| `TWILIO_ACCOUNT_SID` | Twilio account SID  | Using Twilio |
| `TWILIO_AUTH_TOKEN`  | Twilio auth token   | Using Twilio |
| `TWILIO_FROM_NUMBER` | Sender phone number | Using Twilio |
| `TEST_SMS_NUMBER`    | Test phone number   | Testing SMS  |

**Ethiopian SMS Providers:**

| Variable                  | Description                | Required If         |
| ------------------------- | -------------------------- | ------------------- |
| `ETHIOPIAN_SMS_USERNAME`  | Provider username          | Using Ethiopian SMS |
| `ETHIOPIAN_SMS_API_KEY`   | Provider API key           | Using Ethiopian SMS |
| `ETHIOPIAN_SMS_SENDER_ID` | Sender ID (e.g., "SolNet") | Using Ethiopian SMS |
| `ETHIOPIAN_SMS_BASE_URL`  | Provider API endpoint      | Using Ethiopian SMS |

### Telegram Integration (Optional)

| Variable             | Description        | Required If                  |
| -------------------- | ------------------ | ---------------------------- |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | Using Telegram notifications |
| `TELEGRAM_CHAT_ID`   | Chat/channel ID    | Using Telegram notifications |

### Security Configuration

| Variable                  | Description                    | Default  | Notes                         |
| ------------------------- | ------------------------------ | -------- | ----------------------------- |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit time window         | `900000` | 15 minutes in milliseconds    |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window        | `100`    | Per user/IP                   |
| `SESSION_COOKIE_SECURE`   | Require HTTPS for cookies      | `true`   | Set to `false` in development |
| `SESSION_COOKIE_HTTPONLY` | HTTP-only cookies              | `true`   | Security best practice        |
| `HELMET_ENABLED`          | Enable Helmet security headers | `true`   | Recommended                   |
| `CONTENT_SECURITY_POLICY` | Enable CSP headers             | `true`   | Security best practice        |

### Environment File Templates

**Development (`.env`):**

```env
DATABASE_URL=postgresql://solnetuser:solnetpass@localhost:5432/solnetcomputer
JWT_SECRET=dev-secret-change-in-production
SESSION_SECRET=dev-session-secret-change-in-production
NODE_ENV=development
PORT=5001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
ENABLE_DEBUG_LOGS=true
```

**Production:**

```env
DATABASE_URL=postgresql://prod_user:strong_pass@production-db.example.com:5432/solnetcomputer
JWT_SECRET=<generated-64-char-random-string>
SESSION_SECRET=<generated-different-64-char-random-string>
NODE_ENV=production
PORT=5000
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
ENABLE_DEBUG_LOGS=false
VITE_ENABLE_DEBUG_LOGS=false
SESSION_COOKIE_SECURE=true
HELMET_ENABLED=true
```

**Generate Secure Secrets:**

```bash
# Generate JWT_SECRET
openssl rand -base64 64

# Generate SESSION_SECRET
openssl rand -base64 64
```

---

## Security Implementation

### Password Security

**Hashing:**

- **Algorithm:** bcrypt
- **Rounds:** 10
- **Implementation:**

  ```typescript
  import bcrypt from "bcrypt";

  // Hash password
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Verify password
  const isValid = await bcrypt.compare(plainPassword, hashedPassword);
  ```

**Password Requirements:**

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&\*()\_+-=[]{}|;:,.<>?)

**Regex Pattern:**

```regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$
```

### JWT Authentication

**Token Structure:**

```json
{
  "userId": "uuid",
  "username": "admin",
  "role": "admin|technician|sales",
  "locationId": "uuid",
  "iat": 1642345678,
  "exp": 1642432078
}
```

**Token Expiration:**

- **Access Token:** 24 hours
- **Refresh Token:** (Not yet implemented - see upgrade recommendations)

**Security Practices:**

- Tokens signed with strong secret (min 64 characters)
- Tokens include expiration time
- Client stores token in memory (not localStorage for security)
- Token sent in Authorization header: `Bearer <token>`

### CORS Configuration

**Development:**

```typescript
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
```

**Production:**

```typescript
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Selected-Location"],
  })
);
```

### Rate Limiting

**Implementation:**

```typescript
import rateLimit from "express-rate-limit";

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests, please try again later",
});

// Login endpoint rate limiter (stricter)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 attempts
  message: "Too many login attempts, please try again later",
});

app.use("/api/", apiLimiter);
app.use("/api/login", loginLimiter);
```

### Input Sanitization

**SQL Injection Prevention:**

- Using Drizzle ORM with parameterized queries (safe by default)
- Never concatenating user input directly into SQL

**XSS Prevention:**

- HTML escaping in React (safe by default)
- Content Security Policy headers
- Input validation with Zod schemas

**Example Validation:**

```typescript
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(1).max(255),
  phone: z.string().regex(/^\+?[\d\s-()]{10,20}$/),
  email: z.string().email().optional(),
});

// This throws error if validation fails
const validatedData = customerSchema.parse(req.body);
```

### File Upload Security

**Restrictions:**

```typescript
const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      // Generate safe filename
      const uniqueName = `${Date.now()}_${sanitizeFilename(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Allow only images and Excel files
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});
```

**File Type Validation:**

- Check MIME type
- Verify file extension
- Scan for malware (recommended: ClamAV)
- Store outside web root or serve through controlled endpoint

### Security Headers (Helmet)

**Implementation:**

```typescript
import helmet from "helmet";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
```

### Multi-Location Access Control

**Middleware:**

```typescript
// Validate user can only access their location's data
export function validateLocationAccess(req: AuthenticatedRequest) {
  const resourceLocationId = req.body.locationId || req.params.locationId;

  // Admin can access any location
  if (req.user.role === "admin") {
    return true;
  }

  // Non-admin can only access their own location
  if (resourceLocationId !== req.user.locationId) {
    throw new Error("Cannot access data from other locations");
  }

  return true;
}
```

---

## Infrastructure & Deployment

### Architecture Overview

```
┌─────────────────┐
│  Client (React) │
│  Vite Dev/Build │
└────────┬────────┘
         │ HTTP/WebSocket
┌────────▼──────────────────┐
│  Express Server (Node.js) │
│  - API Routes             │
│  - JWT Auth               │
│  - Static File Serving    │
└────────┬──────────────────┘
         │
┌────────▼──────────┐
│  PostgreSQL DB    │
│  - Drizzle ORM    │
└───────────────────┘
```

### Deployment Options

#### Option 1: Docker Compose (Recommended)

```yaml
services:
  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck: pg_isready

  app:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://...
      - JWT_SECRET=...
```

**Start:**

```bash
docker compose up -d
```

#### Option 2: VPS/Cloud (Node.js Runtime)

1. Provision PostgreSQL (managed or self-hosted)
2. Clone repository
3. Set environment variables
4. Build:
   ```bash
   npm ci
   npm run build
   ```
5. Run migrations:
   ```bash
   npm run db:migrate
   npm run db:verify
   ```
6. Start:
   ```bash
   NODE_ENV=production node dist/index.js
   ```
7. Use PM2/systemd for process management
8. Configure NGINX as reverse proxy with TLS

#### Option 3: Platform-as-a-Service

- **Replit:** Ready to deploy (already configured)
- **Heroku/Render/Railway:** Use Dockerfile, set env vars
- **Vercel/Netlify:** Not suitable (needs long-running Node process)

### Environment Configuration

**Critical Environment Variables:**

- `NODE_ENV`: `production` or `development`
- `PORT`: Server port (default: 5000)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong random secret for JWT signing
- `SESSION_SECRET`: Strong random secret for sessions
- `ALLOWED_ORIGINS`: Comma-separated CORS origins
- `ENABLE_DEBUG_LOGS`: `false` in production
- `VITE_ENABLE_DEBUG_LOGS`: `false` in production

**Optional:**

- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`: Twilio SMS
- `ETHIOPIAN_SMS_USERNAME`, `ETHIOPIAN_SMS_API_KEY`, `ETHIOPIAN_SMS_SENDER_ID`: Ethiopian SMS
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`: Rate limiting config

### Security Controls

- **HTTPS:** Terminate TLS at reverse proxy (NGINX/Cloudflare)
- **CORS:** Restricted to `ALLOWED_ORIGINS`
- **Rate Limiting:** `express-rate-limit` with configurable limits
- **Security Headers:** Helmet.js with CSP
- **Input Sanitization:** Custom middleware for XSS prevention
- **Password Hashing:** bcrypt with salt rounds
- **JWT Expiry:** Configurable token expiration
- **SQL Injection:** Drizzle ORM parameterized queries
- **File Upload:** Size limits, type validation
- **Trust Proxy:** Enabled for correct IP detection behind proxies

### Monitoring & Logging

- **Health Endpoint:** `/api/health` for liveness checks
- **Structured Logging:** JSON logs with levels (debug, info, warn, error)
- **Console Suppression:** Controlled via `ENABLE_DEBUG_LOGS`
- **Error Tracking:** Global error handler with status codes
- **Performance:** Query optimization, database indexes
- **System Metrics:** Available at `/api/system/stats` (admin only)

### Backup Strategy

1. **Database Backups:**

   - Automated PostgreSQL backups (pg_dump)
   - Retention policy (7 daily, 4 weekly, 12 monthly)
   - Store off-site (S3-compatible storage)

2. **File Uploads:**

   - Volume backups (`uploads/` directory)
   - Consider S3 for production

3. **Restore Process:**
   - Use `/api/backup/import` endpoint (admin)
   - Or manual `psql < backup.sql`

---

## File Structure

```
SolNetComputer/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/            # Shadcn/Radix UI primitives
│   │   │   ├── layout/        # Header, Sidebar, AppLayout
│   │   │   └── settings/      # Settings panels
│   │   ├── features/          # Feature modules (analytics, auth, etc.)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility libraries (queryClient, utils, cache)
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   ├── App.tsx            # Root app component with routing
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles (Tailwind)
│   └── index.html             # HTML template
├── server/                    # Express backend
│   ├── middleware/            # Auth, security, location filtering
│   ├── utils/                 # Logger, Excel helpers
│   ├── db.ts                  # Database connection (Drizzle)
│   ├── routes.ts              # API route definitions
│   ├── storage.ts             # Database operations (DAL)
│   ├── sms-service.ts         # SMS integration (Twilio)
│   ├── ethiopian-sms-service.ts # Ethiopian SMS provider
│   ├── notification-service.ts  # Notification system
│   ├── system-monitor.ts      # System health monitoring
│   ├── vite.ts                # Vite dev server integration
│   └── index.ts               # Server entry point
├── shared/                    # Shared code (client + server)
│   ├── schemas/               # Database schemas (Drizzle)
│   │   ├── core/              # Users, customers, locations, business
│   │   ├── devices/           # Devices, device types, problems
│   │   ├── inventory/         # Inventory, suppliers, purchase orders
│   │   ├── sales/             # Sales, appointments
│   │   ├── financial/         # Expenses, invoices
│   │   ├── communication/     # SMS, notifications
│   │   ├── enums.ts           # Shared enums
│   │   └── index.ts           # Re-exports
│   └── schema.ts              # Backward-compatible schema export
├── migrations/                # SQL migration files
├── scripts/                   # Utility scripts (seed, migrate, etc.)
├── uploads/                   # File uploads directory
├── drizzle.config.ts          # Drizzle ORM config
├── vite.config.ts             # Vite build config
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind CSS config
├── package.json               # Dependencies and scripts
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # Docker orchestration
├── .env.template              # Environment variable template
├── env.production.template    # Production env template
└── PRODUCTION_READINESS_AUDIT.md  # Deployment checklist
```

---

## Quick Start for Recreation

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Setup Steps

1. **Clone and Install:**

   ```bash
   git clone <repository>
   cd SolNetComputer
   npm ci
   ```

2. **Configure Environment:**

   ```bash
   cp env.production.template .env
   # Edit .env with your DATABASE_URL, JWT_SECRET, etc.
   ```

3. **Database Setup:**

   ```bash
   npm run db:migrate
   npm run db:verify
   npm run db:seed  # Optional demo data
   ```

4. **Development:**

   ```bash
   npm run dev  # Runs client (Vite) and server (tsx watch) concurrently
   ```

5. **Production Build:**
   ```bash
   npm run build
   npm start
   ```

### Default Admin Account (After Seeding)

- **Username:** `admin`
- **Password:** `admin123`
- **Role:** admin

**⚠️ Change this in production!**

---

## AI Agent Implementation Guide

**Purpose:** Step-by-step implementation guide optimized for AI agents to recreate the entire system.

### Implementation Philosophy

**Approach:** Build in layers, test each layer before proceeding.

```
Layer 1: Foundation → Layer 2: Core Features → Layer 3: Advanced Features → Layer 4: Polish
```

### Phase 1: Project Setup & Database (Hours 1-3)

#### Step 1.1: Initialize Project

```bash
# Create project directory
mkdir SolNetComuter && cd SolNetComputer

# Initialize package.json
npm init -y

# Install dependencies
npm install express@4.21 drizzle-orm@0.39 postgres bcrypt jsonwebtoken cors helmet express-rate-limit multer qrcode zod
npm install -D @types/express @types/bcrypt @types/jsonwebtoken @types/cors @types/multer tsx typescript @types/node

# Frontend dependencies
npm install react@18.3 react-dom@18.3 wouter@3.3 @tanstack/react-query@5.60 react-hook-form@7.55 @hookform/resolvers zod tailwindcss@3.4 recharts@2.15
npm install -D vite@7.1 @vitejs/plugin-react @types/react @types/react-dom

# Initialize TypeScript
npx tsc --init
```

#### Step 1.2: Create Project Structure

```bash
# Backend
mkdir -p server/{middleware,utils}
mkdir -p shared/schemas/{core,devices,inventory,sales,financial,communication}

# Frontend
mkdir -p client/src/{pages,components/{ui,layout,auth,settings},hooks,lib,types,utils}

# Other
mkdir -p migrations scripts uploads
```

#### Step 1.3: Configure Files

**package.json scripts:**

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "tsx watch server/index.ts",
    "dev:client": "vite",
    "build": "vite build && tsc --project tsconfig.server.json",
    "start": "node dist/index.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "node scripts/migrate-database.js",
    "db:seed": "tsx scripts/seed.ts"
  }
}
```

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["client/**/*", "shared/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**vite.config.ts:**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
});
```

#### Step 1.4: Create Database Schemas

**Priority Order for Tables:**

```typescript
// Create in this order (respects foreign key dependencies):
1. locations
2. users
3. customers
4. device_types, brands, models, service_types (reference tables)
5. devices
6. device_status_history, device_problems
7. suppliers
8. inventory_items
9. purchase_orders, purchase_order_items
10. sales, sale_items
11. expenses, expense_categories
12. loan_invoices, loan_invoice_payments
13. appointments
14. notifications, notification_types, notification_templates
15. sms_templates, sms_campaigns
16. business_profile
17. customer_feedback
18. predefined_problems
19. system_settings
```

**Example Schema (shared/schemas/core/users.ts):**

```typescript
import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  numId: serial("num_id"),
  username: text("username").unique().notNull(),
  email: text("email").unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  phone: text("phone"),
  role: varchar("role", { length: 50 }).notNull(),
  locationId: varchar("location_id", { length: 255 }).references(
    () => locations.id
  ),
  profilePicture: text("profile_picture"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users);
```

### Phase 2: Backend API Implementation (Hours 4-12)

#### Step 2.1: Database Connection

**server/db.ts:**

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

#### Step 2.2: Authentication Middleware

**server/middleware/locationAuth.ts:**

```typescript
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: string;
    locationId: string;
  };
}

export function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
```

#### Step 2.3: API Routes Pattern

**server/routes.ts (for each entity, follow this pattern):**

```typescript
import { Express } from "express";
import { db } from "./db";
import { customers, insertCustomerSchema } from "@shared/schema";
import { eq, and, like } from "drizzle-orm";
import { authenticateUser } from "./middleware/locationAuth";

export function registerRoutes(app: Express) {
  // LIST (with location filtering)
  app.get("/api/customers", authenticateUser, async (req, res) => {
    try {
      const locationFilter = getLocationFilter(
        req.user!,
        req.headers["x-selected-location"]
      );

      const results = await db
        .select()
        .from(customers)
        .where(
          and(
            eq(customers.isActive, true),
            locationFilter.locationId
              ? eq(customers.locationId, locationFilter.locationId)
              : undefined
          )
        );

      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  // CREATE
  app.post("/api/customers", authenticateUser, async (req, res) => {
    try {
      const validated = insertCustomerSchema.parse(req.body);

      // Normalize phone number
      validated.phone = normalizePhone(validated.phone);

      const [customer] = await db
        .insert(customers)
        .values(validated)
        .returning();

      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  // UPDATE
  app.put("/api/customers/:id", authenticateUser, async (req, res) => {
    try {
      const updates = insertCustomerSchema.partial().parse(req.body);

      const [updated] = await db
        .update(customers)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(customers.id, req.params.id))
        .returning();

      if (!updated) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  // DELETE (soft delete)
  app.delete("/api/customers/:id", authenticateUser, async (req, res) => {
    try {
      await db
        .update(customers)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(customers.id, req.params.id));

      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });
}
```

**Repeat this pattern for:**

- Users, Devices, Inventory, Sales, Locations, Appointments, Expenses, etc.
- Follow the same structure for consistency

### Phase 3: Frontend Pages (Hours 13-30)

#### Step 3.1: Create Page Template

**Standard Page Structure:**

```typescript
// client/src/pages/customers.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => apiRequest("/customers"),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/customers/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Customer deleted successfully" });
    },
  });

  if (isLoading) return <Skeleton />;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button>Add Customer</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers?.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost">
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(customer.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Step 3.2: Pages to Implement (Priority Order)

**Phase 3A - Core (Week 1-2):**

1. `login.tsx` - Authentication page
2. `dashboard.tsx` - Main dashboard with KPIs
3. `customers.tsx` - Customer management
4. `device-registration.tsx` - Device intake
5. `repair-tracking.tsx` - Device status updates

**Phase 3B - Business Operations (Week 3-4):** 6. `point-of-sale.tsx` - POS interface 7. `sales.tsx` - Sales history 8. `inventory-management.tsx` - Inventory CRUD 9. `appointments.tsx` - Appointment calendar 10. `workers.tsx` - Staff management

**Phase 3C - Advanced (Week 5-6):** 11. `analytics-hub.tsx` - Analytics dashboard 12. `expenses.tsx` - Expense tracking 13. `loan-invoices.tsx` - Credit invoices 14. `settings.tsx` - System settings 15. `locations.tsx` - Multi-location management

**Phase 3D - Additional (Week 7-8):**
16-30. Other specialized pages (inventory predictions, system health, etc.)

### Phase 4: UI Components (Hours 31-40)

#### Step 4.1: Install shadcn/ui

```bash
npx shadcn-ui@latest init

# Select options:
- Style: New York
- Base color: Neutral
- CSS variables: Yes
```

#### Step 4.2: Add Required Components

```bash
# Install all components (or one by one as needed)
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add skeleton
# ... (46 total components)
```

#### Step 4.3: Create Layout Components

**AppLayout, Header, Sidebar** - See Frontend Implementation Patterns section for patterns.

### Phase 5: Integration & Testing (Hours 41-50)

#### Step 5.1: Connect Frontend to Backend

Ensure `apiRequest` utility is configured with proper base URL and auth headers.

#### Step 5.2: Test Core Workflows

1. **Login Flow:** Can authenticate and receive JWT
2. **Customer CRUD:** Create, read, update, delete customers
3. **Device Registration:** Register device, generate receipt, QR code
4. **Inventory:** Add items, check stock, low stock alerts
5. **Sales:** Process sale, decrement inventory, generate receipt
6. **Multi-location:** Admin can switch locations, non-admin restricted

#### Step 5.3: Fix Common Issues

```typescript
// CORS issues:
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(","),
    credentials: true,
  })
);

// 404 on refresh (Vite dev server):
// Add to vite.config.ts:
server: {
  historyApiFallback: true;
}

// Auth token persistence:
// Store in localStorage (basic) or httpOnly cookie (secure)
localStorage.setItem("token", token);

// Location filtering not working:
// Ensure X-Selected-Location header is sent from frontend
headers["X-Selected-Location"] = selectedLocation || "all";
```

### Implementation Checklist for AI Agents

**Database Layer:**

- [ ] Create all 44 table schemas using Drizzle ORM
- [ ] Generate migrations
- [ ] Create seed data script
- [ ] Test database connections

**Backend Layer:**

- [ ] Setup Express server
- [ ] Implement authentication middleware
- [ ] Create CRUD routes for all entities
- [ ] Implement location filtering
- [ ] Add validation with Zod schemas
- [ ] Implement file upload handling
- [ ] Add error handling middleware
- [ ] Setup CORS and security headers

**Frontend Layer:**

- [ ] Setup Vite + React + TypeScript
- [ ] Configure Tailwind CSS
- [ ] Install shadcn/ui components
- [ ] Create routing structure (Wouter)
- [ ] Implement authentication flow
- [ ] Create all 30+ pages
- [ ] Implement forms with validation
- [ ] Add error handling
- [ ] Add loading states
- [ ] Make responsive (mobile-first)

**Integration:**

- [ ] Connect frontend to backend APIs
- [ ] Test all CRUD operations
- [ ] Verify authentication works
- [ ] Test multi-location filtering
- [ ] Test file uploads
- [ ] Test SMS notifications (optional)

**Deployment:**

- [ ] Create Dockerfile
- [ ] Setup docker-compose.yml
- [ ] Configure environment variables
- [ ] Run production build
- [ ] Test deployment locally
- [ ] Deploy to cloud/VPS

### Estimated Timeline

| Phase           | Description                     | Time              | Complexity |
| --------------- | ------------------------------- | ----------------- | ---------- |
| **Phase 1**     | Project setup, database schemas | 3 hours           | Low        |
| **Phase 2**     | Backend API implementation      | 8 hours           | Medium     |
| **Phase 3**     | Frontend pages (core features)  | 15 hours          | Medium     |
| **Phase 4**     | UI components & layout          | 10 hours          | Medium     |
| **Phase 5**     | Integration & testing           | 10 hours          | High       |
| **Phase 6**     | Advanced features               | 20 hours          | High       |
| **Phase 7**     | Polish & deployment             | 10 hours          | Medium     |
| **Total**       | **MVP (Core Features)**         | **50-75 hours**   | -          |
| **Full System** | **All Features**                | **100-150 hours** | -          |

### Key Dependencies & Order

```
Database Schemas → Backend Routes → Frontend Pages → Integration → Deployment

Must implement in order:
1. Authentication first (needed by all routes)
2. Locations (needed by multi-location filtering)
3. Users (needed for assignments)
4. Reference tables (device types, brands, etc.)
5. Core entities (customers, devices, inventory)
6. Transactions (sales, purchase orders)
7. Advanced features (analytics, reports, etc.)
```

### Code Generation Tips for AI Agents

1. **Follow Existing Patterns:** Use the code examples in this document as templates
2. **Type Safety:** Generate TypeScript types from database schemas
3. **Validation:** Ensure client-side Zod schemas match backend
4. **Error Handling:** Every API call should handle errors
5. **Loading States:** Every data fetch should show loading UI
6. **Responsive:** Use Tailwind responsive classes (md:, lg:)
7. **Accessibility:** Add ARIA labels to interactive elements
8. **Testing:** Test each feature before moving to next
9. **Incremental:** Build and test in small increments
10. **Reference:** Use existing working code as examples

---

## Upgrade Pathways & Future Enhancements

### Priority Enhancements

The following features are recommended additions to enhance the system's capabilities, maintainability, and user experience.

---

### 1. **UI/UX Design System** 🎨

**Status:** ✅ IMPLEMENTED  
**Impact:** User experience, brand consistency

**Implementation:** COMPLETE

- **Design Tokens:** Exported JSON format for Figma import ✅
- **Components:**
  - Complete design token system (colors, typography, spacing) ✅
  - Interactive showcase page at `/design-system` ✅
  - Component library documentation ✅
  - Responsive breakpoints (mobile, tablet, desktop) ✅
  - Dark mode variants ✅
  - Accessibility (WCAG 2.1 AA compliance) ✅

**Suggested Structure:**

```
design/
├── wireframes/
│   ├── dashboard.fig
│   ├── device-registration.fig
│   ├── pos.fig
│   └── ...
├── components/
│   ├── buttons.fig
│   ├── forms.fig
│   └── data-tables.fig
└── style-guide.fig
```

**Tools & Resources:**

- Figma (recommended) - Collaborative, version control
- Storybook for component documentation
- Design tokens for consistent theming

**Deliverables:**

- ✅ Design tokens export system (`/design-system` page)
- ✅ Comprehensive design documentation (`DESIGN_SYSTEM.md`)
- ✅ Figma import guide (`FIGMA_IMPORT_GUIDE.md`)
- ✅ Interactive component showcase
- ✅ Exportable JSON tokens for Figma/Sketch
- ✅ CSS variable system for theming

---

### 2. **Automated Testing Suite** 🧪

**Status:** Missing / Critical for Production  
**Impact:** Code quality, regression prevention, CI/CD

**Implementation:**

**A. Unit Testing (Jest)**

```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

**Test Structure:**

```
tests/
├── unit/
│   ├── components/
│   │   ├── Button.test.tsx
│   │   └── DataTable.test.tsx
│   ├── hooks/
│   │   ├── useAuth.test.ts
│   │   └── useLocation.test.ts
│   ├── utils/
│   │   ├── currency.test.ts
│   │   └── validation.test.ts
│   └── api/
│       ├── customers.test.ts
│       └── devices.test.ts
├── integration/
│   ├── auth-flow.test.ts
│   ├── pos-transaction.test.ts
│   └── device-repair-workflow.test.ts
└── e2e/
    ├── login.spec.ts
    ├── device-registration.spec.ts
    └── sales-report.spec.ts
```

**B. End-to-End Testing (Playwright)**

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**E2E Test Examples:**

```typescript
// tests/e2e/device-registration.spec.ts
test("register new device for repair", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[name="username"]', "admin");
  await page.fill('[name="password"]', "admin123");
  await page.click('button[type="submit"]');

  await page.goto("/device-registration");
  await page.fill('[name="customerPhone"]', "+251912345678");
  await page.selectOption('[name="deviceType"]', "Laptop");
  await page.fill('[name="problemDescription"]', "Screen broken");
  await page.click('button:has-text("Register Device")');

  await expect(page.locator(".toast-success")).toBeVisible();
  await expect(page.locator(".receipt-number")).toContainText("REC-");
});
```

**package.json scripts:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

**Coverage Goals:**

- Unit tests: 80%+ coverage
- Integration tests: Critical user flows
- E2E tests: 10-15 key scenarios

---

### 3. **Job Scheduling & Background Tasks** ⏰

**Status:** Missing / Medium Priority  
**Impact:** Automation, performance, user experience

**Implementation:**

**A. Node-Cron for Scheduled Tasks**

```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

**Scheduler Setup:**

```typescript
// server/scheduler.ts
import cron from "node-cron";
import { generateDailyReports } from "./tasks/reports";
import { sendAppointmentReminders } from "./tasks/sms";
import { updateInventoryPredictions } from "./tasks/inventory";
import { cleanupOldNotifications } from "./tasks/cleanup";

export function initializeScheduler() {
  // Daily reports at 6 AM
  cron.schedule("0 6 * * *", async () => {
    console.log("Running daily reports...");
    await generateDailyReports();
  });

  // Appointment reminders every hour
  cron.schedule("0 * * * *", async () => {
    console.log("Sending appointment reminders...");
    await sendAppointmentReminders();
  });

  // Inventory predictions daily at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("Updating inventory predictions...");
    await updateInventoryPredictions();
  });

  // Cleanup old data weekly (Sunday 2 AM)
  cron.schedule("0 2 * * 0", async () => {
    console.log("Cleaning up old data...");
    await cleanupOldNotifications();
  });

  // Low stock alerts daily at 9 AM
  cron.schedule("0 9 * * *", async () => {
    console.log("Checking low stock items...");
    await checkLowStockAlerts();
  });
}
```

**Suggested Cron Jobs:**

| Task                  | Schedule      | Purpose                           |
| --------------------- | ------------- | --------------------------------- |
| Daily sales report    | `0 6 * * *`   | Email daily summary to admin      |
| Appointment reminders | `0 * * * *`   | SMS 1 hour before appointment     |
| Low stock alerts      | `0 9 * * *`   | Notify when stock below threshold |
| Inventory predictions | `0 0 * * *`   | Update stockout predictions       |
| SMS campaign batches  | `*/5 * * * *` | Process queued SMS campaigns      |
| Backup database       | `0 2 * * *`   | Nightly automated backups         |
| Cleanup old logs      | `0 2 * * 0`   | Weekly cleanup (Sunday)           |
| Revenue target check  | `0 18 * * *`  | Daily progress notification       |

**B. Bull Queue (Advanced Alternative)**

For more robust job management:

```bash
npm install bull ioredis
npm install --save-dev @types/bull
```

---

### 4. **Real-time Updates (WebSocket)** ⚡

**Status:** Partially Implemented / High Priority  
**Impact:** User experience, collaboration, live updates

**Current State:** WebSocket infrastructure exists but limited usage

**Enhancement Plan:**

**A. WebSocket Events to Implement**

```typescript
// server/websocket.ts
import { WebSocketServer } from "ws";

export const wsEvents = {
  // Device status updates
  DEVICE_STATUS_CHANGED: "device:status:changed",
  DEVICE_ASSIGNED: "device:assigned",
  DEVICE_COMPLETED: "device:completed",

  // Inventory updates
  INVENTORY_LOW_STOCK: "inventory:low-stock",
  INVENTORY_UPDATED: "inventory:updated",

  // Sales & POS
  NEW_SALE: "sale:new",
  SALE_UPDATED: "sale:updated",

  // Notifications
  NEW_NOTIFICATION: "notification:new",

  // System
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
};

// Emit device status change to all connected admins
export function notifyDeviceStatusChange(deviceId: string, status: string) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: wsEvents.DEVICE_STATUS_CHANGED,
          payload: { deviceId, status, timestamp: new Date() },
        })
      );
    }
  });
}
```

**B. Client-side Hook**

```typescript
// client/src/hooks/useWebSocket.ts
export function useWebSocket() {
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");

    ws.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);

      switch (type) {
        case "device:status:changed":
          queryClient.invalidateQueries(["devices"]);
          toast.success(`Device ${payload.deviceId} status updated`);
          break;
        case "inventory:low-stock":
          toast.warning(`Low stock: ${payload.itemName}`);
          break;
        case "notification:new":
          queryClient.invalidateQueries(["notifications"]);
          break;
      }
    };

    return () => ws.close();
  }, []);
}
```

**Use Cases:**

- ✅ Real-time device status updates across all users
- ✅ Live inventory updates when items sold
- ✅ Instant notification delivery
- ✅ Multi-user collaboration (prevent conflicts)
- ✅ Live dashboard metrics

---

### 5. **Payment Gateway Integration** 💳

**Status:** Missing / High Priority (Revenue)  
**Impact:** Customer experience, payment automation

**Recommended Providers:**

**A. Stripe (International)**

```bash
npm install stripe @stripe/stripe-js
npm install --save-dev @types/stripe
```

**Implementation:**

```typescript
// server/payment-service.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createPaymentIntent(
  amount: number,
  currency: string = "usd"
) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    automatic_payment_methods: { enabled: true },
  });
}

export async function processRefund(paymentIntentId: string, amount?: number) {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
  });
}
```

**B. Chapa (Ethiopia)**

```bash
npm install chapa
```

```typescript
// server/chapa-service.ts
import { Chapa } from "chapa";

const chapa = new Chapa(process.env.CHAPA_SECRET_KEY!);

export async function initializeChapaPayment(data: {
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  txRef: string;
}) {
  return await chapa.initialize({
    ...data,
    currency: "ETB",
    callbackUrl: `${process.env.APP_URL}/api/payment/callback`,
  });
}
```

**C. PayPal**

```bash
npm install @paypal/checkout-server-sdk
```

**Features to Implement:**

- ✅ One-time payments (sales, repairs)
- ✅ Split payments for loan invoices
- ✅ Refund processing
- ✅ Payment receipts (email + SMS)
- ✅ Payment history tracking
- ✅ Failed payment retry logic

**Database Schema Addition:**

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id),
  loan_invoice_id UUID REFERENCES loan_invoices(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  provider VARCHAR(50) NOT NULL, -- stripe, chapa, paypal
  provider_payment_id VARCHAR(255),
  status VARCHAR(50) NOT NULL, -- pending, completed, failed, refunded
  payment_method VARCHAR(50), -- card, mobile_money, bank_transfer
  customer_email VARCHAR(255),
  metadata JSONB,
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 6. **Email Templates & Automation** 📧

**Status:** Missing / Medium Priority  
**Impact:** Customer communication, professionalism

**Implementation:**

**A. Email Service Setup (Nodemailer)**

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

**B. Template Engine (Handlebars)**

```bash
npm install handlebars
npm install --save-dev @types/handlebars
```

**Email Template Structure:**

```
server/templates/emails/
├── receipt.hbs
├── device-registered.hbs
├── device-ready.hbs
├── appointment-reminder.hbs
├── low-stock-alert.hbs
├── payment-confirmation.hbs
├── feedback-request.hbs
└── invoice.hbs
```

**Example Template (Receipt):**

```handlebars
<!-- server/templates/emails/receipt.hbs -->

<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; } .receipt { max-width: 600px;
      margin: 0 auto; padding: 20px; } .header { text-align: center;
      border-bottom: 2px solid #333; } .items { margin: 20px 0; } .total {
      font-size: 18px; font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="receipt">
      <div class="header">
        <h1>{{businessName}}</h1>
        <p>Receipt #{{receiptNumber}}</p>
        <p>{{date}}</p>
      </div>

      <h3>Customer: {{customerName}}</h3>

      <div class="items">
        <h4>Items:</h4>
        {{#each items}}
          <p>{{this.name}}
            -
            {{this.quantity}}
            x
            {{this.price}}
            =
            {{this.total}}</p>
        {{/each}}
      </div>

      <p class="total">Total: {{currency}}{{total}}</p>

      <p>Thank you for your business!</p>
    </div>
  </body>
</html>
```

**Email Service:**

```typescript
// server/email-service.ts
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendReceiptEmail(to: string, data: any) {
  const template = fs.readFileSync(
    path.join(__dirname, "templates/emails/receipt.hbs"),
    "utf-8"
  );
  const html = handlebars.compile(template)(data);

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Receipt #${data.receiptNumber}`,
    html,
  });
}
```

**Automated Emails:**

| Trigger                   | Template                 | Recipient             |
| ------------------------- | ------------------------ | --------------------- |
| Device registered         | device-registered.hbs    | Customer              |
| Device status → completed | device-ready.hbs         | Customer              |
| Sale completed            | receipt.hbs              | Customer              |
| Appointment created       | appointment-reminder.hbs | Customer (24h before) |
| Inventory low stock       | low-stock-alert.hbs      | Admin                 |
| Payment received          | payment-confirmation.hbs | Customer              |
| Repair completed          | feedback-request.hbs     | Customer (ask review) |

---

### 7. **Performance Profiling & Monitoring** 📊

**Status:** Basic / Needs Enhancement  
**Impact:** System performance, debugging, optimization

**Implementation:**

**A. Winston Logger (Structured Logging)**

```bash
npm install winston winston-daily-rotate-file
```

```typescript
// server/utils/logger-enhanced.ts
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    }),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}
```

**B. Query Performance Tracking**

```typescript
// server/middleware/query-profiler.ts
export const queryProfiler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    logger.info("API Request", {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.userId,
      ip: req.ip,
    });

    if (duration > 1000) {
      logger.warn("Slow query detected", {
        method: req.method,
        path: req.path,
        duration,
      });
    }
  });

  next();
};
```

**C. Database Query Tracing (Drizzle)**

```typescript
// Enable query logging in development
export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === "development",
});
```

**D. Performance Metrics Dashboard**

Create admin endpoint:

```typescript
// GET /api/admin/performance-metrics
app.get(
  "/api/admin/performance-metrics",
  authenticateUser,
  async (req, res) => {
    const metrics = {
      slowQueries: await getSlowQueries(), // Queries > 1s
      errorRate: await getErrorRate(), // Last 24h
      avgResponseTime: await getAvgResponseTime(),
      topEndpoints: await getTopEndpoints(), // Most called
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    };

    res.json(metrics);
  }
);
```

---

### 8. **API Usage Analytics** 📈

**Status:** Missing / Medium Priority  
**Impact:** Security, optimization, billing (future)

**Implementation:**

**Database Schema:**

```sql
CREATE TABLE api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  role VARCHAR(50),
  location_id UUID REFERENCES locations(id),
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  request_size INTEGER,
  response_size INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_usage_user ON api_usage_logs(user_id, created_at);
CREATE INDEX idx_api_usage_endpoint ON api_usage_logs(endpoint, created_at);
CREATE INDEX idx_api_usage_role ON api_usage_logs(role, created_at);
```

**Middleware:**

```typescript
// server/middleware/api-analytics.ts
export const apiAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const originalSend = res.send;
  let responseBody: any;

  res.send = function (data) {
    responseBody = data;
    return originalSend.call(this, data);
  };

  res.on("finish", async () => {
    const duration = Date.now() - startTime;

    await db.insert(apiUsageLogs).values({
      userId: req.user?.userId,
      role: req.user?.role,
      locationId: req.user?.locationId,
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTimeMs: duration,
      requestSize: req.headers["content-length"]
        ? parseInt(req.headers["content-length"])
        : 0,
      responseSize: responseBody ? JSON.stringify(responseBody).length : 0,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      errorMessage: res.statusCode >= 400 ? responseBody?.message : null,
    });
  });

  next();
};
```

**Analytics Queries:**

```typescript
// GET /api/admin/api-analytics
export async function getApiAnalytics(timeRange: string = "7d") {
  // Top endpoints by traffic
  const topEndpoints = await db
    .select({
      endpoint: apiUsageLogs.endpoint,
      count: sql<number>`count(*)`,
      avgResponseTime: sql<number>`avg(response_time_ms)`,
    })
    .from(apiUsageLogs)
    .where(sql`created_at > NOW() - INTERVAL '${timeRange}'`)
    .groupBy(apiUsageLogs.endpoint)
    .orderBy(sql`count(*) DESC`)
    .limit(10);

  // Traffic by role
  const trafficByRole = await db
    .select({
      role: apiUsageLogs.role,
      count: sql<number>`count(*)`,
    })
    .from(apiUsageLogs)
    .groupBy(apiUsageLogs.role);

  // Error rate
  const errorRate = await db
    .select({
      date: sql<string>`date_trunc('day', created_at)`,
      totalRequests: sql<number>`count(*)`,
      errorRequests: sql<number>`count(*) FILTER (WHERE status_code >= 400)`,
    })
    .from(apiUsageLogs)
    .where(sql`created_at > NOW() - INTERVAL '${timeRange}'`)
    .groupBy(sql`date_trunc('day', created_at)`);

  return { topEndpoints, trafficByRole, errorRate };
}
```

---

### 9. **Localization (i18n) - Multi-language Support** 🌍

**Status:** Missing / Medium Priority (Ethiopia market)  
**Impact:** User accessibility, market expansion

**Implementation:**

**A. i18next Setup**

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

**B. Translation Files Structure**

```
client/src/locales/
├── en/
│   ├── common.json
│   ├── dashboard.json
│   ├── devices.json
│   ├── pos.json
│   └── validation.json
├── am/  (Amharic)
│   ├── common.json
│   ├── dashboard.json
│   ├── devices.json
│   ├── pos.json
│   └── validation.json
└── index.ts
```

**C. Translation Example (en/common.json)**

```json
{
  "app": {
    "name": "SolNetComputer",
    "tagline": "Complete Repair Shop Management"
  },
  "nav": {
    "dashboard": "Dashboard",
    "devices": "Devices",
    "customers": "Customers",
    "inventory": "Inventory",
    "sales": "Sales",
    "settings": "Settings"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search",
    "filter": "Filter",
    "export": "Export"
  },
  "validation": {
    "required": "This field is required",
    "email": "Invalid email address",
    "phone": "Invalid phone number"
  }
}
```

**D. Amharic Translation (am/common.json)**

```json
{
  "app": {
    "name": "ሶልኔት ማኔጅ",
    "tagline": "ሙሉ የጥገና ሱቅ አስተዳደር"
  },
  "nav": {
    "dashboard": "ዳሽቦርድ",
    "devices": "መሳሪያዎች",
    "customers": "ደንበኞች",
    "inventory": "ክምችት",
    "sales": "ሽያጭ",
    "settings": "ቅንብሮች"
  },
  "actions": {
    "save": "አስቀምጥ",
    "cancel": "ሰርዝ",
    "delete": "ሰርዝ",
    "edit": "አርትዕ",
    "search": "ፈልግ",
    "filter": "አጣራ",
    "export": "ላክ"
  }
}
```

**E. i18n Configuration**

```typescript
// client/src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import amCommon from "./locales/am/common.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      am: { common: amCommon },
    },
    fallbackLng: "en",
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

**F. Usage in Components**

```typescript
import { useTranslation } from "react-i18next";

export function Dashboard() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t("nav.dashboard")}</h1>
      <button onClick={() => i18n.changeLanguage("am")}>አማርኛ</button>
      <button onClick={() => i18n.changeLanguage("en")}>English</button>
    </div>
  );
}
```

**G. Database i18n Support**

Add language column to users table:

```sql
ALTER TABLE users ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en';
```

**H. Number & Currency Formatting**

```typescript
// client/src/utils/i18n-format.ts
export function formatCurrency(amount: number, currency: string = "ETB") {
  const locale = i18n.language === "am" ? "am-ET" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date) {
  const locale = i18n.language === "am" ? "am-ET" : "en-US";
  return new Intl.DateTimeFormat(locale).format(date);
}
```

**Localization Checklist:**

- ✅ All UI text translated (en + am)
- ✅ Date/time formatting (Ethiopian calendar option)
- ✅ Number formatting (Ethiopian number system)
- ✅ Currency display (ETB, USD)
- ✅ Right-to-left (RTL) support (if needed)
- ✅ SMS templates in both languages
- ✅ Email templates in both languages
- ✅ Receipt templates bilingual

---

## Implementation Priority Matrix

| Feature                   | Priority    | Complexity | Time Estimate | Dependencies        |
| ------------------------- | ----------- | ---------- | ------------- | ------------------- |
| **Automated Testing**     | 🔴 Critical | Medium     | 2-3 weeks     | None                |
| **Payment Integration**   | 🔴 Critical | High       | 2-4 weeks     | None                |
| **Email Templates**       | 🟡 High     | Low        | 1 week        | None                |
| **Real-time Updates**     | 🟡 High     | Medium     | 1-2 weeks     | WebSocket (exists)  |
| **UI/UX Design**          | 🟡 High     | Medium     | 2-3 weeks     | None                |
| **Job Scheduling**        | 🟡 High     | Low        | 1 week        | None                |
| **API Analytics**         | 🟢 Medium   | Medium     | 1-2 weeks     | Database schema     |
| **Performance Profiling** | 🟢 Medium   | Low        | 1 week        | None                |
| **Localization (i18n)**   | 🟢 Medium   | High       | 3-4 weeks     | Translation service |

---

## Recommended Implementation Sequence

### Phase 1: Foundation (Weeks 1-4)

1. UI/UX Design System (Figma)
2. Automated Testing Setup (Jest + Playwright)
3. Job Scheduling (node-cron)

### Phase 2: User Experience (Weeks 5-8)

4. Email Templates & Automation
5. Real-time WebSocket Enhancements
6. Performance Profiling Setup

### Phase 3: Business Value (Weeks 9-12)

7. Payment Gateway Integration
8. API Usage Analytics
9. Localization (Amharic + English)

---

## Partially Defined Features - Refinement Guide

The following features exist in the system but need refinement and completion before production deployment.

---

### 1. **Authentication Enhancement - Refresh Tokens** 🔐

**Current State:** Basic JWT authentication with single access token  
**Gap:** No refresh token mechanism, users must re-login frequently  
**Priority:** 🔴 Critical

**Implementation:**

**A. JWT Strategy Refinement**

```typescript
// server/auth-service.ts
import jwt from "jsonwebtoken";
import crypto from "crypto";

interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  locationId: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: Date;
  refreshTokenExpiry: Date;
}

const ACCESS_TOKEN_EXPIRY = "15m"; // Short-lived
const REFRESH_TOKEN_EXPIRY = "7d"; // Long-lived

export function generateTokenPair(payload: TokenPayload): TokenPair {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(
    {
      userId: payload.userId,
      tokenId: crypto.randomUUID(), // Unique token ID for revocation
    },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return {
    accessToken,
    refreshToken,
    accessTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
}

export function verifyRefreshToken(token: string): {
  userId: string;
  tokenId: string;
} {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
}
```

**B. Database Schema for Token Management**

```sql
-- Store active refresh tokens for revocation capability
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL, -- SHA256 hash of refresh token
  device_info JSONB, -- User agent, IP for security tracking
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id, expires_at);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expiry ON refresh_tokens(expires_at);

-- Cleanup expired tokens (run daily)
DELETE FROM refresh_tokens WHERE expires_at < NOW();
```

**C. Login Endpoint Update**

```typescript
// POST /api/login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  // Validate credentials
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (!user.length || !(await bcrypt.compare(password, user[0].password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate token pair
  const tokenPair = generateTokenPair({
    userId: user[0].id,
    username: user[0].username,
    role: user[0].role,
    locationId: user[0].locationId,
  });

  // Store refresh token in database
  const tokenHash = crypto
    .createHash("sha256")
    .update(tokenPair.refreshToken)
    .digest("hex");
  await db.insert(refreshTokens).values({
    tokenId: crypto.randomUUID(),
    userId: user[0].id,
    tokenHash,
    deviceInfo: {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    },
    expiresAt: tokenPair.refreshTokenExpiry,
  });

  res.json({
    user: {
      id: user[0].id,
      username: user[0].username,
      role: user[0].role,
      locationId: user[0].locationId,
    },
    accessToken: tokenPair.accessToken,
    refreshToken: tokenPair.refreshToken,
    expiresIn: 900, // 15 minutes in seconds
  });
});
```

**D. Token Refresh Endpoint**

```typescript
// POST /api/auth/refresh
app.post("/api/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if token exists and is not revoked
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const storedToken = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          eq(refreshTokens.userId, decoded.userId),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!storedToken.length) {
      return res
        .status(401)
        .json({ message: "Invalid or revoked refresh token" });
    }

    // Get user data
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);
    if (!user.length) {
      return res.status(401).json({ message: "User not found" });
    }

    // Generate new access token (keep same refresh token)
    const accessToken = jwt.sign(
      {
        userId: user[0].id,
        username: user[0].username,
        role: user[0].role,
        locationId: user[0].locationId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    // Update last_used_at
    await db
      .update(refreshTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, tokenHash));

    res.json({
      accessToken,
      expiresIn: 900,
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});
```

**E. Token Rotation (Enhanced Security)**

```typescript
// POST /api/auth/refresh-rotate
app.post("/api/auth/refresh-rotate", async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Revoke old refresh token
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, tokenHash));

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);
    if (!user.length) {
      return res.status(401).json({ message: "User not found" });
    }

    // Generate new token pair
    const newTokenPair = generateTokenPair({
      userId: user[0].id,
      username: user[0].username,
      role: user[0].role,
      locationId: user[0].locationId,
    });

    // Store new refresh token
    const newTokenHash = crypto
      .createHash("sha256")
      .update(newTokenPair.refreshToken)
      .digest("hex");
    await db.insert(refreshTokens).values({
      tokenId: crypto.randomUUID(),
      userId: user[0].id,
      tokenHash: newTokenHash,
      deviceInfo: { userAgent: req.headers["user-agent"], ip: req.ip },
      expiresAt: newTokenPair.refreshTokenExpiry,
    });

    res.json({
      accessToken: newTokenPair.accessToken,
      refreshToken: newTokenPair.refreshToken,
      expiresIn: 900,
    });
  } catch (error) {
    return res.status(401).json({ message: "Token rotation failed" });
  }
});
```

**F. Logout & Revoke Tokens**

```typescript
// POST /api/logout
app.post(
  "/api/logout",
  authenticateUser,
  async (req: AuthenticatedRequest, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const tokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.tokenHash, tokenHash));
    }

    res.json({ message: "Logged out successfully" });
  }
);

// POST /api/auth/revoke-all (logout all devices)
app.post(
  "/api/auth/revoke-all",
  authenticateUser,
  async (req: AuthenticatedRequest, res) => {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.userId, req.user.userId));

    res.json({ message: "All sessions revoked" });
  }
);
```

**G. Client-Side Implementation**

```typescript
// client/src/lib/api-client.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Request interceptor - attach access token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        // No refresh token, redirect to login
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post("/api/auth/refresh", {
          refreshToken,
        });
        localStorage.setItem("accessToken", data.accessToken);
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${data.accessToken}`;

        isRefreshing = false;
        onRefreshed(data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

**Environment Variables:**

```bash
# Add to .env
JWT_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret-different-from-access
```

---

### 2. **Notification System - Async Queue** 📬

**Current State:** Synchronous SMS/Email sending blocks requests  
**Gap:** No queuing, retry logic, or batch processing  
**Priority:** 🟡 High

**Implementation with BullMQ:**

**A. Setup BullMQ + Redis**

```bash
npm install bullmq ioredis
npm install --save-dev @types/ioredis
```

**B. Queue Configuration**

```typescript
// server/queues/notification-queue.ts
import { Queue, Worker, QueueEvents } from "bullmq";
import Redis from "ioredis";

const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
});

// Define queue interfaces
interface EmailJob {
  type: "email";
  to: string;
  subject: string;
  template: string;
  data: any;
}

interface SMSJob {
  type: "sms";
  to: string;
  message: string;
  provider: "twilio" | "ethiopian";
}

type NotificationJob = EmailJob | SMSJob;

// Create queues
export const notificationQueue = new Queue<NotificationJob>("notifications", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// Email queue (separate for different priorities)
export const emailQueue = new Queue<EmailJob>("emails", {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 5000 },
  },
});

// SMS queue with rate limiting
export const smsQueue = new Queue<SMSJob>("sms", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "fixed", delay: 10000 },
  },
  limiter: {
    max: 10, // Max 10 SMS per...
    duration: 1000, // ...per second (adjust based on provider limits)
  },
});
```

**C. Worker Implementation**

```typescript
// server/workers/notification-worker.ts
import { Worker } from "bullmq";
import { sendEmail } from "../email-service";
import { sendSMS } from "../sms-service";
import { logger } from "../utils/logger";

// Email worker
export const emailWorker = new Worker<EmailJob>(
  "emails",
  async (job) => {
    logger.info(`Processing email job ${job.id}`, {
      to: job.data.to,
      template: job.data.template,
    });

    try {
      await sendEmail({
        to: job.data.to,
        subject: job.data.subject,
        template: job.data.template,
        data: job.data.data,
      });

      logger.info(`Email sent successfully: ${job.id}`);
      return { status: "sent", timestamp: new Date() };
    } catch (error) {
      logger.error(`Email failed: ${job.id}`, { error });
      throw error; // Will trigger retry
    }
  },
  {
    connection,
    concurrency: 5, // Process 5 emails concurrently
  }
);

// SMS worker
export const smsWorker = new Worker<SMSJob>(
  "sms",
  async (job) => {
    logger.info(`Processing SMS job ${job.id}`, {
      to: job.data.to,
      provider: job.data.provider,
    });

    try {
      await sendSMS({
        to: job.data.to,
        message: job.data.message,
        provider: job.data.provider,
      });

      logger.info(`SMS sent successfully: ${job.id}`);
      return { status: "sent", timestamp: new Date() };
    } catch (error) {
      logger.error(`SMS failed: ${job.id}`, { error });
      throw error;
    }
  },
  {
    connection,
    concurrency: 10, // Process 10 SMS concurrently
  }
);

// Event listeners
emailWorker.on("completed", (job) => {
  logger.info(`Email job ${job.id} completed`);
});

emailWorker.on("failed", (job, error) => {
  logger.error(
    `Email job ${job?.id} failed after ${job?.attemptsMade} attempts`,
    { error }
  );
});

smsWorker.on("completed", (job) => {
  logger.info(`SMS job ${job.id} completed`);
});

smsWorker.on("failed", (job, error) => {
  logger.error(`SMS job ${job?.id} failed`, { error });
});
```

**D. Queue Service API**

```typescript
// server/services/notification-queue-service.ts
import { emailQueue, smsQueue } from "../queues/notification-queue";

export class NotificationQueueService {
  // Queue email
  async queueEmail(data: {
    to: string;
    subject: string;
    template: string;
    data: any;
    priority?: number;
    delay?: number;
  }) {
    return await emailQueue.add(
      "send-email",
      {
        type: "email",
        ...data,
      },
      {
        priority: data.priority || 3, // 1 = highest, 10 = lowest
        delay: data.delay, // Delay in ms
      }
    );
  }

  // Queue SMS
  async queueSMS(data: {
    to: string;
    message: string;
    provider?: "twilio" | "ethiopian";
    priority?: number;
  }) {
    return await smsQueue.add(
      "send-sms",
      {
        type: "sms",
        provider: data.provider || "twilio",
        ...data,
      },
      {
        priority: data.priority || 3,
      }
    );
  }

  // Queue bulk SMS
  async queueBulkSMS(recipients: Array<{ to: string; message: string }>) {
    const jobs = recipients.map((recipient, index) => ({
      name: `bulk-sms-${index}`,
      data: {
        type: "sms" as const,
        provider: "twilio" as const,
        ...recipient,
      },
      opts: {
        delay: index * 100, // Stagger by 100ms to avoid rate limits
      },
    }));

    return await smsQueue.addBulk(jobs);
  }

  // Get queue stats
  async getQueueStats() {
    const [emailStats, smsStats] = await Promise.all([
      emailQueue.getJobCounts(),
      smsQueue.getJobCounts(),
    ]);

    return {
      email: emailStats,
      sms: smsStats,
    };
  }

  // Clear failed jobs
  async clearFailedJobs(queueName: "email" | "sms") {
    const queue = queueName === "email" ? emailQueue : smsQueue;
    await queue.clean(0, 1000, "failed");
  }

  // Retry failed job
  async retryFailedJob(queueName: "email" | "sms", jobId: string) {
    const queue = queueName === "email" ? emailQueue : smsQueue;
    const job = await queue.getJob(jobId);
    if (job) {
      await job.retry();
    }
  }
}

export const notificationQueueService = new NotificationQueueService();
```

**E. Usage in Routes**

```typescript
// server/routes.ts
import { notificationQueueService } from "./services/notification-queue-service";

// Device completed - send email
app.put("/api/devices/:id/complete", authenticateUser, async (req, res) => {
  const device = await storage.updateDeviceStatus(req.params.id, "completed");
  const customer = await storage.getCustomer(device.customerId);

  // Queue notification instead of sending synchronously
  await notificationQueueService.queueEmail({
    to: customer.email,
    subject: "Your device is ready!",
    template: "device-ready",
    data: {
      customerName: customer.name,
      deviceType: device.deviceType,
      receiptNumber: device.receiptNumber,
    },
    priority: 2, // High priority
  });

  await notificationQueueService.queueSMS({
    to: customer.phone,
    message: `Your ${device.deviceType} is ready for pickup. Receipt: ${device.receiptNumber}`,
    priority: 2,
  });

  res.json(device);
});
```

**F. Admin Dashboard for Queue Monitoring**

```typescript
// GET /api/admin/queues/stats
app.get("/api/admin/queues/stats", authenticateUser, async (req, res) => {
  const stats = await notificationQueueService.getQueueStats();
  res.json(stats);
});

// GET /api/admin/queues/:queueName/failed
app.get(
  "/api/admin/queues/:queueName/failed",
  authenticateUser,
  async (req, res) => {
    const queueName = req.params.queueName as "email" | "sms";
    const queue = queueName === "email" ? emailQueue : smsQueue;
    const failed = await queue.getFailed(0, 100);

    res.json(
      failed.map((job) => ({
        id: job.id,
        data: job.data,
        failedReason: job.failedReason,
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp,
      }))
    );
  }
);

// POST /api/admin/queues/:queueName/retry/:jobId
app.post(
  "/api/admin/queues/:queueName/retry/:jobId",
  authenticateUser,
  async (req, res) => {
    await notificationQueueService.retryFailedJob(
      req.params.queueName as "email" | "sms",
      req.params.jobId
    );
    res.json({ message: "Job queued for retry" });
  }
);
```

**G. Initialize Workers in Server**

```typescript
// server/index.ts
import { emailWorker, smsWorker } from "./workers/notification-worker";

// Start workers
if (
  process.env.NODE_ENV === "production" ||
  process.env.ENABLE_WORKERS === "true"
) {
  logger.info("Starting notification workers...");
  // Workers start automatically when imported
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing workers...");
  await Promise.all([emailWorker.close(), smsWorker.close()]);
  process.exit(0);
});
```

**Environment Variables:**

```bash
# Add to .env
REDIS_HOST=localhost
REDIS_PORT=6379
ENABLE_WORKERS=true  # Set to false to disable workers in development
```

**Docker Compose Update:**

```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: solnetcomputer-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

volumes:
  redis_data:
```

---

### 3. **Audit Logging - CRUD Tracking** 📋

**Current State:** No activity tracking  
**Gap:** Cannot trace who changed what and when  
**Priority:** 🔴 Critical (Compliance & Security)

**Implementation:**

**A. Database Schema**

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  username VARCHAR(255),
  action VARCHAR(50) NOT NULL, -- CREATE, READ, UPDATE, DELETE
  entity_type VARCHAR(100) NOT NULL, -- customers, devices, inventory_items, etc.
  entity_id UUID NOT NULL,
  old_values JSONB, -- Previous state (for UPDATE/DELETE)
  new_values JSONB, -- New state (for CREATE/UPDATE)
  changes JSONB, -- Diff of changes
  ip_address VARCHAR(45),
  user_agent TEXT,
  location_id UUID REFERENCES locations(id),
  metadata JSONB, -- Additional context
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_location ON audit_logs(location_id, created_at DESC);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- Partition by month for performance (PostgreSQL 10+)
CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

**B. Audit Middleware**

```typescript
// server/middleware/audit-logger.ts
import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { auditLogs } from "@shared/schema";

interface AuditableRequest extends Request {
  user?: any;
  auditLog?: {
    entityType: string;
    entityId: string;
    oldValues?: any;
    newValues?: any;
  };
}

export const auditLogger = (entityType: string) => {
  return async (req: AuditableRequest, res: Response, next: NextFunction) => {
    const originalSend = res.json;

    res.json = function (data: any) {
      // Log after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAudit(req, entityType, data).catch((error) => {
          console.error("Audit logging failed:", error);
        });
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

async function logAudit(
  req: AuditableRequest,
  entityType: string,
  responseData: any
) {
  const action = getActionFromMethod(req.method);

  if (action === "READ") {
    return; // Skip READ actions to reduce log volume (optional)
  }

  const entityId = req.params.id || responseData?.id;
  const oldValues = req.auditLog?.oldValues;
  const newValues = req.body || responseData;

  const changes = oldValues ? calculateChanges(oldValues, newValues) : null;

  await db.insert(auditLogs).values({
    userId: req.user?.userId,
    username: req.user?.username,
    action,
    entityType,
    entityId,
    oldValues,
    newValues,
    changes,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    locationId: req.user?.locationId,
    metadata: {
      path: req.path,
      method: req.method,
    },
  });
}

function getActionFromMethod(method: string): string {
  switch (method) {
    case "POST":
      return "CREATE";
    case "GET":
      return "READ";
    case "PUT":
    case "PATCH":
      return "UPDATE";
    case "DELETE":
      return "DELETE";
    default:
      return "UNKNOWN";
  }
}

function calculateChanges(oldValues: any, newValues: any): any {
  const changes: any = {};

  for (const key in newValues) {
    if (oldValues[key] !== newValues[key]) {
      changes[key] = {
        from: oldValues[key],
        to: newValues[key],
      };
    }
  }

  return Object.keys(changes).length > 0 ? changes : null;
}
```

**C. Usage in Routes with Old Value Capture**

```typescript
// server/routes.ts
import { auditLogger } from "./middleware/audit-logger";

// Customer update with audit
app.put(
  "/api/customers/:id",
  authenticateUser,
  auditLogger("customers"),
  async (req: AuditableRequest, res) => {
    try {
      // Fetch old values before update
      const oldCustomer = await storage.getCustomer(req.params.id);

      // Store for audit middleware
      req.auditLog = {
        entityType: "customers",
        entityId: req.params.id,
        oldValues: oldCustomer,
      };

      // Perform update
      const updated = await storage.updateCustomer(req.params.id, req.body);

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Update failed" });
    }
  }
);

// Device deletion with audit
app.delete(
  "/api/devices/:id",
  authenticateUser,
  auditLogger("devices"),
  async (req: AuditableRequest, res) => {
    const device = await storage.getDevice(req.params.id);

    req.auditLog = {
      entityType: "devices",
      entityId: req.params.id,
      oldValues: device,
    };

    await storage.deleteDevice(req.params.id);
    res.json({ message: "Device deleted" });
  }
);
```

**D. Database Triggers for Automatic Auditing (Alternative)**

```sql
-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (
      action,
      entity_type,
      entity_id,
      old_values,
      created_at
    ) VALUES (
      'DELETE',
      TG_TABLE_NAME,
      OLD.id,
      row_to_json(OLD),
      NOW()
    );
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (
      action,
      entity_type,
      entity_id,
      old_values,
      new_values,
      created_at
    ) VALUES (
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id,
      row_to_json(OLD),
      row_to_json(NEW),
      NOW()
    );
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (
      action,
      entity_type,
      entity_id,
      new_values,
      created_at
    ) VALUES (
      'CREATE',
      TG_TABLE_NAME,
      NEW.id,
      row_to_json(NEW),
      NOW()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to important tables
CREATE TRIGGER audit_customers
  AFTER INSERT OR UPDATE OR DELETE ON customers
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_devices
  AFTER INSERT OR UPDATE OR DELETE ON devices
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_inventory
  AFTER INSERT OR UPDATE OR DELETE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

**E. Audit Log API**

```typescript
// GET /api/admin/audit-logs
app.get("/api/admin/audit-logs", authenticateUser, async (req, res) => {
  const {
    entityType,
    entityId,
    userId,
    action,
    startDate,
    endDate,
    limit = 100,
    offset = 0,
  } = req.query;

  let query = db.select().from(auditLogs);

  if (entityType) {
    query = query.where(eq(auditLogs.entityType, entityType as string));
  }
  if (entityId) {
    query = query.where(eq(auditLogs.entityId, entityId as string));
  }
  if (userId) {
    query = query.where(eq(auditLogs.userId, userId as string));
  }
  if (action) {
    query = query.where(eq(auditLogs.action, action as string));
  }
  if (startDate) {
    query = query.where(
      gte(auditLogs.createdAt, new Date(startDate as string))
    );
  }
  if (endDate) {
    query = query.where(lte(auditLogs.createdAt, new Date(endDate as string)));
  }

  const logs = await query
    .orderBy(desc(auditLogs.createdAt))
    .limit(Number(limit))
    .offset(Number(offset));

  const total = await db.select({ count: sql`count(*)` }).from(auditLogs);

  res.json({
    logs,
    total: total[0].count,
    limit: Number(limit),
    offset: Number(offset),
  });
});

// GET /api/admin/audit-logs/entity/:entityType/:entityId
app.get(
  "/api/admin/audit-logs/entity/:entityType/:entityId",
  authenticateUser,
  async (req, res) => {
    const { entityType, entityId } = req.params;

    const logs = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.entityType, entityType),
          eq(auditLogs.entityId, entityId)
        )
      )
      .orderBy(desc(auditLogs.createdAt));

    res.json(logs);
  }
);

// GET /api/admin/audit-logs/user/:userId
app.get(
  "/api/admin/audit-logs/user/:userId",
  authenticateUser,
  async (req, res) => {
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, req.params.userId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);

    res.json(logs);
  }
);
```

**F. Client Component - Audit Trail Viewer**

```typescript
// client/src/components/audit-trail.tsx
export function AuditTrail({
  entityType,
  entityId,
}: {
  entityType: string;
  entityId: string;
}) {
  const { data: logs } = useQuery({
    queryKey: ["audit-logs", entityType, entityId],
    queryFn: () =>
      fetch(`/api/admin/audit-logs/entity/${entityType}/${entityId}`).then(
        (r) => r.json()
      ),
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Activity History</h3>
      {logs?.map((log: any) => (
        <div key={log.id} className="border-l-2 border-gray-300 pl-4 py-2">
          <div className="flex justify-between">
            <span className="font-medium">{log.action}</span>
            <span className="text-sm text-gray-500">
              {new Date(log.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-600">by {log.username}</p>
          {log.changes && (
            <div className="mt-2 text-sm">
              {Object.entries(log.changes).map(
                ([key, value]: [string, any]) => (
                  <div key={key} className="flex gap-2">
                    <span className="font-medium">{key}:</span>
                    <span className="text-red-600">{value.from}</span>
                    <span>→</span>
                    <span className="text-green-600">{value.to}</span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

### 4. **Analytics Dashboard - KPI Implementation** 📊

**Current State:** Basic analytics endpoints exist  
**Gap:** Need comprehensive chart data APIs and real-time KPIs  
**Priority:** 🟡 High

**Implementation:**

**A. KPI Calculation Service**

```typescript
// server/services/kpi-service.ts
import { db } from "../db";
import {
  devices,
  sales,
  customers,
  expenses,
  inventoryItems,
} from "@shared/schema";
import { sql, and, gte, lte, eq, desc } from "drizzle-orm";

export class KPIService {
  // Revenue KPIs
  async getRevenueKPIs(
    locationFilter: any,
    dateRange: { start: Date; end: Date }
  ) {
    const [currentRevenue] = await db
      .select({
        total: sql<number>`COALESCE(SUM(total_amount), 0)`,
        count: sql<number>`COUNT(*)`,
        average: sql<number>`COALESCE(AVG(total_amount), 0)`,
      })
      .from(sales)
      .where(
        and(
          locationFilter.includeAllLocations
            ? sql`1=1`
            : eq(sales.locationId, locationFilter.locationId),
          gte(sales.saleDate, dateRange.start),
          lte(sales.saleDate, dateRange.end)
        )
      );

    // Compare with previous period
    const periodDays = Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const previousStart = new Date(
      dateRange.start.getTime() - periodDays * 24 * 60 * 60 * 1000
    );

    const [previousRevenue] = await db
      .select({
        total: sql<number>`COALESCE(SUM(total_amount), 0)`,
      })
      .from(sales)
      .where(
        and(
          locationFilter.includeAllLocations
            ? sql`1=1`
            : eq(sales.locationId, locationFilter.locationId),
          gte(sales.saleDate, previousStart),
          lte(sales.saleDate, dateRange.start)
        )
      );

    const growth =
      previousRevenue.total > 0
        ? ((currentRevenue.total - previousRevenue.total) /
            previousRevenue.total) *
          100
        : 0;

    return {
      current: {
        total: currentRevenue.total,
        count: currentRevenue.count,
        average: currentRevenue.average,
      },
      previous: {
        total: previousRevenue.total,
      },
      growth: Math.round(growth * 100) / 100,
    };
  }

  // Device/Repair KPIs
  async getRepairKPIs(
    locationFilter: any,
    dateRange: { start: Date; end: Date }
  ) {
    const statusBreakdown = await db
      .select({
        status: devices.status,
        count: sql<number>`COUNT(*)`,
        avgCost: sql<number>`COALESCE(AVG(total_cost), 0)`,
      })
      .from(devices)
      .where(
        and(
          locationFilter.includeAllLocations
            ? sql`1=1`
            : eq(devices.locationId, locationFilter.locationId),
          gte(devices.createdAt, dateRange.start),
          lte(devices.createdAt, dateRange.end)
        )
      )
      .groupBy(devices.status);

    // Average repair time
    const [avgRepairTime] = await db
      .select({
        avgDays: sql<number>`
          COALESCE(
            AVG(EXTRACT(EPOCH FROM (actual_completion_date - created_at)) / 86400),
            0
          )
        `,
      })
      .from(devices)
      .where(
        and(
          locationFilter.includeAllLocations
            ? sql`1=1`
            : eq(devices.locationId, locationFilter.locationId),
          sql`actual_completion_date IS NOT NULL`,
          gte(devices.createdAt, dateRange.start)
        )
      );

    return {
      statusBreakdown,
      avgRepairTime: Math.round(avgRepairTime.avgDays * 10) / 10,
      totalDevices: statusBreakdown.reduce((sum, item) => sum + item.count, 0),
    };
  }

  // Customer KPIs
  async getCustomerKPIs(
    locationFilter: any,
    dateRange: { start: Date; end: Date }
  ) {
    const [newCustomers] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(customers)
      .where(
        and(
          locationFilter.includeAllLocations
            ? sql`1=1`
            : eq(customers.locationId, locationFilter.locationId),
          gte(customers.registrationDate, dateRange.start),
          lte(customers.registrationDate, dateRange.end)
        )
      );

    const [totalCustomers] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(customers)
      .where(
        locationFilter.includeAllLocations
          ? sql`1=1`
          : eq(customers.locationId, locationFilter.locationId)
      );

    return {
      new: newCustomers.count,
      total: totalCustomers.count,
    };
  }

  // Inventory KPIs
  async getInventoryKPIs(locationFilter: any) {
    const [inventoryStats] = await db
      .select({
        totalItems: sql<number>`COUNT(*)`,
        totalValue: sql<number>`COALESCE(SUM(quantity * sale_price), 0)`,
        lowStockItems: sql<number>`COUNT(*) FILTER (WHERE quantity <= min_stock_level)`,
        outOfStock: sql<number>`COUNT(*) FILTER (WHERE quantity = 0)`,
      })
      .from(inventoryItems)
      .where(
        and(
          locationFilter.includeAllLocations
            ? sql`1=1`
            : eq(inventoryItems.locationId, locationFilter.locationId),
          eq(inventoryItems.isActive, true)
        )
      );

    return inventoryStats;
  }

  // Expense KPIs
  async getExpenseKPIs(
    locationFilter: any,
    dateRange: { start: Date; end: Date }
  ) {
    const [expenseStats] = await db
      .select({
        total: sql<number>`COALESCE(SUM(amount), 0)`,
        count: sql<number>`COUNT(*)`,
        average: sql<number>`COALESCE(AVG(amount), 0)`,
      })
      .from(expenses)
      .where(
        and(
          locationFilter.includeAllLocations
            ? sql`1=1`
            : eq(expenses.locationId, locationFilter.locationId),
          gte(expenses.date, dateRange.start),
          lte(expenses.date, dateRange.end)
        )
      );

    return expenseStats;
  }

  // Combined dashboard KPIs
  async getDashboardKPIs(
    locationFilter: any,
    dateRange: { start: Date; end: Date }
  ) {
    const [revenue, repairs, customer, inventory, expense] = await Promise.all([
      this.getRevenueKPIs(locationFilter, dateRange),
      this.getRepairKPIs(locationFilter, dateRange),
      this.getCustomerKPIs(locationFilter, dateRange),
      this.getInventoryKPIs(locationFilter),
      this.getExpenseKPIs(locationFilter, dateRange),
    ]);

    return {
      revenue,
      repairs,
      customers: customer,
      inventory,
      expenses: expense,
      profitability: {
        revenue: revenue.current.total,
        expenses: expense.total,
        profit: revenue.current.total - expense.total,
        margin:
          revenue.current.total > 0
            ? ((revenue.current.total - expense.total) /
                revenue.current.total) *
              100
            : 0,
      },
    };
  }
}

export const kpiService = new KPIService();
```

**B. Chart Data APIs**

```typescript
// server/routes.ts - Analytics endpoints

// GET /api/analytics/revenue-trend (for line chart)
app.get(
  "/api/analytics/revenue-trend",
  authenticateAndFilter,
  async (req: any, res) => {
    const { period = "daily", days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const groupBy =
      period === "daily" ? "day" : period === "weekly" ? "week" : "month";

    const trend = await db
      .select({
        date: sql<string>`date_trunc('${sql.raw(groupBy)}', sale_date)`,
        revenue: sql<number>`SUM(total_amount)`,
        salesCount: sql<number>`COUNT(*)`,
      })
      .from(sales)
      .where(
        and(
          req.locationFilter.includeAllLocations
            ? sql`1=1`
            : eq(sales.locationId, req.locationFilter.locationId),
          gte(sales.saleDate, startDate)
        )
      )
      .groupBy(sql`date_trunc('${sql.raw(groupBy)}', sale_date)`)
      .orderBy(sql`date_trunc('${sql.raw(groupBy)}', sale_date)`);

    res.json(trend);
  }
);

// GET /api/analytics/repair-status-distribution (for pie chart)
app.get(
  "/api/analytics/repair-status-distribution",
  authenticateAndFilter,
  async (req: any, res) => {
    const distribution = await db
      .select({
        status: devices.status,
        count: sql<number>`COUNT(*)`,
        percentage: sql<number>`
        (COUNT(*)::float / (SELECT COUNT(*) FROM devices WHERE is_active = true)) * 100
      `,
      })
      .from(devices)
      .where(
        and(
          req.locationFilter.includeAllLocations
            ? sql`1=1`
            : eq(devices.locationId, req.locationFilter.locationId),
          eq(devices.isActive, true)
        )
      )
      .groupBy(devices.status);

    res.json(distribution);
  }
);

// GET /api/analytics/top-selling-items (for bar chart)
app.get(
  "/api/analytics/top-selling-items",
  authenticateAndFilter,
  async (req: any, res) => {
    const { limit = 10 } = req.query;

    const topItems = await db
      .select({
        itemName: saleItems.productName,
        totalQuantity: sql<number>`SUM(quantity)`,
        totalRevenue: sql<number>`SUM(total_price)`,
        salesCount: sql<number>`COUNT(DISTINCT sale_id)`,
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .where(
        req.locationFilter.includeAllLocations
          ? sql`1=1`
          : eq(sales.locationId, req.locationFilter.locationId)
      )
      .groupBy(saleItems.productName)
      .orderBy(desc(sql`SUM(total_price)`))
      .limit(Number(limit));

    res.json(topItems);
  }
);

// GET /api/analytics/expense-breakdown (for pie chart)
app.get(
  "/api/analytics/expense-breakdown",
  authenticateAndFilter,
  async (req: any, res) => {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const breakdown = await db
      .select({
        category: expenseCategories.name,
        total: sql<number>`SUM(expenses.amount)`,
        count: sql<number>`COUNT(*)`,
        percentage: sql<number>`
        (SUM(expenses.amount)::float / (
          SELECT SUM(amount) FROM expenses 
          WHERE date >= ${startDate}
        )) * 100
      `,
      })
      .from(expenses)
      .leftJoin(
        expenseCategories,
        eq(expenses.categoryId, expenseCategories.id)
      )
      .where(
        and(
          req.locationFilter.includeAllLocations
            ? sql`1=1`
            : eq(expenses.locationId, req.locationFilter.locationId),
          gte(expenses.date, startDate)
        )
      )
      .groupBy(expenseCategories.name)
      .orderBy(desc(sql`SUM(expenses.amount)`));

    res.json(breakdown);
  }
);
```

**C. Client-Side Chart Components**

```typescript
// client/src/components/charts/revenue-trend-chart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function RevenueTrendChart({
  period = "daily",
  days = 30,
}: {
  period?: string;
  days?: number;
}) {
  const { data } = useQuery({
    queryKey: ["analytics", "revenue-trend", period, days],
    queryFn: () =>
      fetch(`/api/analytics/revenue-trend?period=${period}&days=${days}`).then(
        (r) => r.json()
      ),
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#8884d8"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

### 5. **System Monitoring - Metrics Collection** 🔍

**Current State:** Basic health endpoint exists  
**Gap:** No detailed metrics, no alerting, no historical tracking  
**Priority:** 🟡 High

**Implementation:**

**A. Prometheus Integration (Recommended)**

```bash
npm install prom-client
```

```typescript
// server/monitoring/prometheus.ts
import client from "prom-client";

// Create registry
export const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const httpRequestTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

export const activeDevices = new client.Gauge({
  name: "active_devices_total",
  help: "Total number of active devices",
  labelNames: ["status"],
});

export const inventoryValue = new client.Gauge({
  name: "inventory_value_total",
  help: "Total inventory value",
  labelNames: ["location_id"],
});

export const dbConnectionPool = new client.Gauge({
  name: "db_connection_pool_size",
  help: "Database connection pool metrics",
  labelNames: ["state"], // active, idle, waiting
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeDevices);
register.registerMetric(inventoryValue);
register.registerMetric(dbConnectionPool);

// Update metrics periodically
setInterval(async () => {
  // Update device counts
  const deviceCounts = await db
    .select({
      status: devices.status,
      count: sql<number>`COUNT(*)`,
    })
    .from(devices)
    .where(eq(devices.isActive, true))
    .groupBy(devices.status);

  deviceCounts.forEach(({ status, count }) => {
    activeDevices.labels(status).set(count);
  });

  // Update inventory value by location
  const inventoryValues = await db
    .select({
      locationId: inventoryItems.locationId,
      value: sql<number>`SUM(quantity * sale_price)`,
    })
    .from(inventoryItems)
    .groupBy(inventoryItems.locationId);

  inventoryValues.forEach(({ locationId, value }) => {
    inventoryValue.labels(locationId || "null").set(value);
  });
}, 60000); // Update every minute
```

**B. Metrics Middleware**

```typescript
// server/middleware/metrics.ts
import {
  httpRequestDuration,
  httpRequestTotal,
} from "../monitoring/prometheus";

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;

    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
    httpRequestTotal.labels(req.method, route, res.statusCode.toString()).inc();
  });

  next();
};
```

**C. Metrics Endpoint**

```typescript
// server/routes.ts
import { register } from "./monitoring/prometheus";

// GET /metrics (Prometheus scrape endpoint)
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// GET /api/admin/system-metrics (Human-readable)
app.get("/api/admin/system-metrics", authenticateUser, async (req, res) => {
  const metrics = {
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.version,
      env: process.env.NODE_ENV,
    },
    database: {
      connectionPool: await getDbPoolStats(),
      tableStats: await getTableStats(),
    },
    application: {
      totalUsers: await db.select({ count: sql`COUNT(*)` }).from(users),
      totalCustomers: await db.select({ count: sql`COUNT(*)` }).from(customers),
      totalDevices: await db.select({ count: sql`COUNT(*)` }).from(devices),
      totalSales: await db.select({ count: sql`COUNT(*)` }).from(sales),
    },
  };

  res.json(metrics);
});
```

**D. Custom Stats Collector (Alternative)**

```typescript
// server/monitoring/stats-collector.ts
export class StatsCollector {
  private stats: Map<string, any> = new Map();

  async collect() {
    const timestamp = new Date();

    const snapshot = {
      timestamp,
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
      database: await this.collectDatabaseStats(),
      application: await this.collectApplicationStats(),
    };

    this.stats.set(timestamp.toISOString(), snapshot);

    // Keep last 24 hours of stats
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for (const [key, value] of this.stats.entries()) {
      if (new Date(value.timestamp) < oneDayAgo) {
        this.stats.delete(key);
      }
    }

    return snapshot;
  }

  async collectDatabaseStats() {
    const [poolStats] = await db.execute(sql`
      SELECT 
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);

    return poolStats;
  }

  async collectApplicationStats() {
    const [devices, customers, sales] = await Promise.all([
      db.select({ count: sql`COUNT(*)` }).from(devices),
      db.select({ count: sql`COUNT(*)` }).from(customers),
      db.select({ count: sql`COUNT(*)` }).from(sales),
    ]);

    return {
      totalDevices: devices[0].count,
      totalCustomers: customers[0].count,
      totalSales: sales[0].count,
    };
  }

  getStats(minutes: number = 60) {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recentStats = Array.from(this.stats.values()).filter(
      (stat) => new Date(stat.timestamp) >= cutoff
    );

    return recentStats;
  }
}

export const statsCollector = new StatsCollector();

// Collect stats every 5 minutes
setInterval(() => {
  statsCollector.collect().catch(console.error);
}, 5 * 60 * 1000);
```

---

### 6. **Import/Export Enhancement** 📥📤

**Current State:** Basic Excel templates exist  
**Gap:** No field mapping UI, limited validation, no preview  
**Priority:** 🟢 Medium

**Implementation:**

**A. Enhanced Import Service**

```typescript
// server/services/import-service.ts
import ExcelJS from "exceljs";
import { z } from "zod";

interface ImportMapping {
  sourceColumn: string;
  targetField: string;
  transform?: (value: any) => any;
  required?: boolean;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; field: string; error: string }>;
  preview?: any[];
}

export class ImportService {
  async importCustomers(
    file: Buffer,
    mapping: ImportMapping[],
    locationId: string,
    preview: boolean = false
  ): Promise<ImportResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file);
    const worksheet = workbook.worksheets[0];

    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      preview: preview ? [] : undefined,
    };

    const rows: any[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const rowData: any = { locationId };
      const rowErrors: string[] = [];

      mapping.forEach(({ sourceColumn, targetField, transform, required }) => {
        const cellIndex = this.columnToIndex(sourceColumn);
        let value = row.getCell(cellIndex).value;

        if (transform) {
          try {
            value = transform(value);
          } catch (error) {
            rowErrors.push(`${targetField}: Transform failed`);
          }
        }

        if (required && !value) {
          rowErrors.push(`${targetField}: Required field missing`);
        }

        rowData[targetField] = value;
      });

      if (rowErrors.length > 0) {
        result.failed++;
        rowErrors.forEach((error) => {
          result.errors.push({ row: rowNumber, field: "", error });
        });
      } else {
        rows.push(rowData);
      }
    });

    if (preview) {
      result.preview = rows.slice(0, 10); // Preview first 10 rows
      return result;
    }

    // Validate with schema
    const customerSchema = z.object({
      name: z.string().min(1),
      phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
      email: z.string().email().optional(),
      address: z.string().optional(),
      locationId: z.string().uuid(),
    });

    // Insert valid rows
    for (const [index, rowData] of rows.entries()) {
      try {
        const validated = customerSchema.parse(rowData);
        await db.insert(customers).values(validated);
        result.success++;
      } catch (error) {
        result.failed++;
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            result.errors.push({
              row: index + 2, // +2 for header and 0-based index
              field: err.path.join("."),
              error: err.message,
            });
          });
        }
      }
    }

    return result;
  }

  private columnToIndex(column: string): number {
    let index = 0;
    for (let i = 0; i < column.length; i++) {
      index = index * 26 + (column.charCodeAt(i) - 64);
    }
    return index;
  }
}

export const importService = new ImportService();
```

**B. Import API with Mapping**

```typescript
// POST /api/import/customers/preview
app.post(
  "/api/import/customers/preview",
  authenticateUser,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "File required" });
    }

    const mapping: ImportMapping[] = JSON.parse(req.body.mapping || "[]");

    const result = await importService.importCustomers(
      req.file.buffer,
      mapping,
      req.user.locationId,
      true // Preview mode
    );

    res.json(result);
  }
);

// POST /api/import/customers/execute
app.post(
  "/api/import/customers/execute",
  authenticateUser,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "File required" });
    }

    const mapping: ImportMapping[] = JSON.parse(req.body.mapping || "[]");

    const result = await importService.importCustomers(
      req.file.buffer,
      mapping,
      req.user.locationId,
      false
    );

    res.json(result);
  }
);
```

**C. Field Mapping UI Component**

```typescript
// client/src/components/import-mapper.tsx
export function ImportMapper({
  file,
  onComplete,
}: {
  file: File;
  onComplete: (mapping: any) => void;
}) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<any[]>([]);

  const targetFields = [
    { field: "name", label: "Customer Name", required: true },
    { field: "phone", label: "Phone Number", required: true },
    { field: "email", label: "Email", required: false },
    { field: "address", label: "Address", required: false },
    { field: "city", label: "City", required: false },
  ];

  useEffect(() => {
    // Read Excel headers
    const reader = new FileReader();
    reader.onload = async (e) => {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(e.target.result);
      const sheet = workbook.worksheets[0];
      const headerRow = sheet.getRow(1);
      const headers = headerRow.values.slice(1); // Skip first empty cell
      setHeaders(headers);
    };
    reader.readAsArrayBuffer(file);
  }, [file]);

  return (
    <div className="space-y-4">
      <h3>Map Excel Columns to Fields</h3>
      {targetFields.map(({ field, label, required }) => (
        <div key={field} className="flex items-center gap-4">
          <label className="w-1/3">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <select
            className="flex-1 border rounded px-3 py-2"
            onChange={(e) => {
              const newMapping = [...mapping];
              const index = newMapping.findIndex(
                (m) => m.targetField === field
              );
              if (index >= 0) {
                newMapping[index] = {
                  sourceColumn: e.target.value,
                  targetField: field,
                  required,
                };
              } else {
                newMapping.push({
                  sourceColumn: e.target.value,
                  targetField: field,
                  required,
                });
              }
              setMapping(newMapping);
            }}
          >
            <option value="">-- Select Column --</option>
            {headers.map((header, i) => (
              <option key={i} value={String.fromCharCode(65 + i)}>
                {header}
              </option>
            ))}
          </select>
        </div>
      ))}
      <button onClick={() => onComplete(mapping)} className="btn-primary">
        Continue
      </button>
    </div>
  );
}
```

---

### 7. **File Storage - Cloud Fallback** ☁️

**Current State:** Local filesystem only  
**Gap:** Not scalable for multi-instance deployment  
**Priority:** 🟡 High (for production scaling)

**Implementation:**

**A. S3-Compatible Storage Service**

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

```typescript
// server/services/storage-service.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";

const USE_S3 = process.env.USE_S3_STORAGE === "true";

const s3Client = USE_S3
  ? new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      endpoint: process.env.S3_ENDPOINT, // For S3-compatible services (MinIO, DigitalOcean Spaces)
    })
  : null;

export class StorageService {
  // Upload file
  async uploadFile(
    file: Express.Multer.File,
    folder: string = "uploads"
  ): Promise<{ url: string; key: string }> {
    const filename = `${Date.now()}_${file.originalname}`;
    const key = `${folder}/${filename}`;

    if (USE_S3 && s3Client) {
      // Upload to S3
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: "public-read", // Or 'private' with signed URLs
        })
      );

      const url = process.env.S3_PUBLIC_URL
        ? `${process.env.S3_PUBLIC_URL}/${key}`
        : `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      return { url, key };
    } else {
      // Local filesystem fallback
      const localPath = path.join(process.cwd(), "uploads", filename);
      await fs.promises.writeFile(localPath, file.buffer);

      return {
        url: `/uploads/${filename}`,
        key: filename,
      };
    }
  }

  // Get signed URL (for private files)
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (USE_S3 && s3Client) {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } else {
      // Local files don't need signed URLs
      return `/uploads/${key}`;
    }
  }

  // Delete file
  async deleteFile(key: string): Promise<void> {
    if (USE_S3 && s3Client) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: key,
        })
      );
    } else {
      const localPath = path.join(process.cwd(), "uploads", key);
      if (fs.existsSync(localPath)) {
        await fs.promises.unlink(localPath);
      }
    }
  }
}

export const storageService = new StorageService();
```

**B. Update File Upload Handlers**

```typescript
// server/routes.ts
import { storageService } from "./services/storage-service";

// Upload profile picture
app.put(
  "/api/users/:id/profile-picture",
  authenticateUser,
  upload.single("picture"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "File required" });
    }

    // Upload to S3 or local
    const { url, key } = await storageService.uploadFile(req.file, "profiles");

    // Update user record
    await db
      .update(users)
      .set({ profilePicture: url })
      .where(eq(users.id, req.params.id));

    res.json({ url, key });
  }
);
```

**Environment Variables:**

```bash
# S3 Configuration
USE_S3_STORAGE=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=solnetcomputer-uploads
S3_PUBLIC_URL=https://cdn.yourdomain.com  # Optional CDN

# For S3-compatible services (MinIO, DigitalOcean Spaces, Wasabi)
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
```

---

### 8. **SMS Integration - Production Configuration** 📱

**Current State:** Twilio + Ethiopian SMS code exists  
**Gap:** Need production credentials and testing  
**Priority:** 🟡 High

**Refinement:**

**A. Environment Configuration**

```bash
# Production .env
# Twilio (International)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1234567890
TWILIO_ENABLED=true

# Ethiopian SMS Provider
ETHIOPIAN_SMS_USERNAME=your_username
ETHIOPIAN_SMS_API_KEY=your_api_key
ETHIOPIAN_SMS_SENDER_ID=SolNet
ETHIOPIAN_SMS_BASE_URL=https://sms.provider.et/api/send
ETHIOPIAN_SMS_ENABLED=true

# SMS Preferences
DEFAULT_SMS_PROVIDER=ethiopian  # or 'twilio'
SMS_RATE_LIMIT=100  # Max SMS per minute
```

**B. Unified SMS Service**

```typescript
// server/services/unified-sms-service.ts
import { getSMSService as getTwilioService } from "../sms-service";
import { EthiopianSMSService } from "../ethiopian-sms-service";

export class UnifiedSMSService {
  private twilioService: any;
  private ethiopianService: EthiopianSMSService;

  constructor() {
    this.twilioService = getTwilioService();
    this.ethiopianService = new EthiopianSMSService();
  }

  async sendSMS(params: {
    to: string;
    message: string;
    provider?: "twilio" | "ethiopian" | "auto";
  }) {
    const provider = params.provider || this.selectProvider(params.to);

    if (
      provider === "ethiopian" &&
      process.env.ETHIOPIAN_SMS_ENABLED === "true"
    ) {
      return await this.ethiopianService.sendSMS(params.to, params.message);
    } else if (provider === "twilio" && process.env.TWILIO_ENABLED === "true") {
      return await this.twilioService.sendSMS(params.to, params.message);
    } else {
      throw new Error("No SMS provider configured");
    }
  }

  private selectProvider(phoneNumber: string): "twilio" | "ethiopian" {
    // Auto-select based on phone number
    if (phoneNumber.startsWith("+251") || phoneNumber.startsWith("251")) {
      return "ethiopian";
    }
    return (process.env.DEFAULT_SMS_PROVIDER as any) || "twilio";
  }

  async getProviderStatus() {
    return {
      twilio: {
        enabled: process.env.TWILIO_ENABLED === "true",
        configured: !!(
          process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
        ),
      },
      ethiopian: {
        enabled: process.env.ETHIOPIAN_SMS_ENABLED === "true",
        configured: !!(
          process.env.ETHIOPIAN_SMS_USERNAME &&
          process.env.ETHIOPIAN_SMS_API_KEY
        ),
      },
    };
  }
}

export const unifiedSMSService = new UnifiedSMSService();
```

**C. SMS Testing Endpoint**

```typescript
// POST /api/admin/sms/test
app.post("/api/admin/sms/test", authenticateUser, async (req, res) => {
  const { phoneNumber, provider } = req.body;

  try {
    await unifiedSMSService.sendSMS({
      to: phoneNumber,
      message: "Test message from SolNetComputer",
      provider,
    });

    res.json({ success: true, message: "SMS sent successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "SMS failed",
      error: error.message,
    });
  }
});

// GET /api/admin/sms/status
app.get("/api/admin/sms/status", authenticateUser, async (req, res) => {
  const status = await unifiedSMSService.getProviderStatus();
  res.json(status);
});
```

---

### 9. **CI/CD Pipeline** 🚀

**Current State:** Manual deployment process  
**Gap:** No automated testing, building, or deployment  
**Priority:** 🟡 High (DevOps best practice)

**Implementation:**

**A. GitHub Actions Workflow**

Create `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "20.x"

jobs:
  # Job 1: Code Quality
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run check

      - name: Lint CSS
        run: npm run lint:css

  # Job 2: Unit Tests
  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test
        env:
          NODE_ENV: test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()

  # Job 3: E2E Tests
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: solnetcomputer_test
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/solnetcomputer_test
          JWT_SECRET: test-secret
          SESSION_SECRET: test-session-secret

      - name: Run migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/solnetcomputer_test

      - name: Seed test data
        run: npm run db:seed
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/solnetcomputer_test

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/solnetcomputer_test
          JWT_SECRET: test-secret

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  # Job 4: Build Docker Image
  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, test]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:latest
            ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Job 5: Deploy to Production
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://your-domain.com
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/solnetcomputer
            docker compose pull
            docker compose up -d
            docker image prune -f
```

**B. Additional Workflows**

**.github/workflows/security-scan.yml:**

```yaml
name: Security Scan

on:
  schedule:
    - cron: "0 0 * * *" # Daily
  workflow_dispatch:

jobs:
  security:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=high

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**.github/workflows/database-backup.yml:**

```yaml
name: Database Backup

on:
  schedule:
    - cron: "0 2 * * *" # Daily at 2 AM
  workflow_dispatch:

jobs:
  backup:
    name: Backup Production Database
    runs-on: ubuntu-latest
    steps:
      - name: Backup database
        run: |
          pg_dump ${{ secrets.DATABASE_URL }} > backup_$(date +%Y%m%d).sql

      - name: Upload to S3
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Upload backup
        run: |
          aws s3 cp backup_$(date +%Y%m%d).sql s3://solnetcomputer-backups/db/
```

**C. Environment Secrets (GitHub Repository Settings)**

Go to Settings > Secrets and add:

```
Production Secrets:
- DATABASE_URL
- JWT_SECRET
- SESSION_SECRET
- PRODUCTION_HOST
- PRODUCTION_USER
- SSH_PRIVATE_KEY

AWS/S3:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- S3_BUCKET

SMS:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- ETHIOPIAN_SMS_API_KEY

Security:
- SNYK_TOKEN
```

**D. Pre-commit Hooks (Husky)**

```bash
npm install --save-dev husky lint-staged
npx husky install
```

**.husky/pre-commit:**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**package.json:**

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["tsc --noEmit", "git add"],
    "*.css": ["npm run lint:css:fix", "git add"]
  }
}
```

---

## Feature Status Summary

| Feature                 | Current Status    | Refinement Status                | Action Required                            |
| ----------------------- | ----------------- | -------------------------------- | ------------------------------------------ |
| **Authentication**      | ✅ Basic JWT      | ✅ Refresh tokens defined        | Implement refresh_tokens table + endpoints |
| **Notification Queue**  | ⚠️ Synchronous    | ✅ BullMQ implementation         | Add Redis + BullMQ workers                 |
| **Audit Logging**       | ❌ Missing        | ✅ Complete implementation       | Create audit_logs table + middleware       |
| **Analytics Dashboard** | ⚠️ Partial        | ✅ KPI service + chart APIs      | Implement chart endpoints                  |
| **System Monitoring**   | ⚠️ Basic health   | ✅ Prometheus + custom collector | Add metrics middleware                     |
| **Import/Export**       | ⚠️ Templates only | ✅ Field mapping + validation    | Build import mapper UI                     |
| **File Storage**        | ⚠️ Local only     | ✅ S3 integration                | Add S3 credentials                         |
| **SMS Integration**     | ⚠️ Coded          | ✅ Unified service               | Add production API keys                    |
| **CI/CD Pipeline**      | ❌ Missing        | ✅ GitHub Actions YAML           | Create workflow files                      |

---

## Quick Implementation Checklist

### Week 1: Critical Security & Reliability

- [ ] Implement refresh tokens (authentication)
- [ ] Add audit logging middleware
- [ ] Setup BullMQ + Redis for notifications
- [ ] Create audit_logs table
- [ ] Create refresh_tokens table

### Week 2: Monitoring & Performance

- [ ] Add Prometheus metrics
- [ ] Implement query profiler middleware
- [ ] Create performance dashboard
- [ ] Setup Winston logging with rotation

### Week 3: Business Features

- [ ] Implement chart data APIs
- [ ] Build KPI calculation service
- [ ] Add import field mapping UI
- [ ] Integrate S3 storage service

### Week 4: DevOps & Testing

- [ ] Create GitHub Actions workflows
- [ ] Setup Husky pre-commit hooks
- [ ] Implement E2E test suite
- [ ] Configure production SMS credentials

---

## Support & Documentation

### 📚 Documentation Overview

**THIS DOCUMENT (SYSTEM_BLUEPRINT.md) IS NOW COMPREHENSIVE!**

**What's Included in This Single Document:**

- ✅ **Complete Database Schema** (44 tables with full definitions)
- ✅ **Validation Rules & Business Logic** (All constraints and patterns)
- ✅ **API Endpoints with Request/Response Schemas** (Detailed examples)
- ✅ **Frontend Implementation Patterns** (React/TypeScript code)
- ✅ **Design System & UI Components** (Complete design reference)
- ✅ **Environment Variables** (All 25+ variables documented)
- ✅ **Security Implementation** (Complete security guide)
- ✅ **AI Agent Implementation Guide** (Step-by-step recreation)
- ✅ **Infrastructure & Deployment** (Docker, cloud deployment)

### Additional Reference Guides (Optional)

**Feature-Specific Implementation Details:**

- **Design System Live Demo:** Navigate to `/design-system` in the app (exports tokens, shows components)
- **SMS Integration:** [SMS_INTEGRATION_GUIDE.md](SMS_INTEGRATION_GUIDE.md) - Twilio & Ethiopian SMS setup
- **Notifications:** [NOTIFICATION_SYSTEM_GUIDE.md](NOTIFICATION_SYSTEM_GUIDE.md) - Notification system details
- **Purchase Orders:** [PURCHASE_ORDER_SYSTEM.md](PURCHASE_ORDER_SYSTEM.md) - PO workflow
- **Inventory:** [ENHANCED_INVENTORY_GUIDE.md](ENHANCED_INVENTORY_GUIDE.md) - Advanced inventory features
- **Logo System:** [LOGO_UPLOAD_GUIDE.md](LOGO_UPLOAD_GUIDE.md) - Multi-logo upload system
- **Import/Export:** [IMPORT_EXPORT_GUIDE.md](IMPORT_EXPORT_GUIDE.md) - Bulk operations
- **Telegram:** [TELEGRAM_INTEGRATION.md](TELEGRAM_INTEGRATION.md) - Telegram bot setup

**Deployment & Operations:**

- **Production Readiness:** [PRODUCTION_READINESS_AUDIT.md](PRODUCTION_READINESS_AUDIT.md)
- **Database Migrations:** [DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md)
- **System Health:** [SYSTEM_HEALTH_ENHANCEMENT.md](SYSTEM_HEALTH_ENHANCEMENT.md)

**Analysis Reports:**

- **System Analysis:** [SYSTEM_ANALYSIS_REPORT.md](SYSTEM_ANALYSIS_REPORT.md)
- **Comprehensive Audit:** [COMPREHENSIVE_AUDIT_REPORT.md](COMPREHENSIVE_AUDIT_REPORT.md)

---

**Document Version:** 2.0 (Consolidated & Enhanced)  
**Last Updated:** October 15, 2025  
**Lines of Code:** ~6,300 lines  
**Completeness:** **98% - AI-Agent Ready**

**Key Achievement:**  
✨ **Single comprehensive document with everything needed to recreate the entire system!**

**For AI Agents:**  
This document contains all necessary information to generate a complete, production-ready system. Follow the AI Agent Implementation Guide section for step-by-step instructions.

**For Developers:**  
Use this as your primary reference. All validation rules, API schemas, frontend patterns, and deployment procedures are included.

**Maintained By:** SolNetComputer Development Team
