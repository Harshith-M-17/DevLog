import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setToken, setHydrating } from './store/authSlice';
import { setEntries } from './store/entriesSlice';
import { getProfile, getEntries } from './services/api';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { EntryForm } from './pages/EntryForm';
import { Profile } from './pages/Profile';
import { Chat } from './pages/Chat';
import Navbar from './components/Navbar';
import './App.css';

function AppContent() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/login';

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* Public routes - redirect to dashboard if authenticated */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes - require authentication */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
          
          <Route 
            path="/add-entry" 
            element={
              <ProtectedRoute>
                <EntryForm />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/edit-entry/:id" 
            element={
              <ProtectedRoute>
                <EntryForm />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    </>
  );
}

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(setToken(token));
      getProfile()
        .then(res => {
          dispatch(setUser(res.data));
          // Fetch entries after user is hydrated
          getEntries()
            .then(entriesRes => {
              dispatch(setEntries(entriesRes.data));
            })
            .catch(() => {
              dispatch(setEntries([]));
            });
        })
        .catch(() => {
          dispatch(setUser(null));
        });
    } else {
      // No token found, finish hydration immediately
      dispatch(setHydrating(false));
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="app">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;
