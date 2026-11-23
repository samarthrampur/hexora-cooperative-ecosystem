import { Router } from 'express';
import {
  getEmploymentDashboard,
  getCandidateProfile,
  updateCandidateProfile,
  getJobs,
  getJobDetails,
  applyForJob,
  getMyApplications,
  getSkillGapAnalysis,
  getEmployerDashboard,
  createJobPosting,
  updateApplicationStatus,
} from '../controllers/employment.controller';
import { authenticate } from '../middleware/auth';
import { requireWorkspace, requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate, requireWorkspace('EMPLOYMENT'));

// Candidate & Discovery
router.get('/dashboard', getEmploymentDashboard);
router.get('/profile', getCandidateProfile);
router.put('/profile', updateCandidateProfile);
router.get('/jobs', getJobs);
router.get('/job/:jobId', getJobDetails);
router.post('/job/:jobId/apply', applyForJob);
router.get('/my-applications', getMyApplications);
router.get('/skill-gap', getSkillGapAnalysis);

// Employer Portal
router.get('/employer/dashboard', requireRole(['EMPLOYER', 'SUPER_ADMIN']), getEmployerDashboard);
router.post('/employer/job', requireRole(['EMPLOYER', 'SUPER_ADMIN']), createJobPosting);
router.patch('/employer/application/:applicationId/status', requireRole(['EMPLOYER', 'SUPER_ADMIN']), updateApplicationStatus);

export default router;
