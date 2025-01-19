import { Lock, LogIn, Mail, UserPlus } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { authSchema } from '../schema/auth';

interface AuthFormProps {
  onSuccess: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validateForm = () => {
    const { error } = authSchema.validate(
      { email, password },
      { abortEarly: false }
    );
    if (error) {
      const validationErrors: { [key: string]: string } = {};
      error.details.forEach((detail) => {
        validationErrors[detail.path[0]] = detail.message;
      });
      setErrors(validationErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setGeneralError(null);
    setLoading(true);

    try {
      const { error: authError } = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (authError) throw authError;
      onSuccess();
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-lg bg-white rounded-lg shadow-xl p-8'>
        <div className='space-y-2 mb-6'>
          <h2 className='text-3xl font-bold tracking-tight text-gray-900'>
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className='text-gray-600'>
            {isLogin
              ? 'Enter your credentials to access your account'
              : 'Sign up for an account to get started'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'
            >
              Email
            </label>
            <div className='relative'>
              <Mail
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={18}
              />
              <input
                id='email'
                type='email'
                placeholder='name@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded-md border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            {errors.email && (
              <p className='text-sm text-red-500'>{errors.email}</p>
            )}
          </div>
          <div className='space-y-2'>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700'
            >
              Password
            </label>
            <div className='relative'>
              <Lock
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={18}
              />
              <input
                id='password'
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded-md border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            {errors.password && (
              <p className='text-sm text-red-500'>{errors.password}</p>
            )}
          </div>
          {generalError && (
            <div
              className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'
              role='alert'
            >
              <span className='block sm:inline'>{generalError}</span>
            </div>
          )}
          <button
            type='submit'
            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                {isLogin ? (
                  <LogIn className='mr-2' size={18} />
                ) : (
                  <UserPlus className='mr-2' size={18} />
                )}
                {isLogin ? 'Sign In' : 'Sign Up'}
              </>
            )}
          </button>
        </form>
        <div className='mt-4 text-center'>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className='text-sm text-blue-600 hover:text-blue-800'
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
