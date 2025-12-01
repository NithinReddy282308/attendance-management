import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './redux/authStore';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import MarkAttendance from './pages/employee/MarkAttendance';
import MyHistory from './pages/employee/MyHistory';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import AllAttendance from './pages/manager/AllAttendance';
import TeamCalendar from './pages/manager/TeamCalendar';
import Reports from './pages/manager/Reports';
import LoginMonitoring from './pages/manager/LoginMonitoring';

// Shared Pages
import Profile from './pages/Profile';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'manager' ? '/manager/dashboard' : '/dashboard'} replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'manager' ? '/manager/dashboard' : '/dashboard'} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f1f5f9'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f1f5f9'
            }
          }
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Employee Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/attendance" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <MarkAttendance />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/history" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <MyHistory />
            </ProtectedRoute>
          } 
        />

        {/* Manager Routes */}
        <Route 
          path="/manager/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manager/attendance" 
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <AllAttendance />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manager/calendar" 
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <TeamCalendar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manager/reports" 
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <Reports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manager/login-monitoring" 
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <LoginMonitoring />
            </ProtectedRoute>
          } 
        />

        {/* Shared Routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
