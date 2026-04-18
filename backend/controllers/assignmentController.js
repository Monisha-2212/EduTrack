import Assignment from '../models/Assignment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { getIO } from '../socket/socketHandler.js';

// ─── GET /api/assignments/users?role=student|faculty ─────────────────────────

const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('_id name email');
    return res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/assignments  (faculty) ────────────────────────────────────────

const createAssignment = async (req, res, next) => {
  try {
    const { title, description, deadline, maxMarks, assignedTo } = req.body;
    const io = getIO();

    const assignment = await Assignment.create({
      title,
      description,
      deadline,
      maxMarks,
      createdBy: req.user.userId,
      assignedTo,
    });

    // Notify each assigned student
    const studentIds = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    for (const studentId of studentIds) {
      const notification = await Notification.create({
        recipientId: studentId,
        recipientRole: 'student',
        message: `New assignment posted: "${title}". Deadline: ${new Date(deadline).toLocaleString()}.`,
        type: 'assignment_posted',
        relatedAssignmentId: assignment._id,
      });

      io.to(`student_${studentId}`).emit('assignment_posted', {
        notification,
        assignment,
      });
    }

    return res.status(201).json({ message: 'Assignment created.', assignment });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/assignments ─────────────────────────────────────────────────────

const getAssignments = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    if (role === 'faculty') {
      const assignments = await Assignment.find({ createdBy: userId })
        .populate('assignedTo', 'name email')
        .lean();

      const result = assignments.map((a) => ({
        ...a,
        submissionCount: a.submissions?.length ?? 0,
      }));

      return res.status(200).json({ assignments: result });
    }

    // Student view
    const assignments = await Assignment.find({ assignedTo: userId })
      .populate('createdBy', 'name email')
      .lean();

    const result = assignments.map((a) => {
      const mySubmission =
        a.submissions?.find((s) => s.studentId?.toString() === userId) ?? null;

      // eslint-disable-next-line no-unused-vars
      const { submissions, ...rest } = a;
      return { ...rest, mySubmission };
    });

    return res.status(200).json({ assignments: result });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/assignments/:id/submit  (student, multer) ─────────────────────

const submitAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const io = getIO();

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    // Verify student is in assignedTo
    const isAssigned = assignment.assignedTo.some((sid) => sid.toString() === userId);
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this assignment.' });
    }

    // Check for duplicate submission
    const alreadySubmitted = assignment.submissions.some(
      (s) => s.studentId?.toString() === userId
    );
    if (alreadySubmitted) {
      return res.status(409).json({ message: 'You have already submitted this assignment.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Upload to Cloudinary
    const { url: fileUrl } = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

    console.log('[Upload] File URL:', fileUrl);

    // Push submission
    assignment.submissions.push({
      studentId: userId,
      fileUrl,
      fileName: req.file.originalname,
    });
    await assignment.save();

    // Notify faculty
    const notification = await Notification.create({
      recipientId: assignment.createdBy,
      recipientRole: 'faculty',
      message: `A student submitted "${assignment.title}".`,
      type: 'submission_received',
      relatedAssignmentId: assignment._id,
    });

    io.to(`faculty_${assignment.createdBy}`).emit('submission_received', {
      notification,
      assignmentId: assignment._id,
      studentId: userId,
    });

    return res.status(200).json({ message: 'Submission successful.', fileUrl });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/assignments/:id/grade  (faculty) ─────────────────────────────

const gradeSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { studentId, marks, feedback } = req.body;
    const { userId } = req.user;
    const io = getIO();

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    // Verify this faculty owns the assignment
    if (assignment.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to grade this assignment.' });
    }

    const submission = assignment.submissions.find(
      (s) => s.studentId?.toString() === studentId
    );
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found for this student.' });
    }

    submission.marks = marks;
    submission.feedback = feedback ?? '';
    submission.status = 'graded';
    await assignment.save();

    // Notify student
    const notification = await Notification.create({
      recipientId: studentId,
      recipientRole: 'student',
      message: `Your submission for "${assignment.title}" has been graded. Marks: ${marks}/${assignment.maxMarks}`,
      type: 'marks_awarded',
      relatedAssignmentId: assignment._id,
    });

    io.to(`student_${studentId}`).emit('marks_awarded', {
      notification,
      assignmentId: assignment._id,
      marks,
      maxMarks: assignment.maxMarks,
    });

    return res.status(200).json({ message: 'Submission graded.', submission });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/assignments/:id/submissions  (faculty) ─────────────────────────

const getSubmissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id)
      .populate('submissions.studentId', 'name email')
      .lean();

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    return res.status(200).json({ assignment });
  } catch (err) {
    next(err);
  }
};

export {
  getUsers,
  createAssignment,
  getAssignments,
  submitAssignment,
  gradeSubmission,
  getSubmissions,
};
