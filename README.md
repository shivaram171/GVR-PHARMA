# GVR Pharma Inventory & Order Management System

## 📌 Overview

The **GVR Pharma Inventory & Order Management System** is a full-stack web application designed to streamline pharmaceutical inventory and order management. The system enables efficient management of medicines, suppliers, inventory, and purchase orders through a secure and user-friendly interface.

This project was developed during my internship at **GVR Pharma Pvt. Ltd.**, where I primarily contributed to backend development by designing and implementing RESTful APIs using **Node.js** and **Express.js**.

---

## 🚀 Features

- User Registration & Login
- JWT-based Authentication & Authorization
- Medicine Inventory Management
- Supplier Management
- Order Management
- Dashboard with Inventory Statistics
- Report Generation
- Secure Password Hashing using bcrypt
- RESTful API Architecture
- MongoDB Database Integration

---

## 🛠 Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt.js
- RESTful APIs

### Database
- MongoDB
- Mongoose

### Tools
- Postman
- Git & GitHub
- VS Code

---

## 📂 Project Structure

```
GVR-Pharma/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 📋 Modules

### Authentication
- User Registration
- User Login
- JWT Token Authentication

### Dashboard
- Inventory Overview
- Medicine Statistics
- Supplier Statistics
- Order Summary

### Medicines
- Add Medicine
- Update Medicine
- Delete Medicine
- View Medicines

### Suppliers
- Add Supplier
- Update Supplier
- Delete Supplier
- View Suppliers

### Orders
- Create Orders
- View Orders
- Update Orders
- Delete Orders

### Reports
- Inventory Reports
- Order Reports
- Dashboard Analytics

---

## 🔄 Application Workflow

```
User
   │
   ▼
React Frontend
   │
Axios API Requests
   │
   ▼
Express.js Routes
   │
   ▼
Controllers
   │
   ▼
MongoDB (Mongoose)
   │
   ▼
JSON Response
   │
   ▼
React UI
```

---

## 🔐 Authentication Flow

1. User registers an account.
2. Password is hashed using bcrypt.
3. User logs in with email and password.
4. Backend validates credentials.
5. JWT Token is generated.
6. Protected APIs require the JWT token.

---

## 📊 REST APIs

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Medicines
- GET /api/medicines
- POST /api/medicines
- PUT /api/medicines/:id
- DELETE /api/medicines/:id

### Suppliers
- GET /api/suppliers
- POST /api/suppliers
- PUT /api/suppliers/:id
- DELETE /api/suppliers/:id

### Orders
- GET /api/orders
- POST /api/orders
- PUT /api/orders/:id
- DELETE /api/orders/:id

### Reports
- GET /api/reports

---

## ⚙ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/GVR-Pharma.git
```

### Install Backend

```bash
cd backend
npm install
```

### Install Frontend

```bash
cd frontend
npm install
```

### Configure Environment Variables

Create a `.env` file inside the backend folder.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Run Backend

```bash
npm run dev
```

### Run Frontend

```bash
npm start
```

---

## 📈 Future Enhancements

- Barcode/QR Code Integration
- Medicine Expiry Notifications
- Low Stock Alerts
- Sales & Billing Module
- Email Notifications
- Cloud Deployment
- Advanced Analytics Dashboard
- Role-Based Access Control

---

## 🎯 Learning Outcomes

During this project, I gained practical experience in:

- Backend Development
- RESTful API Development
- Node.js & Express.js
- MongoDB Integration
- JWT Authentication
- CRUD Operations
- API Testing using Postman
- Database Design
- Full-Stack Application Development

---

## 👨‍💻 Author

**Varanganty Shivaram**

Backend Developer

Institute of Aeronautical Engineering

Hyderabad, Telangana

GitHub: https://github.com/shivaram171

LinkedIn: https://www.linkedin.com/in/shivaram171

---
