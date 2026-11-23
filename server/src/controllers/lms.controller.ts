import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

// 1. Get Course Categories
export const getCategories = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.courseCategory.findMany({
      include: {
        _count: { select: { courses: true } },
      },
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve categories.' });
  }
};

// 2. Get Course Catalogue
export const getCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const category = req.query.category ? String(req.query.category) : undefined;
    const difficulty = req.query.difficulty ? String(req.query.difficulty) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const userId = req.user?.id;

    const whereClause: any = {
      status: 'PUBLISHED',
    };

    if (category) {
      whereClause.category = { slug: category };
    }
    if (difficulty) {
      whereClause.difficulty = difficulty;
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        category: true,
        instructor: { select: { id: true, fullName: true, email: true } },
        courseSkills: { include: { skill: true } },
        enrollments: userId
          ? {
              where: { userId },
              select: { progressPercent: true, isCompleted: true },
            }
          : undefined,
        _count: { select: { lessons: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(courses);
  } catch (error: any) {
    console.error('getCourses Error:', error);
    res.status(500).json({ error: 'Failed to fetch course catalogue.' });
  }
};

// 3. Get Course Details
export const getCourseDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const idOrSlug = String(req.params.idOrSlug);
    const userId = req.user?.id;

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        category: true,
        instructor: { select: { id: true, fullName: true, email: true } },
        courseSkills: { include: { skill: true } },
        lessons: {
          orderBy: { orderIndex: 'asc' },
          include: userId
            ? {
                progresses: {
                  where: { userId },
                  select: { isCompleted: true, completedAt: true },
                },
              }
            : undefined,
        },
        assessments: {
          include: {
            questions: true,
            submissions: userId
              ? {
                  where: { userId },
                  orderBy: { score: 'desc' },
                  take: 1,
                }
              : undefined,
          },
        },
        enrollments: userId
          ? {
              where: { userId },
            }
          : undefined,
      },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    res.json(course);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve course details.' });
  }
};

// 4. Enroll in a Course
export const enrollCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    const course = await prisma.course.findUnique({ where: { id: String(courseId) } });
    if (!course) {
      res.status(404).json({ error: 'Course does not exist.' });
      return;
    }

    const enrollment = await prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId, courseId: String(courseId) } },
      create: {
        userId,
        courseId: String(courseId),
        progressPercent: 0,
      },
      update: {},
    });

    await prisma.notification.create({
      data: {
        userId,
        title: 'Enrolled in Course',
        message: `You have successfully enrolled in "${course.title}". Start learning now!`,
        type: 'SUCCESS',
        link: `/lms/course/${course.slug}`,
      },
    });

    res.status(201).json({ message: 'Enrolled successfully!', enrollment });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to enroll in course.' });
  }
};

// 5. Update Lesson Progress
export const updateLessonProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lessonId = String(req.params.lessonId);
    const { isCompleted } = req.body;
    const userId = req.user.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: { lessons: true },
        },
      },
    });

    if (!lesson || !lesson.course) {
      res.status(404).json({ error: 'Lesson not found.' });
      return;
    }

    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        isCompleted: isCompleted ?? true,
        completedAt: new Date(),
      },
      update: {
        isCompleted: isCompleted ?? true,
        completedAt: new Date(),
      },
    });

    const totalLessons = lesson.course.lessons.length;
    const completedCount = await prisma.lessonProgress.count({
      where: {
        userId,
        lessonId: { in: lesson.course.lessons.map((l: any) => l.id) },
        isCompleted: true,
      },
    });

    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 100;
    const isFinished = progressPercent === 100;

    const updatedEnrollment = await prisma.courseEnrollment.update({
      where: { userId_courseId: { userId, courseId: lesson.courseId } },
      data: {
        progressPercent,
        isCompleted: isFinished,
        completedAt: isFinished ? new Date() : null,
      },
    });

    res.json({
      message: 'Lesson progress updated.',
      progressPercent,
      isCompleted: isFinished,
      enrollment: updatedEnrollment,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update lesson progress.' });
  }
};

// 6. Submit Assessment Quiz & Auto-Issue Certificate + Verified Skills!
export const submitAssessment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const assessmentId = String(req.params.assessmentId);
    const { answers } = req.body;
    const userId = req.user.id;

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: true,
        course: {
          include: {
            courseSkills: { include: { skill: true } },
          },
        },
      },
    });

    if (!assessment || !assessment.course) {
      res.status(404).json({ error: 'Assessment not found.' });
      return;
    }

    let correctCount = 0;
    const totalQuestions = assessment.questions.length;

    assessment.questions.forEach((q: any) => {
      if (answers && answers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
    const passed = score >= assessment.passingScore;

    const submission = await prisma.assessmentSubmission.create({
      data: {
        assessmentId,
        userId,
        answersJson: JSON.stringify(answers || {}),
        score,
        passed,
        feedback: passed
          ? `Outstanding work! You scored ${score}% (Passing criteria: ${assessment.passingScore}%).`
          : `You scored ${score}%. The passing threshold is ${assessment.passingScore}%. Please review course materials and reattempt.`,
      },
    });

    let certificate = null;

    if (passed) {
      const certId = `HEX-CERT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const skillsToCredit = assessment.course.courseSkills.map((cs: any) => cs.skill.name);

      certificate = await prisma.certificate.upsert({
        where: { userId_courseId: { userId, courseId: assessment.courseId } },
        create: {
          certificateNumber: certId,
          userId,
          courseId: assessment.courseId,
          grade: score >= 90 ? 'DISTINCTION' : 'PASS',
          skillsCredited: JSON.stringify(skillsToCredit),
        },
        update: {
          grade: score >= 90 ? 'DISTINCTION' : 'PASS',
        },
        include: {
          course: true,
          user: { select: { fullName: true, email: true } },
        },
      });

      await prisma.courseEnrollment.upsert({
        where: { userId_courseId: { userId, courseId: assessment.courseId } },
        create: {
          userId,
          courseId: assessment.courseId,
          progressPercent: 100,
          isCompleted: true,
          completedAt: new Date(),
        },
        update: {
          progressPercent: 100,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      // Auto-update Employment Profile with verified skills
      let candidateProfile = await prisma.candidateProfile.findUnique({ where: { userId } });
      if (!candidateProfile) {
        candidateProfile = await prisma.candidateProfile.create({
          data: {
            userId,
            headline: 'Certified Professional',
          },
        });
      }

      for (const cs of assessment.course.courseSkills) {
        await prisma.candidateSkill.upsert({
          where: {
            candidateProfileId_skillId: {
              candidateProfileId: candidateProfile.id,
              skillId: cs.skillId,
            },
          },
          create: {
            candidateProfileId: candidateProfile.id,
            skillId: cs.skillId,
            proficiency: 'INTERMEDIATE',
            isVerified: true,
            sourceCourseId: assessment.courseId,
            verifiedAt: new Date(),
          },
          update: {
            isVerified: true,
            sourceCourseId: assessment.courseId,
            verifiedAt: new Date(),
          },
        });
      }

      await prisma.notification.create({
        data: {
          userId,
          title: '🎉 Course Completed & Certificate Issued!',
          message: `Congratulations! You passed "${assessment.course.title}". Your new skills have been verified on your Employment Profile!`,
          type: 'SUCCESS',
          link: `/lms/certificate/${certificate.certificateNumber}`,
        },
      });
    }

    res.json({
      submission,
      passed,
      score,
      certificate,
    });
  } catch (error: any) {
    console.error('submitAssessment Error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit assessment.' });
  }
};

// 7. Get Learner Dashboard Overview
export const getLearnerDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            category: true,
            instructor: { select: { fullName: true } },
            _count: { select: { lessons: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { issuedAt: 'desc' },
    });

    const ongoingCourses = enrollments.filter((e: any) => !e.isCompleted);
    const completedCourses = enrollments.filter((e: any) => e.isCompleted);

    const enrolledCourseIds = enrollments.map((e: any) => e.courseId);
    const recommendedCourses = await prisma.course.findMany({
      where: {
        id: { notIn: enrolledCourseIds },
        status: 'PUBLISHED',
      },
      take: 4,
      include: { category: true, courseSkills: { include: { skill: true } } },
    });

    res.json({
      stats: {
        totalEnrolled: enrollments.length,
        ongoingCount: ongoingCourses.length,
        completedCount: completedCourses.length,
        certificatesEarned: certificates.length,
      },
      ongoingCourses,
      completedCourses,
      certificates,
      recommendedCourses,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch learner dashboard.' });
  }
};

// 8. Get Certificate by ID or Number
export const getCertificate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const certNumber = String(req.params.certNumber);

    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [{ certificateNumber: certNumber }, { id: certNumber }],
      },
      include: {
        course: {
          include: {
            category: true,
            instructor: { select: { fullName: true } },
            courseSkills: { include: { skill: true } },
          },
        },
        user: { select: { fullName: true, email: true } },
      },
    });

    if (!cert) {
      res.status(404).json({ error: 'Certificate not found or invalid identification code.' });
      return;
    }

    res.json(cert);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch certificate.' });
  }
};

// 9. Create Course (Trainers & Admins)
export const createCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, categoryId, difficulty, durationHours, objectives, skillIds } = req.body;
    const instructorId = req.user.id;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

    const newCourse = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        categoryId,
        difficulty: difficulty || 'BEGINNER',
        instructorId,
        durationHours: Number(durationHours) || 2.0,
        objectives: objectives || '',
        status: 'PUBLISHED',
        courseSkills: skillIds && skillIds.length > 0
          ? {
              create: skillIds.map((sId: string) => ({ skillId: sId })),
            }
          : undefined,
      },
      include: {
        category: true,
        courseSkills: { include: { skill: true } },
      },
    });

    res.status(201).json(newCourse);
  } catch (error: any) {
    console.error('createCourse Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create course.' });
  }
};
