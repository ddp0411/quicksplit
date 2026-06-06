import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '@/state/userStore';

// Auth & Onboarding
import { SplashScreen } from '@/pages/SplashScreen';
import { Onboarding } from '@/pages/Onboarding';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { PermissionSetup } from '@/pages/PermissionSetup';

// Core pages
import { Home } from '@/pages/Home';
import { Scan } from '@/pages/Scan';
import { Split } from '@/pages/Split';
import { Review } from '@/pages/Review';
import { History } from '@/pages/History';

// Friends
import { Friends } from '@/pages/Friends';
import { FriendDetail } from '@/pages/FriendDetail';
import { AddFriend } from '@/pages/AddFriend';

// Groups
import { Groups } from '@/pages/Groups';
import { GroupDetail } from '@/pages/GroupDetail';
import { CreateGroup } from '@/pages/CreateGroup';
import { GroupInsights } from '@/pages/GroupInsights';
import { ImportGroup } from '@/pages/ImportGroup';

// Expenses
import { AddExpense } from '@/pages/AddExpense';
import { ExpenseDetail } from '@/pages/ExpenseDetail';

// Balances & Activity
import { Balances } from '@/pages/Balances';
import { Activity } from '@/pages/Activity';
import { SettleUp } from '@/pages/SettleUp';

// Personal / AI hub
import { PersonalTab } from '@/pages/PersonalTab';
import { AIChat } from '@/pages/AIChat';
import { BudgetDashboard } from '@/pages/BudgetDashboard';
import { SubscriptionTracker } from '@/pages/SubscriptionTracker';
import { SpendingInsights } from '@/pages/SpendingInsights';

// Account & Settings
import { AccountTab } from '@/pages/AccountTab';
import { EditProfile } from '@/pages/EditProfile';
import { AppearanceSettings } from '@/pages/AppearanceSettings';
import { NotificationSettings } from '@/pages/NotificationSettings';
import { SecuritySettings } from '@/pages/SecuritySettings';
import { ProUpgrade } from '@/pages/ProUpgrade';
import { ReferralPage } from '@/pages/ReferralPage';
import { ImportSplitwise } from '@/pages/ImportSplitwise';
import { QRCodePage } from '@/pages/QRCode';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useUserStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function P({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<SplashScreen />} />
    <Route path="/onboarding" element={<Onboarding />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* One-time setup */}
    <Route path="/permissions" element={<P><PermissionSetup /></P>} />

    {/* Friends */}
    <Route path="/friends" element={<P><Friends /></P>} />
    <Route path="/friends/add" element={<P><AddFriend /></P>} />
    <Route path="/friends/:userId" element={<P><FriendDetail /></P>} />

    {/* Groups */}
    <Route path="/groups" element={<P><Groups /></P>} />
    <Route path="/groups/new" element={<P><CreateGroup /></P>} />
    <Route path="/groups/import" element={<P><ImportGroup /></P>} />
    <Route path="/groups/:groupId" element={<P><GroupDetail /></P>} />
    <Route path="/groups/:groupId/insights" element={<P><GroupInsights /></P>} />

    {/* Expenses */}
    <Route path="/expenses/new" element={<P><AddExpense /></P>} />
    <Route path="/expenses/:expenseId" element={<P><ExpenseDetail /></P>} />

    {/* Balance & Activity */}
    <Route path="/balances" element={<P><Balances /></P>} />
    <Route path="/activity" element={<P><Activity /></P>} />
    <Route path="/settle-up" element={<P><SettleUp /></P>} />
    <Route path="/settle-up/:userId" element={<P><SettleUp /></P>} />

    {/* OCR flow */}
    <Route path="/scan" element={<P><Scan /></P>} />
    <Route path="/split" element={<P><Split /></P>} />
    <Route path="/review/:splitId" element={<P><Review /></P>} />
    <Route path="/history" element={<P><History /></P>} />

    {/* Personal / AI hub */}
    <Route path="/personal" element={<P><PersonalTab /></P>} />
    <Route path="/personal/ai-chat" element={<P><AIChat /></P>} />
    <Route path="/personal/budgets" element={<P><BudgetDashboard /></P>} />
    <Route path="/personal/subscriptions" element={<P><SubscriptionTracker /></P>} />
    <Route path="/personal/insights" element={<P><SpendingInsights /></P>} />

    {/* Account & Settings */}
    <Route path="/account" element={<P><AccountTab /></P>} />
    <Route path="/account/edit" element={<P><EditProfile /></P>} />
    <Route path="/account/qr" element={<P><QRCodePage /></P>} />
    <Route path="/account/referral" element={<P><ReferralPage /></P>} />
    <Route path="/account/import" element={<P><ImportSplitwise /></P>} />
    <Route path="/settings/appearance" element={<P><AppearanceSettings /></P>} />
    <Route path="/settings/notifications" element={<P><NotificationSettings /></P>} />
    <Route path="/settings/security" element={<P><SecuritySettings /></P>} />
    <Route path="/pro" element={<P><ProUpgrade /></P>} />

    {/* Legacy */}
    <Route path="/home" element={<P><Home /></P>} />
    <Route path="/profile" element={<Navigate to="/account" replace />} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
