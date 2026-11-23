import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

// 1. Employment Dashboard
export const getEmploymentDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    let candidate = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        candidateSkills: { include: { skill: true } },
        applications: {
          include: {
            jobPosting: {
              include: { employer: true },
            },
          },
          orderBy: { appliedAt: 'desc' },
        },
      },
    });

    if (!candidate) {
      candidate = await prisma.candidateProfile.create({
        data: {
          userId,
          headline: 'Job Seeker',
          experienceYears: 1,
        },
        include: {
          candidateSkills: { include: { skill: true } },
          applications: {
            include: { jobPosting: { include: { employer: true } } },
          },
        },
      });
    }

    const availableJobs = await prisma.jobPosting.findMany({
      where: { status: 'ACTIVE' },
      include: {
        employer: true,
        jobSkills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    const candidateSkillIds = new Set(candidate.candidateSkills.map((cs: any) => cs.skillId));
    
    const enrichedJobs = availableJobs.map((job: any) => {
      const requiredSkills = job.jobSkills || [];
      let matchedCount = 0;
      const matchingReasons: string[] = [];

      requiredSkills.forEach((js: any) => {
        if (candidateSkillIds.has(js.skillId)) {
          matchedCount += 1;
        }
      });

      const totalReq = requiredSkills.length;
      const matchScore = totalReq > 0 ? Math.round((matchedCount / totalReq) * 100) : 80;

      if (matchedCount > 0) {
        matchingReasons.push(`Your profile matches ${matchedCount} of ${totalReq} required skills.`);
      }
      const verifiedMatches = candidate.candidateSkills.filter(
        (cs: any) => cs.isVerified && requiredSkills.some((rs: any) => rs.skillId === cs.skillId)
      );
      if (verifiedMatches.length > 0) {
        matchingReasons.push(`${verifiedMatches.length} skill(s) verified by HEXORA LMS certificate!`);
      }

      return {
        ...job,
        matchScore,
        matchingReasons,
      };
    });

    const verifiedSkillsCount = candidate.candidateSkills.filter((cs: any) => cs.isVerified).length;

    res.json({
      candidate,
      stats: {
        totalApplications: candidate.applications.length,
        verifiedSkills: verifiedSkillsCount,
        totalSkills: candidate.candidateSkills.length,
        activeJobsAvailable: enrichedJobs.length,
      },
      recommendedJobs: enrichedJobs.sort((a: any, b: any) => b.matchScore - a.matchScore),
      recentApplications: candidate.applications.slice(0, 5),
    });
  } catch (error: any) {
    console.error('getEmploymentDashboard Error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch employment dashboard.' });
  }
};

// 2. Candidate Profile
export const getCandidateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    let profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { fullName: true, email: true, phone: true, avatarUrl: true } },
        candidateSkills: { include: { skill: true } },
      },
    });

    if (!profile) {
      profile = await prisma.candidateProfile.create({
        data: { userId, headline: 'Job Seeker' },
        include: {
          user: { select: { fullName: true, email: true, phone: true, avatarUrl: true } },
          candidateSkills: { include: { skill: true } },
        },
      });
    }

    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve candidate profile.' });
  }
};

export const updateCandidateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { headline, bio, experienceYears, educationLevel, currentCity, portfolioUrl, careerPreferences, skillIds } = req.body;

    const profile = await prisma.candidateProfile.upsert({
      where: { userId },
      create: {
        userId,
        headline,
        bio,
        experienceYears: Number(experienceYears) || 0,
        educationLevel,
        currentCity,
        portfolioUrl,
        careerPreferences,
      },
      update: {
        headline,
        bio,
        experienceYears: Number(experienceYears) || 0,
        educationLevel,
        currentCity,
        portfolioUrl,
        careerPreferences,
      },
    });

    if (skillIds && Array.isArray(skillIds)) {
      for (const sId of skillIds) {
        await prisma.candidateSkill.upsert({
          where: {
            candidateProfileId_skillId: {
              candidateProfileId: profile.id,
              skillId: String(sId),
            },
          },
          create: {
            candidateProfileId: profile.id,
            skillId: String(sId),
            proficiency: 'INTERMEDIATE',
            isVerified: false,
          },
          update: {},
        });
      }
    }

    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update candidate profile.' });
  }
};

// 3. Job Discovery
export const getJobs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const search = req.query.search ? String(req.query.search) : undefined;
    const employmentType = req.query.employmentType ? String(req.query.employmentType) : undefined;
    const location = req.query.location ? String(req.query.location) : undefined;
    const userId = req.user?.id;

    const where: any = { status: 'ACTIVE' };
    if (employmentType) where.employmentType = employmentType;
    if (location) where.location = { contains: location };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { employer: { companyName: { contains: search } } },
      ];
    }

    const jobs = await prisma.jobPosting.findMany({
      where,
      include: {
        employer: true,
        jobSkills: { include: { skill: true } },
        applications: userId
          ? {
              where: { candidateProfile: { userId } },
              select: { id: true, status: true, appliedAt: true },
            }
          : undefined,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch job postings.' });
  }
};

// 4. Job Details with Match Calculation
export const getJobDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const jobId = String(req.params.jobId);
    const userId = req.user?.id;

    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: {
        employer: true,
        jobSkills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job posting not found.' });
      return;
    }

    let matchScore = 0;
    const matchingReasons: string[] = [];
    let hasApplied = false;

    if (userId) {
      const candidate = await prisma.candidateProfile.findUnique({
        where: { userId },
        include: {
          candidateSkills: { include: { skill: true } },
          applications: { where: { jobPostingId: jobId } },
        },
      });

      if (candidate) {
        hasApplied = candidate.applications.length > 0;
        const candidateSkillIds = new Set(candidate.candidateSkills.map((cs: any) => cs.skillId));
        const requiredSkills = job.jobSkills || [];
        let matched = 0;

        requiredSkills.forEach((js: any) => {
          if (candidateSkillIds.has(js.skillId)) matched += 1;
        });

        matchScore = requiredSkills.length > 0 ? Math.round((matched / requiredSkills.length) * 100) : 100;
        matchingReasons.push(`You match ${matched} of ${requiredSkills.length} required skills (${matchScore}% match).`);

        const verifiedMatches = candidate.candidateSkills.filter(
          (cs: any) => cs.isVerified && requiredSkills.some((rs: any) => rs.skillId === cs.skillId)
        );
        if (verifiedMatches.length > 0) {
          matchingReasons.push(`${verifiedMatches.length} skill(s) are certified and verified via HEXORA LMS!`);
        }
      }
    }

    res.json({
      ...job,
      matchScore,
      matchingReasons,
      hasApplied,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch job details.' });
  }
};

// 5. Apply for a Job
export const applyForJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const jobId = String(req.params.jobId);
    const { coverLetter, resumeUrl } = req.body;
    const userId = req.user.id;

    let candidate = await prisma.candidateProfile.findUnique({ where: { userId } });
    if (!candidate) {
      candidate = await prisma.candidateProfile.create({ data: { userId } });
    }

    const existingApp = await prisma.jobApplication.findUnique({
      where: {
        jobPostingId_candidateProfileId: {
          jobPostingId: jobId,
          candidateProfileId: candidate.id,
        },
      },
    });

    if (existingApp) {
      res.status(400).json({ error: 'You have already submitted an application for this position.' });
      return;
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobPostingId: jobId,
        candidateProfileId: candidate.id,
        coverLetter: coverLetter || null,
        resumeUrl: resumeUrl || candidate.resumeUrl || null,
        status: 'APPLIED',
      },
      include: {
        jobPosting: { include: { employer: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: 'Application Submitted Successfully',
        message: `Your application for "${application.jobPosting.title}" at ${application.jobPosting.employer.companyName} was received.`,
        type: 'SUCCESS',
        link: '/employment/my-applications',
      },
    });

    res.status(201).json(application);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to submit application.' });
  }
};

// 6. Candidate Applications List
export const getMyApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const candidate = await prisma.candidateProfile.findUnique({ where: { userId } });
    if (!candidate) {
      res.json([]);
      return;
    }

    const applications = await prisma.jobApplication.findMany({
      where: { candidateProfileId: candidate.id },
      include: {
        jobPosting: {
          include: { employer: true },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch applications.' });
  }
};

// 7. KEY CROSS-MODULE FEATURE: Skill Gap Analysis & Direct LMS Recommendation
export const getSkillGapAnalysis = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const jobId = req.query.jobId ? String(req.query.jobId) : undefined;
    const userId = req.user.id;

    const candidate = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        candidateSkills: { include: { skill: true } },
      },
    });

    if (!candidate) {
      res.status(404).json({ error: 'Candidate profile not found.' });
      return;
    }

    const candidateSkillMap = new Map(
      candidate.candidateSkills.map((cs: any) => [cs.skillId, { name: cs.skill.name, isVerified: cs.isVerified }])
    );

    let targetJob = null;
    let requiredSkills: any[] = [];

    if (jobId) {
      targetJob = await prisma.jobPosting.findUnique({
        where: { id: jobId },
        include: {
          jobSkills: { include: { skill: true } },
          employer: true,
        },
      });
      if (targetJob) {
        requiredSkills = targetJob.jobSkills;
      }
    } else {
      const allSkills = await prisma.skill.findMany({ take: 6 });
      requiredSkills = allSkills.map((s: any) => ({ skillId: s.id, skill: s, isMandatory: true }));
    }

    const existingSkills: { id: string; name: string; isVerified: boolean }[] = [];
    const missingSkills: { id: string; name: string; isMandatory: boolean }[] = [];

    requiredSkills.forEach((rs: any) => {
      if (candidateSkillMap.has(rs.skillId)) {
        const info = candidateSkillMap.get(rs.skillId)!;
        existingSkills.push({ id: rs.skillId, name: info.name, isVerified: info.isVerified });
      } else {
        missingSkills.push({ id: rs.skillId, name: rs.skill.name, isMandatory: rs.isMandatory ?? true });
      }
    });

    const missingSkillIds = missingSkills.map((ms) => ms.id);
    const recommendedCourses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        courseSkills: {
          some: {
            skillId: { in: missingSkillIds },
          },
        },
      },
      include: {
        category: true,
        courseSkills: { include: { skill: true } },
      },
      take: 4,
    });

    const total = requiredSkills.length;
    const matchPercentage = total > 0 ? Math.round((existingSkills.length / total) * 100) : 100;

    res.json({
      candidateProfileId: candidate.id,
      jobPostingId: targetJob?.id,
      jobTitle: targetJob?.title || 'Ecosystem High-Demand Competencies',
      companyName: targetJob?.employer?.companyName,
      existingSkills,
      missingSkills,
      recommendedCourses,
      overallMatchPercentage: matchPercentage,
    });
  } catch (error: any) {
    console.error('getSkillGapAnalysis Error:', error);
    res.status(500).json({ error: error.message || 'Failed to calculate skill gap analysis.' });
  }
};

// 8. Employer Portal Operations
export const getEmployerDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    let employer = await prisma.employer.findUnique({
      where: { userId },
      include: {
        jobPostings: {
          include: {
            _count: { select: { applications: true } },
            jobSkills: { include: { skill: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!employer) {
      employer = await prisma.employer.create({
        data: {
          userId,
          companyName: 'Apex Cooperative Enterprise Group',
          industry: 'AGRICULTURE_AND_ALLIED',
        },
        include: {
          jobPostings: {
            include: {
              _count: { select: { applications: true } },
              jobSkills: { include: { skill: true } },
            },
          },
        },
      });
    }

    const totalApplicants = await prisma.jobApplication.count({
      where: { jobPosting: { employerId: employer.id } },
    });

    const shortlistedApplicants = await prisma.jobApplication.count({
      where: { jobPosting: { employerId: employer.id }, status: 'SHORTLISTED' },
    });

    res.json({
      employer,
      stats: {
        totalJobs: employer.jobPostings.length,
        totalApplicants,
        shortlistedApplicants,
      },
      jobs: employer.jobPostings,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch employer dashboard.' });
  }
};

export const createJobPosting = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { title, description, requirements, employmentType, experienceYears, location, salaryRange, skillIds } = req.body;

    let employer = await prisma.employer.findUnique({ where: { userId } });
    if (!employer) {
      employer = await prisma.employer.create({
        data: { userId, companyName: 'Registered Cooperative Enterprise' },
      });
    }

    const job = await prisma.jobPosting.create({
      data: {
        employerId: employer.id,
        title,
        description,
        requirements: requirements || null,
        employmentType: employmentType || 'FULL_TIME',
        experienceYears: Number(experienceYears) || 0,
        location,
        salaryRange: salaryRange || null,
        status: 'ACTIVE',
        jobSkills: skillIds && skillIds.length > 0
          ? {
              create: skillIds.map((sId: string) => ({ skillId: String(sId), isMandatory: true })),
            }
          : undefined,
      },
      include: {
        jobSkills: { include: { skill: true } },
        employer: true,
      },
    });

    res.status(201).json(job);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to post vacancy.' });
  }
};

export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const applicationId = String(req.params.applicationId);
    const { status, employerNotes } = req.body;

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status,
        employerNotes: employerNotes || undefined,
      },
      include: {
        candidateProfile: { include: { user: true } },
        jobPosting: true,
      },
    });

    await prisma.notification.create({
      data: {
        userId: updated.candidateProfile.userId,
        title: `Application Status: ${status}`,
        message: `Your application status for "${updated.jobPosting.title}" has been updated to "${status}".`,
        type: status === 'SELECTED' || status === 'SHORTLISTED' ? 'SUCCESS' : 'INFO',
        link: '/employment/my-applications',
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update application status.' });
  }
};
