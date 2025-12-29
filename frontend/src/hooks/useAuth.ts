// Authentication hook
import { useMutation, useQuery } from '@tanstack/react-query';
import { authAPI } from '../services/api/authAPI';
import { useUserStore } from '../state/userStore';

export const useAuth = () => {
  const { user, setUser, clearUser } = useUserStore();

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      setUser(data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      setUser(data.user);
    },
  });

  const logout = () => {
    clearUser();
  };

  return {
    user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoading: loginMutation.isPending || registerMutation.isPending,
  };
};

