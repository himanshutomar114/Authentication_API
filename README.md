# 🔐 Authentication API

A secure and scalable authentication API built with **Node.js**, **Express**, **MongoDB (Mongoose)**, **JWT**, and **Google OAuth 2.0**.

---

## 🚀 Features

- ✅ User Registration & Login (with JWT)
- 🔐 Password Hashing (using bcrypt)
- 🛡️ JWT Access & Refresh Token Authentication
- 🔄 Token Refresh Endpoint
- 🌐 Google OAuth Login
- 📦 MongoDB Integration with Mongoose
- 🧪 Protected Routes with Middleware

---

## 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB** with **Mongoose**
- **JWT (jsonwebtoken)**
- **bcrypt**
- **Passport.js** + **Google OAuth 2.0**
- **dotenv**

---

## 📁 Project Structure

auth-api/
│
├── lib/
│ └── db.js 
│
├── controllers/
│ └── authController.js 
│
├── middleware/
│ └── auth.middleware.js
│
├── models/
│ └── user.js 
│
├── routes/
│ └── authRoutes.js 
│
├── .env 
├── server.js 
└── package.json 


---

## 🔄 Authentication Flow Diagram

              ┌────────────────────────────┐
              │       User (Client)        │
              └────────────┬───────────────┘
                           │
                 1. Register/Login (email+pwd)
                           │
                           ▼
              ┌────────────────────────────┐
              │      Auth Controller       │
              └────────────┬───────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
  Check email & password         Create new user (Register)
          │                                 │
          ▼                                 ▼
    Hash password (bcrypt)       Save user in DB (Mongoose)
          │                                 │
          └────────────┬────────────────────┘
                       ▼
          Generate Access & Refresh Tokens (JWT)
                       │
                       ▼
             Return Tokens to Client
                       │
                       ▼
      ┌─────────────────────────────────────┐
      │   Client stores tokens (localStorage│
      │   or secure cookies)                │
      └─────────────────────────────────────┘

       ───────────────────────────────────
               🔒 Access Protected Route
       ───────────────────────────────────
                       │
             Send Access Token in Header
                       ▼
          Verify Token (auth middleware)
                       ▼
          Allow access to protected data

       ───────────────────────────────────
               🔄 Refresh Token Flow
       ───────────────────────────────────
                       │
            Send refresh token to backend
                       ▼
          Verify + issue new access token

       ───────────────────────────────────
                  🌐 Google OAuth Flow
       ───────────────────────────────────
                       │
         Click "Login with Google" Button
                       ▼
          Redirect to Google Consent Page
                       ▼
         User Authenticates on Google
                       ▼
          Google redirects to your callback
                       ▼
          Passport verifies Google token
                       ▼
        Check if user exists in database
              ├────────────┐
              ▼            ▼
        Yes (login)     No (register)
              ▼            ▼
        Generate JWT & Send to Client

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/Authentication_API.git
    cd Authentication_API
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file in the `server` directories.

    **`server/.env`**
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_key
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    ```

