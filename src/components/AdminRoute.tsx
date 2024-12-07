import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, isAdmin } = useAuthStore();

  if (!token || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}