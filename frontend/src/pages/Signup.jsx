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
  'border border-[#E8E4DC] dark:border-[#2C2A26] rounded-lg px-3 py-2 text-sm w-full ' +
  'bg-[#FFFDF9] dark:bg-[#1C1A17] text-[#2C2A26] dark:text-[#F5F0E8] ' +
  'focus:outline-none focus:ring-2 focus:ring-[#C9A96E] transition-shadow';

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ currentStep }) {
  return (
    <div className="flex gap-1.5 mb-6">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors duration-300',
            s <= currentStep ? 'bg-[#2C2A26]' : 'bg-[#EDE8DF] dark:bg-[#1C1A17]'
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
        <h1 className="text-base font-medium text-[#2C2A26] dark:text-[#F5F0E8]">
          Create your account
        </h1>
        <p className="text-sm text-[#9A9288] dark:text-[#6B6660] mt-0.5 mb-6">
          Step 1 of 3 · Enter your details
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-medium text-[#4A4640] dark:text-[#9A9288] mb-1">
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
        <label className="block text-xs font-medium text-[#4A4640] dark:text-[#9A9288] mb-1">
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
        className="w-full bg-[#2C2A26] hover:bg-[#3A3830] active:bg-[#1C1A17]
                   text-[#F0EBE0] text-sm font-medium rounded-lg py-2.5 transition-colors duration-150"
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
        <h1 className="text-base font-medium text-[#2C2A26] dark:text-[#F5F0E8]">
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
                ? 'border-[#C9A96E] bg-[#FAF8F5] dark:bg-[#1C1A17]/30'
                : 'border-[#E8E4DC] dark:border-[#2C2A26] bg-[#FFFDF9] dark:bg-[#1C1A17] hover:border-[#E8E4DC] dark:hover:border-[#2C2A26]'
            )}
          >
            <Icon
              size={28}
              className={cn(
                'transition-colors',
                selected === value
                  ? 'text-[#8B6914] dark:text-[#F5F0E8]'
                  : 'text-[#9A9288] dark:text-[#6B6660]'
              )}
            />
            <span
              className={cn(
                'text-sm font-medium',
                selected === value
                  ? 'text-[#8B6914] dark:text-[#F5F0E8]'
                  : 'text-[#3A3830] dark:text-[#D8D4CC]'
              )}
            >
              {label}
            </span>
            <span className="text-xs text-[#9A9288] dark:text-[#6B6660] text-center leading-tight">
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
          'w-full bg-[#2C2A26] text-[#F0EBE0] text-sm font-medium rounded-lg py-2.5 transition-colors duration-150',
          selected
            ? 'hover:bg-[#3A3830] active:bg-[#1C1A17]'
            : 'opacity-50 cursor-not-allowed'
        )}
      >
        Continue
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-xs text-[#9A9288] dark:text-[#6B6660] hover:text-[#4A4640] dark:hover:text-[#D8D4CC]
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
        <h1 className="text-base font-medium text-[#2C2A26] dark:text-[#F5F0E8]">
          Set your password
        </h1>
        <p className="text-sm text-[#9A9288] dark:text-[#6B6660] mt-0.5 mb-6">
          Step 3 of 3 · Almost done
        </p>
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-medium text-[#4A4640] dark:text-[#9A9288] mb-1">
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
        <label className="block text-xs font-medium text-[#4A4640] dark:text-[#9A9288] mb-1">
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
        className="w-full flex items-center justify-center gap-2 bg-[#2C2A26]
                   hover:bg-[#3A3830] active:bg-[#1C1A17] disabled:opacity-60
                   text-[#F0EBE0] text-sm font-medium rounded-lg py-2.5 transition-colors duration-150"
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
        className="w-full text-xs text-[#9A9288] dark:text-[#6B6660] hover:text-[#4A4640] dark:hover:text-[#D8D4CC]
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
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#1C1A17] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#FFFDF9] dark:bg-[#1C1A17] border border-[#EDE8DF] dark:border-[#2C2A26]
                        rounded-2xl p-8 shadow-sm">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#C9A96E] shrink-0" />
            <span className="text-lg font-medium text-[#8B6914] dark:text-[#F5F0E8]">EduTrack</span>
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
        <p className="text-xs text-[#9A9288] dark:text-[#6B6660] mt-4 text-center">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-[#8B6914] dark:text-[#F5F0E8] hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
