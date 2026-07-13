# FleetOps - Logistics & Asset Tracking Portal

FleetOps is a centralized internal fleet management system used by logistics companies to monitor vehicles, drivers, deliveries, and operations.

This repository is structured as a MERN stack monorepo, divided into separate frontend and backend workspaces.

## Directory Structure

```text
FleetOps/
├── frontend/             # React + Vite + Tailwind CSS v4 Client
└── backend/              # Node.js + Express REST API
```

## Getting Started

### 1. Frontend Client
To run the React dashboard client:
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend Server
To configure and run the Express server:
1. Create a `.env` file in the `backend/` directory based on `backend/.env.example`.
2. Run the development server:
```bash
cd backend
npm install
npm run dev
```
