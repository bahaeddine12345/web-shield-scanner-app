
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import HomePage from './Index';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import NewScan from './NewScan';
import ScanProgress from './ScanProgress';
import ScanReport from './ScanReport';
import Stats from './Stats';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminUserScans from './AdminUserScans';
import NotFound from './NotFound';

const AppRoutes = () => {
  const { isAdmin } = useAuth();

  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected user routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/scan/new" 
          element={
            <ProtectedRoute>
              <NewScan />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/scan/:id" 
          element={
            <ProtectedRoute>
              <ScanProgress />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/report/:scanId" 
          element={
            <ProtectedRoute>
              <ScanReport />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/stats" 
          element={
            <ProtectedRoute>
              <Stats />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        
        {/* Protected admin routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/users/:userId/scans" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminUserScans />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute requireAdmin>
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          }
        />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;
