import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../../features/auth/authSlice';
import { AlertCircle, Lock, Mail } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    dispatch(clearError());
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      const userRole = result.payload.data.user.role;
      if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Link to="/" className="text-3xl font-bold mb-6 text-amazon-blue">
        amazon<span className="text-amazon-orange text-sm font-semibold">.clone</span>
      </Link>

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign-In</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amazon-orange text-sm pl-9"
                placeholder="email@example.com"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
            {errors.email && (
              <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                {...register('password')}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amazon-orange text-sm pl-9"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
            {errors.password && (
              <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue py-2.5 rounded font-medium shadow-sm transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-500 text-center border-t pt-4">
          New to Amazon?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-semibold">
            Create your account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
