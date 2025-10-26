import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Navbar from './components/Navbar';
import './App.css';

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
        <Navbar />
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
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
