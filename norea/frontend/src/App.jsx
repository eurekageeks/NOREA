import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PageLoader } from './components/ui/StateViews';
import PublicLayout from './layouts/PublicLayout';
import PortalLayout from './layouts/PortalLayout';
import AdminLayout from './layouts/AdminLayout';
import { GuestOnly, RequireAdmin, RequireStudent } from './routes/Guards';

// Public pages (eagerly loaded for crisp navigation)
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ProgramsPage from './pages/public/ProgramsPage';
import ProgramDetailPage from './pages/public/ProgramDetailPage';
import WhyNoreaPage from './pages/public/WhyNoreaPage';
import AdmissionsPage from './pages/public/AdmissionsPage';
import ContactPage from './pages/public/ContactPage';
import NotFoundPage from './pages/public/NotFoundPage';
import LoginPage from './pages/auth/LoginPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';

// Lazy-loaded portal & admin bundles (keeps public landing fast)
const StudentDashboardPage = lazy(() => import('./pages/portal/StudentDashboardPage'));
const StudentProfilePage = lazy(() => import('./pages/portal/StudentProfilePage'));
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage'));
const AdminEnquiriesPage = lazy(() => import('./pages/admin/AdminEnquiriesPage'));
const AdminProgramsPage = lazy(() => import('./pages/admin/AdminProgramsPage'));
const AdminStudentsPage = lazy(() => import('./pages/admin/AdminStudentsPage'));
const AdminAdmissionsPage = lazy(() => import('./pages/admin/AdminAdmissionsPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#17243A',
            color: '#FAF8F3',
            borderRadius: '14px',
            fontSize: '0.875rem',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#C5A46D', secondary: '#17243A' } },
          error: { style: { background: '#7F1D1D', color: '#FFFFFF' } },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public website */}
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="programs" element={<ProgramsPage />} />
            <Route path="programs/:slug" element={<ProgramDetailPage />} />
            <Route path="why-norea" element={<WhyNoreaPage />} />
            <Route path="admissions" element={<AdmissionsPage />} />
            <Route path="contact" element={<ContactPage />} />

            <Route element={<GuestOnly portal="student" />}>
              <Route path="login" element={<LoginPage defaultMode="login" />} />
              <Route path="register" element={<LoginPage defaultMode="register" />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Student portal */}
          <Route element={<RequireStudent />}>
            <Route path="portal" element={<PortalLayout />}>
              <Route index element={<StudentDashboardPage />} />
              <Route path="profile" element={<StudentProfilePage />} />
            </Route>
          </Route>

          {/* Admin auth */}
          <Route element={<GuestOnly portal="admin" />}>
            <Route path="admin/login" element={<AdminLoginPage />} />
          </Route>

          {/* Admin dashboard */}
          <Route element={<RequireAdmin />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="enquiries" element={<AdminEnquiriesPage />} />
              <Route path="admissions" element={<AdminAdmissionsPage />} />
              <Route path="students" element={<AdminStudentsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route element={<RequireAdmin permission="programs:manage" />}>
                <Route path="programs" element={<AdminProgramsPage />} />
              </Route>
              <Route element={<RequireAdmin permission="settings:manage" />}>
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
              <Route element={<RequireAdmin permission="users:manage" />}>
                <Route path="users" element={<AdminUsersPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
