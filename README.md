# SparkCare

**SparkCare** is an integrated full-stack web platform built on the MERN stack (MongoDB, Express.js, React, Node.js) combining on-demand home electrical services booking with an electrical products e-commerce store.

---

## Overview

SparkCare provides a unified digital portal for homeowners needing certified electrical assistance and quality electrical components. The application bridges two core domains:

1. **Home Electrical Services:** Customers can browse electrical services (e.g., smart panel upgrades, ceiling fan installation, emergency rewiring, EV fast-charger setups), select dates and available time slots, and submit service reservations with upfront pricing.
2. **Electrical Products E-Commerce:** An online storefront allowing customers to discover electrical supplies, search and filter by category or specifications, manage carts and wishlists, and execute orders through an administratively audited manual payment workflow.

The platform is powered by an Express.js REST API with comprehensive security hardening, a responsive React Single Page Application (SPA), MongoDB database modeling via Mongoose, and Cloudinary cloud media storage.

---

## Features

### User Features
* **User Authentication & Session Management:** User registration and login utilizing short-lived JWT access tokens and secure HTTP-only refresh tokens.
* **Product Catalog:** Browse electrical components, filter by category/price/specifications, and view product details with stock status.
* **Search & Discovery:** Instant keyword search and multi-criteria category filtering.
* **Shopping Cart & Wishlist:** Isolated, persistent cart and wishlist state per authenticated user preventing session cross-contamination.
* **Coupon Discounts:** Apply active promotional discount codes during checkout with server-authoritative validation.
* **Electrical Service Booking:** Schedule electrical repairs and installations with date/time-slot selection and address details.
* **Manual UPI/QR Checkout Workflow:** Order placement with business UPI QR presentation, transaction reference (UTR) input, and payment screenshot proof submission.
* **Order History & Booking Tracking:** View personal order statuses (`payment_pending`, `processing`, `delivered`) and service booking history.
* **Verified Customer Reviews:** Submit product and service ratings and feedback (enforced only for verified purchases/bookings).

### Admin Features
* **Administrative Dashboard:** Real-time metrics overview powered by MongoDB aggregation pipelines displaying gross sales, order volume, and pending verification counts.
* **Product Catalog Management:** Full CRUD operations for electrical products (title, SKU, price, discount, inventory stock, technical attributes, and image uploads).
* **Inventory & Stock Tracking:** Track product quantities with atomic decrement safeguards during checkout to prevent overselling.
* **Manual UPI/QR Payment Audit Queue:** Review uploaded customer payment screenshots and UTR reference codes with one-click **Verify** or **Reject** actions.
* **Order Lifecycle Management:** Monitor and update order fulfillment stages from payment verification through processing, shipping, and delivery.
* **Service Booking Management:** View and update incoming residential service reservations.
* **Coupon Engine:** Create, manage, activate/deactivate discount coupons with percentage or fixed discount rules, minimum spend thresholds, and usage caps.
* **User Management:** Inspect registered customer accounts and update administrative roles.

---

## Technology Stack

### Frontend
* **Core:** React 19, Vite 8, JavaScript (ES Modules)
* **Routing:** React Router DOM (v7)
* **State Management:** Redux Toolkit (`@reduxjs/toolkit`), React-Redux
* **Styling & Icons:** Tailwind CSS (v4), Lucide React, Framer Motion
* **HTTP Client:** Axios with request/response interceptors and silent token refresh
* **Notifications:** React Hot Toast

### Backend
* **Runtime & Framework:** Node.js (>= 18.0.0), Express.js (v4)
* **Database & Modeling:** MongoDB, Mongoose ODM (v8)
* **Authentication & Cryptography:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, Node.js native `crypto` (SHA-256 token hashing)
* **Media Handling:** Multer (memory buffering), Cloudinary SDK (v2) with binary magic-byte inspection
* **Security Middleware:** Helmet, CORS, `express-rate-limit`, `mongo-sanitize`, `hpp` (HTTP Parameter Pollution)
* **Email Service:** Nodemailer (with local spool fallback for audit resiliency)
* **Validation & Logging:** Zod, Winston, Morgan
* **Testing:** Node.js Native Test Runner (`node:test`)

---

## Project Structure

```text
SparkCare/
├── .env.example              # Root environment variable template
├── .gitignore                # Comprehensive root git ignore rules
├── package.json              # Root project descriptor & helper scripts
├── README.md                 # Project documentation
│
├── client/                   # Frontend React SPA
│   ├── .env.example          # Client environment template
│   ├── .gitignore            # Client ignore rules
│   ├── index.html            # Application entry HTML
│   ├── package.json          # Frontend dependencies & scripts
│   ├── vite.config.js        # Vite configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── public/               # Static assets & icons
│   └── src/
│       ├── assets/           # Client graphic assets
│       ├── components/       # Reusable UI components (Navbar, Footer, Modals)
│       ├── hooks/            # Custom React hooks
│       ├── layouts/          # Layout shells (MainLayout, DashboardLayout)
│       ├── pages/            # View pages (Home, Products, Cart, Checkout, Admin, etc.)
│       ├── services/         # Axios API client & interceptors
│       ├── store/            # Redux Toolkit store & feature slices
│       └── utils/            # Client utility helpers
│
└── server/                   # Backend Node.js / Express REST API
    ├── .env.example          # Backend environment template
    ├── .gitignore            # Backend ignore rules
    ├── server.js             # Express application initialization & middleware
    ├── package.json          # Backend dependencies & scripts
    ├── config/               # Database connection pool setup (db.js)
    ├── controllers/          # Request handlers (auth, product, order, admin, etc.)
    ├── middleware/           # Security, upload, auth, and rate-limiting middleware
    ├── models/               # Mongoose database models (User, Product, Order, etc.)
    ├── routes/               # Express REST route definitions
    ├── services/             # Background services (Cloudinary, Nodemailer)
    ├── scripts/              # Database maintenance & migration scripts
    ├── tests/                # Automated security & integration test suite
    ├── uploads/              # Local upload directory (.gitkeep protected)
    ├── utils/                # Logging (Winston), AppError, environment validators
    └── validations/          # Zod request validation schemas
```

---

## Installation & Setup

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended)
* **npm** (v9.0.0 or higher)
* **MongoDB** (Local instance running at `mongodb://localhost:27017` or a MongoDB Atlas connection string)
* **Cloudinary Account** (Free tier for media uploads)

### 1. Clone the Repository
```bash
git clone https://github.com/madho-2005/SparkCare.git
cd SparkCare
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../client
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the `server/` directory and another `.env` file in the `client/` directory based on the provided templates:

* **Backend Configuration (`server/.env`):**
  ```bash
  cp server/.env.example server/.env
  ```
  Edit `server/.env` with your MongoDB URI, JWT secrets, and Cloudinary keys:
  ```env
  PORT=5000
  NODE_ENV=development
  MONGODB_URI=mongodb://localhost:27017/sparkcare
  ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_at_least_32_characters
  REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_at_least_32_characters
  ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  UPI_ID=sparkcare@upi
  UPI_NAME=SparkCare Electricals
  ```

* **Frontend Configuration (`client/.env`):**
  ```bash
  cp client/.env.example client/.env
  ```
  Edit `client/.env`:
  ```env
  VITE_API_BASE_URL=http://localhost:5000/api/v1
  VITE_CONTACT_EMAIL=support@sparkcare.com
  ```

### 5. Start the Application

* **Start the Backend Server:**
  ```bash
  cd server
  npm run dev
  ```
  The API will start at `http://localhost:5000` (Health check: `http://localhost:5000/health`).

* **Start the Frontend Client:**
  ```bash
  cd client
  npm run dev
  ```
  The Vite development server will start at `http://localhost:5173`.

---

## Environment Variables

> [!CAUTION]
> **Never commit `.env` files to version control.**  
> The `.gitignore` files at the root, server, and client levels are strictly configured to prevent credential leakage. Always reference `.env.example` templates when setting up a new environment.

* **Root Template:** `.env.example` (Centralized index of all variable names across the project)
* **Backend Template:** `server/.env.example`
* **Frontend Template:** `client/.env.example`

---

## API & Backend Architecture

The backend REST API follows a controller-service-model pattern:
* `/api/v1/auth`: Authentication routines (register, login, logout, silent refresh, profile management).
* `/api/v1/products`: Product catalog retrieval, search, filter, and review bindings.
* `/api/v1/services`: Electrical service catalog and pricing details.
* `/api/v1/bookings`: Residential service reservations and scheduling.
* `/api/v1/orders`: Multi-item checkout, authoritative price calculation, and payment proof ingestion.
* `/api/v1/coupons`: Public coupon discovery and validation.
* `/api/v1/admin`: Administrative endpoints for product catalog CRUD, manual payment verification, dashboard analytics, and user role updates.
* `/health`: System diagnostic gateway reporting database connectivity, uptime, and memory usage.

---

## Database Architecture

Data models are formally enforced via Mongoose schemas in MongoDB:
* **User:** Stores credentials, bcrypt-hashed passwords, assigned role (`user`, `admin`), and an array of cryptographic SHA-256 hashed refresh tokens.
* **Product:** Manages electrical inventory with SKU, technical specifications (wattage, voltage), inventory stock, price, discount price, and Cloudinary media objects.
* **Order:** Stores immutable item snapshots (product reference, quantity, locked unit price), shipping destination, authoritative subtotal, coupon discount, and order state (`payment_pending`, `processing`, `delivered`, `cancelled`).
* **Booking:** Handles electrical service appointments with references to `User` and `Service`, scheduled time slots, and status indicators.
* **Payment:** Tracks transaction mode (`UPI_MANUAL`), UTR number, receipt screenshot URL, review status (`pending`, `verified`, `rejected`), and verifying administrator reference.
* **Coupon:** Manages promotional campaign codes, discount rules, expiry dates, and usage limits.
* **Review:** Stores star ratings and verified-purchase user reviews.

---

## Media Storage

Media assets (product catalog photography and customer UPI payment receipts) are handled via Cloudinary:
1. Multer intercepts incoming binary files into memory buffers (`multer.memoryStorage()`).
2. Custom middleware inspects file binary magic numbers (whitelisting JPEG, PNG, and WebP, while strictly rejecting SVGs and executables).
3. Validated buffers are streamed asynchronously to Cloudinary (`cloudinary.v2.uploader.upload_stream`).
4. The generated immutable HTTPS URL (`secure_url`) and public identifier (`public_id`) are stored in MongoDB.

---

## Payment Workflow

> [!NOTE]
> SparkCare currently utilizes an audited **Manual UPI / QR Payment Verification Workflow**.  
> The project does **NOT** use automated live payment gateways (such as production Stripe or Razorpay webhooks). Any payment gateway references in dependencies or legacy code serve as conceptual stubs.

### How Manual Payment Works:
1. **Initiation:** The customer checks out and selects "Manual UPI / QR".
2. **Scan & Pay:** The platform displays the enterprise static UPI QR code and UPI ID (`UPI_ID`).
3. **Proof Submission:** The customer enters their 12-digit UPI Transaction Reference (UTR) number and uploads a screenshot of the payment receipt.
4. **Pending State:** An order is created with the status `payment_pending`.
5. **Administrative Audit:** The administrator reviews the pending order in the **Admin Payment Verification Panel**, inspects the uploaded receipt, cross-references the UTR with business bank records, and either **Verifies** or **Rejects** the payment.
6. **Fulfillment:** Verification transitions the order status to `processing` and decrements stock.

---

## Security Implementation

SparkCare implements multi-layered security controls:
* **Short-Lived Access Tokens & Hashed Refresh Tokens:** Access tokens expire after 15 minutes. Refresh tokens are stored in `HttpOnly`, `SameSite=Strict`, `Secure` cookies and are stored in MongoDB only as **SHA-256 cryptographic hashes** to neutralize database leak risks.
* **Password Hashing:** Passwords are salted and hashed using `bcryptjs` (cost factor 10).
* **Role-Based Access Control (RBAC):** Middleware verifies user authorization (`admin` vs `user`) on protected endpoints.
* **Authoritative Pricing Engine:** Client-submitted subtotals and discounts are ignored; all pricing, coupon deductions, and taxes are calculated exclusively on the server from database records.
* **Atomic Concurrency Handling:** Product inventory decrements use atomic MongoDB updates (`$gte: quantity` and `$inc: { stock: -quantity }`) to prevent negative stock and overselling under race conditions.
* **SVG & Stored XSS Mitigation:** Binary magic-byte analysis rejects executable and XML/SVG payloads in image uploads.
* **NoSQL Injection Defense:** `mongo-sanitize` strips reserved operators (`$`, `.`) from request bodies and query parameters.
* **HTTP Parameter Pollution (HPP):** `hpp` middleware normalizes duplicate query parameters.
* **Rate Limiting:** `express-rate-limit` prevents brute-force credential attacks on authentication and admin routes.
* **HTTP Security Headers:** `helmet` applies industry-standard HTTP security headers.

---

## Automated Security Testing

The backend includes a comprehensive automated test suite executed with the Node.js Native Test Runner:
```bash
cd server
npm test
```
This suite (`server/tests/security-audit.test.js`) validates:
1. Server-authoritative pricing and coupon calculations
2. Inventory race conditions and atomic stock decrements
3. SHA-256 hashed refresh token storage and validation
4. Magic-byte file upload validation and SVG rejection
5. Rate limiting on authentication routes
6. NoSQL injection neutralization
7. HTTP parameter pollution mitigation
8. Verified-purchase review enforcement
9. Aggregation pipeline efficiency for admin dashboard metrics
10. Manual UPI payment verification state transitions
11. System health diagnostics

---

## Project Status

**Overall Status: Approximately 82% Complete**

The project is functionally robust, secure, and ready for demonstration and evaluation, but is **not yet in production deployment**. 

### Completed & Stable:
* Authentication & RBAC with refresh token rotation
* Product catalog search, categorization, and details
* User cart and wishlist isolation
* Manual UPI/QR payment verification workflow
* Cloudinary media pipeline with binary magic-byte validation
* Admin product catalog, coupon, and dashboard aggregation management
* Security hardening against OWASP Top 10 vulnerabilities

### Current Limitations & In-Progress Areas:
* **Worker / Technician Assignment UI:** The service booking system is operational, but a dedicated UI for assigning specific field technicians to service slots is currently under development.
* **Settings Persistence:** Finalizing migration of system-wide settings from browser storage to authenticated database schemas.
* **Email Resilience:** Nodemailer currently operates with fallback spooling; direct production cloud SMTP relay configuration is in progress.
* **Reporting Exports:** Administrative sales and booking reports display live data but lack PDF/Excel export utilities.
* **Payment Automation:** Operates strictly via manual UPI receipt verification; automated gateway webhooks are not implemented.

---

## Future Improvements
* Integration of an automated payment gateway (e.g., Razorpay) with webhook signature verification alongside the manual UPI workflow.
* Technician mobile dashboard for electrical service workers to view assigned service calls and update job statuses in real time.
* Live real-time chat between customers and support/technicians using Socket.io.
* Automated invoice generation (PDF) dispatched via email upon administrative payment confirmation.
* Full Docker containerization (Docker Compose) and CI/CD pipelines with GitHub Actions.

---

## Author

**URVISH THUMMAR**  
B.Tech Computer Science and Engineering  
GitHub: [@madho-2005](https://github.com/madho-2005)
