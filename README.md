# ⚡ NEXUS ARENA – Next-Gen Esports Tournament Platform

An enterprise-grade, high-performance competitive gaming infrastructure designed for esports tournament organizers, pro contenders, and gaming organizations. 

**NEXUS ARENA** streamlines end-to-end tournament lifecycle operations — from directive creation, roster screening, and automated duel fixtures to real-time MMR leaderboards and verified Hall of Fame publishing.

---

## 🚀 Key Architectural Pillars

- **Directive Management**: Configure tournament parameters, prize pools, entry fees, player caps, and online/LAN venue logistics.
- **Roster Screening Hub**: Screen applicant registrations with one-click authorization or disqualification protocols.
- **Automated Duel Scheduler**: Coordinate round fixtures (Round of 16 through Grand Finals) with real-time scorekeeping.
- **Dynamic MMR Standings**: Real-time tournament leaderboards auto-calculated upon match result certification.
- **Certified Hall of Fame**: Official result publishing with championship podium highlights and archived placements.
- **Dual Command Center**: Tailored HUD for both Tournament Organizers (operations & metrics) and Pro Contenders (match queues & battle records).

---

## 🧰 Technology Architecture

| Tier | Technologies Employed |
| :--- | :--- |
| **Frontend Client** | HTML5, Cyberpunk CSS3 Design System, JavaScript (ES6+), Bootstrap 5, Bootstrap Icons |
| **API Server Engine** | Node.js, Express.js (RESTful MVC Architecture) |
| **Data Layer** | MongoDB Atlas with Mongoose ODM |
| **Security & Auth** | JSON Web Tokens (JWT), `bcryptjs` salted password hashing, RBAC Middleware |
| **Tooling & Standards** | Modern Web Standards, RESTful API Design, Postman Collections |

---

## 📁 Repository Structure

```
nexus-arena/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection lifecycle
│   ├── controllers/               # Business logic handlers
│   │   ├── authController.js      # Authentication & token dispatch
│   │   ├── userController.js      # Profile & credential updates
│   │   ├── tournamentController.js# Tournament CRUD operations
│   │   ├── registrationController.js# Applicant review & approvals
│   │   ├── matchController.js     # Duel fixtures & scorekeeper certification
│   │   ├── leaderboardController.js# Dynamic MMR & win-loss calculation
│   │   ├── resultController.js    # Final podium certification
│   │   └── dashboardController.js # Aggregated telemetry & metrics
│   ├── middleware/
│   │   ├── auth.js                # JWT token verification & RBAC guard
│   │   └── errorHandler.js        # Global error interceptor
│   ├── models/                    # Mongoose Data Schemas
│   │   ├── User.js                # Organizers & Contenders
│   │   ├── Tournament.js          # Tournament directives
│   │   ├── Registration.js        # Roster applications
│   │   ├── Match.js               # Scheduled duels & scores
│   │   ├── Leaderboard.js         # Dynamic tournament standings
│   │   └── Result.js              # Certified final podium
│   ├── routes/                    # Modular Express routes
│   ├── .env.example               # Configuration template
│   ├── package.json               # Backend dependencies & scripts
│   └── server.js                  # Server entry point & static file server
│
├── frontend/                      # Cyberpunk dark glassmorphic UI client
│   ├── css/style.css              # Cyber HUD design system & animations
│   ├── js/
│   │   ├── api.js                 # Unified REST API client with auto-attached JWT
│   │   └── auth.js                # Session management, navigation & HUD toasts
│   ├── index.html                 # Nexus Arena Landing & Headquarters
│   ├── login.html                 # Operative access portal
│   ├── register.html              # Operative enlistment portal
│   ├── dashboard.html             # Command center (Organizer / Contender)
│   ├── tournaments.html           # Competitive circuit directory & filters
│   ├── tournament-details.html    # Tournament intelligence hub
│   ├── create-tournament.html     # Directive creation studio
│   ├── edit-tournament.html       # Directive parameter modifier
│   ├── registrations.html         # Roster verification & screening hub
│   ├── matches.html               # Match center & scorekeeper
│   ├── leaderboard.html           # Real-time podium & standings matrix
│   ├── results.html               # Certified Hall of Fame
│   └── profile.html               # Gamer identity & security credentials
│
├── docs/
│   ├── database-setup.md          # MongoDB Atlas cluster setup guide
│   └── deployment-guide.md        # Production cloud deployment guide
│
└── README.md
```

---

## 🔌 REST API Specification

**Base URL**: `http://localhost:5001/api`

### 1. Authentication (`/api/auth`)
| Verb | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Enlist new contender or organizer account |
| `POST` | `/auth/login` | Public | Authenticate credentials & issue JWT |
| `POST` | `/auth/logout` | Private | Invalidate operative session |
| `GET` | `/auth/me` | Private | Retrieve active authenticated operative |

### 2. User Profiles (`/api/users`)
| Verb | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `PUT` | `/users/profile` | Private | Update gamer tag, phone/tag, or passkey |
| `GET` | `/users/:id` | Private | Retrieve user by unique identifier |

### 3. Tournaments (`/api/tournaments`)
| Verb | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/tournaments` | Public | List tournaments with `search`, `game`, `status`, `page`, `limit` |
| `GET` | `/tournaments/:id` | Public | Inspect full tournament intelligence |
| `POST` | `/tournaments` | Organizer | Initialize new tournament directive |
| `PUT` | `/tournaments/:id` | Organizer (Owner) | Modify tournament parameters |
| `DELETE` | `/tournaments/:id` | Organizer (Owner) | Terminate tournament directive |
| `GET` | `/tournaments/organizer/mine` | Organizer | Query self-hosted tournaments |

### 4. Roster Applications (`/api/registrations`)
| Verb | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/registrations/:tournamentId` | Player | Submit application for tournament |
| `PUT` | `/registrations/cancel/:id` | Player (Owner) | Withdraw registration |
| `PUT` | `/registrations/:id/approve` | Organizer | Authorize candidate to official roster |
| `PUT` | `/registrations/:id/reject` | Organizer | Reject / deny candidate application |
| `GET` | `/registrations/tournament/:tournamentId` | Organizer | Inspect tournament applicant queue |
| `GET` | `/registrations/mine` | Player | Query personal registration history |

### 5. Match Duels (`/api/matches`)
| Verb | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/matches` | Organizer | Schedule competitive duel fixture |
| `GET` | `/matches/tournament/:tournamentId` | Public | Fetch match schedule for tournament |
| `PUT` | `/matches/:id` | Organizer | Reschedule duel or modify contenders |
| `PUT` | `/matches/:id/result` | Organizer | Certify duel scores & sync leaderboard |

### 6. Dynamic Standings (`/api/leaderboard`)
| Verb | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/leaderboard/:tournamentId` | Public | Real-time ranked MMR standings matrix |

### 7. Hall of Fame (`/api/results`)
| Verb | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/results/:tournamentId/publish` | Organizer | Publish official results & mark completed |
| `GET` | `/results/:tournamentId` | Public | Inspect certified champion podium |

### 8. Command Center Telemetry (`/api/dashboard`)
| Verb | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/organizer` | Organizer | Aggregate host metrics, rosters & duels |
| `GET` | `/dashboard/player` | Player | Enrolled tournaments & match queue |

---

## ⚡ Deployment & Execution

### 1. Environment Configuration
Navigate to `backend/` and copy `.env.example` to `.env`:
```bash
cd backend
cp .env.example .env
```
Provide your MongoDB Atlas connection string and security keys:
```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/nexusarena?retryWrites=true&w=majority
JWT_SECRET=nexus_super_secure_production_secret_key
JWT_EXPIRE=7d
```

### 2. Dependency Installation & Launch
```bash
cd backend
npm install
npm run dev   # or npm start
```

Once running, access the web client at `http://localhost:5001`.

---

## 🛡️ Security Best Practices
- Passwords hashed using industry-standard `bcryptjs` with 10 salt rounds.
- Strict JWT authentication on private routes with granular Role-Based Access Control (RBAC).
- Parameterized MongoDB queries through Mongoose models mitigating injection vectors.

