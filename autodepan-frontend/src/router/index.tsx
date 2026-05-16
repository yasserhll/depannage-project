import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Spinner } from '@/components/common/Spinner';
import { AuthGuard } from '@/guards/AuthGuard';
import { GuestGuard } from '@/guards/GuestGuard';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ClientLayout } from '@/layouts/ClientLayout';
import { DepanneurLayout } from '@/layouts/DepanneurLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Pages critiques — chargement direct
import { Login }              from '@/pages/auth/Login';
import { Register }           from '@/pages/auth/Register';
import { RegisterDepanneur }  from '@/pages/auth/RegisterDepanneur';
import { ClientDashboard }    from '@/pages/client/Dashboard';
import { NewMission }         from '@/pages/client/NewMission';
import { MissionTracking }    from '@/pages/client/MissionTracking';
import { MissionHistory }     from '@/pages/client/MissionHistory';
import { DepanneurDashboard } from '@/pages/depanneur/Dashboard';
import { AdminDashboard }     from '@/pages/admin/Dashboard';
import { KYCReview }          from '@/pages/admin/KYCReview';

// Pages lazy — chargées à la demande
const ForgotPassword     = lazy(() => import('@/pages/auth/ForgotPassword').then((m)   => ({ default: m.ForgotPassword })));
const ResetPassword      = lazy(() => import('@/pages/auth/ResetPassword').then((m)    => ({ default: m.ResetPassword })));

const MissionDetail      = lazy(() => import('@/pages/client/MissionDetail').then((m)  => ({ default: m.MissionDetail })));
const ClientChat         = lazy(() => import('@/pages/client/Chat').then((m)           => ({ default: m.ClientChat })));
const ClientProfile      = lazy(() => import('@/pages/client/Profile').then((m)        => ({ default: m.ClientProfile })));
const Notifications      = lazy(() => import('@/pages/client/Notifications').then((m)  => ({ default: m.Notifications })));

const DepanneurMissions  = lazy(() => import('@/pages/depanneur/Missions').then((m)    => ({ default: m.DepanneurMissions })));
const ActiveMission      = lazy(() => import('@/pages/depanneur/ActiveMission').then((m) => ({ default: m.ActiveMission })));
const DepanneurChat      = lazy(() => import('@/pages/depanneur/Chat').then((m)        => ({ default: m.DepanneurChat })));
const Wallet             = lazy(() => import('@/pages/depanneur/Wallet').then((m)      => ({ default: m.Wallet })));
const Documents          = lazy(() => import('@/pages/depanneur/Documents').then((m)   => ({ default: m.Documents })));
const DepanneurProfile   = lazy(() => import('@/pages/depanneur/Profile').then((m)     => ({ default: m.DepanneurProfile })));

const AdminUsers         = lazy(() => import('@/pages/admin/Users').then((m)           => ({ default: m.AdminUsers })));
const AdminMissions      = lazy(() => import('@/pages/admin/Missions').then((m)        => ({ default: m.AdminMissions })));
const AdminPayments      = lazy(() => import('@/pages/admin/Payments').then((m)        => ({ default: m.AdminPayments })));
const AdminDisputes      = lazy(() => import('@/pages/admin/Disputes').then((m)        => ({ default: m.AdminDisputes })));
const GPSMonitor         = lazy(() => import('@/pages/admin/GPSMonitor').then((m)      => ({ default: m.GPSMonitor })));
const AdminLogs          = lazy(() => import('@/pages/admin/Logs').then((m)            => ({ default: m.AdminLogs })));

function PageFallback() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/auth/connexion" replace />} />

        {/* =================== AUTH (invités uniquement) =================== */}
        <Route element={<GuestGuard />}>
          <Route element={<AuthLayout />}>
            <Route path="/auth/connexion"              element={<Login />} />
            <Route path="/auth/inscription"            element={<Register />} />
            <Route path="/auth/inscription/depanneur"  element={<RegisterDepanneur />} />
            <Route path="/auth/mot-de-passe-oublie"    element={<ForgotPassword />} />
            <Route path="/auth/reset-password"         element={<ResetPassword />} />
          </Route>
        </Route>

        {/* =================== CLIENT =================== */}
        <Route element={<AuthGuard requiredRole="client" />}>
          <Route path="/client" element={<ClientLayout />}>
            <Route index                       element={<ClientDashboard />} />
            <Route path="nouveau"              element={<NewMission />} />
            <Route path="missions"             element={<MissionHistory />} />
            <Route path="missions/:uuid"       element={<MissionDetail />} />
            <Route path="tracking/:uuid"       element={<MissionTracking />} />
            <Route path="chat/:uuid"           element={<ClientChat />} />
            <Route path="profil"               element={<ClientProfile />} />
            <Route path="notifications"        element={<Notifications />} />
          </Route>
        </Route>

        {/* =================== DÉPANNEUR =================== */}
        <Route element={<AuthGuard requiredRole="depanneur" />}>
          <Route path="/depanneur" element={<DepanneurLayout />}>
            <Route index                       element={<DepanneurDashboard />} />
            <Route path="missions"             element={<DepanneurMissions />} />
            <Route path="missions/:uuid"       element={<ActiveMission />} />
            <Route path="chat/:uuid"           element={<DepanneurChat />} />
            <Route path="wallet"               element={<Wallet />} />
            <Route path="documents"            element={<Documents />} />
            <Route path="profil"               element={<DepanneurProfile />} />
          </Route>
        </Route>

        {/* =================== ADMIN =================== */}
        <Route element={<AuthGuard requiredRole="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index                       element={<AdminDashboard />} />
            <Route path="utilisateurs"         element={<AdminUsers />} />
            <Route path="missions"             element={<AdminMissions />} />
            <Route path="paiements"            element={<AdminPayments />} />
            <Route path="litiges"              element={<AdminDisputes />} />
            <Route path="kyc"                  element={<KYCReview />} />
            <Route path="gps-live"             element={<GPSMonitor />} />
            <Route path="logs"                 element={<AdminLogs />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center gap-4 p-6">
      <Search className="w-16 h-16 text-brand-muted" />
      <h1 className="text-brand-text text-2xl font-bold">Page introuvable</h1>
      <p className="text-brand-muted text-center">La page que vous recherchez n'existe pas.</p>
      <a href="/" className="text-primary font-semibold hover:underline">← Retour à l'accueil</a>
    </div>
  );
}
