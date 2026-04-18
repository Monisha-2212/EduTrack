import { Router } from 'express';
import verifyToken from '../middleware/verifyToken.js';
import requireRole from '../middleware/requireRole.js';
import { upload } from '../middleware/upload.js';
import {
  getUsers,
  createAssignment,
  getAssignments,
  submitAssignment,
  gradeSubmission,
  getSubmissions,
} from '../controllers/assignmentController.js';

const router = Router();

// All routes are protected
router.use(verifyToken);

// GET /api/assignments/users?role=student|faculty
router.get('/users', getUsers);

// GET /api/assignments
router.get('/', getAssignments);

// POST /api/assignments  (faculty only)
router.post('/', requireRole('faculty'), createAssignment);

// POST /api/assignments/:id/submit  (student only, with file upload)
router.post('/:id/submit', requireRole('student'), upload.single('file'), submitAssignment);

// PATCH /api/assignments/:id/grade  (faculty only)
router.patch('/:id/grade', requireRole('faculty'), gradeSubmission);

// GET /api/assignments/:id/submissions  (faculty only)
router.get('/:id/submissions', requireRole('faculty'), getSubmissions);

export default router;
