import { useMutation, useQuery } from '@tanstack/react-query';
import { authAPI, LoginRequest, RegisterRequest } from '@/services/api/authAPI';
import { useUserStore } from '@/state/userStore';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { setUser, logout: logoutStore } = useUserStore();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authAPI.login(data),
    onSuccess: (data) => {
      setUser(data.user, data.access_token);
      navigate('/scan');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authAPI.register(data),
    onSuccess: (data) => {
      setUser(data.user, data.access_token);
      navigate('/scan');
    },
  });

  const logout = () => {
    logoutStore();
    navigate('/login');
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
