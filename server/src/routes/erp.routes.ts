import { Router } from 'express';
import {
  getERPDashboard,
  getMembers,
  createMember,
  getDepartments,
  getTasks,
  createTask,
  updateTaskStatus,
  getAttendance,
  markAttendance,
  getMeetings,
  createMeeting,
  saveMeetingMinutes,
  getFinancialRecords,
  createFinancialRecord,
  getDocuments,
  assignTrainingToMember,
} from '../controllers/erp.controller';
import { authenticate } from '../middleware/auth';
import { requireWorkspace, requireRole } from '../middleware/rbac';

const router = Router();

router.use(authenticate, requireWorkspace('ERP'));

router.get('/dashboard', getERPDashboard);

// Members
router.get('/members', getMembers);
router.post('/members', requireRole(['COOPERATIVE_ADMIN', 'SUPER_ADMIN']), createMember);

// Departments
router.get('/departments', getDepartments);

// Tasks
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.patch('/tasks/:taskId/status', updateTaskStatus);

// Attendance
router.get('/attendance', getAttendance);
router.post('/attendance', markAttendance);

// Meetings
router.get('/meetings', getMeetings);
router.post('/meetings', requireRole(['COOPERATIVE_ADMIN', 'SUPER_ADMIN']), createMeeting);
router.post('/meetings/:meetingId/minutes', requireRole(['COOPERATIVE_ADMIN', 'SUPER_ADMIN']), saveMeetingMinutes);

// Financials
router.get('/financials', getFinancialRecords);
router.post('/financials', requireRole(['COOPERATIVE_ADMIN', 'SUPER_ADMIN']), createFinancialRecord);

// Documents
router.get('/documents', getDocuments);

// Cross-Module: Assign LMS training
router.post('/assign-training', requireRole(['COOPERATIVE_ADMIN', 'SUPER_ADMIN']), assignTrainingToMember);

export default router;
