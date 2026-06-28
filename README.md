# TaskFlow — Smart Task & Project Manager

A full-stack task and project management application built with the MERN stack, featuring JWT authentication, a Kanban-style board view, and an AI-powered effort estimation feature using the Google Gemini API.

---

## Screenshots

> See `/screenshots` folder or refer to the project report for all screenshots.

---

## Tech Stack

### Frontend
- React.js v18 (Vite)
- React Router DOM
- Tailwind CSS v4
- Axios

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- express-validator

### AI Integration
- Google Gemini API (`gemini-3-flash-preview`)
- Called server-side only — API key never reaches the browser

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Local (dev) / MongoDB Atlas (production)

---

## Live Demo

- **Frontend:** https://taskflow-omega-three-13.vercel.app
- **Backend:** https://taskflow-server-yiow.onrender.com
- **Test credentials:** Email: `tara@test.com` / Password: `123456`

---

## Local Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally (or Atlas URI)

### 1. Clone the repository
```bash
git clone https://github.com/harsshittabhati/Taskflow.git
cd Taskflow
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder (see `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```

Create a `.env.development` file in the `client/` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

### 4. Open the app
Go to `http://localhost:5173`

---

## Environment Variables

### Backend (`server/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `CLIENT_URL` | Frontend URL for CORS |
| `GEMINI_API_KEY` | Google Gemini API key |

### Frontend (`client/.env.development`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

---

## AI Feature

The app integrates Google Gemini API (`gemini-3-flash-preview`) for smart task estimation.

**How it works:**
1. User opens the Create/Edit Task modal and types a title and description
2. User clicks **"Suggest Estimate"** button
3. The frontend sends the title and description to the backend (`POST /api/ai/suggest`)
4. The backend calls the Gemini API with a structured prompt
5. Gemini returns a JSON response with effort estimate, suggested due date, and reasoning
6. The user can **accept** the suggestion (pre-fills the fields) or **ignore** it

**Security:** The Gemini API key is stored in the backend `.env` only and never sent to the browser.

**Graceful fallback:** If the API key is missing or the call fails, the app returns a default estimate and continues working normally.

---

## API Documentation

### Auth Routes
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user, returns JWT | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Board Routes
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/boards` | Get all boards for user | Yes |
| POST | `/api/boards` | Create new board | Yes |
| GET | `/api/boards/:id` | Get single board | Yes |
| PUT | `/api/boards/:id` | Update board | Yes |
| DELETE | `/api/boards/:id` | Delete board | Yes |

### Task Routes
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/tasks/board/:boardId` | Get all tasks for board | Yes |
| POST | `/api/tasks` | Create new task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |

### AI Routes
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/ai/suggest` | Get AI effort estimate | Yes |

---

## Features

- ✅ JWT authentication (register, login, logout, protected routes)
- ✅ Board management (create, rename, delete with confirmation)
- ✅ Task management (create, edit, delete, move between columns)
- ✅ 3-column Kanban board (To Do, In Progress, Done)
- ✅ Priority badges (low, medium, high)
- ✅ Due date with overdue visual cue (red border + label)
- ✅ AI-powered effort estimation (Google Gemini)
- ✅ Graceful AI fallback when API unavailable
- ✅ Dark mode / Light mode toggle (persisted)
- ✅ Fully responsive design
- ✅ Loading spinners and error handling
- ✅ Custom 404 page
- ✅ Ownership enforcement (users only see their own data)

---

## Known Issues / Future Improvements

- Drag and drop between columns (currently using Move Forward/Back buttons)
- MongoDB Atlas blocked on local network — using local MongoDB for development
- Dashboard analytics/charts (tasks by status, priority)
- Search and filter tasks globally
- Collaboration — share boards with other users
- Activity log for task changes

---

## Project Structure

```
taskflow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # Axios API functions
│   │   ├── components/    # Reusable components (Navbar)
│   │   ├── context/       # Auth context
│   │   └── pages/         # Login, Register, Dashboard, BoardView, NotFound
│   └── .env.example
└── server/                 # Node.js backend
    ├── config/            # DB connection
    ├── controllers/       # Route handlers
    ├── middleware/        # JWT auth middleware
    ├── models/            # Mongoose models
    ├── routes/            # Express routes
    └── .env.example
```