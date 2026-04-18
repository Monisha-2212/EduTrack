import { useState, useEffect } from 'react';
import { X, ExternalLink, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import * as assignmentApi from '../api/assignmentApi.js';
import { cn } from '../lib/utils.js';

export default function GradeDialog({ isOpen, onClose, assignment, onSuccess }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch full assignment with submissions populated (student name/email)
  const { data: fullAssignment, isLoading, refetch } = useQuery({
    queryKey: ['assignment-submissions', assignment?._id],
    queryFn: async () => {
      const res = await assignmentApi.getSubmissions(assignment._id);
      console.log('[GradeDialog] Full assignment data:', res.data);
      return res.data.assignment;
    },
    enabled: !!isOpen && !!assignment?._id,
  });

  const submissions = fullAssignment?.submissions ?? [];
  const selectedSubmission = submissions[selectedIndex];

  const openFile = (url) => {
    console.log('[GradeDialog] openFile called with url:', url);
    if (!url) {
      toast.error('File URL not available');
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (selectedSubmission) {
      setMarks(selectedSubmission.marks ?? '');
      setFeedback(selectedSubmission.feedback ?? '');
      console.log('[GradeDialog] fileUrl:', selectedSubmission?.fileUrl);
    }
  }, [selectedSubmission]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !assignment) return null;

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;
    
    setIsSaving(true);
    try {
      await assignmentApi.gradeSubmission(assignment._id, {
        studentId: selectedSubmission.studentId._id,
        marks: Number(marks),
        feedback,
      });
      toast.success('Grade saved!');
      refetch(); // Refresh local list
      onSuccess(); // Refresh parent dashboard
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save grade.';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-[#FFFDF9] dark:bg-[#1C1A17] rounded-2xl w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EDE8DF] dark:border-[#2C2A26] flex items-center justify-between bg-[#FFFDF9] dark:bg-[#1C1A17] sticky top-0 z-20">
          <div>
            <h2 className="text-base font-medium text-[#2C2A26] dark:text-[#F5F0E8] truncate max-w-full">
              {assignment.title}
            </h2>
            <p className="text-xs text-[#9A9288]">Grading submissions</p>
          </div>
          <button
            onClick={onClose}
            className="border border-[#E8E4DC] dark:border-[#2C2A26] rounded-lg w-8 h-8 flex items-center justify-center text-[#9A9288] hover:text-[#4A4640] dark:hover:text-[#D8D4CC] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#8B6914] mb-2" />
            <p className="text-sm text-[#9A9288]">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-[#9A9288]">No submissions yet for this assignment.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Sidebar: Student List */}
            <div className="w-full md:w-64 border-r border-[#EDE8DF] dark:border-[#2C2A26] bg-[#FAF8F5]/50 dark:bg-[#1C1A17]/20 overflow-y-auto p-4 shrink-0">
              <p className="text-[10px] uppercase font-semibold text-[#9A9288] tracking-wider mb-3 px-1">
                Submissions ({submissions.length})
              </p>
              <div className="space-y-1">
                {submissions.map((sub, idx) => (
                  <button
                    key={sub._id}
                    onClick={() => setSelectedIndex(idx)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-150',
                      selectedIndex === idx
                        ? 'border-[#EDE8DF] bg-[#FAF8F5] dark:bg-[#1C1A17]/30 ring-1 ring-[#C9A96E]/40 dark:ring-[#2C2A26]'
                        : 'border-transparent hover:bg-[#FFFDF9] dark:hover:bg-[#1C1A17]'
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#E8E4DC] dark:bg-[#1C1A17] flex items-center justify-center text-[10px] font-bold text-[#6B6660] uppercase shrink-0">
                      {sub.studentId?.name ? sub.studentId.name[0] : '?'}
                    </div>
                    <div className="min-w-0">
                      <p className={cn(
                        'text-xs font-medium truncate',
                        selectedIndex === idx ? 'text-[#8B6914] dark:text-[#F5F0E8]' : 'text-[#3A3830] dark:text-[#D8D4CC]'
                      )}>
                        {sub.studentId?.name || 'Unknown Student'}
                      </p>
                      <span className={cn(
                        'text-[9px] uppercase font-bold tracking-tight',
                        sub.status === 'graded' ? 'text-[#2A5C4A]' : 'text-[#7A5A10]'
                      )}>
                        {sub.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content: Grading Form */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#FFFDF9] dark:bg-[#1C1A17]">
              {selectedSubmission && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-full bg-[#FAF8F5] dark:bg-[#1C1A17]/40 flex items-center justify-center text-[#8B6914] dark:text-[#F5F0E8]">
                       <User size={20} />
                     </div>
                     <div>
                       <h3 className="text-sm font-semibold text-[#2C2A26] dark:text-[#F5F0E8] leading-tight">
                         {selectedSubmission.studentId?.name || 'Unknown Student'}
                       </h3>
                       <p className="text-xs text-[#9A9288]">{selectedSubmission.studentId?.email || 'No email'}</p>
                     </div>
                  </div>

                  <div className="space-y-5">
                    {/* File Attachment */}
                    {selectedSubmission?.fileUrl ? (
                      <button
                        onClick={() => openFile(selectedSubmission.fileUrl)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-[#FAF8F5] dark:bg-[#1C1A17]/50 rounded-xl group hover:bg-[#EDE8DF] dark:hover:bg-[#1C1A17] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <ExternalLink size={16} className="text-[#8B6914] dark:text-[#F5F0E8]" />
                          <span className="text-xs font-medium text-[#3A3830] dark:text-[#D8D4CC]">View submitted file</span>
                        </div>
                        <span className="text-[10px] text-[#9A9288] group-hover:text-[#4A4640] transition-colors">Open in new tab</span>
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-between px-4 py-3 bg-[#FAF8F5] dark:bg-[#1C1A17]/50 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <ExternalLink size={16} className="text-[#9A9288]" />
                          <span className="text-xs font-medium text-[#9A9288]">No file available</span>
                        </div>
                      </div>
                    )}

                    {/* Marks Input */}
                    <div>
                      <label className="block text-xs font-medium text-[#6B6660] dark:text-[#9A9288] mb-1.5 uppercase tracking-wider">
                        Marks Awarded
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={marks}
                          onChange={(e) => setMarks(e.target.value)}
                          max={assignment.maxMarks}
                          min={0}
                          placeholder="0"
                          className="w-24 border border-[#E8E4DC] dark:border-[#2C2A26] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E] bg-[#FFFDF9] dark:bg-[#1C1A17] text-[#2C2A26] dark:text-[#F5F0E8]"
                        />
                        <span className="text-sm text-[#9A9288]">/ {assignment.maxMarks}</span>
                      </div>
                    </div>

                    {/* Feedback Textarea */}
                    <div>
                      <label className="block text-xs font-medium text-[#6B6660] dark:text-[#9A9288] mb-1.5 uppercase tracking-wider">
                        Feedback
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={3}
                        placeholder="Add a comment or feedback for the student..."
                        className="w-full border border-[#E8E4DC] dark:border-[#2C2A26] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A96E] bg-[#FFFDF9] dark:bg-[#1C1A17] text-[#2C2A26] dark:text-[#F5F0E8] resize-none"
                      />
                    </div>

                    {/* Save Button */}
                    <div className="pt-2">
                      <button
                        onClick={handleSaveGrade}
                        disabled={isSaving || marks === ''}
                        className="w-full flex items-center justify-center gap-2 bg-[#2C2A26] hover:bg-[#3A3830] active:bg-[#1C1A17] disabled:opacity-50 text-[#F0EBE0] text-sm font-medium rounded-xl py-3 transition-all duration-150"
                      >
                        {isSaving ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          'Save Grade'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
