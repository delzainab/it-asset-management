import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import PrivateRoute from './components/auth/PrivateRoute';
import Layout from './components/layout/Layout';

// Pages principales
import Dashboard from './components/dashboard/Dashboard';
import AssetList from './components/assets/AssetList';
import AssetForm from './components/assets/AssetForm';
import AssetDetails from './components/assets/AssetDetails';
import TicketList from './components/tickets/TicketList';
import TicketDetails from './components/tickets/TicketDetails';
import OfficeList from './components/offices/OfficeList';
import ServiceList from './components/services/ServiceList';
import UserList from './components/users/UserList';
import AssignmentList from './components/assignments/AssignmentList';
import MaintenanceList from './components/maintenances/MaintenanceList';
import MaintenanceDetails from './components/maintenances/MaintenanceDetails';
import MaintenanceForm from './components/maintenances/MaintenanceForm';
import AuditLogList from './components/audit/AuditLogList';
import Reports from './components/reports/Reports';
import Settings from './components/settings/Settings';
import FaqList from './components/faq/FaqList';
import FaqDetails from './components/faq/FaqDetails';
import FaqAdmin from './components/faq/FaqAdmin';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e67e22',
      light: '#f39c12',
      dark: '#d35400',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#2c3e50',
      light: '#34495e',
      dark: '#1a2632',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    },
    success: { main: '#27ae60' },
    warning: { main: '#f1c40f' },
    error: { main: '#e74c3c' },
    info: { main: '#3498db' }
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 500, fontSize: '1.6rem' },
    h5: { fontWeight: 500, fontSize: '1.4rem' },
    button: { textTransform: 'none', fontWeight: 500 }
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6, padding: '6px 16px', fontWeight: 500 },
        containedPrimary: { backgroundColor: '#e67e22', '&:hover': { backgroundColor: '#d35400' } }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e9ecef' }
      }
    },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, backgroundColor: '#f8f9fa', color: '#2c3e50' }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Routes protégées avec Layout */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } />
            
            {/* Assets */}
            <Route path="/assets" element={
              <PrivateRoute>
                <Layout>
                  <AssetList />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/assets/new" element={
              <PrivateRoute>
                <Layout>
                  <AssetForm />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/assets/edit/:id" element={
              <PrivateRoute>
                <Layout>
                  <AssetForm />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/assets/:id" element={
              <PrivateRoute>
                <Layout>
                  <AssetDetails />
                </Layout>
              </PrivateRoute>
            } />
            
            {/* Tickets */}
            <Route path="/tickets" element={
              <PrivateRoute>
                <Layout>
                  <TicketList />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/tickets/:id" element={
              <PrivateRoute>
                <Layout>
                  <TicketDetails />
                </Layout>
              </PrivateRoute>
            } />
            
            {/* Assignments */}
            <Route path="/assignments" element={
              <PrivateRoute>
                <Layout>
                  <AssignmentList />
                </Layout>
              </PrivateRoute>
            } />
            
            {/* Maintenances */}
            <Route path="/maintenances" element={
              <PrivateRoute>
                <Layout>
                  <MaintenanceList />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/maintenances/:id" element={
              <PrivateRoute>
                <Layout>
                  <MaintenanceDetails />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/maintenances/edit/:id" element={
              <PrivateRoute>
                <Layout>
                  <MaintenanceForm />
                </Layout>
              </PrivateRoute>
            } />
            
            {/* Utilisateurs */}
            <Route path="/users" element={
              <PrivateRoute>
                <Layout>
                  <UserList />
                </Layout>
              </PrivateRoute>
            } />
            
            {/* Services */}
            <Route path="/services" element={
              <PrivateRoute>
                <Layout>
                  <ServiceList />
                </Layout>
              </PrivateRoute>
            } />
            
            {/* Bureaux */}
            <Route path="/offices" element={
              <PrivateRoute>
                <Layout>
                  <OfficeList />
                </Layout>
              </PrivateRoute>
            } />
            
            {/* Audit Logs */}
            <Route path="/audit-logs" element={
              <PrivateRoute>
                <Layout>
                  <AuditLogList />
                </Layout>
              </PrivateRoute>
            } />
            
            {/* Rapports */}
            <Route path="/reports" element={
              <PrivateRoute>
                <Layout>
                  <Reports />
                </Layout>
              </PrivateRoute>
            } />
            
            {/* FAQ */}
            <Route path="/faq" element={
              <PrivateRoute>
                <Layout>
                  <FaqList />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/faq/:id" element={
              <PrivateRoute>
                <Layout>
                  <FaqDetails />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/faq-admin" element={
              <PrivateRoute>
                <Layout>
                  <FaqAdmin />
                </Layout>
              </PrivateRoute>
            } />
            
            {/* Paramètres */}
            <Route path="/settings" element={
              <PrivateRoute>
                <Layout>
                  <Settings />
                </Layout>
              </PrivateRoute>
            } />
            
            {/* Redirection par défaut */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;