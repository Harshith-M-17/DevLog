# Mini DevLog

A React web application for teams to share daily development progress and learnings.

## 🚀 Live Demo

The app is running at: **http://localhost:5174/**

## Features

### 🔐 Authentication
- **Login/Register Screen**: Toggle between login and register modes
- **JWT Token Storage**: Secure authentication with localStorage
- **Protected Routes**: Automatic redirection based on authentication status

### 📊 Dashboard (Team Feed)
- **Daily Entries Feed**: View all team members' daily entries in card format
- **Entry Details**: Each card shows Name, Date, Work Done, Blockers, Learnings, and GitHub commit links
- **Floating Add Button**: Quick access to add new entries
- **Responsive Design**: Works on desktop and mobile devices

### ✏️ Add/Edit Entry Form
- **Rich Form Fields**: Work Done, Blockers, Learnings, and optional GitHub commit link
- **Form Validation**: Required field validation and GitHub URL validation
- **Edit Functionality**: Edit your own entries with pre-populated data
- **Clean UI**: Intuitive form design with error handling

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: Plain CSS (no frameworks)
- **Build Tool**: Vite
- **State Management**: React Context API

## Project Structure

```
src/
├── components/          # Reusable components
│   └── ProtectedRoute.tsx
├── contexts/           # React Context providers
│   └── AuthContext.tsx
├── pages/              # Main application screens
│   ├── Auth.tsx        # Login/Register page
│   ├── Auth.css
│   ├── Dashboard.tsx   # Team feed/dashboard
│   ├── Dashboard.css
│   ├── EntryForm.tsx   # Add/Edit entry form
│   ├── EntryForm.css
│   └── index.ts        # Page exports
├── services/           # API and external services
│   └── api.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── auth.ts
├── App.tsx             # Main app component with routing
├── App.css             # Global app styles
├── index.css           # Base CSS reset and global styles
└── main.tsx            # Application entry point
```

## Backend API Requirements

This frontend expects a backend API with the following endpoints:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Daily Entries Endpoints
- `GET /api/daily-entries` - Get all entries
- `POST /api/daily-entries` - Create new entry
- `PUT /api/daily-entries/:id` - Update existing entry

**Note**: The app is currently configured to connect to `http://localhost:3001`. Update `API_BASE_URL` in `src/services/api.ts` to match your backend URL.

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Features Implemented

✅ **Authentication Flow**: Complete login/register with JWT storage  
✅ **Protected Routing**: Route guards based on authentication  
✅ **Dashboard**: Team feed with entry cards and floating add button  
✅ **Form Handling**: Add/Edit entries with validation  
✅ **Responsive Design**: Mobile-first CSS for all screen sizes  
✅ **TypeScript**: Full type safety throughout the application  
✅ **Error Handling**: Comprehensive error states and user feedback
