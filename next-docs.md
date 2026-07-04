# Next.js Architecture & How It Works

## Overview

Next.js is a full-stack React framework that enables developers to build modern web applications with features such as:

- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- Client-Side Rendering (CSR)
- API Routes
- Middleware
- Image Optimization
- Authentication
- Server Components
- Streaming
- Incremental Static Regeneration (ISR)

Unlike React, Next.js provides both the frontend and backend in a single application.

---

# High-Level Architecture

```text
                          User Browser
                                │
                                │ HTTPS Request
                                ▼
                     +-------------------------+
                     |      Next.js Server     |
                     |-------------------------|
                     | Routing                 |
                     | Middleware              |
                     | Authentication          |
                     | Server Components       |
                     | API Routes              |
                     | Rendering Engine        |
                     +-----------+-------------+
                                 │
                 ┌───────────────┴────────────────┐
                 ▼                                ▼
         React Components                  Backend APIs
                 │                                │
                 ▼                                ▼
        HTML + JavaScript               Database / Services
                 │                                │
                 └───────────────┬────────────────┘
                                 ▼
                           Browser Display
```

---

# Request Lifecycle

```text
User
 │
 ▼
Enter URL
 │
 ▼
Next.js Router
 │
 ▼
Middleware (Optional)
 │
 ▼
Authentication
 │
 ▼
Load Page
 │
 ▼
Fetch Data
 │
 ▼
Render Components
 │
 ▼
Return HTML
 │
 ▼
Hydration
 │
 ▼
Interactive React App
```

---

# Project Structure

```text
my-app/

app/
│
├── layout.tsx
├── page.tsx
├── dashboard/
│      page.tsx
├── products/
│      page.tsx
│
components/
│
hooks/
│
lib/
│
services/
│
public/
│
styles/
│
middleware.ts
│
next.config.ts
│
package.json
```

---

# Rendering Methods

## 1. Server-Side Rendering (SSR)

Every request generates fresh HTML.

```text
Browser
    │
    ▼
Next.js Server
    │
    ▼
Fetch Data
    │
    ▼
Generate HTML
    │
    ▼
Return HTML
```

Best for:

- Dashboards
- Dynamic content
- Authentication

---

## 2. Static Site Generation (SSG)

HTML is generated during build time.

```text
Build
 │
 ▼
Generate HTML
 │
 ▼
Deploy
 │
 ▼
Serve Static Files
```

Best for:

- Blogs
- Landing pages
- Documentation

---

## 3. Client-Side Rendering (CSR)

React fetches data after the page loads.

```text
Browser
 │
 ▼
Load JavaScript
 │
 ▼
Fetch API
 │
 ▼
Render UI
```

Best for:

- Dashboards
- Real-time applications

---

## 4. Incremental Static Regeneration (ISR)

Static pages regenerate automatically after a specified interval.

```text
Request
 │
 ▼
Cached Page
 │
 ▼
Revalidate
 │
 ▼
Generate Updated Page
```

---

# Routing

```
app/

page.tsx
```

↓

```
/
```

```
app/products/page.tsx
```

↓

```
/products
```

```
app/products/[id]/page.tsx
```

↓

```
/products/15
```

---

# Data Fetching

### Server Component

```typescript
const products = await fetch("/api/products");
```

Runs on the server before rendering.

---

### Client Component

```typescript
useEffect(() => {
    fetchProducts();
}, []);
```

Runs in the browser after the page loads.

---

# API Routes

Next.js can act as a backend.

```text
app/api/products/route.ts
```

↓

```
GET /api/products
```

Flow

```text
Browser
 │
 ▼
Next.js API
 │
 ▼
Database
 │
 ▼
JSON Response
```

---

# Middleware

Middleware runs before a request reaches a page.

Examples:

- Authentication
- Localization
- Redirects
- Logging

```text
Request
 │
 ▼
Middleware
 │
 ├── Allow
 └── Redirect
```

---

# Authentication Flow

```text
User Login
 │
 ▼
NextAuth / JWT
 │
 ▼
Cookie Stored
 │
 ▼
Request Protected Page
 │
 ▼
Middleware
 │
 ▼
Allow Access
```

---

# Communication with External APIs

```text
Browser
 │
 ▼
Next.js
 │
 ▼
REST API
 │
 ▼
Flask
 │
 ▼
Machine Learning
 │
 ▼
Prediction
 │
 ▼
Next.js
 │
 ▼
Browser
```

---

# Deployment Architecture

```text
                   Internet
                        │
                        ▼
                 CDN / Vercel
                        │
                        ▼
                 Next.js Server
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
 Database                     External APIs
                                       │
                                       ▼
                               Flask / AI Service
```

---

# Complete Workflow

```text
                User
                  │
                  ▼
          Open Application
                  │
                  ▼
          Next.js Router
                  │
                  ▼
           Middleware Check
                  │
                  ▼
        Authentication Check
                  │
                  ▼
         Load Server Component
                  │
                  ▼
        Fetch Data (DB / API)
                  │
                  ▼
          Generate HTML
                  │
                  ▼
          Send HTML to Browser
                  │
                  ▼
             Hydration
                  │
                  ▼
        Interactive React App
                  │
                  ▼
     User Actions (Clicks, Forms)
                  │
                  ▼
         API Calls (Next.js/Flask)
                  │
                  ▼
           Updated UI Render
```

---

# Key Features

- File-based routing
- Server Components
- Client Components
- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- Incremental Static Regeneration (ISR)
- API Routes
- Middleware
- Image Optimization
- SEO optimization
- TypeScript support
- Built-in performance optimizations

---

# Summary

Next.js combines the power of React with server-side capabilities, allowing developers to build fast, SEO-friendly, and scalable web applications. It supports multiple rendering strategies, built-in routing, API handling, middleware, and seamless integration with databases and external services, making it suitable for both frontend and full-stack development.
