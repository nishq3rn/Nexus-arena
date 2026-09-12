# Database Setup Guide – MongoDB Atlas

**NEXUS ARENA** connects to **MongoDB Atlas** (cloud-hosted MongoDB) through **Mongoose** for data modeling. Follow this setup protocol to initialize your cluster.

---

## 1. Create an Atlas Account
1. Visit https://www.mongodb.com/cloud/atlas/register and create an account (Free M0 tier available).
2. Create a new Organization / Project, e.g. `NexusArena-Esports`.

---

## 2. Deploy a Database Cluster
1. In the console, select **Build a Database** → choose the **Free (M0)** tier.
2. Select your preferred Cloud Provider and regional datacenter (e.g. AWS / Mumbai or Frankfurt).
3. Name the cluster (e.g. `nexus-cluster`) and click **Create Deployment**.

---

## 3. Create Database Security Credentials
1. Under **Security** → **Database Access**, click **Add New Database User**.
2. Authentication Method: **Password**.
3. Choose a Username and secure Password (retain these for your connection URI).
4. Assign user privileges: **Read and write to any database**.
5. Save user.

---

## 4. Configure Network Access Firewalls
1. Under **Security** → **Network Access**, select **Add IP Address**.
2. For global development or cloud deployment platforms (Render, Railway, etc.), select **Allow Access from Anywhere** (`0.0.0.0/0`).
3. Click **Confirm**.

---

## 5. Obtain Connection URI
1. Return to **Databases** → click **Connect** on your cluster.
2. Select **Drivers** → Driver: `Node.js`.
3. Copy the SRV connection string:
   ```
   mongodb+srv://<username>:<password>@nexus-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Insert your database credentials and declare the database name `nexusarena` before the parameter string:
   ```
   mongodb+srv://nexusadmin:YourSecurePassword@nexus-cluster.xxxxx.mongodb.net/nexusarena?retryWrites=true&w=majority
   ```

---

## 6. Configure Backend Environment
1. In `backend/`, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Populate the parameters:
   ```env
   PORT=5001
   MONGO_URI=mongodb+srv://nexusadmin:YourSecurePassword@nexus-cluster.xxxxx.mongodb.net/nexusarena?retryWrites=true&w=majority
   JWT_SECRET=nexus_super_secure_production_secret_key_2026
   JWT_EXPIRE=7d
   ```
3. Save the file.

---

## 7. Verify Operational Link
Launch the API engine:
```bash
cd backend
npm install
npm run dev
```
Upon successful handshake, the console will report:
```
[MongoDB] Connected successfully: nexus-cluster-shard-00-00.xxxxx.mongodb.net/nexusarena
[NEXUS ARENA] Server engine active in development mode on port 5001
```

---

## 8. Schema Collections
Mongoose schemas automatically provision collections upon data insertion:
- `users`: Operative credentials, gamer tags, roles (`organizer`, `player`).
- `tournaments`: Directives, prize matrices, capacities, venue logistics.
- `registrations`: Candidate applications & verification states.
- `matches`: Round brackets, scheduled duel fixtures, scores, victors.
- `leaderboards`: Dynamic tournament MMR & win-loss tallies.
- `results`: Certified championship podium records.
