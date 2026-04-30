# 🚀 Project Management System (PMS)
### Full-Stack App — React + Node.js + MongoDB + JWT RBAC

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

---

## 🔌 API ENDPOINTS

### Auth
| Method | Endpoint           | Access | Description          |
|--------|--------------------|--------|----------------------|
| POST   | /api/auth/signup   | Public | Register new user    |
| POST   | /api/auth/login    | Public | Login & get JWT      |
| GET    | /api/auth/me       | Auth   | Get current user     |

### Projects
| Method | Endpoint                        | Access      | Description          |
|--------|---------------------------------|-------------|----------------------|
| GET    | /api/projects                   | Auth        | Get all projects     |
| POST   | /api/projects                   | Admin only  | Create project       |
| GET    | /api/projects/:id               | Auth        | Get project details  |
| DELETE | /api/projects/:id               | Admin only  | Delete project       |
| POST   | /api/projects/:id/members       | Admin only  | Add member           |
| DELETE | /api/projects/:id/members/:uid  | Admin only  | Remove member        |

### Tasks
| Method | Endpoint        | Access           | Description          |
|--------|-----------------|------------------|----------------------|
| GET    | /api/tasks      | Auth             | Get tasks (filtered) |
| POST   | /api/tasks      | Admin only       | Create task          |
| PUT    | /api/tasks/:id  | Admin / Assignee | Update task          |
| DELETE | /api/tasks/:id  | Admin only       | Delete task          |

### Dashboard
| Method | Endpoint        | Access | Description          |
|--------|-----------------|--------|----------------------|
| GET    | /api/dashboard  | Auth   | Get stats + summary  |

### Users
| Method | Endpoint    | Access | Description     |
|--------|-------------|--------|-----------------|
| GET    | /api/users  | Auth   | List all users  |

---

## 🗄️ DATABASE MODELS

### User
```js
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed, minlength: 6),
  role: 'admin' | 'member' (default: 'member'),
  createdAt, updatedAt
}
```

### Project
```js
{
  name: String (required),
  description: String,
  createdBy: ObjectId → User,
  members: [ObjectId → User],
  createdAt, updatedAt
}
```

### Task
```js
{
  title: String (required),
  description: String,
  projectId: ObjectId → Project (required),
  assignedTo: ObjectId → User,
  createdBy: ObjectId → User (required),
  status: 'pending' | 'in-progress' | 'completed',
  dueDate: Date,
  isOverdue: virtual (computed)
  createdAt, updatedAt
}
```

---

## 🛡️ ROLE-BASED ACCESS

| Action                    | Admin | Member |
|---------------------------|-------|--------|
| Create project            | ✅    | ❌     |
| Delete project            | ✅    | ❌     |
| Add/Remove members        | ✅    | ❌     |
| Create task               | ✅    | ❌     |
| Assign task to user       | ✅    | ❌     |
| Delete task               | ✅    | ❌     |
| Update any task field     | ✅    | ❌     |
| Update own task status    | ✅    | ✅     |
| View assigned tasks       | ✅    | ✅     |
| View project details      | ✅    | ✅     |

---

## ⚙️ LOCAL DEVELOPMENT SETUP

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (free tier) or local MongoDB
- npm or yarn

### Step 1: Clone / Setup
```bash
# Create folders (or clone your repo)
mkdir project-management-system
cd project-management-system
```

### Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev   # starts on port 5000
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# .env is pre-configured for local dev (proxy to port 5000)
npm start     # starts on port 3000
```

### Backend .env
```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/pms
JWT_SECRET=mysupersecretkey_changeme
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend .env (local)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🚂 RAILWAY DEPLOYMENT (Step by Step)

### Prerequisites
- GitHub account
- Railway account (railway.app — free tier available)
- MongoDB Atlas free cluster

---

### Step 1: Setup MongoDB Atlas
1. Go to **mongodb.com/atlas** → Create free account
2. Create a new **free cluster** (M0 tier)
3. Create a **database user** (username + password)
4. Whitelist IP: go to **Network Access** → Add `0.0.0.0/0` (allow all)
5. Get your **connection string**:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/pms`

---

### Step 2: Push Code to GitHub
```bash
# In project root
git init
git add .
git commit -m "Initial commit: Project Management System"
git remote add origin https://github.com/YOUR_USERNAME/pms-app.git
git push -u origin main
```

---

### Step 3: Deploy Backend on Railway
1. Go to **railway.app** → New Project → **Deploy from GitHub repo**
2. Select your repository
3. Railway auto-detects Node.js → Click **Deploy**
4. Go to **Variables** tab → Add these environment variables:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/pms
   JWT_SECRET=your_long_random_secret_key_here
   CLIENT_URL=https://YOUR_FRONTEND_URL.railway.app
   NODE_ENV=production
   ```
5. Go to **Settings** → **Root Directory**: set to `backend`
6. Go to **Settings** → **Start Command**: `node server.js`
7. Click **Deploy** → Wait for build to complete
8. Copy your backend URL (e.g. `https://pms-backend-production.railway.app`)

---

### Step 4: Deploy Frontend on Railway
1. In your Railway project → **New Service** → Deploy from same GitHub repo
2. Go to **Settings** → **Root Directory**: set to `frontend`
3. Go to **Settings** → **Build Command**: `npm run build`
4. Go to **Settings** → **Start Command**: `npx serve -s build -p 3000`
5. Go to **Variables** → Add:
   ```
   REACT_APP_API_URL=https://YOUR_BACKEND_URL.railway.app/api
   ```
6. Redeploy → Copy your frontend URL

---

### Step 5: Update Backend CORS
Update `CLIENT_URL` in your backend Railway variables:
```
CLIENT_URL=https://YOUR_FRONTEND_URL.railway.app
```
Then redeploy backend.

---

### Step 6: Verify Deployment
Visit your frontend URL → You should see the ProjectMS login page ✅

---

## 🧪 SAMPLE TEST DATA

### Test Users
```json
[
  {
    "name": "Alice Admin",
    "email": "admin@demo.com",
    "password": "password123",
    "role": "admin"
  },
  {
    "name": "Bob Member",
    "email": "bob@demo.com",
    "password": "password123",
    "role": "member"
  },
  {
    "name": "Carol Member",
    "email": "carol@demo.com",
    "password": "password123",
    "role": "member"
  }
]
```

### Test API Calls (using curl)

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Admin","email":"admin@demo.com","password":"password123","role":"admin"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"password123"}'
# Copy the token from response
```

**Create Project (Admin):**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"Website Redesign","description":"Q1 2025 website overhaul"}'
```

**Create Task (Admin):**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Design new homepage",
    "description": "Create wireframes and mockups",
    "projectId": "PROJECT_ID_HERE",
    "assignedTo": "USER_ID_HERE",
    "dueDate": "2025-03-15",
    "status": "pending"
  }'
```

**Update Task Status (Member):**
```bash
curl -X PUT http://localhost:5000/api/tasks/TASK_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MEMBER_TOKEN_HERE" \
  -d '{"status":"in-progress"}'
```

---

## 🔒 SECURITY FEATURES

- ✅ Passwords hashed with **bcrypt** (10 salt rounds)
- ✅ JWT tokens expire after **7 days**
- ✅ Protected routes with middleware
- ✅ Role-based authorization (Admin vs Member)
- ✅ Input validation on all endpoints
- ✅ Auto-logout on expired/invalid token
- ✅ CORS configured for specific origin

---

## 🌟 KEY FEATURES SUMMARY

| Feature                    | Status |
|----------------------------|--------|
| Signup / Login             | ✅     |
| JWT Auth                   | ✅     |
| Role-Based Access (RBAC)   | ✅     |
| Create / Delete Projects   | ✅     |
| Add / Remove Members       | ✅     |
| Create / Update / Delete Tasks | ✅  |
| Assign Tasks to Members    | ✅     |
| Task Status Tracking       | ✅     |
| Due Date + Overdue Detection | ✅   |
| Dashboard with Stats       | ✅     |
| Responsive UI (Tailwind)   | ✅     |
| Form Validation            | ✅     |
| Toast Notifications        | ✅     |

---

## 📦 TECH STACK VERSIONS

### Backend
- express: ^4.18.2
- mongoose: ^8.0.3
- jsonwebtoken: ^9.0.2
- bcryptjs: ^2.4.3
- cors: ^2.8.5
- dotenv: ^16.3.1

### Frontend
- react: ^18.2.0
- react-router-dom: ^6.20.1
- axios: ^1.6.2
- react-hot-toast: ^2.4.1
- date-fns: ^2.30.0
- tailwindcss (via react-scripts)
