import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '@/state/userStore';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Scan } from '@/pages/Scan';
import { Split } from '@/pages/Split';
import { Review } from '@/pages/Review';
import { History } from '@/pages/History';
import { Profile } from '@/pages/Profile';
import { Friends } from '@/pages/Friends';
import { Groups } from '@/pages/Groups';
import { GroupDetail } from '@/pages/GroupDetail';
import { AddExpense } from '@/pages/AddExpense';
import { ExpenseDetail } from '@/pages/ExpenseDetail';
import { Balances } from '@/pages/Balances';
import { Activity } from '@/pages/Activity';
import { SettleUp } from '@/pages/SettleUp';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useUserStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function Protected({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login />} />

      <Route path="/scan" element={<Protected><Scan /></Protected>} />
      <Route path="/split" element={<Protected><Split /></Protected>} />
      <Route path="/review/:splitId" element={<Protected><Review /></Protected>} />
      <Route path="/history" element={<Protected><History /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />

      {/* Splitwise features */}
      <Route path="/friends" element={<Protected><Friends /></Protected>} />
      <Route path="/groups" element={<Protected><Groups /></Protected>} />
      <Route path="/groups/:groupId" element={<Protected><GroupDetail /></Protected>} />
      <Route path="/expenses/new" element={<Protected><AddExpense /></Protected>} />
      <Route path="/expenses/:expenseId" element={<Protected><ExpenseDetail /></Protected>} />
      <Route path="/balances" element={<Protected><Balances /></Protected>} />
      <Route path="/activity" element={<Protected><Activity /></Protected>} />
      <Route path="/settle-up" element={<Protected><SettleUp /></Protected>} />
      <Route path="/settle-up/:userId" element={<Protected><SettleUp /></Protected>} />
    </Routes>
  );
};

export default AppRoutes;
