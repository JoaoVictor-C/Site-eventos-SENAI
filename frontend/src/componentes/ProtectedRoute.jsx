import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedProfiles }) => {
  
  const perfil = localStorage.getItem('perfil');

  if (!perfil || !allowedProfiles.includes(perfil)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
