# API.md - Complete REST API Specification

## 1. Overview & Conventions

- **Base URL**: `http://localhost:5000/api/v1`
- **Content-Type**: `application/json` (or `multipart/form-data` for file uploads)
- **Authentication**: `Authorization: Bearer <JWT_TOKEN>`
- **Response Format**:
  - Success: `{ "success": true, "message": "...", "data": { ... }, "meta": { ... } }`
  - Error: `{ "success": false, "message": "...", "error": { "code": "...", "details": [...] } }`

---

## 2. API Endpoint Catalog

### 2.1 Authentication (`/auth`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | None | Register new customer account |
| `POST` | `/auth/login` | Public | None | Authenticate customer/admin & return JWT |
| `GET` | `/auth/me` | User | Any | Get currently authenticated user profile |
| `POST` | `/auth/logout` | User | Any | Revoke / clear current session |

#### `POST /auth/register`
- **Request Body (Zod)**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "phone": "+1234567890"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": 1, "firstName": "John", "lastName": "Doe", "email": "john.doe@example.com", "role": "CUSTOMER" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2.2 Product Catalog & Categories (`/products`, `/categories`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/categories` | Public | None | Get category tree & subcategories |
| `GET` | `/products` | Public | None | Search & filter products (params: `search`, `category`, `minPrice`, `maxPrice`, `brand`, `rating`, `sort`, `page`, `limit`) |
| `GET` | `/products/featured` | Public | None | Get curated featured products |
| `GET` | `/products/recommendations` | Public | None | Get recommended products based on history/category |
| `GET` | `/products/:slug` | Public | None | Get detailed product by slug (with variants, attributes, images, stock) |
| `POST` | `/products/:id/recently-viewed` | User | CUSTOMER | Track product view in customer history |
| `GET` | `/users/recently-viewed` | User | CUSTOMER | Get user's recently viewed products |

#### Query Parameters for `GET /products`
- `search`: Keyword string (searches title & description)
- `category`: Category slug or ID
- `minPrice`, `maxPrice`: Numeric filter bounds
- `rating`: Minimum average rating (1 to 5)
- `sort`: `price_asc` \| `price_desc` \| `newest` \| `rating` \| `popularity`
- `page`: Page index (default: 1)
- `limit`: Items per page (default: 12)

---

### 2.3 User Addresses & Profile (`/users`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/users/profile` | User | CUSTOMER | Get user profile details |
| `PUT` | `/users/profile` | User | CUSTOMER | Update profile details |
| `GET` | `/users/addresses` | User | CUSTOMER | List all user shipping/billing addresses |
| `POST` | `/users/addresses` | User | CUSTOMER | Create a new address |
| `PUT` | `/users/addresses/:id` | User | CUSTOMER | Update address |
| `DELETE` | `/users/addresses/:id` | User | CUSTOMER | Delete address |
| `PATCH` | `/users/addresses/:id/default` | User | CUSTOMER | Set default shipping or billing address |

---

### 2.4 Cart & Wishlist (`/cart`, `/wishlist`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/cart` | User | CUSTOMER | Fetch active user cart with items, prices & total |
| `POST` | `/cart/items` | User | CUSTOMER | Add item/variant to cart (Zod: `productId`, `variantId`, `quantity`) |
| `PUT` | `/cart/items/:id` | User | CUSTOMER | Update cart item quantity |
| `DELETE` | `/cart/items/:id` | User | CUSTOMER | Remove item from cart |
| `DELETE` | `/cart` | User | CUSTOMER | Clear entire cart |
| `GET` | `/wishlist` | User | CUSTOMER | Fetch user wishlist items |
| `POST` | `/wishlist/items` | User | CUSTOMER | Add product to wishlist |
| `DELETE` | `/wishlist/items/:productId` | User | CUSTOMER | Remove product from wishlist |

---

### 2.5 Orders, Checkout & Payments (`/orders`, `/payments`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/orders/checkout` | User | CUSTOMER | Place order, validate server stock, deduct inventory, apply coupon & initiate payment |
| `GET` | `/orders` | User | CUSTOMER | List user order history |
| `GET` | `/orders/:id` | User | CUSTOMER | Get full order details & live tracking status |
| `POST` | `/orders/:id/cancel` | User | CUSTOMER | Cancel pending/processing order |
| `POST` | `/payments/mock-process` | User | CUSTOMER | Process mock payment transaction |

---

### 2.6 Reviews & Product Questions (`/reviews`, `/questions`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/products/:productId/reviews` | Public | None | List product reviews with pagination |
| `POST` | `/products/:productId/reviews` | User | CUSTOMER | Submit product review & upload review images |
| `GET` | `/products/:productId/questions` | Public | None | List questions & answers for a product |
| `POST` | `/products/:productId/questions` | User | CUSTOMER | Ask a product question |
| `POST` | `/questions/:id/answers` | User | CUSTOMER/ADMIN | Post answer to product question |

---

### 2.7 Coupons & Notifications (`/coupons`, `/notifications`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/coupons/validate` | User | CUSTOMER | Validate coupon code against subtotal & user usage |
| `GET` | `/notifications` | User | Any | Get user notifications |
| `PATCH` | `/notifications/:id/read` | User | Any | Mark notification as read |
| `PATCH` | `/notifications/read-all` | User | Any | Mark all user notifications as read |

---

### 2.8 Returns & Refunds (`/returns`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/returns` | User | CUSTOMER | Request item return with reason & order details |
| `GET` | `/returns` | User | CUSTOMER | Get user's active/past return requests |
| `GET` | `/returns/:id` | User | CUSTOMER | Get detailed return status & refund update |

---

### 2.9 Admin Operations & Analytics (`/admin`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/admin/analytics/dashboard` | Admin | ADMIN/SUPER_ADMIN | Get summary metrics (total revenue, orders, customers, low stock count) |
| `GET` | `/admin/analytics/revenue` | Admin | ADMIN/SUPER_ADMIN | Get revenue chart data (daily, weekly, monthly) |
| `GET` | `/admin/analytics/orders` | Admin | ADMIN/SUPER_ADMIN | Get order breakdown analytics by status |
| `GET` | `/admin/products` | Admin | ADMIN/SUPER_ADMIN | List products for admin management |
| `POST` | `/admin/products` | Admin | ADMIN/SUPER_ADMIN | Create product with images, variants, attributes |
| `PUT` | `/admin/products/:id` | Admin | ADMIN/SUPER_ADMIN | Update product & stock levels |
| `DELETE` | `/admin/products/:id` | Admin | ADMIN/SUPER_ADMIN | Soft delete / deactivate product |
| `GET` | `/admin/inventory` | Admin | ADMIN/SUPER_ADMIN | Get inventory status, low-stock & out-of-stock items |
| `POST` | `/admin/inventory/adjust` | Admin | ADMIN/SUPER_ADMIN | Manual stock adjustment with transaction log |
| `GET` | `/admin/categories` | Admin | ADMIN/SUPER_ADMIN | Get category management tree |
| `POST` | `/admin/categories` | Admin | ADMIN/SUPER_ADMIN | Create new category |
| `PUT` | `/admin/categories/:id` | Admin | ADMIN/SUPER_ADMIN | Update category |
| `GET` | `/admin/orders` | Admin | ADMIN/SUPER_ADMIN | List all customer orders with filters |
| `PATCH` | `/admin/orders/:id/status` | Admin | ADMIN/SUPER_ADMIN | Update order status & tracking info |
| `GET` | `/admin/customers` | Admin | ADMIN/SUPER_ADMIN | List registered customers & purchase summary |
| `PATCH` | `/admin/customers/:id/status` | Admin | ADMIN/SUPER_ADMIN | Activate/deactivate customer account |
| `GET` | `/admin/reviews` | Admin | ADMIN/SUPER_ADMIN | List pending reviews for moderation |
| `PATCH` | `/admin/reviews/:id/moderate` | Admin | ADMIN/SUPER_ADMIN | Approve or reject customer review |
| `GET` | `/admin/coupons` | Admin | ADMIN/SUPER_ADMIN | List coupons |
| `POST` | `/admin/coupons` | Admin | ADMIN/SUPER_ADMIN | Create coupon rule |
| `PUT` | `/admin/coupons/:id` | Admin | ADMIN/SUPER_ADMIN | Edit coupon rule |
| `GET` | `/admin/returns` | Admin | ADMIN/SUPER_ADMIN | List customer return requests |
| `PATCH` | `/admin/returns/:id/process` | Admin | ADMIN/SUPER_ADMIN | Approve/reject return & issue refund |
| `GET` | `/admin/audit-logs` | Admin | SUPER_ADMIN | View immutable system audit logs |
