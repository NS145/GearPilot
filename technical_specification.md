# 🏗️ GearPilot Technical Specification & Logic Guide

This document provides a deep-dive into the engineering architecture and business logic that powers the GearPilot IT Asset Management Platform.

---

## 1. The "Smart Assignment" Algorithm
The core value of GearPilot lies in its automated inventory allocation. Instead of manual selection, the system uses a **weighted rotation algorithm**.

### **Logic Flow:**
1.  **Stage 1: Return Priority**: The system queries the `Assignments` collection for the most recently completed assignment (`status: 'returned'`). It identifies the laptop that was returned **last**.
2.  **Stage 2: Availability Verification**: It cross-references this laptop with the `Laptops` collection to ensure it is currently marked as `available`.
3.  **Stage 3: Fallback (FIFO)**: If no recent returns are found, the system switches to a **First-In-First-Out (FIFO)** strategy, selecting the laptop with the oldest `purchaseDate`.
4.  **Stage 4: Atomic Reservation**: Once a laptop is chosen, its status is immediately changed to `reserved` in an atomic operation to prevent duplicate assignments.

---

## 2. QR-Based Fulfillment Lifecycle
GearPilot bridges the gap between digital records and physical warehouse operations using a QR-first approach.

### **The Lifecycle:**
- **Request State**: Admin initiates a request. Assignment is created with `status: 'requested'`.
- **Physical Verification**: The Service Tech uses the mobile app to scan a **Tray QR Code**.
- **Fulfillment**: The system validates that the scanned tray contains the **Reserved Laptop**. If it matches, the Tech clicks "Complete", and the status transitions to `active`.
- **Return Path**: When a laptop is returned, the tech scans the tray again and clicks "Return to Inventory". This marks the laptop as `available` and the assignment as `returned`.

---

## 3. Database Schema & Relationships
We use **MongoDB** with **Mongoose** to handle complex hardware relationships.

### **Entity Map:**
- **Rack**: The physical storage unit (contains many Trays).
- **Tray**: The specific slot in a Rack. Each Tray is unique and has a QR code linked to its MongoDB `_id`.
- **Laptop**: The physical asset. Each Laptop belongs to exactly one Tray (or is 'In Repair').
- **Assignment**: The "glue" record. Links a **Laptop**, an **Employee**, and a **Tray** with timestamps and status tracking.

---

## 4. Security & Data Integrity
### **Partial Unique Indexes**
To solve the problem of race conditions, we implemented a **Partial Unique Index** on the `Assignment` collection:
```javascript
assignmentSchema.index(
  { employeeId: 1 }, 
  { unique: true, partialFilterExpression: { status: { $in: ['active', 'requested'] } } }
);
```
*Why?* This ensures that no employee can ever have more than one "open" assignment record, preventing inventory double-counting.

### **Role-Based Access Control (RBAC)**
- **Admin**: Has `GET`, `POST`, `PUT`, `DELETE` access to all collections.
- **Service**: Has `GET` access to inventory and `POST` access to Fulfillment/Return actions.
- **Employee**: Strictly filtered `GET` access to their own assignment data only.

---

## 5. Deployment Infrastructure
- **API (Vercel Serverless)**: Each endpoint is a serverless function, allowing for infinite scaling during peak warehouse hours.
- **Logging (Winston)**: Customized to handle Vercel's read-only filesystem by streaming logs to `stdout`, which are then captured by Vercel's cloud logging service.
- **Mobile (Expo SDK 54)**: A universal runtime that allows the same code to run on both iOS and Android, critical for warehouse environments where hardware types vary.

---

## 6. UI/UX Philosophy
- **Web**: Uses a **Glassmorphic** design with high-contrast status badges for instant readability.
- **Mobile**: High-visibility "Action Cards" and a "Scan-Centric" workflow to minimize typing for techs in the field.

---
*Document Version: 1.1*  
*Project: GearPilot*
