import { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getDeadlineBadge, cn } from '../lib/utils.js';
import * as assignmentApi from '../api/assignmentApi.js';

export default function UploadDialog({ isOpen, onClose, assignment, onSuccess }) {
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !assignment) return null;

  const badge = getDeadlineBadge(assignment.deadline);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please upload PDF, DOCX, JPG, or PNG.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max limit is 10 MB.');
      return;
    }

    setFile(selectedFile);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    // Simulated progress: 0 -> 90%
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressIntervalRef.current);
          return 90;
        }
        return prev + 10;
      });
    }, 400);

    try {
      const formData = new FormData();
      formData.append('file', file);

      await assignmentApi.submitAssignment(assignment._id, formData);
      
      clearInterval(progressIntervalRef.current);
      setProgress(100);
      toast.success('Assignment submitted successfully!');
      
      onSuccess();
      setTimeout(onClose, 500);
    } catch (err) {
      clearInterval(progressIntervalRef.current);
      setIsUploading(false);
      setProgress(0);
      const msg = err?.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-50 p-4 transition-opacity duration-200">
      {/* Overlay click */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-[#FFFDF9] dark:bg-[#1C1A17] rounded-2xl p-6 w-full max-w-md shadow-2xl relative z-10 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-medium text-[#2C2A26] dark:text-[#F5F0E8]">Upload Assignment</h2>
          <button
            onClick={onClose}
            className="border border-[#E8E4DC] dark:border-[#2C2A26] rounded-lg w-8 h-8 flex items-center justify-center text-[#9A9288] hover:text-[#4A4640] dark:hover:text-[#D8D4CC] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-[#FAF8F5] dark:bg-[#1C1A17]/50 border border-[#EDE8DF] dark:border-[#2C2A26] rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
          <p className="text-sm font-medium text-[#3A3830] dark:text-[#D8D4CC] truncate pr-4">
            {assignment.title}
          </p>
          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap', badge.className)}>
            {badge.label}
          </span>
        </div>

        {/* Upload Zone */}
        {!file && (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 text-center',
              isDragOver
                ? 'border-[#C9A96E] bg-[#FAF8F5] dark:bg-[#1C1A17]/10'
                : 'border-[#E8E4DC] dark:border-[#2C2A26] bg-[#FAF8F5]/50 dark:bg-transparent hover:border-[#E8E4DC] dark:hover:border-[#2C2A26]'
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
              accept=".pdf,.docx,.jpg,.jpeg,.png"
            />
            <UploadCloud size={28} className="text-[#D8D4CC] mb-1" />
            <p className="text-sm text-[#6B6660] dark:text-[#9A9288]">Drag and drop your file here</p>
            <p className="text-[11px] text-[#D8D4CC] dark:text-[#4A4640] font-medium">or</p>
            <button className="text-xs text-[#8B6914] dark:text-[#F5F0E8] font-medium hover:underline">
              Browse file
            </button>
            <p className="text-[10px] text-[#D8D4CC] dark:text-[#4A4640] mt-2">
              PDF, DOCX, JPG, PNG · Max 10 MB
            </p>
          </div>
        )}

        {/* File Preview */}
        {file && (
          <div className="bg-[#FAF8F5] dark:bg-[#1C1A17]/30 border border-[#EDE8DF] dark:border-[#2C2A26] rounded-xl px-4 py-3 flex items-center gap-3 mb-5">
            <div className="bg-[#FAF8F5] dark:bg-[#1C1A17]/20 p-2 rounded-lg">
              <FileText size={18} className="text-[#8B6914] dark:text-[#F5F0E8]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#3A3830] dark:text-[#D8D4CC] truncate">
                {file.name}
              </p>
              <p className="text-[10px] text-[#9A9288] dark:text-[#6B6660]">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            {!isUploading && (
              <button
                onClick={() => setFile(null)}
                className="text-[#9A9288] hover:text-[#8B3A22] transition-colors"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {isUploading && (
          <div className="mb-5">
            <div className="flex justify-between items-center mb-1.5 px-1">
              <span className="text-xs text-[#9A9288]">Uploading...</span>
              <span className="text-xs font-medium text-[#8B6914]">{progress}%</span>
            </div>
            <div className="w-full bg-[#EDE8DF] dark:bg-[#1C1A17] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#2C2A26] h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!file || isUploading}
          className="w-full flex items-center justify-center gap-2 bg-[#2C2A26] hover:bg-[#3A3830] active:bg-[#1C1A17] disabled:opacity-50 text-[#F0EBE0] text-sm font-medium rounded-xl py-3 transition-all duration-150"
        >
          {isUploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            'Submit Assignment'
          )}
        </button>
      </div>
    </div>
  );
}
