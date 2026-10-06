# Skinet

A full-stack e-commerce application with a customer storefront, an admin dashboard, Stripe payments, real-time updates via SignalR, and a complete CI/CD pipeline deployed on Microsoft Azure.

**Live demo:** [https://skinet-2026.azurewebsites.net](https://skinet-2026-b4c2a0cygbfef4g8.southindia-01.azurewebsites.net/)

---

## Features

### Storefront
- Product catalogue with search, filtering, sorting and pagination
- Shopping basket and checkout flow
- Secure online payments with **Stripe**
- Order history and order details
- Real-time order/payment status updates with **SignalR**
- Responsive UI built with Angular Material and Tailwind CSS

### Admin
- Admin-only area protected by role-based authorization
- Manage products (create, edit, delete) <!-- TODO: adjust to what you built -->
- View and manage customer orders
- Order status visibility in real time

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 21, Angular Material, Tailwind CSS, Signals |
| Backend | ASP.NET Core Web API (.NET) |
| Caching | Redis (UpStash) |
| Real-time | SignalR |
| Payments | Stripe (Payment Intents + Webhooks) |
| Database | Azure SQL Database |
| Hosting | Azure App Service (`skinet-2026`) |
| CI/CD | GitHub Actions |

---

## Architecture

```
┌──────────────┐      HTTPS / REST      ┌────────────────────┐      ┌────────────────┐
│  Angular 21  │ ─────────────────────► │  ASP.NET Core API  │ ───► │  Azure SQL DB  │
│   (Client)   │ ◄───── SignalR ─────── │  + SignalR Hub     │      └────────────────┘
└──────────────┘                        │                    │
                                        │                    │      ┌────────────────┐
                                        │                    │ ───► │     Redis      │
                                        │                    │      │ (Basket cache) │
                                        └─────────┬──────────┘      └────────────────┘
                                                  │ ▲
                                        Stripe API│ │Webhooks
                                                  ▼ │
                                             ┌──────────┐
                                             │  Stripe  │
                                             └──────────┘
```

1. The Angular client calls the REST API for products, baskets, orders and auth.
2. At checkout the API creates a Stripe Payment Intent; the client confirms payment with Stripe.js.
3. Stripe sends a webhook to the API when payment succeeds or fails.
4. The API updates the order and pushes the new status to the client through a SignalR hub.

---

## Project Structure

```
Skinet/
├── API/              # ASP.NET Core Web API, SignalR hub, controllers
├── Core/             # Entities, interfaces, specifications
├── Infrastructure/   # EF Core, repositories, services, migrations
├── Client/           # Angular application
└── .github/workflows # GitHub Actions CI/CD
```
---

## Getting Started (Local Development)

### Prerequisites
- [.NET SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (LTS) and npm
- Angular CLI: `npm install -g @angular/cli`
- SQL Server (local instance or Docker)
- Redis (Docker)
- A [Stripe](https://stripe.com) account (test mode) and the [Stripe CLI](https://stripe.com/docs/stripe-cli)

### 1. Clone the repository
```bash
git clone https://github.com/beastkp/Skinet.git
cd skinet
```

### 2. Configure the API
Set secrets with .NET user secrets or checkout the appsettings.json file in the repo:

```bash
cd API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<your-sql-connection-string>"
dotnet user-secrets set "StripeSettings:SecretKey" "<sk_test_...>"
dotnet user-secrets set "StripeSettings:WhSecret" "<whsec_...>"
```
<!-- TODO: align key names with your appsettings -->

Apply migrations and run:

```bash
dotnet ef database update
dotnet run
```

### 3. Run the Angular client
```bash
cd Client
npm install
ng serve
```
The app is served at `http://localhost:4200`.

### 4. Test Stripe webhooks locally
```bash
stripe listen --forward-to https://localhost:7254/api/payments/webhook --events=payment_intent.succeeded
```
Copy the signing secret it prints into `StripeSettings:WhSecret`.

---

## Deployment on Azure

The app is deployed to **Azure App Service** (`skinet-2026`) with an **Azure SQL Database** (`Skinet`).

### Azure resources
- App Service (web app) hosting the .NET API and the built Angular client
- Azure SQL Database
- Application settings configured in App Service for connection string and Stripe keys

### App Service configuration
Add these under **Settings → Environment variables**:

| Name | Purpose |
|------|---------|
| `ConnectionStrings__DefaultConnection` | Azure SQL connection string |
| `StripeSettings__SecretKey` | Stripe secret key |
| `StripeSettings__WhSecret` | Stripe webhook signing secret |
| `Redis` | Upstash Redis Instance |

Also make sure **Web sockets** is enabled (Configuration → General settings) so SignalR can use WebSockets.

### Stripe webhook
In the Stripe Dashboard, add an endpoint pointing to:
```
https://skinet-2026.azurewebsites.net/api/payments/webhook
```
and subscribe to `payment_intent.succeeded` and `payment_intent.payment_failed`.

### CI/CD with GitHub Actions
On every push to `main`, the workflow:
1. Builds the Angular app in the `Client` folder
2. Builds and publishes the .NET API (with the Angular output served from `wwwroot`)
3. Deploys the package to Azure App Service
---

## Screenshots

| Storefront | Checkout | Admin |
|-----------|----------|-------|
| ![Shop](docs/shop.png) | ![Checkout](docs/checkout.png) | ![Admin](docs/admin.png) |

---

## Author

**Krish**
Full-stack developer · [Medium](https://medium.com/@kroshpan)
---
