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
    return { label: 'Graded', className: 'bg-[#E8F5F1] text-[#2A5C4A]' };
  }

  const now = new Date();
  const due = new Date(deadline);
  const diffMs = due - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    return { label: 'Overdue', className: 'bg-[#FBF0ED] text-[#8B3A22]' };
  }
  if (diffDays <= 0) {
    return { label: 'Due today', className: 'bg-[#FBF0ED] text-[#8B3A22]' };
  }
  if (diffDays === 1) {
    return { label: 'Due tomorrow', className: 'bg-[#FBF0ED] text-[#8B3A22]' };
  }
  if (diffDays <= 3) {
    return { label: `Due in ${diffDays} days`, className: 'bg-[#FDF5E4] text-[#7A5A10]' };
  }
  return { label: `Due in ${diffDays} days`, className: 'bg-[#EDF4E8] text-[#3A5C28]' };
}
