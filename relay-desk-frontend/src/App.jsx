import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import License from './pages/License';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Overview from './pages/Overview';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import NewTicket from './pages/NewTicket';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import KnowledgeBase from './pages/KnowledgeBase';
import Downloads from './pages/Downloads';
import AccessLogs from './pages/AccessLogs';
import AdminDownloads from './pages/AdminDownloads';
import AdminSlides from './pages/AdminSlides';
import AdminLicense from './pages/AdminLicense';
import DealerMapping from './pages/DealerMapping';
import AdminUsers from './pages/AdminUsers';
import AdminBranches from './pages/AdminBranches';
import PendingTransfers from './pages/PendingTransfers';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Public routes — reachable without logging in */}
      <Route path="/" element={<Login />} />
      <Route path="/license" element={<License />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Everything below requires a logged-in session.
          Going straight to /dashboard (or any other page) without
          logging in first redirects back to "/". */}
      <Route path="/dashboard" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
      <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
      <Route path="/tickets/new" element={<ProtectedRoute><NewTicket /></ProtectedRoute>} />
      <Route path="/tickets/:ticketId" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/knowledge-base" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
      <Route path="/downloads" element={<ProtectedRoute><Downloads /></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute><AccessLogs /></ProtectedRoute>} />
      <Route path="/admin/downloads" element={<ProtectedRoute><AdminDownloads /></ProtectedRoute>} />
      <Route path="/admin/slides" element={<ProtectedRoute><AdminSlides /></ProtectedRoute>} />
      <Route path="/admin/license" element={<ProtectedRoute><AdminLicense /></ProtectedRoute>} />
      <Route path="/admin/dealers" element={<ProtectedRoute><DealerMapping /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/branches" element={<ProtectedRoute><AdminBranches /></ProtectedRoute>} />
      <Route path="/transfers" element={<ProtectedRoute><PendingTransfers /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  );
}
