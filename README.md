# HEXORA – AI- and LMS-Enabled Cooperative Capacity Building, ERP and Employment Ecosystem
**Official Problem Statement ID:** SIH26087  
**Official Problem Statement Title:** AI- and LMS-Enabled Cooperative Capacity Building, ERP and Employment Ecosystem  
**Mission Statement:** Combine learning, cooperative organizational management, and employment support into one unified, intelligent, scalable ecosystem.

---

## 🌟 Executive Summary

**HEXORA** solves the operational fragmentation of grassroots cooperative societies, farmer producer organizations (FPOs), and vocational learners. Rather than forcing disparate tools for education, operational management, and hiring, HEXORA establishes a **Single Identity, Triple Dedicated Workspace** architecture:

1. **Learning Management System (LMS):** Capacity building, multimedia chapters, quizzes, automated grading, official certificate issuance, and an AI Learning Assistant.
2. **Cooperative Enterprise Resource Planning (ERP):** Multi-society data isolation, membership directories, departmental hierarchy, task Kanban, attendance tracking with IoT biometric/RFID integration, meeting minutes, financial ledgers, and document archives.
3. **Employment Ecosystem:** Certified candidate profiles, vacancy discovery, dynamic application tracking pipelines, employer recruitment portals, and AI-driven match score analytics with understandable explanations.

---

## 🔄 The Cross-Module Integration Engine

HEXORA is **not** three separate tools stitched together. It functions as a cohesive ecosystem:

```
[LMS Capacity Building]
       │
       ▼ (Earns Certificate & Verified Skill Badges)
[Employment Profile]
       │
       ▼ (Auto-Calculates Candidate Match Score)
[Job Vacancy Match] ◄─── (Identifies Skill Gaps & Recommends LMS Courses)
       ▲
       │ (Cooperative Admin Issues Training Directive)
[Cooperative ERP]
```

### 1. LMS Course Completion ➔ Auto-Verified Employment Skills
When a learner completes lessons in an accredited course and scores $\ge 70\%$ on the assessment, the backend automatically issues a verifiable Certificate (`HEX-CERT-2026-XXXX`) and marks the corresponding skills on the candidate's Employment Profile as **`LMS Verified`**.

### 2. Job Skill Gap Analysis ➔ One-Click LMS Course Recommendation
When an applicant views a job posting (e.g. *Precision Agritech Field Specialist*), the system evaluates required competencies against candidate records. If a competency is missing, it displays a **Skill Gap Analysis** that maps directly to the specific LMS course teaching that skill, enabling instant enrollment.

### 3. Cooperative Administration ➔ Member Training Directives
A Cooperative Administrator can identify organizational skill deficits (e.g., needing certified accountants for statutory audits) and dispatch a formal **Training Directive** from the ERP. This auto-enrolls the designated member in the LMS course, sends an in-app alert, and tracks their progress.

### 4. Hardware Extensibility (Biometric & RFID Terminals)
While physical hardware is not mandatory for software evaluation, HEXORA exposes a secure hardware ingestion endpoint:
- **`POST /api/hardware/attendance-sync`**
Receives batch logs from IoT biometric fingerprint terminals (e.g., Biotrack Pro IoT) and RFID readers, resolving member IDs to attendance entries. Evaluators can simulate live hardware swipes via the **Hardware Devices** UI.

---

## 👥 Seed Demonstration Accounts

All accounts are pre-seeded in the local database. You can test each persona with 1-click from the login screen:

| Persona / Role | Email | Password | Primary Workspace | Permissions & Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Super Administrator** | `admin@hexora.org` | `Hexora@2026` | Workspace Hub | Universal oversight across LMS, ERP & Employment |
| **Cooperative Administrator** | `coop.admin@greenvalley.org` | `Password@123` | Cooperative ERP | Manages Green Valley Agro Cooperative, financials, meetings & tasks |
| **Cooperative Member & Learner** | `member.arjun@greenvalley.org` | `Password@123` | Cooperative ERP / LMS | Field agronomist, assigned operational tasks & enrolled in LMS courses |
| **Lead Academic Trainer** | `trainer.priya@hexora.org` | `Password@123` | LMS Workspace | Course creator, curriculum designer & quiz assessor |
| **Job Seeker Candidate** | `candidate.rohit@gmail.com` | `Password@123` | Employment | Certified agritech candidate with verified LMS badges applying for jobs |
| **Employer / Recruiter** | `employer.kavita@agriapex.com` | `Password@123` | Employment | HR Director at AgriApex Solutions publishing vacancies & reviewing CVs |

---

## 🚀 Quickstart & Installation Guide

### Prerequisites
- **Node.js** v18+ (tested on Node v26)
- **npm** v9+

### 1. Install Dependencies
Run from the project root:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Initialize Database & Seed Demo Data
```bash
cd ../server
npx prisma generate
npx prisma db push
npx tsx src/prisma/seed.ts
```

### 3. Start Development Servers

**Terminal 1 (Backend API - Port 5000):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend Client - Port 5173):**
```bash
cd client
npm run dev
```

Now open **`http://localhost:5173`** in your browser.

---

## 📱 Guided Walkthrough for Evaluators

1. **Authentication:**
   - Navigate to `http://localhost:5173/login`.
   - Click any of the **1-Click Demo Login** pills (e.g. *Job Seeker* or *Cooperative Admin*).
2. **Purpose Selection Screen:**
   - If logging in as a newly registered user or accessing the switcher, you will encounter the **Welcome to HEXORA** Purpose Selection interface.
   - Choose between **Learning Management System**, **Cooperative Management**, or **Employment and Careers**.
3. **Experience the LMS:**
   - Browse courses in the **Course Catalogue**.
   - Open *"Modern Agritech & IoT Sensors for Yield Optimization"*.
   - Mark lesson chapters complete, then click **Take Assessment**.
   - Answer the quiz questions to score $\ge 70\%$.
   - Watch the celebratory confetti, then view your official printable **Certificate of Competency**.
4. **Inspect the Employment Workspace:**
   - Click the top bar **Switch Workspace** dropdown and select **Employment Ecosystem**.
   - Notice that the skills you just certified in the LMS now appear under **Verified LMS Credential Badges**!
   - Navigate to **Discover Vacancies** and open *"Precision Agritech Field Specialist"*.
   - See how your match score increased to **100% Match** with verified reason badges.
   - Click **Apply for this Position** to submit your verified candidacy.
5. **Inspect the Cooperative ERP:**
   - Switch to **Cooperative ERP**.
   - View the active cooperative *Green Valley Agro Producers Cooperative Society Ltd.*
   - Inspect member directories, task kanban boards, attendance logs, and financial income/expense ledgers.
   - Go to **Assign LMS Training** to assign an upskilling course to a cooperative member.
   - Go to **Hardware IoT Devices** and click **Simulate Biometric Swipe** to verify real-time IoT check-in ingestion.

---

## 🔒 Security & Architecture Highlights
- **Strict Data Isolation:** Multi-cooperative and multi-employer scoping ensures one organization cannot access another's financial or member records.
- **RBAC Enforcement:** Permissions validated on Express middleware (`authenticate`, `requireWorkspace`, `requireRole`) and database constraints, not merely frontend UI visibility.
- **AI Dual-Engine:** Configured to call Google Gemini API when an API key is present, backed by an intelligent deterministic knowledge engine for seamless offline evaluations.
- **Production Build Ready:** Both frontend and backend compile to optimized production assets (`tsc && vite build`).

Developed with pride by the **HEXORA Community-Based Project Engineering Team** for **SIH26087**.
