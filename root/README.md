# Smart Campus Transit

A MERN stack application (MongoDB replaced with Firebase) for managing campus transit systems.

## Project Structure

```
SmartCampusTransit/
├── frontend/          # React application (Vite)
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/ # Reusable components
│   │   └── services/  # Firebase and API services
│   └── package.json
│
└── backend/           # Node.js/Express API
    ├── src/
    │   ├── routes/    # API routes
    │   ├── controllers/ # Route controllers
    │   └── config/    # Configuration files (Firebase Admin)
    └── package.json
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup Instructions

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173` (default Vite port)

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies (if not already installed):

   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:

   ```env
   PORT=5000
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The backend API will be available at `https://smart-campus-backend-iuqo.onrender.com`

## Available Routes

### Frontend Routes

- `/` - Home page
- `/student` - Student Portal
- `/admin` - Admin Portal

### Backend API Routes

- `GET /` - API welcome message
- `GET /api/test` - Test route (returns "API running")

## Next Steps

1. **Firebase Setup (Frontend)**:

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Get your Firebase config
   - Update `frontend/src/services/firebase.js` with your configuration

2. **Firebase Admin Setup (Backend)**:

   - In Firebase Console, go to Project Settings > Service Accounts
   - Generate a new private key
   - Save it as `serviceAccountKey.json` in `backend/src/config/`
   - Update `backend/src/config/firebase.js` with the service account initialization

3. **Environment Variables**:
   - Create `.env` files in both frontend and backend directories
   - Add necessary environment variables

## Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Technologies Used

- **Frontend**: React, Vite, React Router DOM, Axios, Firebase (Web SDK)
- **Backend**: Node.js, Express, CORS, Firebase Admin SDK
