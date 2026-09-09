# ShopHub - Full-Stack E-Commerce Platform

A production-style e-commerce platform built with **Spring Boot, React.js, and PostgreSQL**. Features JWT-based authentication, role-based access control (CUSTOMER / ADMIN), product catalog with search and category filters, shopping cart, and order management.

**Live demo:** (add after deployment)
**API backend:** (add after deployment)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.3.5, Spring Security, Spring Data JPA |
| Auth | JWT (JSON Web Tokens) via jjwt 0.12.6, BCrypt password hashing |
| Database | PostgreSQL (production / Render), H2 in-memory (local dev) |
| Frontend | React 18 (Vite), Tailwind CSS, React Router, Axios |
| Build | Maven (backend), Vite (frontend) |
| Deploy | Docker, Render (API + Postgres), Netlify/Vercel (frontend) |

## 🏗 Architecture

```
┌────────────────────┐       REST / JSON        ┌─────────────────────┐
│   React SPA        │ ───────────────────────► │  Spring Boot API     │
│  (Netlify/Vercel)  │  JWT Bearer Token       │  (Render)            │
└────────────────────┘                          └──────────┬──────────┘
                                                           │ JPA
                                                   ┌───────▼────────┐
                                                   │ PostgreSQL      │
                                                   │  (Render)       │
                                                   └─────────────────┘
```

### Backend structure (clean layered architecture)

```
backend/src/main/java/com/shophub/
├── ShopHubApplication.java      // entry point
├── config/SecurityConfig.java   // Spring Security + stateless JWT filter
├── security/
│   ├── JwtUtil.java              // token generate/validate
│   ├── JwtAuthenticationFilter.java
│   └── UserDetailsServiceImpl.java
├── entity/                      // User, Role, Product, CartItem, Order, OrderItem
├── repository/                  // Spring Data JPA repositories
├── service/                     // business logic (Auth, Product, Cart, Order)
├── controller/                  // REST controllers
└── dto/                         // request/response DTOs
```

**Domain model:** User (1) ── (N) CartItem ── (1) Product; User (1) ── (N) Order; Order (1) ── (N) OrderItem ── (1) Product. Orders snapshot product name/price at purchase time so historical data survives product changes.

## 🔐 Features

- **Auth:** register, login, JWT issuance, BCrypt password hashing, token expiry validation
- **Roles:** ADMIN can manage catalog; CUSTOMER browses and orders (enforced via `@PreAuthorize`)
- **Catalog:** paginated listing, category filter, case-insensitive search on name/description, product detail
- **Cart:** add/update/remove items, quantity validation against stock, per-user persistence
- **Orders:** checkout places an atomic order (stock decremented + items snapshotted), order history per user, status lifecycle (PLACED → SHIPPED → DELIVERED)
- **Bootstrap data:** 16 products across 5 categories + demo admin user seeded on first boot

## 🚀 Run Locally

### Prerequisites
- Java 21+, Node 18+, Maven 3.9+
- (optional) Docker

### 1. Backend

```bash
cd backend
mvn spring-boot:run
# or build & run
mvn package
java -jar target/shophub-backend-1.0.0.jar
```

Server starts on `http://localhost:8080`. By default it uses an in-memory **H2** database (`jdbc:h2:mem:shophub`) — zero setup. H2 console: `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:mem:shophub`, user `sa`, empty password).

Configure via environment variables:

| Env var | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:h2:mem:shophub` | JDBC URL |
| `DB_USERNAME` / `DB_PASSWORD` | `sa` / empty | DB credentials |
| `DB_DRIVER` | `org.h2.Driver` | JDBC driver class |
| `JWT_SECRET` | dev-only secret | HS256 signing key (change in prod!) |
| `PORT` | `8080` | Server port |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`, proxying `/api` to the backend on `:8080`.

### Demo accounts (seeded automatically)

| Role | Username | Password |
|---|---|---|
| ADMIN | `admin` | `admin123` |
| CUSTOMER | (create via Register page) | — |

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Get JWT |
| GET | `/api/products` | — | Paginated list (query: `page`, `size`, `search`, `category`) |
| GET | `/api/products/{id}` | — | Product detail |
| GET | `/api/cart` | ✔ | My cart |
| POST | `/api/cart` | ✔ | Add to cart |
| PUT | `/api/cart/{itemId}` | ✔ | Update quantity |
| DELETE | `/api/cart/{itemId}` | ✔ | Remove item |
| DELETE | `/api/cart` | ✔ | Clear cart |
| POST | `/api/orders` | ✔ | Place order |
| GET | `/api/orders` | ✔ | My orders |
| GET | `/api/orders/{id}` | ✔ | Order detail |

Empty body sample for cart: `{"productId": 1, "quantity": 2}`; order: `{"shippingAddress": "123 Main St, Bangalore, KA - 560001", "paymentMethod": "COD"}`.

## ☁ Deployment

Deploy is intentionally free-tier friendly.

**API + Database (Render)** – a `render.yaml` blueprint is included:

1. Push this repo to GitHub
2. On render.com → **New → Blueprint** → connect the repo
3. Render provisions a Postgres database + the API web service (Docker) automatically
4. Set `JWT_SECRET` (auto-generated by the blueprint) — done via the blueprint, or set an env var otherwise

**Frontend (Netlify or Vercel)** – `netlify.toml` is included:

1. On netlify.com → **Add new site → Import an existing project** → pick the GitHub repo
2. Build command `npm run build`, publish dir `dist`
3. Add env var at build time:
   - `VITE_API_URL` = your Render API URL (e.g. `https://shophub-api.onrender.com`)
4. Deploy. SPA routing is handled by the `/* → /index.html` rewrite in `netlify.toml`.

> Note: Render free tier spins the API down after ~15 min idle; first request after idle may take ~30–60s to wake up.

## 📸 Click-through

Shop the catalog → register/login → add to cart → checkout (COD/UPI) → see order history. Admin can log in to explore role-restricted access.

## 👤 Contact / Portfolio

- GitHub: [github.com/aanandkishor42](https://github.com/aanandkishor42)
- LinkedIn: [linkedin.com/in/aanand-kishor-shah-608bb341b](https://www.linkedin.com/in/aanand-kishor-shah-608bb341b)