import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { authAPI } from '../services/api/authAPI';
import type { LoginRequest, RegisterRequest } from '../services/api/authAPI';
import { useUserStore } from '../state/userStore';

export const useAuth = () => {
  const { setUser, logout: logoutStore } = useUserStore();
  const navigation = useNavigation<any>();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authAPI.login(data),
    onSuccess: (data) => {
      setUser(data.user, data.access_token);
      // RootNavigator auto-switches to MainTabs when isAuthenticated becomes true
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authAPI.register(data),
    onSuccess: (data) => {
      setUser(data.user, data.access_token);
    },
  });

  const logout = () => {
    logoutStore();
  };

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
};
