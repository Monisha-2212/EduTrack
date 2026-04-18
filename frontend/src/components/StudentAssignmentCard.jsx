import { format } from 'date-fns';
import { Upload, FileText } from 'lucide-react';
import { getDeadlineBadge, cn } from '../lib/utils.js';

/**
 * Student-specific assignment card.
 * 
 * @param {{ assignment: object, onUpload: function }} props
 */
export default function StudentAssignmentCard({ assignment, onUpload }) {
  const { title, deadline, maxMarks, createdBy, mySubmission } = assignment;
  const facultyName = createdBy?.name ?? 'Unknown Faculty';
  const status = mySubmission?.status; // submitted | graded | undefined
  const badge = getDeadlineBadge(deadline, status);

  return (
    <div className="bg-[#FFFDF9] dark:bg-[#1C1A17] border border-[#EDE8DF] dark:border-[#2C2A26] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h4 className="text-sm font-medium text-[#2C2A26] dark:text-[#F5F0E8] truncate">
          {title}
        </h4>
        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap', badge.className)}>
          {badge.label}
        </span>
      </div>

      <p className="text-xs text-[#9A9288] dark:text-[#6B6660] mb-4">
        {facultyName} · {format(new Date(deadline), 'dd MMM yyyy')} · Max {maxMarks} marks
      </p>

      <div className="flex items-center justify-between gap-4">
        {/* Left: Status Badge */}
        <div>
          {!mySubmission ? (
            <span className="bg-[#FDF5E4] dark:bg-[#1C1A17]/20 text-[#7A5A10] dark:text-[#9A9288] text-[10px] font-medium px-2 py-0.5 rounded-full">
              Pending
            </span>
          ) : status === 'submitted' ? (
            <span className="bg-[#EDF4E8] dark:bg-[#1C1A17]/20 text-[#3A5C28] dark:text-[#3A5C28] text-[10px] font-medium px-2 py-0.5 rounded-full">
              Submitted
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="bg-[#E8F5F1] dark:bg-[#1C1A17]/20 text-[#2A5C4A] dark:text-[#2A5C4A] text-[10px] font-medium px-2 py-0.5 rounded-full">
                Graded
              </span>
              <span className="text-sm font-semibold text-[#2C2A26] dark:text-[#F5F0E8]">
                {mySubmission.marks} / {maxMarks}
              </span>
            </div>
          )}
        </div>

        {/* Right: Actions / File Info */}
        <div className="flex flex-col items-end">
          {!mySubmission ? (
            <button
              onClick={() => onUpload(assignment)}
              className="flex items-center gap-1.5 bg-[#2C2A26] text-[#F0EBE0] text-xs px-3 py-1.5 rounded-lg hover:bg-[#3A3830] transition-colors"
            >
              <Upload size={14} />
              Upload
            </button>
          ) : (
            <div className="bg-[#EDF4E8] dark:bg-[#1C1A17]/20 text-[#3A5C28] dark:text-[#3A5C28] text-[10px] px-2 py-1 rounded-lg flex items-center gap-1.5 max-w-[150px]">
              <FileText size={12} className="shrink-0" />
              <span className="truncate">{mySubmission.fileName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Feedback box */}
      {status === 'graded' && mySubmission.feedback && (
        <div className="mt-4 pt-3 border-t border-[#EDE8DF] dark:border-[#2C2A26]">
           <p className="text-[10px] text-[#9A9288] dark:text-[#6B6660] uppercase tracking-wider mb-1">Feedback</p>
           <div className="bg-[#FAF8F5] dark:bg-[#1C1A17]/50 border-l-2 border-[#C9A96E] pl-3 py-2 text-xs text-[#6B6660] dark:text-[#9A9288] italic">
             "{mySubmission.feedback}"
           </div>
        </div>
      )}
    </div>
  );
}
