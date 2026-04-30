# 🚀 Project Management System (PMS)
### Full-Stack App — React + Node.js + MongoDB + JWT RBAC

## Website - https://just-optimism-production-1260.up.railway.app/login
---

## 📁 COMPLETE FOLDER STRUCTURE

```
project-management-system/
├── backend/
│   ├── config/               # (optional: db.js if you want separate file)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── dashboardController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js           # JWT verify + adminOnly
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   ├── users.js
│   │   └── dashboard.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx        # Sidebar + nav
    │   │   ├── Modal.jsx         # Reusable modal
    │   │   └── TaskStatusBadge.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx   # Auth state + JWT management
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ProjectsPage.jsx
    │   │   ├── ProjectDetailPage.jsx
    │   │   └── TasksPage.jsx
    │   ├── services/
    │   │   └── api.js            # Axios instance
    │   ├── App.jsx               # Routes
    │   ├── index.css             # Tailwind + custom classes
    │   └── index.js
    ├── .env.example
    ├── package.json
    └── tailwind.config.js
```

Project Management System (PMS)

A full-stack web application to manage projects, assign tasks, and track progress with role-based access control.

Features:-
Authentication using JWT (Signup and Login)
Role-based access control (Admin and Member)
Project management (create, delete, manage team members)
Task management (create, assign, update status, due dates)
Dashboard with task statistics (pending, completed, overdue)
Priority and overdue tracking
Responsive user interface using React and Tailwind CSS

Tech Stack:-
Frontend: React.js, Tailwind CSS
Backend: Node.js, Express.js
Database: MongoDB
Authentication: JSON Web Tokens (JWT)
Deployment: Railway

Installation (Local Setup):-

1- Backend
cd backend
npm install
npm run dev

2- Frontend
cd frontend
npm install
npm start

Environment Variables
Backend (.env)
PORT=5000
MONGO_URI=mongodb+srv://yyaasshh4444_db_user:<Yyaasshh44>@cluster0.gcy8k4u.mongodb.net/?appName=Cluster0
CLIENT_URL=http://localhost:3000
NODE_ENV=development
Frontend (.env)
REACT_APP_API_URL=http://localhost:5000/api
GitHub Setup
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/jarvisz4/project-management-system.git
git push -u origin main
Deployment on Railway
Backend Deployment
Go to railway.app and create a new project
Select "Deploy from GitHub repository"

Choose your repository

Set the following:

Root Directory:

backend

Start Command:

node server.js

Environment Variables:
PORT=5000
MONGO_URI=https://github.com/jarvisz4/project-management-system.git
CLIENT_URL=https://just-optimism-production-1260.up.railway.app
NODE_ENV=production

Deploy and copy the backend URL.

Frontend Deployment
Create a new service in Railway
Select the same GitHub repository

Set the following:

Root Directory:

frontend

Build Command:

npm run build

Start Command:

npx serve -s build -p 3000

Environment Variables:

REACT_APP_API_URL=https://efficient-strength-production-03fc.up.railway.app/api

Deploy and copy the frontend URL.

Final Step

Update backend environment variable:

CLIENT_URL=https://just-optimism-production-1260.up.railway.app

Redeploy backend.

Live Demo

Frontend: https://just-optimism-production-1260.up.railway.app
Backend: https://efficient-strength-production-03fc.up.railway.app

Demo Credentials

Admin
Email: admin@demo.com
Password: password123

Member
Email: arun@gmail.com
Password: Yyaasshh44@

API Endpoints (Summary)

POST /api/auth/signup
POST /api/auth/login
GET /api/auth/me

GET /api/projects
POST /api/projects

GET /api/tasks
POST /api/tasks
PUT /api/tasks/

GET /api/dashboard

Author

Yash

Notes
Uses RESTful APIs with proper validation
Role-based restrictions enforced on backend
Designed with modular and scalable architecture
