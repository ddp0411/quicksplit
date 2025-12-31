import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '@/state/userStore';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Scan } from '@/pages/Scan';
import { Split } from '@/pages/Split';
import { Review } from '@/pages/Review';
import { History } from '@/pages/History';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useUserStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login />} />
      
      <Route
        path="/scan"
        element={
          <ProtectedRoute>
            <Scan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/split"
        element={
          <ProtectedRoute>
            <Split />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review/:splitId"
        element={
          <ProtectedRoute>
            <Review />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
