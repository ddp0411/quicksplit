import React, { useState } from 'react';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Modal, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useUserStore } from '../state/userStore';
import { useTheme } from '../theme/useTheme';

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
const navigationRef = createNavigationContainerRef();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '⌂', Friends: '♙', Groups: '◇', Personal: '✦', Account: '○',
  };
  return (
    <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
      {icons[name] ?? '●'}
    </Text>
  );
}

function PlaceholderScreen() {
  return null;
}

function MainTabs() {
  const { colors } = useTheme();
  const [showActions, setShowActions] = useState(false);

  const actionItems = [
    { icon: '+', title: 'Add Expense', subtitle: 'Split a bill with friends', tab: 'Home', screen: 'AddExpense', color: '#FF6B35' },
    { icon: '▣', title: 'Scan Bill', subtitle: 'Capture a receipt instantly', tab: 'Home', screen: 'Scan', color: '#F59E0B' },
    { icon: '₹', title: 'Settle Up', subtitle: 'Record a payment', tab: 'Home', screen: 'SettleUp', color: '#1B4332' },
  ];

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: route.name !== 'Action',
          tabBarStyle: [
            styles.tabBar,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ],
          tabBarActiveTintColor: '#1B4332',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: route.name === 'Action' ? styles.actionTabItem : styles.tabItem,
          tabBarIcon: ({ focused }) => route.name === 'Action'
            ? null
            : <TabIcon name={route.name} focused={focused} />,
          tabBarButton: route.name === 'Action'
            ? () => (
              <TouchableOpacity
                style={styles.centerAction}
                activeOpacity={0.9}
                onPress={() => setShowActions(true)}
              >
                <Text style={styles.centerActionText}>+</Text>
              </TouchableOpacity>
            )
            : undefined,
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Friends" component={FriendsStack} />
        <Tab.Screen name="Action" component={PlaceholderScreen} />
        <Tab.Screen name="Groups" component={GroupsStack} />
        <Tab.Screen name="Personal" component={PersonalStack} />
        <Tab.Screen name="Account" component={AccountStack} />
      </Tab.Navigator>

      <Modal
        visible={showActions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActions(false)}
      >
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setShowActions(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.actionSheet, { backgroundColor: colors.bg }]}
          >
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Quick action</Text>
            <Text style={[styles.sheetSubtitle, { color: colors.textSub }]}>
              Start the next split in one tap.
            </Text>
            {actionItems.map((item) => (
              <TouchableOpacity
                key={item.title}
                style={[styles.sheetRow, { borderColor: colors.cardBorder }]}
                activeOpacity={0.82}
                onPress={() => {
                  setShowActions(false);
                  setTimeout(() => {
                    // Screens live in the Home stack so this works from any tab.
                    if (navigationRef.isReady()) {
                      (navigationRef as any).navigate(item.tab, { screen: item.screen });
                    }
                  }, 180);
                }}
              >
                <View style={[styles.sheetIcon, { backgroundColor: item.color }]}>
                  <Text style={styles.sheetIconText}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sheetRowTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.sheetRowSub, { color: colors.textSub }]}>{item.subtitle}</Text>
                </View>
                <Text style={[styles.sheetArrow, { color: colors.textMuted }]}>›</Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
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
    <NavigationContainer ref={navigationRef}>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    height: 72,
    borderRadius: 26,
    borderWidth: 1,
    paddingBottom: 10,
    paddingTop: 9,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 12,
  },
  tabItem: { paddingTop: 1 },
  actionTabItem: { width: 64 },
  tabIcon: {
    fontSize: 23,
    color: '#9CA3AF',
    lineHeight: 25,
    fontWeight: '800',
  },
  tabIconActive: { color: '#1B4332' },
  tabLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 1,
  },
  centerAction: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: -21,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 14,
  },
  centerActionText: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '300',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.45)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'PlayfairDisplay_700Bold',
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  sheetIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetIconText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  sheetRowTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sheetRowSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sheetArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
});
