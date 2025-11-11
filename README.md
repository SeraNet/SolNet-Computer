# SolNet Management System

> A comprehensive business management platform for device repair shops, retail stores, and service providers.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791.svg)](https://www.postgresql.org/)

## 🚀 Features

- **Device Management**: Track device registrations, repairs, and service history
- **Point of Sale**: Complete POS system with inventory management
- **Customer Management**: CRM with detailed customer profiles and history
- **Inventory Tracking**: Real-time stock management with low-stock alerts
- **Analytics Dashboard**: Comprehensive business intelligence and reporting
- **Multi-location Support**: Manage multiple branches with centralized control
- **SMS Notifications**: Automated customer notifications with queue system
- **User Roles & Permissions**: Admin, Technician, and Sales role management
- **Dark Mode**: Full dark mode support throughout the application

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **PostgreSQL**: 14.x or higher
- **npm** or **yarn**: Latest version

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd SolNetManage4
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the environment template and configure it:

```bash
cp env.template .env
```

Edit `.env` and configure the following **required** variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/solnetmanage

# Security (REQUIRED - use strong random values)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
CORS_ORIGINS=http://localhost:5173,http://localhost:5000

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Optional configurations**:

```bash
# SMS Configuration (Ethiopian providers)
ETHIOPIAN_SMS_USERNAME=your_ethiopian_sms_username
ETHIOPIAN_SMS_API_KEY=your_ethiopian_sms_api_key
ETHIOPIAN_SMS_SENDER_ID=SolNet
ETHIOPIAN_SMS_BASE_URL=https://sms.ethiotelecom.et/api/send

# Or use Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+1234567890

# Debug Logging (disable in production)
ENABLE_DEBUG_LOGS=false
VITE_ENABLE_DEBUG_LOGS=false
```

### 4. Setup Database

Run the database migrations:

```bash
npm run db:migrate
```

(Optional) Seed demo data for testing:

```bash
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
SolNetManage4/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components and routes
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   └── styles/        # CSS and styling
├── server/                # Express backend API
│   ├── middleware/        # Express middleware
│   ├── utils/             # Server utilities
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                # Shared code between client/server
│   └── schemas/           # Database schemas and types
├── migrations/            # Database migration files
└── scripts/               # Utility scripts
```

## 🔐 Security Features

### Authentication
- JWT-based authentication with 8-hour expiration
- Secure password hashing with bcrypt
- Rate limiting on login endpoints (5 attempts per 15 minutes)
- Token verification on protected routes

### Authorization
- Role-based access control (Admin, Technician, Sales)
- Location-based data filtering
- Permission-based feature access

### Data Protection
- Input sanitization and validation
- SQL injection prevention via Drizzle ORM
- CORS protection with whitelisted origins
- File upload validation with magic byte verification
- Comprehensive error handling without information leakage

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login (rate limited)
- `GET /api/auth/verify` - Verify JWT token

### Customers
- `GET /api/customers` - List customers (supports pagination)
- `POST /api/customers` - Create customer (validated)
- `PUT /api/customers/:id` - Update customer (validated)
- `GET /api/customers/:id` - Get customer details

### Devices
- `GET /api/devices` - List devices (supports pagination)
- `POST /api/devices` - Register new device
- `PUT /api/devices/:id` - Update device status
- `GET /api/devices/:id` - Get device details

### Sales & POS
- `GET /api/sales` - List sales (supports pagination)
- `POST /api/sales` - Create sale
- `GET /api/sales/today` - Today's sales

### Analytics
- `GET /api/analytics` - Overview analytics
- `GET /api/analytics/expense-types` - Expense breakdown
- `GET /api/analytics/budget-analysis` - Budget vs actual
- `GET /api/analytics/cash-flow-projections` - Cash flow forecasts

### SMS Queue (Admin only)
- `GET /api/sms/queue` - View SMS queue
- `GET /api/sms/queue/stats` - Queue statistics
- `POST /api/sms/retry/:id` - Retry failed SMS
- `DELETE /api/sms/queue/:id` - Cancel queued SMS

### Import/Export (Admin only)
- `POST /api/import/customers` - Import customers (supports dry-run)
- `POST /api/import/inventory` - Import inventory
- `POST /api/export/customers` - Export customers to Excel

**Note**: All endpoints support `?page=1&limit=50` for pagination where applicable.

## 🔄 SMS Queue System

The system includes a robust SMS delivery mechanism with automatic retry:

- Messages are queued for delivery instead of sent immediately
- Background processor runs every 30 seconds
- Automatic retry up to 3 times for failed messages
- Admin interface to view and manually retry failed SMS
- Detailed error logging for troubleshooting

## 📊 Database Migrations

### Running Migrations

```bash
npm run db:migrate
```

### Available Migrations

- **Initial Schema**: Core tables (users, customers, devices, etc.)
- **SMS Queue**: `migrations/add_sms_queue.sql`
- **Performance Indexes**: `migrations/add_performance_indexes.sql`

### Analyzing Performance

Check query performance and index usage:

```bash
npx tsx scripts/analyze-query-performance.ts
```

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Manual Testing

Sample test credentials:
- **Admin**: Check your seeded data or create via database

## 📦 Production Deployment

### 1. Prepare Environment

Copy production template:

```bash
cp env.production.template .env
```

Configure all **REQUIRED** variables:
- `DATABASE_URL` - Your production database
- `JWT_SECRET` - Generate strong random string (min 32 characters)
- `CORS_ORIGINS` - Your production domain(s)
- `NODE_ENV=production`

### 2. Build Application

```bash
npm run build
```

### 3. Run Production Server

```bash
npm start
```

### 4. Database Setup

Run migrations on production database:

```bash
NODE_ENV=production npm run db:migrate
```

### 5. Security Checklist

- [ ] JWT_SECRET is strong and unique (min 32 characters)
- [ ] CORS_ORIGINS includes only your domains
- [ ] Database credentials are secure
- [ ] Debug logs are disabled (`ENABLE_DEBUG_LOGS=false`)
- [ ] HTTPS is configured (recommended)
- [ ] Firewall rules are in place
- [ ] Regular backups are configured

## 🐛 Troubleshooting

### Server won't start

**Issue**: `JWT_SECRET environment variable is required`  
**Solution**: Set `JWT_SECRET` in your `.env` file with a secure random string (min 32 characters)

```bash
# Generate a strong secret (Linux/Mac)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### CORS Errors

**Issue**: `Not allowed by CORS`  
**Solution**: Add your frontend URL to `CORS_ORIGINS` in `.env`:

```bash
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### SMS Not Sending

**Issue**: SMS messages not being delivered  
**Solution**: 
1. Check SMS queue: `GET /api/sms/queue?status=failed`
2. Verify SMS credentials in `.env`
3. Check server logs for errors
4. Manually retry failed messages via admin interface

### Database Connection Failed

**Issue**: Cannot connect to database  
**Solution**:
1. Verify `DATABASE_URL` format: `postgresql://user:password@host:port/database`
2. Ensure PostgreSQL is running: `pg_isready`
3. Check database exists: `psql -l`
4. Verify firewall allows connection

### Import Validation Errors

**Issue**: Import fails with validation errors  
**Solution**:
1. Use dry-run mode first: Add `?dryRun=true` to import request
2. Fix validation errors shown in response
3. Ensure phone numbers match Ethiopian format
4. Verify all required fields are present

## 📚 Additional Documentation

- **System Blueprint**: See `SYSTEM_BLUEPRINT.md`
- **Database Schema**: See `shared/schemas/`
- **API Documentation**: See `API_DOCS.md` (if available)
- **Deployment Guide**: See `DEPLOYMENT.md` (below)

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start dev server (client + API)
npm run dev:client       # Start client only
npm run dev:server       # Start server only

# Building
npm run build            # Build for production
npm run check            # TypeScript check

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed demo data
npm run db:reset         # Reset database (dev only)
npm run db:verify        # Verify tables exist
npm run db:indexes       # Apply performance indexes

# Linting
npm run lint:css         # Lint CSS files
npm run lint:css:fix     # Fix CSS issues
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues and questions:
- Check the troubleshooting section above
- Review documentation files
- Check server logs: `tail -f logs/app.log`
- Contact system administrator

---

**Version**: 2.0  
**Last Updated**: October 2025  
**Status**: Production Ready ✅
















