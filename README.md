#chatty- A Chat-App

A small real-time chat application built with a MERN-style stack (Node.js + Express backend, MongoDB, React frontend) using Socket.IO for realtime messaging and Cloudinary for image uploads.

## Table of contents

- [Demo / Overview](#demo--overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Run locally](#run-locally)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [API (main endpoints)](#api-main-endpoints)
- [How authentication works](#how-authentication-works)
- [Realtime (Socket.IO) behavior](#realtime-socketio-behavior)
- [Deployment notes](#deployment-notes)
- [Contributing](#contributing)
- [Acknowledgements & References](#acknowledgements--references)

## Demo / Overview

This project implements a simple chat application with:

- User sign up / login
- Profile picture upload (Cloudinary)
- Realtime online presence and messaging with Socket.IO
- Persistent message storage in MongoDB

It is intended as a practice project for building a modern realtime web app using web sockets

## Features

- Sign up / Login / Logout
- Upload profile picture (base64 image strings uploaded to Cloudinary)
- View list of users (sidebar)
- Send text and image messages
- Real-time delivery for online recipients
- JWT-based authentication stored in an HTTP-only cookie

## Tech stack

- Backend: Node.js, Express, Mongoose (MongoDB), Socket.IO
- Frontend: React (Vite), Tailwind CSS, Zustand for state
- Image storage: Cloudinary
- Auth: JWT stored in cookie

## Repository structure (important files)

- `backend/`
  - `index.js` - Express app entry (connects DB, mounts routes, starts server)
  - `src/controllers/` - route handlers (`auth.controller.js`, `message.controller.js`)
  - `src/routes/` - `auth.route.js`, `message.route.js`
  - `src/lib/` - helpers: `db.js`, `cloudinary.js`, `socket.js`, `utils.js`
  - `src/models/` - Mongoose models for `User` and `Message`

- `frontend/`
  - `src/` - React app source (pages, components, store hooks)
  - Vite + Tailwind + Zustand for local state

## Prerequisites

- Node.js (v16+ recommended) and npm
- A MongoDB instance (local or hosted like Atlas)
- A Cloudinary account for file uploads

## Environment variables

Create a `.env` file in the `backend/` folder (or provide env vars by other means). Example entries used by this project:

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/chat-app?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Notes:
- The backend reads `process.env.MONGODB_URI` for Mongo connection.
- Cloudinary configuration is read from `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- The JWT secret must be provided as `JWT_SECRET` and is used to sign auth cookies.

## Run locally

Open two terminals (one for backend, one for frontend).

### Backend

1. Install dependencies and start dev server:

```bash
cd backend
npm install
npm run dev
```

- The `backend/package.json` includes a `dev` script: `nodemon index.js`. The server will run on `PORT` (defaults to `5000`).
- The server currently allows CORS from `http://localhost:5173` (this is where the frontend dev server usually runs).

### Frontend

1. Install dependencies and start the dev server:

```bash
cd frontend
npm install
npm run dev
```

- The `frontend/package.json` provides `dev` (vite), `build` and `preview` scripts.

## API (main endpoints)

All backend routes are mounted under `/api`.

- Auth
  - `POST /api/auth/signup` — create account (body: `{ fullName, email, password }`)
  - `POST /api/auth/login` — login (body: `{ email, password }`) — sets `jwt` cookie on success
  - `POST /api/auth/logout` — clears cookie
  - `PUT /api/auth/update-profile` — protected; expects `{ profilePic }` (base64 string); uploads to Cloudinary and updates user
  - `GET /api/auth/check` — protected; returns user data based on cookie

- Messages
  - `GET /api/messages/users` — protected; returns all users except the logged-in user (sidebar list)
  - `GET /api/messages/:id` — protected; get conversation messages with user `:id`
  - `POST /api/messages/send/:id` — protected; send a message to `:id`. Accepts `{ text, image }` where `image` can be a base64 string to upload to Cloudinary.

Protected routes require a valid JWT stored in the `jwt` cookie (the middleware reads `req.cookies.jwt`).

## How authentication works

- When a user signs up or logs in successfully, a JWT is generated and sent to the client as an HTTP-only cookie named `jwt` using `generateToken` in the backend utilities.
- Protected routes use `protectRoute` middleware which verifies the cookie's JWT and attaches the user to `req.user`.

## Realtime (Socket.IO) behavior

- The server initializes a `socket.io` server and maintains a map `userSocketMap` to map user IDs to socket IDs for online-user tracking.
- On connection, clients should pass their `userId` in the socket handshake query so the server can track them.
- When a message is saved in the backend, the server checks `getReceiverSocketId(receiverId)` and emits `newMessage` to the receiver if they are online.

Important CORS/origin settings used in the code:
- Express CORS origin is set to `http://localhost:5173` in `backend/index.js`.
- Socket.IO CORS origin is also configured for `http://localhost:5173` in `backend/src/lib/socket.js`.

If your frontend runs on a different host/port, update these origin values.

## Deployment notes

- For production you will typically:
  - Host MongoDB on Atlas (or another hosted DB)
  - Set Cloudinary env vars from your deployment provider
  - Build the frontend with `npm run build` inside `frontend/` and serve the static build with a static host (Netlify, Vercel) or serve it from the backend by adding a static folder serving step.
  - Ensure CORS and socket origins match the deployed front-end domain.

## Contributing

- Feel free to open issues or PRs. Keep changes small and focused. Add tests if you change data logic.

## Acknowledgements & References

- Built as a practice MERN realtime chat app using Socket.IO and Cloudinary for images.

---

If you want, I can also:

- add a `README` section with screenshots or GIFs (if you provide images),
- add a sample `.env.example` file in `backend/`, or
- add a short guide in the front-end `README` describing the store hooks and where to configure socket connections.

Made with ❤️ — if you want changes, tell me what to adjust.
