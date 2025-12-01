import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from './stores/authStore';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

// Pages - Base
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import UserManagementPage from './pages/UserManagementPage';

// Pages - Activities
import ActivitiesList from './pages/activities/ActivitiesList';
import ActivityDetail from './pages/activities/ActivityDetail';
import ActivityCreate from './pages/activities/ActivityCreate';
import ActivityEdit from './pages/activities/ActivityEdit';
import ShiftDetail from './pages/activities/ShiftDetail';
import ShiftCreate from './pages/activities/ShiftCreate';
import ShiftEdit from './pages/activities/ShiftEdit';
import ShiftsCalendarPage from './pages/activities/ShiftsCalendarPage';

// Pages - Segreteria
import TodoBacheca from './pages/segreteria/TodoBacheca';
import DocumentsList from './pages/segreteria/DocumentsList';

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
        {/* Main pages */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/users" element={<UserManagementPage />} />

        {/* Activities Routes */}
        <Route path="/activities">
          <Route index element={<ActivitiesList />} />
          <Route path="create" element={<ActivityCreate />} />
          <Route path="calendar" element={<ShiftsCalendarPage />} />
          <Route path=":id" element={<ActivityDetail />} />
          <Route path=":id/edit" element={<ActivityEdit />} />
          
          {/* Shifts nested routes */}
          <Route path="shifts">
            <Route path="create" element={<ShiftCreate />} />
            <Route path=":id" element={<ShiftDetail />} />
            <Route path=":id/edit" element={<ShiftEdit />} />
          </Route>
        </Route>

        {/* Segreteria Routes */}
        <Route path="/segreteria">
          <Route path="todos" element={<TodoBacheca />} />
          <Route path="documents" element={<DocumentsList />} />
        </Route>

        {/* Placeholder routes - TODO: Implement in next sprints */}
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