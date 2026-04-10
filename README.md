# 🛸 GearPilot — Next-Gen Laptop WMS

[![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20Expo-blueviolet?style=for-the-badge)](https://github.com/NS145/GearPilot)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Uptime](https://img.shields.io/badge/Status-Active-orange?style=for-the-badge)](https://github.com/NS145/GearPilot)

**GearPilot** is a production-grade, full-stack Warehouse Management System (WMS) specifically designed for laptop inventory and lifecycle management. It features a sophisticated assignment algorithm, QR integration for mobile devices, and a premium Glassmorphic UI.

---

## 🏗️ Architecture & Tech Stack

GearPilot is built on a high-performance **MERN** architecture with native mobile support.

| Layer | Technology | Key Features |
| :--- | :--- | :--- |
| **Backend** | `Node.js` + `Express` | REST API, JWT Auth, Winston Logging |
| **Database** | `MongoDB` + `Mongoose` | Transactions, Atomic Ops, Geo-indexing |
| **Frontend** | `React` + `Vite` | Glassmorphism UI, Tailwind CSS, Framer Motion |
| **Mobile** | `React Native` + `Expo` | QR Scanning, Real-time Tray Lookups |
| **Security** | `Bcrypt` + `Joi` | Password Hashing, Schema Validation |

---

## 📁 Repository Structure

```text
gear-pilot/
├── 🚀 backend/         # Node.js API server & business logic
├── 💻 frontend/        # React web dashboard for admins & service
└── 📱 mobile/          # Expo app for warehouse staff (QR integration)
```

---

## 🚀 Quick Start Guide

Follow these steps to get GearPilot running locally in under 5 minutes.

### 📋 Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or Atlas connection string)
- **Expo Go** app (installed on your physical mobile device)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/NS145/GearPilot.git
cd GearPilot
```

### Step 2: Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create environment file:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and set your `MONGODB_URI` and `JWT_SECRET`.*
3. Install and run:
   ```bash
   npm install
   npm run seed    # Optional: Populates demo data
   npm run dev     # Server starts on http://localhost:5000
   ```

### Step 3: Frontend Web Dashboard
1. Open a new terminal and navigate to:
   ```bash
   cd frontend
   ```
2. Install and run:
   ```bash
   npm install
   npm run dev     # Dashboard runs on http://localhost:5173
   ```

### Step 4: Mobile App
1. Open a new terminal and navigate to:
   ```bash
   cd mobile
   ```
2. Install and start:
   ```bash
   npm install
   npx expo start
   ```
   *Note: Ensure your mobile and PC are on the same Wi-Fi. Update the `BASE_URL` in `src/api/client.js` to your computer's local IP.*

---

## 🔑 Demo Access
| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@wms.com` | `Admin@123` |
| **Service Staff** | `service@wms.com` | `Service@123` |

---

## 🧠 Smart Assignment Logic
GearPilot uses a two-tier priority bridge to ensure laptop health and optimal rotation.

1. **Priority 1 (Recent Rotation)**: Always assigns the laptop that was returned most recently to ensure equal wear across the fleet.
2. **Priority 2 (FIFO)**: If no laptops have rotation history, it defaults to the oldest purchase date.

> [!IMPORTANT]
> All assignment operations use **MongoDB Transactions** to prevent race conditions during simultaneous requests.

---

## 📡 Key API Features
- **Auto-Allocation**: Atomic `POST /api/assignment/assign` endpoint.
- **QR Tray Lookup**: Instant data retrieval via `GET /api/tray/by-qr/:code`.
- **RBAC**: Middleware-enforced Role Based Access Control for Sensitive Ops.

---

## 🛠️ Future Roadmap
- [ ] **Predictive Maintenance**: AI-driven alerts for battery cycle thresholds.
- [ ] **Bulk Import**: CSV/Excel processing for fleet onboarding.
- [ ] **PDF Engine**: Instant QR code label generation for hardware tagging.

---

Built with ❤️ by [NS145](https://github.com/NS145)
