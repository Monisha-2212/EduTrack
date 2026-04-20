import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, GraduationCap, BookOpen, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import * as authApi from '../api/authApi.js';
import { cn } from '../lib/utils.js';

// ─── Per-step Zod schemas ─────────────────────────────────────────────────────

const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
});

const step2Schema = z.object({
  role: z.enum(['student', 'faculty'], { required_error: 'Please select a role' }),
});

const step3Schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ─── Shared input class ────────────────────────────────────────────────────────

const inputCls =
  'border border-indigo-200 rounded-lg px-3 py-2 text-sm w-full ' +
  'bg-violet-50 text-gray-900 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-700 transition-shadow';

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ currentStep }) {
  return (
    <div className="flex gap-1.5 mb-6">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors duration-300',
            s <= currentStep ? 'bg-indigo-700' : 'bg-gray-300'
          )}
        />
      ))}
    </div>
  );
}

// ─── Step 1 — Account details ─────────────────────────────────────────────────

function Step1({ onNext, defaults }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(step1Schema), defaultValues: defaults });

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-4">
      <div>
        <h1 className="text-base font-extrabold text-gray-900">
          Create your account
        </h1>
        <p className="text-sm text-[#9A9288] dark:text-[#6B6660] mt-0.5 mb-6">
          Step 1 of 3 · Enter your details
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Full Name
        </label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          className={inputCls}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-xs text-[#8B3A22] mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Email
        </label>
        <input
          id="signup-email"
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

      <button
        id="signup-step1-continue"
        type="submit"
        className="w-full bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900
                   text-white text-sm font-medium rounded-lg py-2.5 transition-colors duration-150"
      >
        Continue
      </button>
    </form>
  );
}

// ─── Step 2 — Role selection ──────────────────────────────────────────────────

const roles = [
  {
    value: 'student',
    label: 'Student',
    description: 'Access assignments and submit work',
    Icon: GraduationCap,
  },
  {
    value: 'faculty',
    label: 'Faculty',
    description: 'Create assignments and grade students',
    Icon: BookOpen,
  },
];

function Step2({ onNext, onBack, defaultRole }) {
  const [selected, setSelected] = useState(defaultRole || null);

  const handleContinue = () => {
    if (!selected) return;
    onNext({ role: selected });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base font-extrabold text-gray-900">
          Who are you?
        </h1>
        <p className="text-sm text-[#9A9288] dark:text-[#6B6660] mt-0.5 mb-6">
          Step 2 of 3 · Select your role
        </p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-2 gap-3">
        {roles.map(({ value, label, description, Icon }) => (
          <button
            key={value}
            id={`role-card-${value}`}
            type="button"
            onClick={() => setSelected(value)}
            className={cn(
              'border-2 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer',
              'transition-all duration-150 text-left',
              selected === value
                ? value === 'student' 
                  ? 'border-indigo-700 bg-indigo-50' 
                  : 'border-emerald-500 bg-emerald-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            )}
          >
            <Icon
              size={28}
              className={cn(
                'transition-colors',
                selected === value
                  ? value === 'student' ? 'text-indigo-700' : 'text-emerald-600'
                  : 'text-gray-600'
              )}
            />
            <span
              className={cn(
                'text-sm font-medium',
                selected === value
                  ? value === 'student' ? 'text-indigo-700' : 'text-emerald-600'
                  : 'text-gray-600'
              )}
            >
              {label}
            </span>
            <span className="text-xs text-gray-500 text-center leading-tight">
              {description}
            </span>
          </button>
        ))}
      </div>

      <button
        id="signup-step2-continue"
        type="button"
        disabled={!selected}
        onClick={handleContinue}
        className={cn(
          'w-full bg-indigo-700 text-white text-sm font-medium rounded-lg py-2.5 transition-colors duration-150',
          selected
            ? 'hover:bg-indigo-800 active:bg-indigo-900'
            : 'opacity-50 cursor-not-allowed'
        )}
      >
        Continue
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-xs text-gray-600 hover:text-gray-800
                   flex items-center justify-center gap-1 transition-colors"
      >
        <ChevronLeft size={13} /> Back
      </button>
    </div>
  );
}

// ─── Step 3 — Password ────────────────────────────────────────────────────────

function Step3({ onSubmit: onFinish, onBack, isLoading }) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(step3Schema) });

  return (
    <form onSubmit={handleSubmit(onFinish)} noValidate className="space-y-4">
      <div>
        <h1 className="text-base font-extrabold text-gray-900">
          Set your password
        </h1>
        <p className="text-sm text-[#9A9288] dark:text-[#6B6660] mt-0.5 mb-6">
          Step 3 of 3 · Almost done
        </p>
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="signup-password"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            className={cn(inputCls, 'pr-10')}
            {...register('password')}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9288]
                       hover:text-[#4A4640] dark:hover:text-[#D8D4CC] transition-colors"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-[#8B3A22] mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm password */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="signup-confirm-password"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Re-enter password"
            className={cn(inputCls, 'pr-10')}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9288]
                       hover:text-[#4A4640] dark:hover:text-[#D8D4CC] transition-colors"
          >
            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-[#8B3A22] mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        id="signup-create-account"
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-700
                   hover:bg-indigo-800 active:bg-indigo-900 disabled:opacity-60
                   text-white text-sm font-medium rounded-lg py-2.5 transition-colors duration-150"
      >
        {isLoading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Creating account…
          </>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="w-full text-xs text-gray-600 hover:text-gray-800
                   flex items-center justify-center gap-1 transition-colors"
      >
        <ChevronLeft size={13} /> Back
      </button>
    </form>
  );
}

// ─── Main Signup component ────────────────────────────────────────────────────

export default function Signup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Accumulated form data across steps
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: null,
    password: '',
  });

  // Step 1 → 2
  const handleStep1 = ({ name, email }) => {
    setFormData((prev) => ({ ...prev, name, email }));
    setCurrentStep(2);
  };

  // Step 2 → 3
  const handleStep2 = ({ role }) => {
    setFormData((prev) => ({ ...prev, role }));
    setCurrentStep(3);
  };

  // Step 3 → submit
  const handleStep3 = async ({ password }) => {
    setIsLoading(true);
    try {
      await authApi.signup(formData.name, formData.email, password, formData.role);
      toast.success('Account created! Please sign in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200
                        rounded-2xl p-8 shadow-sm">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-700 shrink-0" />
            <span className="text-lg font-extrabold text-indigo-700">EduTrack</span>
          </div>

          {/* Progress bar */}
          <ProgressBar currentStep={currentStep} />

          {/* Steps */}
          {currentStep === 1 && (
            <Step1
              onNext={handleStep1}
              defaults={{ name: formData.name, email: formData.email }}
            />
          )}
          {currentStep === 2 && (
            <Step2
              onNext={handleStep2}
              onBack={() => setCurrentStep(1)}
              defaultRole={formData.role}
            />
          )}
          {currentStep === 3 && (
            <Step3
              onSubmit={handleStep3}
              onBack={() => setCurrentStep(2)}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-600 mt-4 text-center">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-indigo-700 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
