import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names intelligently using clsx + tailwind-merge.
 * Resolves Tailwind CSS conflicts (e.g. px-2 + px-4 → px-4).
 *
 * @param {...import('clsx').ClassValue} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a { label, className } badge descriptor for an assignment deadline.
 *
 * @param {string | Date} deadline  - The assignment deadline
 * @param {string} [status]         - Submission status: 'submitted' | 'graded' | undefined
 * @returns {{ label: string, className: string }}
 */
export function getDeadlineBadge(deadline, status) {
  if (status === 'graded') {
    return { label: 'Graded', className: 'bg-green-100 text-green-800' };
  }

  const now = new Date();
  const due = new Date(deadline);
  const diffMs = due - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    return { label: 'Overdue', className: 'bg-red-100 text-red-800' };
  }
  if (diffDays <= 0) {
    return { label: 'Due today', className: 'bg-red-100 text-red-800' };
  }
  if (diffDays === 1) {
    return { label: 'Due tomorrow', className: 'bg-red-100 text-red-800' };
  }
  if (diffDays <= 3) {
    return { label: `Due in ${diffDays} days`, className: 'bg-yellow-100 text-yellow-800' };
  }
  return { label: `Due in ${diffDays} days`, className: 'bg-green-100 text-green-800' };
}
