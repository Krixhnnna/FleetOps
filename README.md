# FleetOps

FleetOps is a full-stack fleet management web application built with the MERN stack. It enables real-time monitoring of vehicles, drivers, and daily fleet operations through a clean, role-based interface.

---

## Features

- 🔐 **User Authentication** — JWT-based login with role-based routing (Driver / Manager / Admin)
- 🏠 **Home Page** — Landing page with hero section, features, workflow, and contact
- 📊 **Manager Dashboard** — Live fleet telemetry, vehicle table with filters, event feed, and diagnostics drawer
- 🚛 **Driver Portal** — Driver dashboard, vehicle selection, shift management, incident reporting
- 🛠️ **Dispatch & Fleet Management** — Vehicle CRUD, driver assignment, repair dispatch
- 🗄️ **Database & Backend Logic** — MongoDB schema (Users, Vehicles, Shifts, Incidents), REST APIs
- 📋 **Admin & Reports** — CSV export, date-range filtering, admin-only routes
- 🎨 **Frontend Integration & UI** — Shared components, Axios API integration, responsive design

---

## Repository Structure

```text
FleetOps/
├── frontend/                        # React + Vite + Tailwind CSS v4 Client
│   ├── src/
│   │   ├── components/              # Shared UI components
│   │   │   ├── Navbar.jsx           # Navigation bar (role-aware, login/logout)
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── OperationalHighlights.jsx
│   │   │   ├── WhyFleetOps.jsx
│   │   │   └── Workflow.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Public landing page
│   │   │   ├── Login.jsx            # Auth page with role-based redirect
│   │   │   ├── ManagerDashboard.jsx # Manager fleet control panel
│   │   │   └── mockData.js          # Mock vehicle & log data (dev only)
│   │   ├── App.jsx                  # Root component with hash-based routing
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── backend/                         # Node.js + Express REST API
    ├── server.js
    └── package.json
```

---

## Module Breakdown

| # | Module | Responsibilities |
|---|--------|-----------------|
| 1 | Authentication & Home | MERN setup, Login/Signup, JWT, role-based routing, protected routes |
| 2 | Driver Portal | Driver dashboard, vehicle selection, Start/End Shift, incident reporting |
| **3** | **Manager Dashboard** | **Fleet dashboard, vehicle table, filters (All/Idle/En Route/Maintenance), live telemetry simulation, diagnostics drawer** |
| 4 | Dispatch & Fleet Management | Vehicle CRUD, driver assignment, dispatch repair unit, reassign deliveries |
| 5 | Database & Backend Logic | MongoDB schemas (Users, Vehicles, Shifts, Incidents), controllers, business logic |
| 6 | Admin & Reports | Export Hub, CSV generation, date-range filtering, admin-only routes |
| 7 | Frontend Integration & UI | Shared components, navbar, layouts, Axios API integration, responsive design |

---

## Manager Dashboard

The Manager Dashboard (`frontend/src/pages/ManagerDashboard.jsx`) provides a real-time fleet operations control panel with the following features:

- **KPI Cards** — Live counters for total fleet, vehicles en route, idle, and under maintenance
- **Filterable Vehicle Table** — Search by driver, vehicle ID, type, or location; filter by status
- **Live Telemetry Simulator** — Toggle to simulate real-time speed, fuel, and status changes across the fleet
- **Live Event Feed** — Rolling log of fleet events with color-coded severity indicators
- **Telematics Drawer** — Click any vehicle to open a slide-out panel showing:
  - Driver info, cargo load, coolant temperature, tire pressure, fuel level, speed
  - Active warning codes and alerts
  - Mock routing map with live vehicle position
  - Manager Quick Override (change vehicle status directly)

### Demo Login
On the Login page, use the **Quick Demo Access** button to autofill Manager credentials and access the dashboard instantly.

---

## Technology Stack

### Frontend
- React 19
- Vite 8
- Tailwind CSS v4
- Lucide React (icons)
- Hash-based client-side routing

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)

---

## Getting Started

### 1. Frontend Client
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

### 2. Backend Server
1. Create a `.env` file in `backend/` based on `backend/.env.example`
2. Run the server:
```bash
cd backend
npm install
npm run dev
```

### 3. Environment Variables (Frontend)
Create a `frontend/.env` file for optional config:
```env
VITE_DEMO_EMAIL=manager@fleetops.com
VITE_DEMO_PASSWORD=manager123
```

---

## Team

This project is developed collaboratively with modules assigned to different team members.

## License

This project is intended for educational purposes.

