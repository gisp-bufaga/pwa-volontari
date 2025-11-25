import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from './stores/authStore';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import UserManagementPage from './pages/UserManagementPage';

function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes with Layout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/users" element={<UserManagementPage />} />
        
        {/* Placeholder routes - TODO: Implement in next sprints */}
        <Route path="/activities" element={<div style={{padding: '20px'}}>Activities - Coming in Sprint 2</div>} />
        <Route path="/forniture" element={<div style={{padding: '20px'}}>Forniture - Coming in Sprint 3</div>} />
        <Route path="/vehicles" element={<div style={{padding: '20px'}}>Vehicles - Coming in Sprint 4</div>} />
        <Route path="/checklist" element={<div style={{padding: '20px'}}>Checklist - Coming in Sprint 5</div>} />
        <Route path="/reports" element={<div style={{padding: '20px'}}>Reports - Coming in Sprint 6</div>} />
        <Route path="/notifications" element={<div style={{padding: '20px'}}>Notifications - Coming in Sprint 7</div>} />
        <Route path="/settings" element={<div style={{padding: '20px'}}>Settings - Coming Soon</div>} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;