import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useUserStore } from '../state/userStore';

// Auth screens
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

// Tab screens (real implementations)
import { HomeScreen } from '../screens/HomeScreen';
import { FriendsScreen } from '../screens/FriendsScreen';

import {
  GroupsScreen, PersonalScreen, AccountScreen,
  FriendDetailScreen, AddFriendScreen,
  GroupDetailScreen, CreateGroupScreen, GroupInsightsScreen, ImportGroupScreen,
  AddExpenseScreen, ExpenseDetailScreen,
  BalancesScreen, ActivityScreen, SettleUpScreen,
  ScanScreen, SplitScreen, ReviewScreen, OCRHistoryScreen,
  AIChatScreen, BudgetDashboardScreen, SubscriptionTrackerScreen, SpendingInsightsScreen,
  EditProfileScreen, QRCodeScreen, AppearanceSettingsScreen, NotificationSettingsScreen,
  SecuritySettingsScreen, ProUpgradeScreen, ReferralScreen, ImportSplitwiseScreen,
  PermissionSetupScreen,
} from '../screens/stubs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠', Friends: '👥', Groups: '🏝️', Personal: '✨', Account: '👤',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[name] ?? '●'}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Friends" component={FriendsStack} />
      <Tab.Screen name="Groups" component={GroupsStack} />
      <Tab.Screen name="Personal" component={PersonalStack} />
      <Tab.Screen name="Account" component={AccountStack} />
    </Tab.Navigator>
  );
}

const STACK_OPTIONS = {
  headerShown: false,
  animation: 'slide_from_right' as const,
  animationDuration: 220,
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={STACK_OPTIONS}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Activity" component={ActivityScreen} />
      <Stack.Screen name="Balances" component={BalancesScreen} />
      <Stack.Screen name="SettleUp" component={SettleUpScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="Split" component={SplitScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="OCRHistory" component={OCRHistoryScreen} />
    </Stack.Navigator>
  );
}

function FriendsStack() {
  return (
    <Stack.Navigator screenOptions={STACK_OPTIONS}>
      <Stack.Screen name="FriendsMain" component={FriendsScreen} />
      <Stack.Screen name="FriendDetail" component={FriendDetailScreen} />
      <Stack.Screen name="AddFriend" component={AddFriendScreen} />
    </Stack.Navigator>
  );
}

function GroupsStack() {
  return (
    <Stack.Navigator screenOptions={STACK_OPTIONS}>
      <Stack.Screen name="GroupsMain" component={GroupsScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="GroupInsights" component={GroupInsightsScreen} />
      <Stack.Screen name="ImportGroup" component={ImportGroupScreen} />
    </Stack.Navigator>
  );
}

function PersonalStack() {
  return (
    <Stack.Navigator screenOptions={STACK_OPTIONS}>
      <Stack.Screen name="PersonalMain" component={PersonalScreen} />
      <Stack.Screen name="AIChat" component={AIChatScreen} />
      <Stack.Screen name="BudgetDashboard" component={BudgetDashboardScreen} />
      <Stack.Screen name="SubscriptionTracker" component={SubscriptionTrackerScreen} />
      <Stack.Screen name="SpendingInsights" component={SpendingInsightsScreen} />
    </Stack.Navigator>
  );
}

function AccountStack() {
  return (
    <Stack.Navigator screenOptions={STACK_OPTIONS}>
      <Stack.Screen name="AccountMain" component={AccountScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="QRCode" component={QRCodeScreen} />
      <Stack.Screen name="AppearanceSettings" component={AppearanceSettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
      <Stack.Screen name="ProUpgrade" component={ProUpgradeScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
      <Stack.Screen name="ImportSplitwise" component={ImportSplitwiseScreen} />
      <Stack.Screen name="PermissionSetup" component={PermissionSetupScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={STACK_OPTIONS}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated } = useUserStore();

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E7E5E4',
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
