import { Router } from 'express';
import {
  getCategories,
  getCourses,
  getCourseDetails,
  enrollCourse,
  updateLessonProgress,
  submitAssessment,
  getLearnerDashboard,
  getCertificate,
  createCourse,
} from '../controllers/lms.controller';
import { authenticate } from '../middleware/auth';
import { requireWorkspace, requireRole } from '../middleware/rbac';

const router = Router();

// Public / Read Routes (LMS accessible)
router.get('/categories', getCategories);
router.get('/courses', authenticate, requireWorkspace('LMS'), getCourses);
router.get('/course/:idOrSlug', authenticate, requireWorkspace('LMS'), getCourseDetails);
router.get('/certificate/:certNumber', getCertificate);

// Protected Learner Actions
router.get('/dashboard', authenticate, requireWorkspace('LMS'), getLearnerDashboard);
router.post('/enroll', authenticate, requireWorkspace('LMS'), enrollCourse);
router.post('/lesson/:lessonId/progress', authenticate, requireWorkspace('LMS'), updateLessonProgress);
router.post('/assessment/:assessmentId/submit', authenticate, requireWorkspace('LMS'), submitAssessment);

// Trainer / Admin Course Authoring
router.post('/course', authenticate, requireRole(['TRAINER', 'SUPER_ADMIN']), createCourse);

export default router;
