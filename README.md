# 🕐 AttendEase - Employee Attendance System

A full-stack Employee Attendance Management System built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🌐 Live Demo

https://attendacemanagementsys.vercel.app/

## 📋 Project Information

- **Name:**  Vanga NithinReddy

---

## 🚀 Features

### Employee Features
- ✅ Register/Login with secure authentication
- ✅ Mark daily attendance (Check In / Check Out)
- ✅ View attendance history (Calendar & Table view)
- ✅ View monthly summary (Present/Absent/Late/Half-day)
- ✅ Interactive dashboard with stats
- ✅ Profile management

### Manager Features
- ✅ Secure login with role-based access
- ✅ View all employees' attendance
- ✅ Filter by employee, date, status, department
- ✅ View team attendance summary
- ✅ Team calendar view
- ✅ Export attendance reports (CSV)
- ✅ Dashboard with team stats & charts

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Library
- **Zustand** - State Management
- **React Router v6** - Navigation
- **Tailwind CSS** - Styling
- **Recharts** - Charts & Visualizations
- **React Hot Toast** - Notifications
- **Axios** - HTTP Client

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password Hashing

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Manager** | manager@company.com | password123 |
| **Employee** | alice@company.com | password123 |
| **Employee** | bob@company.com | password123 |

> ⚠️ **Note:** First login may take 30-60 seconds as the free server wakes up.

---

## 📁 Project Structure

```
employee-attendance-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── attendanceController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Attendance.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── attendanceRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env.example
│   ├── package.json
│   ├── seed.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
│
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance-system
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env .exampleenv
# Update .env with your MongoDB URI
npm run seed    # Add sample data
npm run dev     # Start server on port 5000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env .exampleenv
npm run dev     # Start on port 5173
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Attendance (Employee)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance/checkin` | Check in |
| POST | `/api/attendance/checkout` | Check out |
| GET | `/api/attendance/today` | Today's status |
| GET | `/api/attendance/my-history` | Attendance history |
| GET | `/api/attendance/my-summary` | Monthly summary |

### Attendance (Manager)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance/all` | All employees attendance |
| GET | `/api/attendance/employee/:id` | Specific employee |
| GET | `/api/attendance/summary` | Team summary |
| GET | `/api/attendance/today-status` | Today's team status |
| GET | `/api/attendance/export` | Export CSV |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/employee` | Employee stats |
| GET | `/api/dashboard/manager` | Manager stats |
| GET | `/api/dashboard/employees` | All employees list |

---

## 🎯 Key Features Explained

### Attendance Status Logic
- **Present**: Check-in within 15 minutes of 9:00 AM
- **Late**: Check-in between 15 minutes to 2 hours late
- **Half-Day**: Check-in more than 2 hours late
- **Absent**: No check-in recorded

### Calendar Color Coding
- 🟢 Green - Present
- 🔴 Red - Absent
- 🟡 Yellow - Late
- 🟠 Orange - Half Day

---

## 🔧 Deployment

### Backend - Render
1. Create Web Service on Render
2. Connect GitHub repository
3. Set root directory: `backend`
4. Add environment variables
5. Deploy

### Frontend - Vercel
1. Import project on Vercel
2. Set root directory: `frontend`
3. Add environment variable: `VITE_API_URL`
4. Deploy

---

## 📝 License

This project is created for educational purposes.

---

## 🙏 Acknowledgments

- All open-source libraries used in this project
- MongoDB Atlas for free database hosting
- Render & Vercel for free hosting

---

**Made with ❤️ using MERN Stack**