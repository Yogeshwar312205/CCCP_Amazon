# FEATURES.md - Complete Feature Specifications & Roles Matrix

## 1. User Roles & Permission Matrix

The application supports three distinct user roles with clear access boundaries enforced via Backend RBAC Middleware (`rbac.middleware.js`) and Frontend Protected Route Guards (`AdminRoute.jsx`, `ProtectedRoute.jsx`).

| Feature / Domain | CUSTOMER | ADMIN | SUPER_ADMIN |
| :--- | :---: | :---: | :---: |
| Product & Category Browsing | ✅ | ✅ | ✅ |
| Account & Address Management | ✅ | ✅ | ✅ |
| Cart & Wishlist | ✅ | ❌ | ❌ |
| Checkout & Order Placement | ✅ | ❌ | ❌ |
| Submit Reviews & Ask Questions | ✅ | ❌ | ❌ |
| Request Returns & Refunds | ✅ | ❌ | ❌ |
| View Admin Dashboard & Analytics | ❌ | ✅ | ✅ |
| Product & Category CRUD | ❌ | ✅ | ✅ |
| Stock & Inventory Management | ❌ | ✅ | ✅ |
| Customer Order Status Updates | ❌ | ✅ | ✅ |
| Customer & Review Moderation | ❌ | ✅ | ✅ |
| Coupon & Discount Management | ❌ | ✅ | ✅ |
| Process Returns & Issue Refunds | ❌ | ✅ | ✅ |
| View Audit Logs | ❌ | ❌ | ✅ |
| System Settings & Admin Provisioning | ❌ | ❌ | ✅ |

---

## 2. Customer E-Commerce Website Specifications

### 2.1 Authentication & Profile
- **Registration / Login / Logout**: JWT-based session with secure client-side storage. Includes field validations, password match checks, and persistent state across page reloads.
- **Address Management**: Full CRUD operations for customer shipping & billing addresses. Allows marking default shipping and billing addresses.
- **Recently Viewed Products**: Tracks viewed products automatically for logged-in users and renders a dynamic horizontal slider on home/product pages.
- **Personalized Recommendations**: Algorithmic suggestions based on category affinity and active browsing context.

### 2.2 Catalog Browsing & Search Engine
- **Hierarchical Categories & Subcategories**: Multi-level navigation dropdown and sidebar filters.
- **Full-Text Product Search**: Keyword search across title, brand, SKU, and product descriptions with debounced input.
- **Multi-Facet Filters**: Filter products simultaneously by Category, Price Range (min-max slider), Brand, Average Rating, and Stock availability.
- **Sorting Options**: Sort by Price (Low to High, High to Low), Newest Arrivals, Customer Rating, and Popularity.
- **Pagination**: Server-side pagination with page size control and total item counts.
- **Product Details Page**:
  - Image gallery with thumbnail switching and zoom view.
  - Variant selector (color/size/capacity) with real-time price & stock updates.
  - Real-time stock status badge ("In Stock", "Only X Left", "Out of Stock").
  - Technical attributes table.
  - Customer review summary with rating breakdown bars.
  - Customer Q&A accordion.

### 2.3 Cart, Wishlist & Checkout
- **Cart Engine**: Dynamic cart calculation with real-time stock limits verification. Quantity adjust, item removal, and persistent cart storage.
- **Wishlist**: Toggle items in/out of wishlist with quick "Move to Cart" action.
- **Checkout Process**:
  - Multi-step checkout (Address selection -> Order summary -> Coupon code application -> Payment method selection).
  - Strict server-side price recalculation (zero-trust frontend total).
- **Mock Payment Gateway**: Simulates card processing, payment transaction creation, and immediate status feedback.
- **Out-of-Stock Notification Request**: Allow customers to request an alert when an out-of-stock item is replenished.

### 2.4 Orders, Tracking & Returns
- **Order Management**: Order history with filter by date/status.
- **Order Tracking**: Visual status timeline (Placed -> Processing -> Shipped -> Delivered) with tracking number and carrier details.
- **Returns & Refunds**: Request return for delivered orders with reason selection and text details. Real-time return status tracking.
- **Notifications Center**: In-app notifications for order updates, return status changes, and stock replenishment alerts.

---

## 3. Admin Dashboard & Management Specifications

### 3.1 Analytics & Insights Engine
- **Overview Dashboard**: Metrics widgets for Total Revenue, Total Orders, Active Customers, Low Stock Alerts, and Pending Returns.
- **Revenue Analytics**: Interactive line/bar charts (via Recharts) displaying daily/weekly/monthly revenue trends.
- **Order Analytics**: Status breakdown pie charts (Processing, Shipped, Delivered, Cancelled).
- **Customer Analytics**: New registrations vs repeat buyers analysis.

### 3.2 Inventory & Product Management
- **Product CRUD**: Rich product creation/editing modal with multiple image uploads, variant definitions, attribute specification, base/sale pricing.
- **Category CRUD**: Manage category hierarchies, slugs, parent categories, and category banner images.
- **Inventory Engine**:
  - Low-stock management page alerting on items below threshold.
  - Out-of-stock management page with quick restock action.
  - Manual inventory stock adjustments with mandatory audit transaction log entry.

### 3.3 Operations, Moderation & System Audit
- **Order Management**: View all customer orders, filter by status/date/customer, update order status, attach shipping tracking numbers.
- **Customer Management**: View customer directory, account status, total lifetime spend, toggle account activation state.
- **Review Moderation**: Approve or reject flagged product reviews before public visibility.
- **Coupon & Discount Management**: Create discount codes (Percentage or Fixed Amount) with date validity, minimum spend requirements, max discount caps, and usage limits.
- **Return & Refund Management**: Review customer return requests, inspect return reasons, approve/reject requests, and trigger atomic refund processing.
- **Audit Logs**: Immutable log history recording every admin action (product price edits, stock overrides, account bans, refund approvals) with admin user ID, timestamp, IP address, and changed payload.
- **Platform Settings**: Manage store metadata, tax rates, default shipping fees, and low-stock threshold defaults.
