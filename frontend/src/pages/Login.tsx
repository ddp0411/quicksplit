import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, registerSchema } from '@/utils/formValidators';

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

export const Login: React.FC = () => {
  const location = useLocation();
  const isRegister = location.pathname === '/register';
  const { login, register: registerUser, isLoggingIn, isRegistering, loginError, registerError } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
  });

  const onSubmit = (data: AuthFormData) => {
    if (isRegister) {
      registerUser({
        email: data.email,
        password: data.password,
        name: data.name ?? '',
      });
      return;
    }

    login({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <h1 className="text-3xl font-bold text-center mb-6">
          {isRegister ? 'Create Account' : 'Login'}
        </h1>
        
        {(loginError || registerError) && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {isRegister ? 'Registration failed. Please check your details.' : 'Invalid credentials. Please try again.'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isRegister && (
            <Input
              label="Name"
              {...register('name')}
              error={errors.name?.message}
              placeholder="Rohan"
            />
          )}

          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="your@email.com"
          />

          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="••••••••"
          />

          {isRegister && (
            <Input
              label="Confirm Password"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="••••••••"
            />
          )}

          <Button type="submit" loading={isRegister ? isRegistering : isLoggingIn} className="w-full">
            {isRegister ? 'Create Account' : 'Login'}
          </Button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link to={isRegister ? '/login' : '/register'} className="text-primary-600 hover:underline">
            {isRegister ? 'Login' : 'Register'}
          </Link>
        </p>
      </Card>
    </div>
  );
};
