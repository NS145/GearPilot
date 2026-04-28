# 🚀 GearPilot — Smart IT Asset & Inventory Management Platform

<div align="center">
  <p><i>A production-grade, full-stack ecosystem for enterprise hardware lifecycle management.</i></p>

  [![Stack](https://img.shields.io/badge/Stack-MERN%20%7C%20Expo%20SDK%2054-blueviolet?style=for-the-badge)](https://github.com/NS145/GearPilot)
  [![Deployment](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge)](https://gear-pilot.vercel.app)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
</div>

---

## 📌 Project Overview

**GearPilot** is a professional MERN (MongoDB, Express, React, Node) platform designed to solve the "chaos" of physical IT asset management. Unlike simple CRUD apps, GearPilot implements a **hardware lifecycle** including Smart Allocation, QR-based fulfillment, and high-security role-based access.

### 🎥 How it Works (The Core Logic)

```mermaid
sequenceDiagram
    participant Admin
    participant System
    participant ServiceTech as Service Tech (Mobile)
    participant Employee

    Admin->>System: Request Laptop for Employee
    System->>System: Smart Select (FIFO + Last Returned)
    System->>System: Status: RESERVED
    System-->>ServiceTech: New Task in Mobile App
    ServiceTech->>System: Scans Tray QR Code
    ServiceTech->>System: Clicks 'Complete Assignment'
    System->>System: Status: ACTIVE / ASSIGNED
    System-->>Employee: Auto-Generate Credentials
```

---

## 🏗️ System Architecture

GearPilot is built as a **Monorepo** for seamless full-stack orchestration:

```mermaid
graph TD
    subgraph Clients["Frontend Layer"]
        WebAdmin["Admin Dashboard (React + Vite)"]
        WebService["Service Tech Web (React)"]
        MobileApp["Field Ops App (Expo SDK 54)"]
    end

    subgraph Backend["Cloud Engine (Vercel)"]
        API["Express.js Serverless API"]
        JWT["Auth & RBAC Middleware"]
        Logic["Smart Rotation Service"]
    end

    subgraph Data["Persistence"]
        MongoDB["MongoDB Atlas"]
    end

    WebAdmin -->|REST API| API
    WebService -->|REST API| API
    MobileApp -->|REST API| API
    API -->|Mongoose| MongoDB
```

---

## ✨ Key Features

- **📊 360° Dashboard**: Track fleet health, availability, and return rates.
- **🛡️ RBAC (Role-Based Access)**: Admins manage inventory; Service Techs handle physical fulfillment.
- **🤖 The "Smart Assign" Engine**:
    - **Priority 1**: Assign the laptop that was most recently returned (to ensure rotation).
    - **Priority 2**: If no recent returns, assign the oldest purchase (FIFO).
- **📸 QR Scanner Integration**: Built-in mobile scanner to verify tray/laptop identity before hand-off.
- **🏷️ Instant QR Generation**: Generate and download labeled QR stickers for every physical tray.

---

## 🚀 Deployment Guide (Student Friendly)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [Vercel](https://vercel.com/) CLI (`npm i -g vercel`)
- [Expo Go](https://expo.dev/client) app on your phone

### 2. Environment Variables
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=any_random_secure_string
JWT_EXPIRE=7d
```

### 3. Local Setup
```bash
# 1. Clone
git clone https://github.com/NS145/GearPilot.git && cd GearPilot

# 2. Run Backend
cd server && npm install && npm run dev

# 3. Run Frontend
cd ../client && npm install && npm run dev

# 4. Run Mobile
cd ../mobile && npm install && npx expo start
```

### 4. Vercel Deployment (Production)
```bash
# From the root directory:
vercel --prod
```
*Note: Ensure you add your MongoDB and JWT variables in the Vercel Dashboard settings.*

---

## 📂 Folder Structure

- `server/`: Express API, Mongoose Models, and Assignment Logic.
- `client/`: React Frontend with Vite, Tailwind CSS, and Admin/Service modules.
- `mobile/`: Expo React Native app with `expo-camera` integration.

---

## 🤝 Contributing
Built for CS students and IT managers alike. Pull requests are welcome!

---

## 📄 License
MIT License. Created by [NS145](https://github.com/NS145).
