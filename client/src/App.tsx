import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PurposeSelectionScreen } from './pages/purpose/PurposeSelectionScreen';
import { AccessDenied } from './pages/shared/AccessDenied';
import { NotFound } from './pages/shared/NotFound';
import { ProfilePage } from './pages/shared/ProfilePage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { WorkspaceLayout } from './components/common/WorkspaceLayout';

// LMS Pages
import { LearnerDashboard } from './pages/lms/LearnerDashboard';
import { CourseCatalog } from './pages/lms/CourseCatalog';
import { CoursePlayer } from './pages/lms/CoursePlayer';
import { MyCoursesPage } from './pages/lms/MyCoursesPage';
import { AssessmentsPage } from './pages/lms/AssessmentsPage';
import { CertificatesPage } from './pages/lms/CertificatesPage';
import { CertificateView } from './pages/lms/CertificateView';
import { AILearningAssistant } from './pages/lms/AILearningAssistant';
import { TrainerDashboard } from './pages/lms/TrainerDashboard';

// ERP Pages
import { ERPDashboard } from './pages/erp/ERPDashboard';
import { MemberDirectory } from './pages/erp/MemberDirectory';
import { OrgHierarchy } from './pages/erp/OrgHierarchy';
import { TaskManagement } from './pages/erp/TaskManagement';
import { AttendanceTracker } from './pages/erp/AttendanceTracker';
import { MeetingsPage } from './pages/erp/MeetingsPage';
import { FinancialLedgers } from './pages/erp/FinancialLedgers';
import { DocumentArchive } from './pages/erp/DocumentArchive';
import { HardwareDevices } from './pages/erp/HardwareDevices';
import { AssignTrainingDirective } from './pages/erp/AssignTrainingDirective';

// Employment Pages
import { EmploymentDashboard } from './pages/employment/EmploymentDashboard';
import { JobDiscovery } from './pages/employment/JobDiscovery';
import { JobDetailsPage } from './pages/employment/JobDetailsPage';
import { CandidateProfilePage } from './pages/employment/CandidateProfilePage';
import { MyApplicationsPage } from './pages/employment/MyApplicationsPage';
import { SkillGapAnalysisPage } from './pages/employment/SkillGapAnalysisPage';
import { EmployerPortal } from './pages/employment/EmployerPortal';
import { AICareerAdvisor } from './pages/employment/AICareerAdvisor';

export const App: React.FC = () => {
  const { user, token, activeWorkspace } = useAuth();

  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Purpose Selection Page */}
      <Route
        path="/workspace-select"
        element={
          <ProtectedRoute>
            <PurposeSelectionScreen />
          </ProtectedRoute>
        }
      />

      {/* Certificate Public Verification */}
      <Route path="/certificate/:certNumber" element={<CertificateView />} />

      {/* LMS Workspace Routes */}
      <Route
        path="/lms"
        element={
          <ProtectedRoute requiredWorkspace="LMS">
            <WorkspaceLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<LearnerDashboard />} />
        <Route path="courses" element={<CourseCatalog />} />
        <Route path="course/:idOrSlug" element={<CoursePlayer />} />
        <Route path="my-courses" element={<MyCoursesPage />} />
        <Route path="assessments" element={<AssessmentsPage />} />
        <Route path="assessment/:assessmentId" element={<AssessmentsPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="certificate/:certNumber" element={<CertificateView />} />
        <Route path="ai-assistant" element={<AILearningAssistant />} />
        <Route path="trainer" element={<TrainerDashboard />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Cooperative ERP Workspace Routes */}
      <Route
        path="/erp"
        element={
          <ProtectedRoute requiredWorkspace="ERP">
            <WorkspaceLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ERPDashboard />} />
        <Route path="members" element={<MemberDirectory />} />
        <Route path="departments" element={<OrgHierarchy />} />
        <Route path="tasks" element={<TaskManagement />} />
        <Route path="attendance" element={<AttendanceTracker />} />
        <Route path="meetings" element={<MeetingsPage />} />
        <Route path="financials" element={<FinancialLedgers />} />
        <Route path="documents" element={<DocumentArchive />} />
        <Route path="hardware" element={<HardwareDevices />} />
        <Route path="assign-training" element={<AssignTrainingDirective />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Employment Ecosystem Workspace Routes */}
      <Route
        path="/employment"
        element={
          <ProtectedRoute requiredWorkspace="EMPLOYMENT">
            <WorkspaceLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<EmploymentDashboard />} />
        <Route path="jobs" element={<JobDiscovery />} />
        <Route path="job/:jobId" element={<JobDetailsPage />} />
        <Route path="profile" element={<CandidateProfilePage />} />
        <Route path="my-applications" element={<MyApplicationsPage />} />
        <Route path="skill-gap" element={<SkillGapAnalysisPage />} />
        <Route path="employer" element={<EmployerPortal />} />
        <Route path="ai-advisor" element={<AICareerAdvisor />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Profile & Shared */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <WorkspaceLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProfilePage />} />
      </Route>

      {/* Root Redirection */}
      <Route
        path="/"
        element={
          token && user ? (
            user.hasSelectedPurpose ? (
              <Navigate
                to={
                  activeWorkspace === 'ERP'
                    ? '/erp/dashboard'
                    : activeWorkspace === 'EMPLOYMENT'
                    ? '/employment/dashboard'
                    : '/lms/dashboard'
                }
                replace
              />
            ) : (
              <Navigate to="/workspace-select" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
