import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  marks: {
    type: Number,
    default: null,
  },
  feedback: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['submitted', 'graded'],
    default: 'submitted',
  },
});

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
  },
  maxMarks: {
    type: Number,
    required: [true, 'Max marks is required'],
    min: 1,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  submissions: [submissionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
