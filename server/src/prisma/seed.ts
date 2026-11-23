import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting HEXORA Database Seeding...');

  // 1. Roles
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Platform Super Administrator with system-wide oversight' },
    { name: 'COOPERATIVE_ADMIN', description: 'Administrator of a specific cooperative society' },
    { name: 'COOPERATIVE_MEMBER', description: 'Active voting member of a cooperative' },
    { name: 'LEARNER', description: 'Individual pursuing capacity building and skill courses' },
    { name: 'TRAINER', description: 'Course creator, curriculum designer and assessor' },
    { name: 'JOB_SEEKER', description: 'Candidate seeking employment matching verified skills' },
    { name: 'EMPLOYER', description: 'Enterprise recruiter or cooperative seeking skilled talent' },
  ];

  const roleMap: Record<string, string> = {};
  for (const r of roles) {
    const roleRecord = await prisma.role.upsert({
      where: { name: r.name },
      create: r,
      update: { description: r.description },
    });
    roleMap[r.name] = roleRecord.id;
  }
  console.log('✅ Roles seeded.');

  // Common Passwords
  const adminPass = await bcrypt.hash('Hexora@2026', 10);
  const userPass = await bcrypt.hash('Password@123', 10);

  // 2. Users
  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@hexora.org' },
    create: {
      email: 'admin@hexora.org',
      passwordHash: adminPass,
      fullName: 'Vikramaditya Sharma',
      phone: '+91 98765 00001',
      intendedRole: 'SUPER_ADMIN',
      activeWorkspace: 'ERP',
      hasSelectedPurpose: true,
      userRoles: { create: [{ roleId: roleMap['SUPER_ADMIN'] }] },
      workspaceAccess: {
        create: [
          { workspace: 'LMS' },
          { workspace: 'ERP' },
          { workspace: 'EMPLOYMENT' },
        ],
      },
    },
    update: {},
  });

  // Cooperative Admin
  const coopAdmin = await prisma.user.upsert({
    where: { email: 'coop.admin@greenvalley.org' },
    create: {
      email: 'coop.admin@greenvalley.org',
      passwordHash: userPass,
      fullName: 'Suresh Patil',
      phone: '+91 98765 11223',
      intendedRole: 'COOPERATIVE_ADMIN',
      activeWorkspace: 'ERP',
      hasSelectedPurpose: true,
      userRoles: { create: [{ roleId: roleMap['COOPERATIVE_ADMIN'] }] },
      workspaceAccess: {
        create: [
          { workspace: 'LMS' },
          { workspace: 'ERP' },
        ],
      },
    },
    update: {},
  });

  // Trainer
  const trainer = await prisma.user.upsert({
    where: { email: 'trainer.priya@hexora.org' },
    create: {
      email: 'trainer.priya@hexora.org',
      passwordHash: userPass,
      fullName: 'Dr. Priya Nair',
      phone: '+91 98765 33445',
      intendedRole: 'TRAINER',
      activeWorkspace: 'LMS',
      hasSelectedPurpose: true,
      userRoles: { create: [{ roleId: roleMap['TRAINER'] }] },
      workspaceAccess: { create: [{ workspace: 'LMS' }] },
    },
    update: {},
  });

  // Cooperative Member & Learner
  const memberArjun = await prisma.user.upsert({
    where: { email: 'member.arjun@greenvalley.org' },
    create: {
      email: 'member.arjun@greenvalley.org',
      passwordHash: userPass,
      fullName: 'Arjun Deshmukh',
      phone: '+91 98765 44556',
      intendedRole: 'COOPERATIVE_MEMBER',
      activeWorkspace: 'ERP',
      hasSelectedPurpose: true,
      userRoles: {
        create: [
          { roleId: roleMap['COOPERATIVE_MEMBER'] },
          { roleId: roleMap['LEARNER'] },
          { roleId: roleMap['JOB_SEEKER'] },
        ],
      },
      workspaceAccess: {
        create: [
          { workspace: 'LMS' },
          { workspace: 'ERP' },
          { workspace: 'EMPLOYMENT' },
        ],
      },
    },
    update: {},
  });

  // Job Seeker
  const candidateRohit = await prisma.user.upsert({
    where: { email: 'candidate.rohit@gmail.com' },
    create: {
      email: 'candidate.rohit@gmail.com',
      passwordHash: userPass,
      fullName: 'Rohit Verma',
      phone: '+91 98765 55667',
      intendedRole: 'JOB_SEEKER',
      activeWorkspace: 'EMPLOYMENT',
      hasSelectedPurpose: true,
      userRoles: {
        create: [
          { roleId: roleMap['JOB_SEEKER'] },
          { roleId: roleMap['LEARNER'] },
        ],
      },
      workspaceAccess: {
        create: [
          { workspace: 'LMS' },
          { workspace: 'EMPLOYMENT' },
        ],
      },
    },
    update: {},
  });

  // Employer
  const employerKavita = await prisma.user.upsert({
    where: { email: 'employer.kavita@agriapex.com' },
    create: {
      email: 'employer.kavita@agriapex.com',
      passwordHash: userPass,
      fullName: 'Kavita Roy',
      phone: '+91 98765 66778',
      intendedRole: 'EMPLOYER',
      activeWorkspace: 'EMPLOYMENT',
      hasSelectedPurpose: true,
      userRoles: { create: [{ roleId: roleMap['EMPLOYER'] }] },
      workspaceAccess: {
        create: [
          { workspace: 'EMPLOYMENT' },
        ],
      },
    },
    update: {},
  });

  console.log('✅ Demo Users seeded.');

  // 3. Skills Repository
  const skillList = [
    { name: 'Agritech IoT Operations', category: 'TECHNICAL', description: 'Deployment and maintenance of IoT soil sensors, weather nodes, and automated drip controllers' },
    { name: 'Cooperative Accounting & Audit', category: 'FINANCIAL', description: 'Statutory bookkeeping, balance sheet auditing, ledger management under Cooperative Acts' },
    { name: 'Cooperative Bylaws & Statutory Governance', category: 'GOVERNANCE', description: 'Managing AGM protocols, voting records, and compliance with State Cooperative Society acts' },
    { name: 'Data-Driven Yield Optimization', category: 'ANALYTICS', description: 'Interpreting crop telemetry, predictive yield metrics, and fertilizer micro-scheduling' },
    { name: 'Cold Storage Warehouse Management', category: 'LOGISTICS', description: 'Ethylene monitoring, temperature-controlled batch preservation, FIFO inventory control' },
    { name: 'Organic Supply Chain Management', category: 'SUPPLY_CHAIN', description: 'NPOP certification standards, QR traceability, and fair-trade cooperative contracts' },
    { name: 'Financial Literacy & Microcredit', category: 'FINANCIAL', description: 'Managing member loan recovery, NABARD refinance schemas, and thrift deposits' },
  ];

  const skillMap: Record<string, string> = {};
  for (const s of skillList) {
    const skillRecord = await prisma.skill.upsert({
      where: { name: s.name },
      create: s,
      update: {},
    });
    skillMap[s.name] = skillRecord.id;
  }
  console.log('✅ Skills repository seeded.');

  // 4. LMS Categories & Courses
  const catGov = await prisma.courseCategory.upsert({
    where: { slug: 'cooperative-governance-finance' },
    create: {
      name: 'Cooperative Governance & Finance',
      slug: 'cooperative-governance-finance',
      description: 'Master accounting, statutory audits, and board compliance for cooperative societies.',
      icon: 'ShieldCheck',
    },
    update: {},
  });

  const catAgri = await prisma.courseCategory.upsert({
    where: { slug: 'sustainable-agritech' },
    create: {
      name: 'Sustainable Agritech & Smart Farming',
      slug: 'sustainable-agritech',
      description: 'IoT telemetry, drone survey analytics, and precision inputs for farmer collectives.',
      icon: 'Cpu',
    },
    update: {},
  });

  const catSupply = await prisma.courseCategory.upsert({
    where: { slug: 'supply-chain-logistics' },
    create: {
      name: 'Supply Chain & Cold Chain Operations',
      slug: 'supply-chain-logistics',
      description: 'Perishable warehousing, farm-to-shelf traceability, and market linkages.',
      icon: 'Truck',
    },
    update: {},
  });

  // Course 1: Accounting
  const course1 = await prisma.course.upsert({
    where: { slug: 'cooperative-accounting-and-statutory-audit' },
    create: {
      title: 'Cooperative Accounting, Compliance & Audit Essentials',
      slug: 'cooperative-accounting-and-statutory-audit',
      description: 'Comprehensive capacity building program tailored for cooperative executives, accountants, and board members to ensure pristine statutory compliance, ledger balancing, and transparent audits.',
      categoryId: catGov.id,
      difficulty: 'INTERMEDIATE',
      instructorId: trainer.id,
      durationHours: 6.5,
      objectives: JSON.stringify([
        'Understand statutory double-entry bookkeeping for primary agricultural societies',
        'Master Preparation of Profit & Loss Statement and Balance Sheet under cooperative law',
        'Handle internal audits and resolve registrar inspection objections',
      ]),
      status: 'PUBLISHED',
      courseSkills: {
        create: [
          { skillId: skillMap['Cooperative Accounting & Audit'] },
          { skillId: skillMap['Cooperative Bylaws & Statutory Governance'] },
        ],
      },
      lessons: {
        create: [
          {
            orderIndex: 1,
            title: '1. Fundamentals of Cooperative Double-Entry Bookkeeping',
            contentType: 'VIDEO',
            contentUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            contentBody: `### Key Principles of Cooperative Accounting
Cooperative societies operate on non-profit, mutual-help economic foundations. Unlike joint-stock corporations where shareholders vote by equity percentage, cooperatives adhere to the democratic principle of: **One Member, One Vote**.

#### Essential Ledgers to Maintain:
1. **Day Book (Cash & Bank Transactions)**: All receipts and disbursements must be authenticated daily.
2. **Member Share Capital Ledger**: Tracks individual member share values, entry fees, and dividend accruals.
3. **Loan Disbursement Register**: Comprehensive log of short-term seasonal credit and mid-term asset loans.`,
            durationMinutes: 25,
            isFreePreview: true,
          },
          {
            orderIndex: 2,
            title: '2. Reserve Funds, Statutory Transfers & Dividend Calculation',
            contentType: 'TEXT',
            contentBody: `### Statutory Allocation of Net Surplus
Under Section 64 of typical State Cooperative Societies Acts, before declaring any patronage dividend:
- A minimum of **25% of net profit** must be transferred to the **Statutory Reserve Fund**.
- **Cooperative Education Fund**: 1% to 2% contribution.
- Maximum dividend payout to members is legally capped (typically 12% to 15% per annum) to encourage reinvestment into society reserves.`,
            durationMinutes: 20,
          },
          {
            orderIndex: 3,
            title: '3. Conducting Internal Audits & Facing Registrar Inspections',
            contentType: 'PDF',
            contentBody: `### Audit Checklist for Certified Auditors
Ensure all vouchers have signed receipts, bank reconciliation statements match month-end passbooks, and overdue interest classifications strictly conform to NPA prudential norms.`,
            durationMinutes: 30,
          },
        ],
      },
    },
    update: {},
  });

  // Course 1 Assessment
  const assess1 = await prisma.assessment.create({
    data: {
      courseId: course1.id,
      title: 'Certification Exam: Cooperative Accounting & Audit',
      description: 'Test your knowledge on statutory reserves, voucher balancing, and audit readiness.',
      passingScore: 70,
      timeLimitMinutes: 15,
      questions: {
        create: [
          {
            questionText: 'What is the minimum statutory percentage of net profit that must be allocated to the Reserve Fund in a cooperative society?',
            questionType: 'MULTIPLE_CHOICE',
            optionsJson: JSON.stringify(['5%', '10%', '25%', '50%']),
            correctAnswer: '25%',
            points: 1,
          },
          {
            questionText: 'What is the core voting principle in a cooperative organization?',
            questionType: 'MULTIPLE_CHOICE',
            optionsJson: JSON.stringify(['One Share, One Vote', 'One Member, One Vote', 'Highest Investor Decides', 'Seniority Only']),
            correctAnswer: 'One Member, One Vote',
            points: 1,
          },
          {
            questionText: 'True or False: Cooperative societies are exempt from maintaining a Day Book if transaction volumes are low.',
            questionType: 'TRUE_FALSE',
            optionsJson: JSON.stringify(['True', 'False']),
            correctAnswer: 'False',
            points: 1,
          },
        ],
      },
    },
  });

  // Course 2: Agritech
  const course2 = await prisma.course.upsert({
    where: { slug: 'modern-agritech-and-iot-sensors' },
    create: {
      title: 'Modern Agritech & IoT Sensors for Yield Optimization',
      slug: 'modern-agritech-and-iot-sensors',
      description: 'Hands-on practical training on deploying LoRaWAN soil moisture probes, automated weather stations, and telemetry interpretation for collective cooperative farms.',
      categoryId: catAgri.id,
      difficulty: 'BEGINNER',
      instructorId: trainer.id,
      durationHours: 4.0,
      objectives: JSON.stringify([
        'Calibrate volumetric soil moisture sensors and wireless gateways',
        'Analyze real-time evapotranspiration data to automate irrigation solenoids',
        'Use predictive weather alerts to safeguard cooperative cash crops',
      ]),
      status: 'PUBLISHED',
      courseSkills: {
        create: [
          { skillId: skillMap['Agritech IoT Operations'] },
          { skillId: skillMap['Data-Driven Yield Optimization'] },
        ],
      },
      lessons: {
        create: [
          {
            orderIndex: 1,
            title: '1. Introduction to IoT Architecture in Precision Agriculture',
            contentType: 'VIDEO',
            contentUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            contentBody: `Understanding the edge-to-cloud telemetry stack: sensor nodes -> LoRaWAN Gateway -> HEXORA IoT Ingestion Gateway -> Mobile telemetry alerts.`,
            durationMinutes: 20,
            isFreePreview: true,
          },
          {
            orderIndex: 2,
            title: '2. Sensor Calibration, Placement & Battery Optimization',
            contentType: 'TEXT',
            contentBody: `Probes must be inserted at 15cm (root zone) and 45cm (sub-soil leaching depth). Solar trickle charging ensures uninterrupted telemetry even during monsoon cloud covers.`,
            durationMinutes: 25,
          },
        ],
      },
    },
    update: {},
  });

  await prisma.assessment.create({
    data: {
      courseId: course2.id,
      title: 'Agritech IoT Competency Assessment',
      passingScore: 70,
      timeLimitMinutes: 10,
      questions: {
        create: [
          {
            questionText: 'Which wireless protocol is preferred for long-range, low-power agricultural sensor networks across rural farms?',
            questionType: 'MULTIPLE_CHOICE',
            optionsJson: JSON.stringify(['Bluetooth Low Energy', 'LoRaWAN', 'High-Speed 5G Ultra', 'NFC']),
            correctAnswer: 'LoRaWAN',
            points: 1,
          },
          {
            questionText: 'At what root zone depth should primary moisture probes typically be positioned for vegetable crops?',
            questionType: 'MULTIPLE_CHOICE',
            optionsJson: JSON.stringify(['2 cm', '15 cm', '120 cm', '300 cm']),
            correctAnswer: '15 cm',
            points: 1,
          },
        ],
      },
    },
  });

  // Course 3: Cold Chain
  const course3 = await prisma.course.upsert({
    where: { slug: 'cold-chain-logistics-and-warehousing' },
    create: {
      title: 'Cold Chain Logistics and Farm-to-Market Distribution',
      slug: 'cold-chain-logistics-and-warehousing',
      description: 'Master temperature mapping, modified atmospheric packaging, and cold-storage operations to reduce post-harvest losses from 30% down to under 4%.',
      categoryId: catSupply.id,
      difficulty: 'ADVANCED',
      instructorId: trainer.id,
      durationHours: 5.0,
      objectives: JSON.stringify([
        'Design continuous temperature recording protocols for reefer trucks',
        'Manage ethylene scrubbing and cold storage humidity controls',
        'Execute trace-to-origin digital manifests for retail export buyers',
      ]),
      status: 'PUBLISHED',
      courseSkills: {
        create: [
          { skillId: skillMap['Cold Storage Warehouse Management'] },
          { skillId: skillMap['Organic Supply Chain Management'] },
        ],
      },
      lessons: {
        create: [
          {
            orderIndex: 1,
            title: '1. Post-Harvest Physiology and Pre-Cooling Fundamentals',
            contentType: 'VIDEO',
            contentBody: `Immediate removal of field heat within 2 hours of harvest doubles the shelf life of fresh produce.`,
            durationMinutes: 18,
          },
        ],
      },
    },
    update: {},
  });

  console.log('✅ LMS Courses, Lessons, and Assessments seeded.');

  // 5. Cooperative Organization & ERP Data
  const coop = await prisma.cooperative.upsert({
    where: { registrationNumber: 'COOP/MH/2021/AGR/8892' },
    create: {
      name: 'Green Valley Agro Producers Cooperative Society Ltd.',
      registrationNumber: 'COOP/MH/2021/AGR/8892',
      type: 'AGRICULTURE',
      address: 'Plot 42, Agro Industrial Park, Dindori Road',
      city: 'Nashik',
      state: 'Maharashtra',
      contactEmail: 'contact@greenvalleyagro.org',
      contactPhone: '+91 253 288 9911',
      description: 'A forward-thinking farmer-producer collective of 240 smallholder farmers specializing in zero-residue table grapes, organic vegetables, and tech-enabled cold chain exports.',
      establishedDate: new Date('2021-04-12'),
      status: 'ACTIVE',
    },
    update: {},
  });

  // Departments
  const deptFinance = await prisma.department.create({
    data: { cooperativeId: coop.id, name: 'Finance & Member Credit', description: 'Handles member share registers, micro-loans, and quarterly audits.' },
  });
  const deptAgri = await prisma.department.create({
    data: { cooperativeId: coop.id, name: 'Precision Agritech & IoT', description: 'Operates drone surveys, IoT weather stations, and irrigation systems.' },
  });
  const deptLogistics = await prisma.department.create({
    data: { cooperativeId: coop.id, name: 'Cold Storage & Logistics', description: 'Oversees the 500 MT cold storage facility and reefer transport fleet.' },
  });

  // Members
  const memberAdmin = await prisma.member.create({
    data: {
      cooperativeId: coop.id,
      userId: coopAdmin.id,
      membershipId: 'MEM-001',
      designation: 'Managing Director & Secretary',
      departmentId: deptFinance.id,
      status: 'ACTIVE',
    },
  });

  const memberArjunRecord = await prisma.member.create({
    data: {
      cooperativeId: coop.id,
      userId: memberArjun.id,
      membershipId: 'MEM-002',
      designation: 'Lead Field Agronomist & Sensor Technician',
      departmentId: deptAgri.id,
      status: 'ACTIVE',
    },
  });

  // Seed 4 additional cooperative members for vibrant realism
  const names = ['Kailash Jadhav', 'Sunita Gaikwad', 'Ramesh Sonawane', 'Pooja Borse'];
  for (let i = 0; i < names.length; i++) {
    const memUser = await prisma.user.create({
      data: {
        fullName: names[i],
        email: `member.${i + 3}@greenvalley.org`,
        passwordHash: userPass,
        intendedRole: 'COOPERATIVE_MEMBER',
        activeWorkspace: 'ERP',
        hasSelectedPurpose: true,
      },
    });
    await prisma.userRole.create({ data: { userId: memUser.id, roleId: roleMap['COOPERATIVE_MEMBER'] } });
    await prisma.workspaceAccess.create({ data: { userId: memUser.id, workspace: 'ERP' } });
    await prisma.member.create({
      data: {
        cooperativeId: coop.id,
        userId: memUser.id,
        membershipId: `MEM-${String(i + 3).padStart(3, '0')}`,
        designation: i % 2 === 0 ? 'Produce Grader & Sorter' : 'Sensor Maintenance Operator',
        departmentId: i % 2 === 0 ? deptLogistics.id : deptAgri.id,
        status: 'ACTIVE',
      },
    });
  }

  // Tasks
  await prisma.task.createMany({
    data: [
      {
        cooperativeId: coop.id,
        title: 'Calibrate Soil Moisture Probes in Sector 4 Grape Vineyards',
        description: 'Check battery status and re-verify zero-offset telemetry against physical tensiometer readings.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedToMemberId: memberArjunRecord.id,
        createdByUserId: coopAdmin.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        cooperativeId: coop.id,
        title: 'Compile Q3 Financial Vouchers for Statutory Audit Review',
        description: 'Aggregate all fertiliser purchase invoices and reconcile member loan repayments.',
        priority: 'URGENT',
        status: 'PENDING',
        assignedToMemberId: memberAdmin.id,
        createdByUserId: coopAdmin.id,
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      },
      {
        cooperativeId: coop.id,
        title: 'Inspect Reefer Truck Temperature Data Loggers',
        description: 'Verify trip telemetry logs for the 15-tonne export consignment dispatched to Mumbai port.',
        priority: 'MEDIUM',
        status: 'COMPLETED',
        assignedToMemberId: memberArjunRecord.id,
        createdByUserId: coopAdmin.id,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completedAt: new Date(),
      },
    ],
  });

  // Attendance Records for Today
  const todayStr = new Date().toISOString().split('T')[0];
  await prisma.attendanceRecord.createMany({
    data: [
      {
        cooperativeId: coop.id,
        memberId: memberAdmin.id,
        date: todayStr,
        status: 'PRESENT',
        checkInTime: new Date(new Date().setHours(8, 30, 0, 0)),
        verificationMethod: 'MANUAL',
        notes: 'Executive check-in',
      },
      {
        cooperativeId: coop.id,
        memberId: memberArjunRecord.id,
        date: todayStr,
        status: 'PRESENT',
        checkInTime: new Date(new Date().setHours(8, 45, 0, 0)),
        verificationMethod: 'BIOMETRIC_DEVICE',
        notes: 'Biometric fingerprint verified at Gate 1',
      },
    ],
  });

  // Meetings
  const meeting1 = await prisma.meeting.create({
    data: {
      cooperativeId: coop.id,
      title: 'Quarterly Executive Board Review & Technology Modernization',
      description: 'Review Q3 financial performance, IoT sensor rollout in Sector 4, and allocate budget for solar backup.',
      agenda: '1. Review Q3 Profit & Loss\n2. IoT Telemetry status\n3. Approval of new cold-storage compressor\n4. Capacity building directives',
      meetingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      locationOrLink: 'Conference Hall A & Google Meet Hybrid',
      status: 'SCHEDULED',
    },
  });

  // Financial Records
  await prisma.financialRecord.createMany({
    data: [
      {
        cooperativeId: coop.id,
        type: 'INCOME',
        category: 'SALES',
        amount: 850000,
        description: 'Bulk wholesale consignment sale of residue-free grapes to European retail chain',
        referenceNumber: 'INV-2026-089',
        recordedByUserId: coopAdmin.id,
      },
      {
        cooperativeId: coop.id,
        type: 'INCOME',
        category: 'MEMBERSHIP_FEE',
        amount: 120000,
        description: 'Annual membership subscriptions and new member share capital deposits',
        referenceNumber: 'RCP-2026-014',
        recordedByUserId: coopAdmin.id,
      },
      {
        cooperativeId: coop.id,
        type: 'EXPENSE',
        category: 'EQUIPMENT',
        amount: 145000,
        description: 'Procurement of 12 wireless soil IoT telemetry nodes and LoRa gateway',
        referenceNumber: 'PO-AGRI-441',
        recordedByUserId: coopAdmin.id,
      },
      {
        cooperativeId: coop.id,
        type: 'EXPENSE',
        category: 'OPERATIONS',
        amount: 68000,
        description: 'Electricity utility and solar inverter routine maintenance for cold warehouse',
        referenceNumber: 'UTIL-0922',
        recordedByUserId: coopAdmin.id,
      },
    ],
  });

  // Hardware Device
  await prisma.hardwareDevice.create({
    data: {
      deviceIdentifier: 'HEX-BIO-NASHIK-01',
      name: 'Main Gate Biometric Terminal (Biotrack IoT Pro)',
      type: 'BIOMETRIC_FINGERPRINT',
      cooperativeId: coop.id,
      location: 'Nashik Agro Hub - Gate 1 Reception',
      status: 'ONLINE',
      lastSyncAt: new Date(),
    },
  });

  // Documents
  await prisma.document.createMany({
    data: [
      {
        cooperativeId: coop.id,
        title: 'Statutory_Bylaws_Approved_2025.pdf',
        category: 'LEGAL',
        fileUrl: '/uploads/sample_bylaws.pdf',
        fileSize: 2450000,
        uploadedByUserId: coopAdmin.id,
      },
      {
        cooperativeId: coop.id,
        title: 'Q2_Internal_Audit_Report.pdf',
        category: 'FINANCIAL',
        fileUrl: '/uploads/audit_q2.pdf',
        fileSize: 1850000,
        uploadedByUserId: coopAdmin.id,
      },
    ],
  });

  console.log('✅ Cooperative ERP data & Hardware device seeded.');

  // 6. Employment Ecosystem Data
  // Employer Profile
  const employerRecord = await prisma.employer.upsert({
    where: { userId: employerKavita.id },
    create: {
      userId: employerKavita.id,
      companyName: 'AgriApex Solutions Pvt. Ltd.',
      industry: 'AGRICULTURE_AND_ALLIED',
      companySize: '51-200',
      website: 'https://agriapexsolutions.example.com',
      description: 'Leading precision agriculture and cooperative digital supply chain enterprise empowering modern collectives across western India.',
      verifiedStatus: 'VERIFIED',
    },
    update: {},
  });

  // Candidate Profiles
  // Rohit Verma (Aspiring Candidate)
  const rohitProfile = await prisma.candidateProfile.upsert({
    where: { userId: candidateRohit.id },
    create: {
      userId: candidateRohit.id,
      headline: 'Certified Agritech Operations Technician & Cooperative Agronomist',
      bio: 'Passionate about leveraging IoT telemetry, soil sensor arrays, and modern cooperative farm management to elevate collective yields.',
      experienceYears: 2,
      educationLevel: 'BACHELORS',
      currentCity: 'Nashik',
      isPublic: true,
      candidateSkills: {
        create: [
          {
            skillId: skillMap['Agritech IoT Operations'],
            proficiency: 'EXPERT',
            isVerified: true, // Verified by HEXORA LMS!
            verifiedAt: new Date(),
          },
          {
            skillId: skillMap['Data-Driven Yield Optimization'],
            proficiency: 'INTERMEDIATE',
            isVerified: true,
            verifiedAt: new Date(),
          },
        ],
      },
    },
    update: {},
  });

  // Arjun Deshmukh Candidate Profile (Coop Member who is also job seeker!)
  const arjunProfile = await prisma.candidateProfile.upsert({
    where: { userId: memberArjun.id },
    create: {
      userId: memberArjun.id,
      headline: 'Cooperative Operations Specialist & Cold Chain Technician',
      experienceYears: 4,
      educationLevel: 'DIPLOMA',
      currentCity: 'Nashik',
      isPublic: true,
      candidateSkills: {
        create: [
          {
            skillId: skillMap['Cooperative Accounting & Audit'],
            proficiency: 'INTERMEDIATE',
            isVerified: false,
          },
        ],
      },
    },
    update: {},
  });

  // Job Postings
  const job1 = await prisma.jobPosting.create({
    data: {
      employerId: employerRecord.id,
      title: 'Precision Agritech Field Specialist & IoT Sensor Lead',
      description: 'We are seeking an energetic Agritech Field Specialist to lead smart sensor deployment, LoRaWAN telemetry calibration, and farm yield analytics across cooperative clusters.',
      requirements: 'Experience with soil moisture probes, LoRa gateways, and practical agricultural field experience. HEXORA LMS certification is strongly preferred.',
      employmentType: 'FULL_TIME',
      experienceYears: 1,
      location: 'Nashik & Pune Region',
      salaryRange: '₹4,80,000 - ₹6,50,000 per annum',
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      jobSkills: {
        create: [
          { skillId: skillMap['Agritech IoT Operations'], isMandatory: true },
          { skillId: skillMap['Data-Driven Yield Optimization'], isMandatory: true },
          { skillId: skillMap['Organic Supply Chain Management'], isMandatory: false },
        ],
      },
    },
  });

  const job2 = await prisma.jobPosting.create({
    data: {
      employerId: employerRecord.id,
      title: 'Cooperative Accounts & Statutory Compliance Officer',
      description: 'Responsible for maintaining statutory ledgers, managing member share accounts, and preparing societies for annual registrar audits.',
      requirements: 'In-depth understanding of Cooperative Societies Act, double-entry bookkeeping, and audited balance sheet finalization.',
      employmentType: 'FULL_TIME',
      experienceYears: 2,
      location: 'Pune (Hybrid)',
      salaryRange: '₹5,20,000 - ₹7,00,000 per annum',
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      jobSkills: {
        create: [
          { skillId: skillMap['Cooperative Accounting & Audit'], isMandatory: true },
          { skillId: skillMap['Cooperative Bylaws & Statutory Governance'], isMandatory: true },
        ],
      },
    },
  });

  const job3 = await prisma.jobPosting.create({
    data: {
      employerId: employerRecord.id,
      title: 'Cold Storage Warehouse & Logistics Supervisor',
      description: 'Supervise pre-cooling, temperature monitoring for export fruits, FIFO warehousing, and trace-to-market manifests.',
      requirements: 'Hands-on knowledge of cold storage operations, ethylene scrubbers, and transport reefer monitoring.',
      employmentType: 'CONTRACT',
      experienceYears: 3,
      location: 'Nashik Agro Hub',
      salaryRange: '₹4,00,000 - ₹5,50,000 per annum',
      applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      jobSkills: {
        create: [
          { skillId: skillMap['Cold Storage Warehouse Management'], isMandatory: true },
          { skillId: skillMap['Organic Supply Chain Management'], isMandatory: true },
        ],
      },
    },
  });

  // Seed one initial Job Application
  await prisma.jobApplication.create({
    data: {
      jobPostingId: job1.id,
      candidateProfileId: rohitProfile.id,
      coverLetter: 'I have successfully completed the Modern Agritech & IoT Sensors course on HEXORA LMS, verifying my credentials in telemetry calibration and sensor placement. I am excited to apply my skills at AgriApex.',
      status: 'SHORTLISTED',
      employerNotes: 'Excellent candidate with verified LMS certifications and field knowledge.',
    },
  });

  // Seed sample Certificate for Rohit
  await prisma.certificate.create({
    data: {
      certificateNumber: 'HEX-CERT-2026-AGRI99',
      userId: candidateRohit.id,
      courseId: course2.id,
      grade: 'DISTINCTION',
      skillsCredited: JSON.stringify(['Agritech IoT Operations', 'Data-Driven Yield Optimization']),
    },
  });

  // Seed course enrollment for Rohit (Completed) and Arjun (Ongoing)
  await prisma.courseEnrollment.createMany({
    data: [
      {
        userId: candidateRohit.id,
        courseId: course2.id,
        progressPercent: 100,
        isCompleted: true,
        completedAt: new Date(),
      },
      {
        userId: memberArjun.id,
        courseId: course1.id,
        progressPercent: 45,
        isCompleted: false,
      },
    ],
  });

  // Cooperative Training Directive: Coop Admin assigns course to Arjun!
  await prisma.cooperativeTrainingAssignment.create({
    data: {
      cooperativeId: coop.id,
      memberId: memberArjunRecord.id,
      courseId: course1.id,
      assignedByUserId: coopAdmin.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      completionStatus: 'IN_PROGRESS',
    },
  });

  console.log('✅ Employment jobs, profiles, applications, and cross-module linkages seeded successfully!');
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
