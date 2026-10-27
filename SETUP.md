# CCCP_Amazon — Multi-Vendor Marketplace
## Complete Setup Guide & Credentials

---

## Prerequisites

Before you start, install these on your laptop:

| Software | Download | Why |
|---|---|---|
| **Node.js LTS** (v20+) | https://nodejs.org | Runs the server and client |
| **MySQL** | https://dev.mysql.com/downloads/mysql/ | Database — **OR** use XAMPP (easier) |
| **XAMPP** (easier option) | https://apachefriends.org | Bundles MySQL with a GUI control panel |
| **Git** | https://git-scm.com | Clone the repository |

> **Tip:** If you're on Windows, XAMPP is the easiest way to get MySQL running. Install it, open XAMPP Control Panel, and click **Start** next to MySQL.

---

## Quick Start (5 minutes)

### Step 1 — Clone the repository
Open Command Prompt or PowerShell and run:
```
git clone https://github.com/YOUR_USERNAME/CCCP_Amazon.git
cd CCCP_Amazon
```

### Step 2 — Run the setup script
Double-click **`setup.bat`** in the project folder, or run:
```
setup.bat
```

The script will:
1. Check Node.js and MySQL are installed
2. Create `.env` files from templates
3. Install all npm dependencies (server + client)
4. Ask you to confirm, then set up the database and seed demo data

### Step 3 — Edit `server/.env` (IMPORTANT)

Open `server/.env` in Notepad and update the MySQL connection:

**If using XAMPP (default settings):**
```
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=cccp_amazon
```

**If using MySQL Workbench or custom install:**
```
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=cccp_amazon
```

### Step 4 — Start the app

Double-click **`start-app.bat`** or run it from Command Prompt.

This opens two terminal windows (backend + frontend) and launches your browser at http://localhost:5173

---

## Login Credentials

All accounts are pre-seeded by the setup script. Use these to log in.

### 👑 Super Admin (Business Owner)
> Full control over the marketplace — approves shops, manages payouts, sets commission rates

| Field | Value |
|---|---|
| **Email** | `superadmin@cccp.com` |
| **Password** | `SuperAdmin123!` |
| **URL after login** | Go to: http://localhost:5173/superadmin |
| **Or** | Click "Business Portal" in the account dropdown |

**What you can do:**
- Review and approve / reject / suspend seller shops
- Set commission rates per product category
- Approve sponsored product boost campaigns
- Release vendor payouts from the ledger
- Force refunds on disputed orders
- View GMV, platform revenue, take rate, and top stores

---

### 💻 Developer (DevSecOps)
> Infrastructure monitoring — zero access to business data or customer info

| Field | Value |
|---|---|
| **Email** | `dev@cccp.com` |
| **Password** | `DevOps123!` |
| **URL after login** | Go to: http://localhost:5173/dev |
| **Or** | Click "Dev Dashboard" in the account dropdown |

**What you can see:**
- Database connection pool stats (active/idle/waiting connections)
- Node.js heap memory and CPU load charts
- Tail of server error and combined logs
- List of all database tables with row counts
- Sequelize migration history

---

### 🛍️ Seller Accounts (10 pre-approved shops)

All sellers have: password = `Seller123!`
After login, click **"Seller Portal"** in the account dropdown or go to http://localhost:5173/seller

| # | Name | Email | Shop Name | Category Focus |
|---|---|---|---|---|
| 1 | Alex Rivera | `seller1@cccp.com` | TechVault | Laptops, Smartphones |
| 2 | Priya Sharma | `seller2@cccp.com` | SoundWave Store | Audio & Headphones |
| 3 | Sofia Chen | `seller3@cccp.com` | FashionForward | Women's Fashion |
| 4 | James Okafor | `seller4@cccp.com` | ManStyle Co. | Men's Fashion |
| 5 | Maria Gonzalez | `seller5@cccp.com` | HomeNest Living | Home & Kitchen |
| 6 | Chris Thompson | `seller6@cccp.com` | FitGear Pro | Sports & Fitness |
| 7 | Kevin Park | `seller7@cccp.com` | NovaTech Mobiles | Smartphones |
| 8 | Emma Watson | `seller8@cccp.com` | ReadMore Books | Books |
| 9 | Aisha Patel | `seller9@cccp.com` | GlowUp Beauty | Beauty & Skincare |
| 10 | Liam Murphy | `seller10@cccp.com` | GadgetDen | Smart Home Gadgets |

**What sellers can do in their portal:**
- View and manage their own products (not other sellers')
- Update order fulfillment status (PROCESSING → PACKED → SHIPPED → DELIVERED)
- Submit product boost requests for sponsored placement
- View their escrow balance and available payout balance

---

### 👤 Customer Accounts (3 pre-seeded)

All customers have: password = `Customer123!`

| Name | Email | City |
|---|---|---|
| John Doe | `customer@cccp.com` | Seattle, WA |
| Sarah Johnson | `sarah@cccp.com` | New York, NY |
| Mike Chen | `mike@cccp.com` | San Francisco, CA |

**What customers can do:**
- Browse all products from all sellers
- Add to cart, apply coupon codes, checkout
- Track orders and request returns
- Write reviews, ask product questions
- Add to wishlist

---

### 🎟️ Coupon Codes (for checkout testing)

| Code | Type | Value | Min Order |
|---|---|---|---|
| `WELCOME10` | 10% off | up to $100 | $50 |
| `SAVEMORE20` | $20 fixed off | — | $150 |
| `NEWSHOP15` | 15% off | up to $50 | $75 |

---

## Full Feature Walkthrough

### How to test new seller registration + Super Admin approval

1. Register a new account at http://localhost:5173/register
2. After registering, log in — your role is `CUSTOMER` by default
3. **To make it a SELLER**, you need to update the role in MySQL:
   ```sql
   UPDATE users SET role = 'SELLER' WHERE email = 'your@email.com';
   ```
4. Log back in → click "Seller Portal" → click "Register Shop"
5. Fill in the shop details and submit
6. Log out, then log in as `superadmin@cccp.com`
7. Go to http://localhost:5173/superadmin/shops
8. Find the new shop in the PENDING queue and click **Approve**
9. Log back in as the seller — the shop is now ACTIVE and products can be added

> **Is this dynamic?** Yes. New sellers register → shop goes PENDING → Super Admin approves/rejects. All live in the database. The approval immediately activates the seller's ability to list products.

---

### How to test the product boost workflow

1. Log in as any seller (e.g., `seller2@cccp.com`)
2. Go to Seller Portal → Boost Campaigns
3. Select a product, set a budget ($50), set duration (7 days), submit
4. Log out, log in as Super Admin (`superadmin@cccp.com`)
5. Go to http://localhost:5173/superadmin/boosts
6. Find the REQUESTED boost → set approval duration → click Approve
7. The product now shows a **"Sponsored"** badge on the marketplace
8. In product search, boosted items rank above organic results

---

### How to test the escrow + payout flow

1. Log in as a customer, add a seller's product to cart, checkout
2. Log in as that seller → go to Seller Portal → Orders
3. Advance the order status to DELIVERED
4. Wait for the escrow scheduler (runs every hour, or restart the server to trigger immediately on startup)
5. After 7 days (configurable in Super Admin → Settings), the seller's `availableBalance` increases
6. Log in as Super Admin → go to http://localhost:5173/superadmin/payouts
7. Click **Release Payout** to disburse funds

---

## Database Notes

### What tables exist after setup

The seeder runs `sequelize.sync({ force: true })` which **drops and recreates all tables**. After running `--seed` you will have:

| Table | Contents |
|---|---|
| `users` | 15 users (1 super admin, 1 developer, 10 sellers, 3 customers) |
| `shops` | 10 active shops |
| `products` | ~35 products across all shops |
| `platform_settings` | 1 row (global config) |
| `category_commissions` | 10 rows (one per category) |
| `categories` | 10 categories |
| `coupons` | 3 coupon codes |
| All other tables | Empty — populated as you use the app |

### Re-seeding (resetting to fresh state)

To wipe and re-seed at any time:
```
cd server
node scripts/migrate.js --seed
```

> **Warning:** This deletes ALL data. Only use on a development machine.

### Adding new categories or commission rates

Log in as Super Admin → go to **Commission Rates** → add a new category rate.
Categories are managed by Super Admin only (sellers cannot create new categories).

---

## Architecture Overview

```
CCCP_Amazon/
├── client/          React 18 + Vite + Redux Toolkit + Tailwind
│   └── src/
│       ├── pages/
│       │   ├── customer/    Storefront (browse, cart, checkout, orders)
│       │   ├── admin/       Legacy admin panel (product/inventory/order mgmt)
│       │   ├── seller/      Seller portal (orders, products, boosts, balance)
│       │   ├── superadmin/  Business owner portal (KYC, commissions, GMV)
│       │   └── dev/         Developer dashboard (DB pools, logs, vitals)
│       └── routes/
│           ├── ProtectedRoute.jsx   Requires login
│           ├── AdminRoute.jsx       Requires SELLER or SUPER_ADMIN
│           ├── SellerRoute.jsx      Requires SELLER
│           ├── SuperAdminRoute.jsx  Requires SUPER_ADMIN
│           └── DevRoute.jsx         Requires DEVELOPER
│
└── server/          Node.js + Express + Sequelize + MySQL
    └── src/
        ├── models/          33 Sequelize models
        ├── routes/          15 route files (incl. /seller, /superadmin, /dev)
        ├── services/        Business logic layer
        ├── controllers/     Request handlers
        ├── middlewares/     Auth, RBAC, rate limit, validation, upload
        └── scheduler/       Hourly escrow settlement + boost expiry
```

---

## Common Issues & Fixes

| Problem | Fix |
|---|---|
| `ECONNREFUSED` on server start | MySQL is not running. Start XAMPP → MySQL, or start MySQL service |
| `ER_BAD_DB_ERROR: Unknown database 'cccp_amazon'` | Run `setup.bat` again — the seeder creates the DB structure |
| `JWT_SECRET must be at least 16 characters` | Edit `server/.env` and set a longer `JWT_SECRET` value |
| Port 5000 already in use | Change `PORT=5001` in `server/.env` and update `VITE_API_BASE_URL` in `client/.env` |
| Port 5173 already in use | Vite will auto-pick the next port (5174) — check the terminal output |
| Seller portal shows "No shop" error | The shop may be PENDING. Log in as Super Admin and approve it |
| Images not loading | The app uses Unsplash URLs — requires an internet connection to display product images |

---

## What's NOT implemented (future work)

- Real payment gateway (currently mocked — no actual Stripe/PayPal charges)
- Email notifications (no SMTP configured — notifications are in-app only)
- Cloud image storage (product images are uploaded to `server/uploads/` locally)
- PWA / mobile app
- Real-time chat between buyer and seller

---

*Generated by CCCP_Amazon setup. For issues, contact the project maintainer.*
