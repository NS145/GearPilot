# 🛸 GearPilot — Laptop Warehouse Management System (WMS)

A production-ready, full-stack inventory and assignment management system with QR integration and intelligent laptop allocation logic.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js + MongoDB (Mongoose) |
| Frontend | React (Vite) + Tailwind CSS |
| Mobile | React Native (Expo) |
| Auth | JWT (JSON Web Tokens) |
| Logging | Winston |
| Validation | Joi |

---

## 📁 Folder Structure

```
gear-pilot/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Auth, error handler
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── services/       # Business logic (assignment)
│   ├── utils/          # Logger, pagination, seed
│   ├── validators/     # Joi schemas
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/        # Axios + service calls
│       ├── components/ # Shared UI components
│       ├── context/    # Auth context
│       └── pages/      # Admin + Service + Auth pages
└── mobile/
    └── src/
        ├── api/        # API client
        ├── context/    # Auth context
        └── screens/    # Login, Dashboard, QR, Tray, etc.
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js >= 18
- MongoDB >= 5 (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI and JWT_SECRET

npm install
npm run seed    # Seed demo data
npm run dev     # Start dev server (port 5000)
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev     # Runs on http://localhost:5173
```

### 3. Mobile App

```bash
cd mobile
npm install
# In src/api/client.js, update BASE_URL to your local IP
# e.g., http://192.168.1.x:5000/api

npx expo start
# Scan QR with Expo Go app
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@wms.com | Admin@123 |
| Service | service@wms.com | Service@123 |

---

## 🧠 Assignment Algorithm

The core business logic lives in `backend/services/assignmentService.js`.

### Priority Rules:
1. **Priority 1 — Most Recently Returned**: Assign the laptop with the highest `lastReturnedDate` (most recently returned)
2. **Priority 2 — Oldest Purchase Date**: If no laptops have ever been returned, assign the one with the oldest `purchaseDate`

### Atomicity & Race Condition Prevention:
- Uses **MongoDB Transactions** (`session.startTransaction()`)
- `findOneAndUpdate` is atomic — atomically finds AND marks the laptop as assigned in one operation
- Prevents two simultaneous requests from assigning the same laptop
- Transaction is rolled back on any error

```javascript
// Priority 1: Most recently returned
laptop = await Laptop.findOneAndUpdate(
  { status: 'available', lastReturnedDate: { $ne: null } },
  { $set: { status: 'assigned' } },
  { sort: { lastReturnedDate: -1 }, new: true, session }
);

// Priority 2: Oldest purchase date
if (!laptop) {
  laptop = await Laptop.findOneAndUpdate(
    { status: 'available' },
    { $set: { status: 'assigned' } },
    { sort: { purchaseDate: 1 }, new: true, session }
  );
}
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/login | Public |
| POST | /api/auth/register | Public |
| GET | /api/auth/me | Protected |

### Rack
| Method | Endpoint | Role |
|--------|----------|------|
| GET | /api/rack | All |
| POST | /api/rack | Admin |
| PUT | /api/rack/:id | Admin |
| DELETE | /api/rack/:id | Admin |

### Tray
| Method | Endpoint | Role |
|--------|----------|------|
| GET | /api/tray | All |
| GET | /api/tray/by-qr/:code | All |
| POST | /api/tray | Admin |
| PUT | /api/tray/:id | Admin/Service |

### Laptop
| Method | Endpoint | Role |
|--------|----------|------|
| GET | /api/laptop | All |
| GET | /api/laptop/dashboard | All |
| POST | /api/laptop | Admin/Service |
| PUT | /api/laptop/:id | Admin/Service |
| DELETE | /api/laptop/:id | Admin |

### Assignment
| Method | Endpoint | Role |
|--------|----------|------|
| GET | /api/assignment | All |
| POST | /api/assignment/assign | Admin/Service |
| POST | /api/assignment/return | Admin/Service |

### Employee
| Method | Endpoint | Role |
|--------|----------|------|
| GET | /api/employee | All |
| POST | /api/employee | Admin |
| PUT | /api/employee/:id | Admin |
| DELETE | /api/employee/:id | Admin |

---

## 🗂️ Database Design

### Indexes

```javascript
// Laptop — critical for assignment algorithm
{ status: 1, lastReturnedDate: -1 }  // Priority 1 sort
{ status: 1, purchaseDate: 1 }        // Priority 2 sort

// Tray
{ qrCode: 1 }   // QR lookups
{ rackId: 1 }   // Filter by rack

// Assignment
{ laptopId: 1, status: 1 }
{ employeeId: 1, status: 1 }
```

---

## 📈 Scalability Suggestions

1. **Redis Caching**: Cache tray/rack list endpoints. Invalidate on mutation.
2. **Horizontal Scaling**: The stateless JWT auth allows running multiple backend instances behind a load balancer.
3. **MongoDB Atlas**: Move to Atlas for automatic scaling + backups.
4. **Message Queue**: For high concurrency assignment requests, use a Redis-based queue (Bull) to serialize assignment operations.
5. **CDN for Mobile**: Host API behind a CDN for global latency reduction.

---

## 🚀 Future Enhancements

1. **Analytics Dashboard**: Charts for assignment frequency, model popularity, average usage duration
2. **Audit Logs**: Immutable audit trail with IP, user agent, diff tracking
3. **Email Notifications**: Notify employees on assignment/return via SendGrid
4. **Bulk Operations**: CSV upload for bulk laptop/employee import
5. **Barcode Generation**: Generate and print QR codes as PDF labels for trays
6. **Role Expansion**: Add `manager` role with approval workflow for assignments
7. **Warranty Tracking**: Track laptop warranty expiry and send alerts
8. **HR Integration**: Webhook listener for HR systems to auto-create employees

---

## 🔒 Security Features

- JWT authentication with expiry
- Bcrypt password hashing (12 rounds)
- Role-based access control middleware
- Input validation via Joi
- Rate limiting (200 req / 15 min)
- Soft deletes (no hard data removal)
- Centralized error handling (no stack traces in production)

---

## 📱 Mobile QR Flow

1. Open mobile app → Login
2. Tap **Scan QR** → Camera opens
3. Point at tray QR code label
4. App calls `GET /api/tray/by-qr/:code`
5. Tray Details screen shows:
   - Rack + tray info
   - Laptop inside (if any) with status
   - Actions: Add laptop OR Assign to employee
