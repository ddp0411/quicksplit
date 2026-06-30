import React, { useState } from 'react';
import { createNavigationContainerRef, NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Modal, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import { useUserStore } from '../state/userStore';
import { useTheme } from '../theme/useTheme';
import { TabBarIcon, TabIconName } from '../components/TabBarIcon';

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
import { MonthlyExpensesScreen } from '../screens/MonthlyExpensesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const navigationRef = createNavigationContainerRef();

// The four icon tabs shown in the floating pill (Account opens from the Profile pill).
const ICON_TABS: { route: string; icon: TabIconName }[] = [
  { route: 'Home', icon: 'Home' },
  { route: 'Friends', icon: 'Friends' },
  { route: 'Groups', icon: 'Groups' },
  { route: 'Personal', icon: 'Personal' },
];

const TAB_INACTIVE = '#9AA0A6';

// The root screen of each tab's stack. The floating bar only shows on these; on any
// pushed (deep) screen it hides so it doesn't cover that screen's bottom CTA.
const ROOT_STACK_SCREENS = [
  'HomeMain', 'FriendsMain', 'GroupsMain', 'PersonalMain', 'AccountMain',
];

function initials(name?: string) {
  if (!name) return 'U';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Floating glass-pill tab bar (Ocean Breeze / Stitch UI) ───────────────────
function FloatingTabBar({ state, navigation, onAdd }: BottomTabBarProps & { onAdd: () => void }) {
  const { colors, isDark } = useTheme();
  const { user } = useUserStore();

  const activeTab = state.routes[state.index];
  const leaf = getFocusedRouteNameFromRoute(activeTab) ?? `${activeTab.name}Main`;
  if (!ROOT_STACK_SCREENS.includes(leaf)) return null;

  const currentTab = activeTab.name;
  const accountFocused = currentTab === 'Account';

  return (
    <View style={styles.barWrap} pointerEvents="box-none">
      <View style={[styles.pill, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
        <BlurView
          intensity={isDark ? 40 : 55}
          tint={isDark ? 'dark' : 'light'}
          style={styles.pillBlur}
        />
        <View style={styles.iconRow}>
          {ICON_TABS.map(({ route, icon }) => {
            const focused = currentTab === route;
            return (
              <TouchableOpacity
                key={route}
                style={styles.iconBtn}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: focused }}
                onPress={() => navigation.navigate(route)}
              >
                <TabBarIcon name={icon} color={focused ? colors.primary : TAB_INACTIVE} size={24} />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.profilePill,
            { backgroundColor: accountFocused ? colors.primary : colors.surfaceHigh },
          ]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Account')}
        >
          <View style={[styles.profileAvatar, { borderColor: colors.glassBorder }]}>
            <Text style={styles.profileAvatarText}>{initials(user?.name)}</Text>
          </View>
          <Text
            style={[styles.profileLabel, { color: accountFocused ? '#FFFFFF' : colors.text }]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.fab }]}
        activeOpacity={0.85}
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel="Quick action"
      >
        <Svg width={26} height={26} viewBox="0 0 24 24">
          <Path
            d="M12 5 V19 M5 12 H19"
            stroke={isDark ? '#111418' : '#FFFFFF'}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
}

function MainTabs() {
  const { colors } = useTheme();
  const [showActions, setShowActions] = useState(false);

  const actionItems = [
    { icon: '+', title: 'Add Expense', subtitle: 'Split a bill with friends', tab: 'Home', screen: 'AddExpense', color: colors.primary },
    { icon: '▣', title: 'Scan Bill', subtitle: 'Capture a receipt instantly', tab: 'Home', screen: 'Scan', color: colors.tertiary },
    { icon: '₹', title: 'Settle Up', subtitle: 'Record a payment', tab: 'Home', screen: 'SettleUp', color: colors.secondary },
  ];

  return (
    <>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <FloatingTabBar {...props} onAdd={() => setShowActions(true)} />}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Friends" component={FriendsStack} />
        <Tab.Screen name="Groups" component={GroupsStack} />
        <Tab.Screen name="Personal" component={PersonalStack} />
        {/* Account is reached from the Profile pill, not an icon tab. */}
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
            style={[styles.actionSheet, { backgroundColor: colors.card }]}
          >
            <View style={[styles.sheetHandle, { backgroundColor: colors.cardBorder }]} />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Quick action</Text>
            <Text style={[styles.sheetSubtitle, { color: colors.textSub }]}>
              Start the next split in one tap.
            </Text>
            {actionItems.map((item) => (
              <TouchableOpacity
                key={item.title}
                style={[styles.sheetRow, { borderColor: colors.cardBorder, backgroundColor: colors.surfaceLow }]}
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
      {/* Shared screens registered per-stack so Friends actions stay in this tab. */}
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      <Stack.Screen name="SettleUp" component={SettleUpScreen} />
      <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
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
      {/* Shared screens registered per-stack so group Add/Settle stay in this tab. */}
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      <Stack.Screen name="SettleUp" component={SettleUpScreen} />
      <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
    </Stack.Navigator>
  );
}

function PersonalStack() {
  return (
    <Stack.Navigator screenOptions={STACK_OPTIONS}>
      {/* The Personal tab now opens the monthly expenses view; the old finance hub
          (Budget / Subscriptions / Insights / AI) is reachable via its "Tools" button. */}
      <Stack.Screen name="PersonalMain" component={MonthlyExpensesScreen} />
      <Stack.Screen name="PersonalHub" component={PersonalScreen} />
      <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
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
  barWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    paddingLeft: 18,
    paddingRight: 6,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  pillBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  iconBtn: {
    paddingVertical: 6,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 24,
    paddingLeft: 6,
    paddingRight: 13,
    paddingVertical: 6,
  },
  profileAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    backgroundColor: '#00658E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  profileLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 12,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.45)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
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
    fontWeight: '700',
  },
  sheetRowTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
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
