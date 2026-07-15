# PariSar

PariSar is a modern society management platform that streamlines communication, visitor management, maintenance, announcements, complaints, deliveries, and other day-to-day operations for residential communities.

This repository serves as the **workspace** for the PariSar project and contains both the mobile application and the backend as separate projects.

## Project Structure

```text
.
├── backend/          # Express.js backend API
├── mobile/           # Expo + React Native mobile application
└── README.md
```

## Projects

- 📱 **[Mobile Application](./mobile)** — Expo + React Native client
- ⚙️ **[Backend API](./backend)** — Express.js + MongoDB server

### 📱 Mobile ([`/mobile`](./mobile))

The React Native application built with Expo.

**Tech Stack**

- React Native
- Expo
- TypeScript
- Expo Router
- React Query
- Firebase Cloud Messaging (via backend)

**Responsibilities**

- Resident & Guard interfaces
- Authentication
- Visitor management
- Complaints
- Notices
- Maintenance payments
- Push notifications
- Profile & society management

---

### ⚙️ Backend ([`/backend`](./backend))

REST API powering the PariSar mobile application.

**Tech Stack**

- Node.js
- Express.js
- MongoDB
- Mongoose
- Firebase Admin SDK
- JWT Authentication

**Responsibilities**

- Authentication & authorization
- User and society management
- Visitor approval workflow
- Complaint management
- Notice management
- Push notification delivery
- File uploads
- Business logic

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/pratksharma/PariSar
cd PariSar
```

### Mobile

```bash
cd mobile
npm install
npm start
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Repository Layout

Each project is intentionally isolated with its own:

- `package.json`
- `.gitignore`
- Environment configuration
- Dependencies
- Documentation

This allows the frontend and backend to be developed, tested, and deployed independently.

## License

This project is licensed under the MIT License.
