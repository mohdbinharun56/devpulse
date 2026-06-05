# DevPulse – Internal Tech Issue & Feature Tracker

A collaborative platform for teams to report bugs, suggest new features, and manage issue resolution workflows. DevPulse helps contributors and maintainers efficiently track issues through a secure role-based system.

## 🚀 Live Demo

**Live URL:** https://devpulse-issues-track.vercel.app

---

## 📋 Features

### Authentication & Authorization
- User registration with role selection (Contributor / Maintainer)
- Secure password hashing using bcrypt
- JWT-based authentication
- Protected routes with token verification
- Role-based access control

### Issue Management
- Create bug reports and feature requests
- View all issues
- View single issue details
- Update issues with permission control
- Delete issues (Maintainer only)
- Issue workflow status management
- Filter issues by type and status
- Sort issues by newest or oldest

### User Roles

#### Contributor
- Register and login
- Create issues
- View all issues
- Update own issues when status is `open`

#### Maintainer
- All contributor permissions
- Update any issue
- Delete any issue
- Change issue status independently
- View all issues

---

## 🛠️ Tech Stack

- **Node.js**
- **TypeScript**
- **Express.js**
- **NeonDB PostgreSQL**
- **pg (Native PostgreSQL Driver)**
- **Raw SQL Queries**
- **bcrypt**
- **jsonwebtoken (JWT)**
- **dotenv**
- **cors**
- **http-status-codes**

---

## 📁 Project Structure

```bash
src/
│   ├── modules/
│   │   ├── auth/
│   │   └── issues/
│   ├── middlewares/
│   ├── database/
│   ├── config/
│   ├── types/
│   └── utils/
│   ├── app.ts
│   ├── server.ts
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mohdbinharun56/devpulse.git
cd devpulse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

DATABASE_URL=your_DB_URL

JWT_SECRET=your_secret_key
```

### 4. Create Database

```sql
CREATE DATABASE devpulse;
```

### 5. Run SQL Schema

#### Users Table

```sql
CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'contributor'
        CHECK(role IN('contributor','maintainer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
```

#### Issues Table

```sql
CREATE TABLE IF NOT EXISTS issues(
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL
    CHECK(LENGTH(description) >= 20),
    type VARCHAR(20) NOT NULL
    CHECK(type IN('bug', 'feature_request')),
    status VARCHAR(20) DEFAULT 'open'
    CHECK(status IN('open', 'in_progress', 'resolved')),
    reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
```

### 6. Run Development Server

```bash
npm run dev
```

### 7. Build Project

```bash
npm run build
```

### 8. Run Production Server

```bash
npm start
```

---

## 🗄️ Database Schema Summary

### Users

| Field | Description |
|---------|-------------|
| id | Auto-increment primary key |
| name | User full name |
| email | Unique email address |
| password | Hashed password |
| role | contributor / maintainer |
| created_at | Creation timestamp |
| updated_at | Last update timestamp |

### Issues

| Field | Description |
|---------|-------------|
| id | Auto-increment primary key |
| title | Issue title |
| description | Issue details |
| type | bug / feature_request |
| status | open / in_progress / resolved |
| reporter_id | Issue creator ID |
| created_at | Creation timestamp |
| updated_at | Last update timestamp |

---

# 📡 API Endpoints

## Authentication

### Register User

```http
POST /api/auth/signup
```

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

---

### Login User

```http
POST /api/auth/login
```

#### Request Body

```json
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

---

## Issues

### Create Issue

```http
POST /api/issues
```

**Protected Route**

#### Headers

```http
Authorization: <JWT_TOKEN>
```

---

### Get All Issues

```http
GET /api/issues
```

#### Query Parameters

| Parameter | Values |
|------------|---------|
| sort | newest, oldest |
| type | bug, feature_request |
| status | open, in_progress, resolved |

Example:

```http
GET /api/issues?sort=newest&type=bug&status=open
```

---

### Get Single Issue

```http
GET /api/issues/:id
```

---

### Update Issue

```http
PATCH /api/issues/:id
```

**Protected Route**

#### Headers

```http
Authorization: <JWT_TOKEN>
```

---

### Delete Issue

```http
DELETE /api/issues/:id
```

**Maintainer Only**

#### Headers

```http
Authorization: <JWT_TOKEN>
```

---

## 🔐 Authentication

For protected routes, include JWT token in the Authorization header.

```http
Authorization: <JWT_TOKEN>
```

Example:

```http
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📌 Business Rules

- Passwords are hashed using bcrypt.
- JWT is required for protected endpoints.
- Email addresses must be unique.
- Contributors can update only their own issues.
- Contributors cannot update issues once status is changed from `open`.
- Maintainers can update any issue.
- Maintainers can delete any issue.
- Maintainers can change issue status.
- Issue title maximum length is 150 characters.
- Issue description minimum length is 20 characters.

---

## 📊 HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## 👨‍💻 Author

**Mohammad Bin Harun**

- B.Sc. in Computer Science & Engineering (AIUB)

---
