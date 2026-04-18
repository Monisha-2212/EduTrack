import { useState, useEffect } from 'react';
import { X, Loader2, Search, Check, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as assignmentApi from '../api/assignmentApi.js';
import { cn } from '../lib/utils.js';

// ─── Validation Schema ────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  deadline: z.string().refine((val) => new Date(val) > new Date(), {
    message: 'Deadline must be in the future',
  }),
  maxMarks: z.coerce.number().min(1, 'Max marks must be at least 1'),
  assignedTo: z.array(z.string()).min(1, 'Please select at least one student'),
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateAssignmentDialog({ isOpen, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { assignedTo: [] },
  });

  const selectedStudents = watch('assignedTo');

  // Fetch students
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => {
      const res = await assignmentApi.getUsers('student');
      return res.data.users;
    },
    enabled: isOpen,
  });

  const students = studentsData ?? [];
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => {
       window.removeEventListener('keydown', handleEsc);
       if (!isOpen) reset();
    };
  }, [isOpen, onClose, reset]);

  if (!isOpen) return null;

  const toggleStudent = (id) => {
    const current = [...selectedStudents];
    const idx = current.indexOf(id);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(id);
    }
    setValue('assignedTo', current, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await assignmentApi.createAssignment(data);
      toast.success('Assignment created and students notified!');
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create assignment.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    'w-full border border-[#E8E4DC] dark:border-[#2C2A26] rounded-xl px-4 py-2.5 text-sm ' +
    'bg-[#FFFDF9] dark:bg-[#1C1A17] text-[#2C2A26] dark:text-[#F5F0E8] ' +
    'focus:outline-none focus:ring-2 focus:ring-[#C9A96E] transition-all duration-200';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-[#FFFDF9] dark:bg-[#1C1A17] rounded-2xl w-full max-w-lg shadow-2xl relative z-10 flex flex-col my-auto animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EDE8DF] dark:border-[#2C2A26]">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-[#2C2A26] dark:text-[#F5F0E8]">Create new assignment</h2>
            <button
              onClick={onClose}
              className="text-[#9A9288] hover:text-[#4A4640] dark:hover:text-[#D8D4CC] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-xs text-[#9A9288]">Fill in details and select students to assign.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-[#6B6660] uppercase tracking-widest mb-1.5 ml-1">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Introduction to React"
              className={inputCls}
              {...register('title')}
            />
            {errors.title && <p className="text-[11px] text-[#8B3A22] mt-1 ml-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-[#6B6660] uppercase tracking-widest mb-1.5 ml-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Explain the assignment tasks..."
              className={cn(inputCls, 'resize-none')}
              {...register('description')}
            />
            {errors.description && <p className="text-[11px] text-[#8B3A22] mt-1 ml-1">{errors.description.message}</p>}
          </div>

          {/* Grid: Deadline & Max Marks */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#6B6660] uppercase tracking-widest mb-1.5 ml-1">
                Deadline
              </label>
              <input
                type="datetime-local"
                className={inputCls}
                {...register('deadline')}
              />
              {errors.deadline && <p className="text-[11px] text-[#8B3A22] mt-1 ml-1">{errors.deadline.message}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#6B6660] uppercase tracking-widest mb-1.5 ml-1">
                Max Marks
              </label>
              <input
                type="number"
                placeholder="100"
                className={inputCls}
                {...register('maxMarks')}
              />
              {errors.maxMarks && <p className="text-[11px] text-[#8B3A22] mt-1 ml-1">{errors.maxMarks.message}</p>}
            </div>
          </div>

          {/* Student Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1">
              <label className="block text-[11px] font-semibold text-[#6B6660] uppercase tracking-widest">
                Assign to students
              </label>
              <span className="text-[10px] text-[#8B6914] font-medium">{selectedStudents.length} selected</span>
            </div>

            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9288]" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(inputCls, 'pl-9 py-2 ring-1 ring-[#E8E4DC] dark:ring-[#2C2A26]')}
                onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
              />
            </div>

            <div className="border border-[#EDE8DF] dark:border-[#2C2A26] rounded-xl overflow-hidden bg-[#FAF8F5]/30 dark:bg-[#1C1A17]/50 max-h-48 overflow-y-auto divide-y divide-[#EDE8DF] dark:divide-[#2C2A26] custom-scrollbar">
              {isLoadingStudents ? (
                <div className="py-8 flex justify-center"><Loader2 size={18} className="animate-spin text-[#D8D4CC]" /></div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#9A9288] italic">No students found</div>
              ) : (
                filteredStudents.map((s) => {
                  const isChecked = selectedStudents.includes(s._id);
                  return (
                    <div
                      key={s._id}
                      onClick={() => toggleStudent(s._id)}
                      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-[#FFFDF9] dark:hover:bg-[#1C1A17] transition-colors group"
                    >
                      <div className={cn(
                        'w-4 h-4 rounded border transition-all flex items-center justify-center shrink-0',
                        isChecked ? 'bg-[#2C2A26] border-[#C9A96E]' : 'border-[#E8E4DC] dark:border-[#2C2A26] bg-[#FFFDF9] dark:bg-[#1C1A17] group-hover:border-[#C9A96E]'
                      )}>
                        {isChecked && <Check size={10} className="text-[#F0EBE0] stroke-[4px]" />}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-[#1C1A17]/40 flex items-center justify-center text-xs font-bold text-[#8B6914] dark:text-[#F5F0E8] shrink-0 capitalize">
                        {s.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#3A3830] dark:text-[#D8D4CC] truncate">{s.name}</p>
                        <p className="text-[10px] text-[#9A9288] truncate">{s.email}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {errors.assignedTo && <p className="text-[11px] text-[#8B3A22] mt-1.5 ml-1">{errors.assignedTo.message}</p>}
          </div>

          {/* Selected Preview Chips */}
          {selectedStudents.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedStudents.map((id) => {
                const s = students.find(st => st._id === id);
                if (!s) return null;
                return (
                  <div key={id} className="bg-[#FAF8F5] dark:bg-[#1C1A17]/30 text-[#8B6914] dark:text-[#F5F0E8] text-[10px] font-medium px-2 py-1 rounded-lg flex items-center gap-1.5">
                    {s.name}
                    <X size={10} className="cursor-pointer hover:text-[#2C2A26]" onClick={(e) => { e.stopPropagation(); toggleStudent(id); }} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#E8E4DC] dark:border-[#2C2A26] text-[#4A4640] dark:text-[#9A9288] text-sm font-medium rounded-xl py-3 hover:bg-[#FAF8F5] dark:hover:bg-[#1C1A17] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] bg-[#2C2A26] hover:bg-[#3A3830] active:bg-[#1C1A17] disabled:opacity-50 text-[#F0EBE0] text-sm font-medium rounded-xl py-3 transition-all duration-150 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
