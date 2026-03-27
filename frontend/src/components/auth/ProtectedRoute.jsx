import React from 'react';
import { Navigate } from 'react-router-dom';
import useStore from '../../store/useStore';

export default function ProtectedRoute({ children }) {
  const { user } = useStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
