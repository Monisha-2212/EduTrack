import { format } from 'date-fns';
import { getDeadlineBadge } from '../lib/utils.js';

/**
 * Faculty-specific assignment card.
 * 
 * @param {{ assignment: object, onGrade: function, onViewSubmissions: function }} props
 */
export default function AssignmentCard({ assignment, onGrade, onViewSubmissions }) {
  const { title, deadline, maxMarks, assignedTo, submissions } = assignment;
  const submissionCount = submissions?.length ?? 0;
  const assignedCount = assignedTo?.length ?? 0;
  const progress = assignedCount > 0 ? (submissionCount / assignedCount) * 100 : 0;
  const badge = getDeadlineBadge(deadline);

  return (
    <div className="bg-[#FFFDF9] dark:bg-[#1C1A17] border border-[#EDE8DF] dark:border-[#2C2A26] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h4 className="text-sm font-extrabold text-gray-900 truncate">
          {title}
        </h4>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      <p className="text-xs text-[#9A9288] dark:text-[#6B6660] mb-3">
        Due {format(new Date(deadline), 'dd MMM yyyy')} · {submissionCount}/{assignedCount} submitted
      </p>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1 mb-4 overflow-hidden">
        <div
          className="bg-indigo-700 h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onViewSubmissions}
          className="border border-gray-300 text-gray-700 
                     rounded-lg px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors"
        >
          View Submissions
        </button>
        <button
          onClick={onGrade}
          className="bg-indigo-700 text-white rounded-lg px-3 py-1.5 text-xs hover:bg-indigo-800 active:bg-indigo-900 transition-colors"
        >
          Grade
        </button>
      </div>
    </div>
  );
}
