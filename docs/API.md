# 📡 GearPilot API Documentation

The GearPilot API is a RESTful service built on Node.js and Express. It uses JWT for authentication and Joi for request validation.

## 🔐 Authentication
All sensitive endpoints require a `Bearer <token>` in the `Authorization` header.

| Endpoint | Method | Description | Role |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Authenticate user & return JWT | Anyone |
| `/api/auth/me` | `GET` | Get current user profile | Auth |

## 💻 Inventory (Laptops)
| Endpoint | Method | Description | Role |
| :--- | :--- | :--- | :--- |
| `/api/laptops` | `GET` | List laptops with filters and pagination | Auth |
| `/api/laptops/:id` | `GET` | Get laptop details | Auth |
| `/api/laptops` | `POST` | Add a new laptop | Admin |
| `/api/laptops/:id` | `PATCH` | Update laptop status/details | Admin |

## 🔄 Allocation & Assignments
| Endpoint | Method | Description | Role |
| :--- | :--- | :--- | :--- |
| `/api/assignment/assign` | `POST` | Auto-allocate a laptop based on priority | Admin/Service |
| `/api/assignment/return` | `POST` | Return a laptop and mark it as available | Admin/Service |
| `/api/assignment/history` | `GET` | Get allocation history log | Admin |

## 🏗️ Infrastructure (Racks & Trays)
| Endpoint | Method | Description | Role |
| :--- | :--- | :--- | :--- |
| `/api/racks` | `GET` | List all racks | Auth |
| `/api/trays/by-qr/:code` | `GET` | Lookup tray data via QR code | Mobile |

---

## 🛠 Internal Logic: SmartAssign Algorithm
The SmartAssign engine applies the following priorities when a laptop is requested:
1. **Recency**: Laptops that were returned most recently are prioritized for assignment to ensure even wear across the fleet.
2. **Availability**: Only laptops with status `available` are considered.
3. **Location Hierarchy**: Assignments are naturally grouped by Rack/Tray proximity to optimize physical warehouse traversal.
