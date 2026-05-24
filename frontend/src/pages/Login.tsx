import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { getAPIErrorMessage } from '@/services/api/errorMessage';
import { loginSchema, registerSchema } from '@/utils/formValidators';
import {
  ArrowRightIcon,
  LockClosedIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

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
  const authError = isRegister
    ? getAPIErrorMessage(registerError, 'Registration failed. Please check your details.')
    : getAPIErrorMessage(loginError, 'Invalid credentials. Please try again.');
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
    <div className="grid min-h-[calc(100vh-8rem)] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden lg:block">
        <div className="max-w-lg">
          <span className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-sm font-bold text-primary-700">
            Secure QuickSplit account
          </span>
          <h1 className="mt-4 font-display text-5xl font-extrabold tracking-normal text-ink">
            One login for every receipt, split, and payment QR.
          </h1>
          <div className="mt-6 grid gap-3">
            {[
              { icon: LockClosedIcon, label: 'JWT sessions with cached auth checks' },
              { icon: ShieldCheckIcon, label: 'Password hashing on the Django backend' },
              { icon: QrCodeIcon, label: 'Private split history and UPI collection links' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
                <span className="rounded-lg bg-primary-50 p-2 text-primary-700">
                  <item.icon className="h-5 w-5" />
                </span>
                <p className="font-semibold text-slate-700">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Card className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-sky-500 text-white shadow-button">
            <SparklesIcon className="h-6 w-6" />
          </span>
          <h2 className="font-display text-3xl font-extrabold tracking-normal text-ink">
            {isRegister ? 'Create account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {isRegister ? 'Start with OCR, splitting, and UPI QR in minutes.' : 'Continue your bill splitting flow.'}
          </p>
        </div>
        
        {(loginError || registerError) && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {authError}
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
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="Minimum 6 characters"
          />

          {isRegister && (
            <Input
              label="Confirm Password"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="Repeat password"
            />
          )}

          <Button type="submit" loading={isRegister ? isRegistering : isLoggingIn} className="w-full">
            {isRegister ? 'Create account' : 'Login'}
            {!isRegistering && !isLoggingIn && <ArrowRightIcon className="ml-2 h-5 w-5" />}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm font-medium text-slate-500">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link to={isRegister ? '/login' : '/register'} className="font-bold text-primary-700 hover:underline">
            {isRegister ? 'Login' : 'Register'}
          </Link>
        </p>
      </Card>
    </div>
  );
};
