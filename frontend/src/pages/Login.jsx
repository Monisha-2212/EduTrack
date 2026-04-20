import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as authApi from '../api/authApi.js';
import useAuthStore from '../store/authStore.js';
import { cn } from '../lib/utils.js';

// ─── Validation schema ────────────────────────────────────────────────────────

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['student', 'faculty'], { required_error: 'Please select a role' }),
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' },
  });

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setValue('role', role, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(data.email, data.password, data.role);
      const user = res.data.user;
      setUser(user);
      navigate(user.role === 'student' ? '/student/dashboard' : '/faculty/dashboard');
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Shared input class ───────────────────────────────────────────────────
  const inputCls =
    'border border-indigo-200 rounded-lg px-3 py-2 text-sm w-full ' +
    'bg-violet-50 text-gray-900 ' +
    'focus:outline-none focus:ring-2 focus:ring-indigo-700 transition-shadow';

  return (
    <div className="min-h-screen bg-indigo-950 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200
                      rounded-2xl p-8 w-full max-w-sm shadow-sm">

        {/* ── Logo ── */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-700 shrink-0" />
          <span className="text-lg font-extrabold text-indigo-700">EduTrack</span>
        </div>

        {/* ── Heading ── */}
        <h1 className="text-base font-extrabold text-gray-900 leading-snug">
          Welcome back
        </h1>
        <p className="text-sm text-[#9A9288] dark:text-[#6B6660] mt-0.5 mb-6">
          Sign in to continue to your dashboard
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

          {/* ── Email ── */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={inputCls}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-[#8B3A22] mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* ── Password ── */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn(inputCls, 'pr-10')}
                {...register('password')}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9288]
                           hover:text-[#4A4640] dark:hover:text-[#D8D4CC] transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[#8B3A22] mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* ── Role selector ── */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['student', 'faculty'].map((role) => (
                <button
                  key={role}
                  type="button"
                  id={`role-${role}`}
                  onClick={() => handleRoleSelect(role)}
                  className={cn(
                    'py-2 rounded-lg text-sm capitalize transition-all duration-150',
                    selectedRole === role
                      ? 'border-2 border-indigo-700 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border border-gray-300 text-gray-600 bg-white hover:border-gray-400'
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
            {errors.role && (
              <p className="text-xs text-[#8B3A22] mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* ── Submit ── */}
          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-700
                       hover:bg-indigo-800 active:bg-indigo-900 disabled:opacity-60
                       text-white text-sm font-medium rounded-lg py-2.5
                       transition-colors duration-150"
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* ── Footer link ── */}
        <p className="text-xs text-gray-600 mt-5 text-center">
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="text-indigo-700 hover:underline font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
