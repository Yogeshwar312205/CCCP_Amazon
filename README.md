# Amazon-Inspired Full-Stack Enterprise E-Commerce Platform

A production-ready, full-stack Amazon-inspired e-commerce platform featuring a modern **React Customer E-Commerce Store** and an enterprise-grade **React Admin Management Dashboard**, powered by a high-concurrency **Node.js/Express REST API**, **Sequelize ORM**, and **MySQL 8+**.

---

## 🌟 Tech Stack

### Frontend (`/client`)
- **Framework**: React 18, Vite (Fast build & HMR)
- **Styling & UI**: Tailwind CSS, Lucide React Icons
- **State Management**: Redux Toolkit (Auth, Products, Cart, Wishlist, Orders, Notifications, Admin)
- **Routing**: React Router v6 (Nested Admin layouts, Protected customer & admin guards)
- **HTTP Client**: Axios with JWT request & 401 response interceptors
- **Visualizations**: Recharts (Revenue trends, sales analytics)
- **Production Serving**: Nginx reverse proxy, Gzip compression, asset caching

### Backend (`/server`)
- **Runtime**: Node.js v20+, Express.js
- **Database & ORM**: MySQL 8.0+, Sequelize ORM (27 fully indexed relational models)
- **Concurrency & Transactions**: Pessimistic row-level locking (`SELECT ... FOR UPDATE`), atomic ACID transactions
- **Auth & RBAC**: JWT (JSON Web Tokens), bcryptjs password hashing, role-based access control (`CUSTOMER`, `ADMIN`, `SUPER_ADMIN`)
- **Security**: Helmet HTTP headers, CORS whitelisting, express-rate-limit (100 req/15min globally, 5 req/min on `/auth`), Multer validation (5MB max, JPEG/PNG/WebP)
- **Auditing & Monitoring**: Immutable `AuditLog` engine for all administrative mutations, structured Winston logging (`combined.log`, `error.log`), and comprehensive `/api/v1/health` monitoring

---

## 📁 Repository Documentation

Comprehensive architectural design and engineering specifications:

- [ARCHITECTURE.md](file:///d:/CCCP_Amazon/ARCHITECTURE.md) - System architecture, component hierarchy, directory layout, security model, and transaction locking.
- [DATABASE.md](file:///d:/CCCP_Amazon/DATABASE.md) - Detailed specification of all **27 MySQL tables**, columns, data types, indexes, foreign keys, and ER diagram.
- [API.md](file:///d:/CCCP_Amazon/API.md) - Complete REST API specification with endpoints, request payloads, Zod schemas, HTTP status codes, and access roles.
- [FEATURES.md](file:///d:/CCCP_Amazon/FEATURES.md) - Full feature breakdown across customer and admin domains with role permission matrix.
- [IMPLEMENTATION_PLAN.md](file:///d:/CCCP_Amazon/IMPLEMENTATION_PLAN.md) - Complete 7-Phase roadmap and technical milestones.

---

## 🔐 Default Seed Credentials

After executing the database migration/seed script, the following accounts are initialized:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@amazon.com` | `SuperAdmin123!` | Full Admin Portal, Immutable Audit Logs, Store Settings |
| **Admin** | `admin@amazon.com` | `Admin123!` | Catalog Management, Orders, Inventory, Returns, Coupons |
| **Customer** | `customer@amazon.com` | `Customer123!` | Customer Store, Cart, Wishlist, Checkout, Reviews |

---

## 🚀 Quick Start — Local Development

### Prerequisites
- **Node.js**: v18.x or higher (tested on Node v20/v22)
- **MySQL Server**: v8.0 or higher running on `localhost:3306`
- **npm**: package manager

### 1. Database Setup
Ensure MySQL is running and initialize the database:
```sql
CREATE DATABASE cccp_amazon DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup
```bash
cd server
npm install

# Configure environment variables (or copy .env.example)
cp .env.example .env

# Run safe database migration & schema sync (verifies all 27 models)
npm run migrate

# Optional: populate seed products, categories, coupons, and test accounts
npm run seed

# Start backend development server (Port 5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install

# Start Vite development server (Port 5173)
npm run dev
```

Visit `http://localhost:5173` to explore the application.

---

## 🏭 Production Deployment

### Option A: Docker Compose (Recommended)

Run the entire stack (MySQL 8 database, Node.js API, and Nginx React SPA) with a single command:

```bash
docker-compose up -d --build
```

- **Frontend**: `http://localhost` (Port 80)
- **Backend API**: `http://localhost:5000/api/v1`
- **Health Check**: `http://localhost:5000/api/v1/health`
- **MySQL**: Internal network `mysql:3306` (host mapped to `3306:3306`)

### Option B: PM2 Cluster & Production Build

#### 1. Build Frontend
```bash
cd client
npm run build
# Output bundle is generated in client/dist
```

#### 2. Start Backend with PM2
```bash
cd server
npm ci --only=production
npm run migrate

# Start in cluster mode across all CPU cores
npx pm2 start ecosystem.config.js --env production

# View process status & logs
npx pm2 status
npx pm2 logs cccp-amazon-api
```

---

## 🩺 System Health Monitoring

The API provides a public health check endpoint for container orchestrators, load balancers, and monitoring systems:

```bash
curl http://localhost:5000/api/v1/health
```

### Sample Response (`200 OK`):
```json
{
  "success": true,
  "status": "HEALTHY",
  "message": "CCCP Amazon API is operational",
  "timestamp": "2026-10-02T01:05:00.000Z",
  "environment": "production",
  "system": {
    "uptime": {
      "seconds": 8420,
      "formatted": "2h 20m 20s"
    },
    "memory": {
      "rssMB": "72.45",
      "heapTotalMB": "38.12",
      "heapUsedMB": "26.84"
    },
    "nodeVersion": "v22.13.0",
    "platform": "win32",
    "pid": 12840
  },
  "database": {
    "status": "CONNECTED",
    "latencyMs": 2,
    "dialect": "mysql"
  },
  "latencyMs": 3
}
```

---

## 🛡️ Enterprise Security & Governance

1. **Zero-Trust Checkout**:
   - Total calculation performed authoritatively on backend.
   - Row-level database locking (`SELECT ... FOR UPDATE`) prevents inventory overselling during concurrent checkouts.
2. **Immutable Audit Trail**:
   - Every administrative mutation (product changes, inventory overrides, order tracking updates, returns/refund processing) is logged in the `audit_logs` table with admin ID, IP address, user agent, old values, and new values.
   - Restricted strictly to `SUPER_ADMIN`.
3. **Notification Engine**:
   - Customer header includes real-time notification bell with polling counter and mark-as-read interactions.
4. **Rate Limiting & Input Sanitization**:
   - Express rate limiting blocks brute-force authentication (5 req/min on `/auth/login` and `/auth/register`).
   - Global rate limiter (100 req/15min).
   - Strict Zod schema validation on all incoming payloads.

---

## 🧪 Testing & Verification

Run backend integration test suite:
```bash
# Verify Phase 6 & Phase 7 features (Auth, RBAC, Notifications, Audit Logs, Rate Limiting)
node scratch/test_phase6.js

# Test database migration runner
cd server && npm run migrate
```

Verify frontend build:
```bash
cd client && npm run build
```

---

## 📄 License
ISC License. Built for enterprise demonstration and production reference.
