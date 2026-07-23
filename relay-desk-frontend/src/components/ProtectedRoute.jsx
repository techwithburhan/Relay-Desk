import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Send the user back to Login, remembering where they were headed
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}
