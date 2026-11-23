import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const getUserCooperativeId = async (userId: string): Promise<string> => {
  const membership = await prisma.member.findFirst({
    where: { userId, status: 'ACTIVE' },
    select: { cooperativeId: true },
  });

  if (membership) return membership.cooperativeId;

  const coop = await prisma.cooperative.findFirst();
  if (coop) return coop.id;
  throw new Error('No cooperative organization registered in the system.');
};

// 1. ERP Dashboard Overview
export const getERPDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coopId = await getUserCooperativeId(req.user.id);

    const coop = await prisma.cooperative.findUnique({
      where: { id: coopId },
      include: {
        _count: {
          select: {
            members: true,
            tasks: true,
            meetings: true,
            financialRecords: true,
            documents: true,
          },
        },
      },
    });

    const activeMembersCount = await prisma.member.count({
      where: { cooperativeId: coopId, status: 'ACTIVE' },
    });

    const pendingTasksCount = await prisma.task.count({
      where: { cooperativeId: coopId, status: { in: ['PENDING', 'IN_PROGRESS'] } },
    });

    const todayDateStr = new Date().toISOString().split('T')[0];
    const todayAttendanceCount = await prisma.attendanceRecord.count({
      where: { cooperativeId: coopId, date: todayDateStr, status: 'PRESENT' },
    });

    const upcomingMeetings = await prisma.meeting.findMany({
      where: {
        cooperativeId: coopId,
        meetingDate: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { meetingDate: 'asc' },
      take: 3,
    });

    const recentFinancials = await prisma.financialRecord.findMany({
      where: { cooperativeId: coopId },
      orderBy: { transactionDate: 'desc' },
      take: 5,
    });

    const financialAggregate = await prisma.financialRecord.groupBy({
      by: ['type'],
      where: { cooperativeId: coopId },
      _sum: { amount: true },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    financialAggregate.forEach((agg: any) => {
      if (agg.type === 'INCOME') totalIncome = agg._sum.amount || 0;
      if (agg.type === 'EXPENSE') totalExpense = agg._sum.amount || 0;
    });

    const recentTasks = await prisma.task.findMany({
      where: { cooperativeId: coopId },
      include: { assignedMember: { include: { user: { select: { fullName: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({
      cooperative: coop,
      stats: {
        totalMembers: coop?._count.members || 0,
        activeMembers: activeMembersCount,
        pendingTasks: pendingTasksCount,
        todayAttendance: todayAttendanceCount,
        attendanceRate: activeMembersCount > 0 ? Math.round((todayAttendanceCount / activeMembersCount) * 100) : 0,
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
      },
      upcomingMeetings,
      recentFinancials,
      recentTasks,
    });
  } catch (error: any) {
    console.error('getERPDashboard Error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch ERP dashboard.' });
  }
};

// 2. Member Directory
export const getMembers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coopId = await getUserCooperativeId(req.user.id);
    const search = req.query.search ? String(req.query.search) : undefined;
    const departmentId = req.query.departmentId ? String(req.query.departmentId) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;

    const where: any = { cooperativeId: coopId };
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;
    if (search) {
      where.OR = [
        { membershipId: { contains: search } },
        { designation: { contains: search } },
        { user: { fullName: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const members = await prisma.member.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
        department: true,
      },
      orderBy: { joinDate: 'desc' },
    });

    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch member directory.' });
  }
};

// 3. Add Member
export const createMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coopId = await getUserCooperativeId(req.user.id);
    const { fullName, email, phone, designation, departmentId } = req.body;

    let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      const defaultPasswordHash = await import('bcryptjs').then((b) => b.hash('Coop@123', 10));
      user = await prisma.user.create({
        data: {
          fullName,
          email: email.toLowerCase(),
          passwordHash: defaultPasswordHash,
          phone: phone || null,
          intendedRole: 'COOPERATIVE_MEMBER',
          activeWorkspace: 'ERP',
        },
      });

      const memberRole = await prisma.role.findFirst({ where: { name: 'COOPERATIVE_MEMBER' } });
      if (memberRole) {
        await prisma.userRole.create({ data: { userId: user.id, roleId: memberRole.id } });
      }
      await prisma.workspaceAccess.createMany({
        data: [
          { userId: user.id, workspace: 'ERP' },
          { userId: user.id, workspace: 'LMS' },
        ],
      });
    }

    const count = await prisma.member.count({ where: { cooperativeId: coopId } });
    const membershipId = `MEM-${String(count + 1).padStart(3, '0')}`;

    const member = await prisma.member.create({
      data: {
        cooperativeId: coopId,
        userId: user.id,
        membershipId,
        designation: designation || 'Active Member',
        departmentId: departmentId || null,
      },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        department: true,
      },
    });

    res.status(201).json(member);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add member.' });
  }
};

// 4. Org Structure / Departments
export const getDepartments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coopId = await getUserCooperativeId(req.user.id);
    const departments = await prisma.department.findMany({
      where: { cooperativeId: coopId },
      include: {
        _count: { select: { members: true } },
      },
    });
    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch departments.' });
  }
};

// 5. Tasks Management
export const getTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coopId = await getUserCooperativeId(req.user.id);
    const status = req.query.status ? String(req.query.status) : undefined;
    const priority = req.query.priority ? String(req.query.priority) : undefined;

    const where: any = { cooperativeId: coopId };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedMember: {
          include: {
            user: { select: { fullName: true, email: true } },
          },
        },
        createdByUser: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coopId = await getUserCooperativeId(req.user.id);
    const { title, description, priority, assignedToMemberId, dueDate } = req.body;

    const task = await prisma.task.create({
      data: {
        cooperativeId: coopId,
        title,
        description: description || null,
        priority: priority || 'MEDIUM',
        assignedToMemberId: assignedToMemberId || null,
        createdByUserId: req.user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        assignedMember: { include: { user: { select: { fullName: true } } } },
      },
    });

    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create task.' });
  }
};

export const updateTaskStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const taskId = String(req.params.taskId);
    const { status } = req.body;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update task status.' });
  }
};

// 6. Attendance Management
export const getAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coopId = await getUserCooperativeId(req.user.id);
    const targetDate = req.query.date ? String(req.query.date) : new Date().toISOString().split('T')[0];

    const records = await prisma.attendanceRecord.findMany({
      where: { cooperativeId: coopId, date: targetDate },
      include: {
        member: {
          include: {
            user: { select: { fullName: true, email: true } },
            department: true,
          },
        },
      },
      orderBy: { checkInTime: 'asc' },
    });

    res.json({ date: targetDate, records });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch attendance records.' });
  }
};

export const markAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coopId = await getUserCooperativeId(req.user.id);
    const { memberId, status, notes } = req.body;
    const dateStr = new Date().toISOString().split('T')[0];

    const record = await prisma.attendanceRecord.upsert({
      where: {
        cooperativeId_memberId_date: {
          cooperativeId: coopId,
          memberId: String(memberId),
          date: dateStr,
        },
      },
      create: {
        cooperativeId: coopId,
        memberId: String(memberId),
        date: dateStr,
        status: status || 'PRESENT',
        checkInTime: new Date(),
        verificationMethod: 'MANUAL',
        notes: notes || null,
      },
      update: {
        status: status || 'PRESENT',
        notes: notes || null,
      },
      include: {
        member: { include: { user: { select: { fullName: true } } } },
      },
    });

    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to record attendance.' });
  }
};

// 7. Meeting Management & Minutes
export const getMeetings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coopId = await getUserCooperativeId(req.user.id);
    const meetings = await prisma.meeting.findMany({
      where: { cooperativeId: coopId },
      include: { minutes: true },
      orderBy: { meetingDate: 'desc' },
    });
    res.json(meetings);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch meetings.' });
  }
};

export const createMeeting = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coopId = await getUserCooperativeId(req.user.id);
    const { title, description, agenda, meetingDate, locationOrLink } = req.body;

    const meeting = await prisma.meeting.create({
      data: {
        cooperativeId: coopId,
        title,
        description: description || null,
        agenda: agenda || null,
        meetingDate: new Date(meetingDate),
        locationOrLink: locationOrLink || 'Cooperative Headquarters Conference Room',
      },
    });

    res.status(201).json(meeting);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to schedule meeting.' });
  }
};

export const saveMeetingMinutes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const meetingId = String(req.params.meetingId);
    const { minutesContent, actionItems, decisions, attendanceCount } = req.body;

    const minutes = await prisma.meetingMinutes.upsert({
      where: { meetingId },
      create: {
        meetingId,
        minutesContent,
        actionItemsJson: JSON.stringify(actionItems || []),
        decisionsJson: JSON.stringify(decisions || []),
        attendanceCount: Number(attendanceCount) || 0,
      },
      update: {
        minutesContent,
        actionItemsJson: JSON.stringify(actionItems || []),
        decisionsJson: JSON.stringify(decisions || []),
        attendanceCount: Number(attendanceCount) || 0,
      },
    });

    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'CONCLUDED' },
    });

    res.json(minutes);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to record meeting minutes.' });
  }
};

// 8. Financial Records
export const getFinancialRecords = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coopId = await getUserCooperativeId(req.user.id);
    const records = await prisma.financialRecord.findMany({
      where: { cooperativeId: coopId },
      include: { recordedByUser: { select: { fullName: true } } },
      orderBy: { transactionDate: 'desc' },
    });
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch financial records.' });
  }
};

export const createFinancialRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coopId = await getUserCooperativeId(req.user.id);
    const { type, category, amount, description, referenceNumber } = req.body;

    const record = await prisma.financialRecord.create({
      data: {
        cooperativeId: coopId,
        type,
        category,
        amount: Number(amount),
        description,
        referenceNumber: referenceNumber || null,
        recordedByUserId: req.user.id,
      },
      include: { recordedByUser: { select: { fullName: true } } },
    });

    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create financial transaction.' });
  }
};

// 9. Document Management
export const getDocuments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coopId = await getUserCooperativeId(req.user.id);
    const documents = await prisma.document.findMany({
      where: { cooperativeId: coopId },
      include: { uploadedByUser: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(documents);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch documents.' });
  }
};

// 10. Assign Training to Member
export const assignTrainingToMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coopId = await getUserCooperativeId(req.user.id);
    const { memberId, courseId, dueDate } = req.body;

    const member = await prisma.member.findUnique({
      where: { id: String(memberId) },
      include: { user: true },
    });

    const course = await prisma.course.findUnique({ where: { id: String(courseId) } });

    if (!member || !course) {
      res.status(404).json({ error: 'Member or Course not found.' });
      return;
    }

    const assignment = await prisma.cooperativeTrainingAssignment.upsert({
      where: {
        cooperativeId_memberId_courseId: {
          cooperativeId: coopId,
          memberId: String(memberId),
          courseId: String(courseId),
        },
      },
      create: {
        cooperativeId: coopId,
        memberId: String(memberId),
        courseId: String(courseId),
        assignedByUserId: req.user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      update: {
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    await prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId: member.userId, courseId: String(courseId) } },
      create: {
        userId: member.userId,
        courseId: String(courseId),
        progressPercent: 0,
      },
      update: {},
    });

    await prisma.notification.create({
      data: {
        userId: member.userId,
        title: 'New Cooperative Training Directive',
        message: `Your Cooperative Administrator has assigned you the course "${course.title}". Start upskilling now!`,
        type: 'INFO',
        link: `/lms/course/${course.slug}`,
      },
    });

    res.status(201).json({
      message: `Course "${course.title}" successfully assigned to member ${member.user.fullName}.`,
      assignment,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to assign training.' });
  }
};
