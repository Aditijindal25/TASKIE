# Taskie — Task Management SaaS

A full-stack task management app built with React, Node.js, Express, and PostgreSQL.

## Tech Stack

| Layer      | Tech                          |
|------------|-------------------------------|
| Frontend   | React 18 + Vite + React Router |
| Backend    | Node.js + Express             |
| Database   | PostgreSQL                    |
| Auth       | JWT (JSON Web Tokens) + bcrypt |
| Styling    | CSS Modules                   |

---

## Prerequisites

Make sure you have these installed on your laptop:

- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/download/) v14 or higher
- npm (comes with Node.js)

---

## Setup Instructions

### Step 1 — Set up the database

Open your terminal and run:

```bash
psql -U postgres
```

Then paste the contents of `server/db/schema.sql` to create the database and tables.

Or run it directly:
```bash
psql -U postgres -f server/db/schema.sql
```

### Step 2 — Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskie
JWT_SECRET=any_long_random_string_here
```

### Step 3 — Install all dependencies

```bash
npm run install:all
```

This installs root, client, and server dependencies in one command.

### Step 4 — Run the app

```bash
npm run dev
```

This starts both the frontend and backend simultaneously:
- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:5000

---

## API Endpoints

### Auth
| Method | Endpoint             | Description        |
|--------|----------------------|--------------------|
| POST   | /api/auth/register   | Create new account |
| POST   | /api/auth/login      | Sign in            |

### Tasks (all require JWT token)
| Method | Endpoint          | Description       |
|--------|-------------------|-------------------|
| GET    | /api/tasks        | Get all tasks     |
| POST   | /api/tasks        | Create a task     |
| PUT    | /api/tasks/:id    | Update a task     |
| DELETE | /api/tasks/:id    | Delete a task     |

---

## Project Structure

```
taskie/
├── client/                  # React frontend
│   └── src/
│       ├── api/             # Axios instance
│       ├── components/      # Reusable UI components
│       ├── context/         # React Context (Auth)
│       ├── hooks/           # Custom hooks (useTasks)
│       └── pages/           # Login, Register, Dashboard
│
├── server/                  # Node.js backend
│   ├── db/                  # DB connection + schema
│   ├── middleware/          # JWT auth middleware
│   └── routes/              # auth.js, tasks.js
│
├── .env.example
└── package.json
```

---

## Resume Highlights

This project demonstrates:

- ✅ RESTful API design with Express
- ✅ JWT authentication with protected routes
- ✅ PostgreSQL relational database with foreign keys
- ✅ React hooks, context, and custom hooks
- ✅ Axios with request/response interceptors
- ✅ Environment-based configuration
- ✅ Component-based architecture with CSS Modules

---

## Next Steps to Enhance

- Add drag-and-drop with `@hello-pangea/dnd`
- Deploy frontend to Vercel, backend to Render
- Add real-time updates with Socket.io
- Write unit tests with Jest + React Testing Library
