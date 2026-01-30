import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoader } from './components/ui/PageLoader';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { AuthSkeleton } from './components/ui/AuthSkeleton';
import { DashboardSkeleton } from './components/ui/DashboardSkeleton';
import { BusinessSetupProvider } from './context/BusinessSetupContext';
import { SetupProvider } from './context/SetupContext';
import { SearchProvider } from './context/SearchProvider';
import { PageTracking } from './components/PageTracking';
import { WebVitalsTracking } from './components/WebVitalsTracking';

// Lazy Load Pages
import { lazyImport } from './utils/lazyImport';

// Lazy Load Pages
const Login = lazyImport(() => import('./pages/auth/Login'));
const Signup = lazyImport(() => import('./pages/auth/Signup'));
const ForgotPassword = lazyImport(() => import('./pages/auth/ForgotPassword'));
const GoogleCallback = lazyImport(() => import('./pages/auth/GoogleCallback'));

// Setup Pages
const Method = lazyImport(() => import('./pages/setup/Method'));
const Record = lazyImport(() => import('./pages/setup/Record'));
const Upload = lazyImport(() => import('./pages/setup/Upload'));
const Processing = lazyImport(() => import('./pages/setup/Processing'));
const Preview = lazyImport(() => import('./pages/setup/Preview'));

// Landing Page
const Landing = lazyImport(() => import('./pages/landing/index'));

const Privacy = lazyImport(() => import('./pages/landing/Privacy'));
const Terms = lazyImport(() => import('./pages/landing/Terms'));

// Dashboard Pages
const DashboardHome = lazyImport(() => import('./pages/dashboard/Home'));
const CallLogs = lazyImport(() => import('./pages/dashboard/CallLogs'));
const Appointments = lazyImport(() => import('./pages/dashboard/Appointments'));
const Reviews = lazyImport(() => import('./pages/dashboard/Reviews/index'));
const HelpCenter = lazyImport(() => import('./pages/dashboard/HelpCenter'));
const Settings = lazyImport(() => import('./pages/dashboard/settings'));
const Billing = lazyImport(() => import('./pages/dashboard/Billing'));
const Plans = lazyImport(() => import('./pages/dashboard/Billing/Plans'));
const VoiceSetup = lazyImport(() => import('./pages/voice-setup'));
const NumberDetails = lazyImport(() => import('./pages/voice-setup/NumberDetails'));
const SetupSubaccount = lazyImport(() => import('./pages/voice-setup/SetupSubaccount'));
const GetNewNumber = lazyImport(() => import('./pages/voice-setup/GetNewNumber'));
const UseExistingNumber = lazyImport(() => import('./pages/voice-setup/UseExistingNumber'));
const BusinessSetup = lazyImport(() => import('./pages/business-setup'));

function App() {
  return (
    <Router>
      <PageTracking />
      <WebVitalsTracking />
      <LazyMotion features={domAnimation}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Auth Routes with separate skeleton */}
            <Route element={
              <ErrorBoundary>
                <Suspense fallback={<AuthSkeleton />}>
                  <Outlet />
                </Suspense>
              </ErrorBoundary>
            }>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/callback" element={<GoogleCallback />} />
            </Route>

            {/* Protected Setup Routes */}
            <Route element={
              <ErrorBoundary>
                <ProtectedRoute />
              </ErrorBoundary>
            }>
              <Route element={
                <Suspense fallback={<DashboardSkeleton />}>
                  <Outlet />
                </Suspense>
              }>
                {/* Dashboard Routes */}
                <Route element={
                  <BusinessSetupProvider>
                    <SearchProvider>
                      <Outlet />
                    </SearchProvider>
                  </BusinessSetupProvider>
                }>
                  <Route path="/dashboard" element={<DashboardHome />} />
                  <Route path="/dashboard/calls" element={<CallLogs />} />
                  <Route path="/dashboard/calls/:callId" element={<CallLogs />} />
                  <Route path="/dashboard/appointments" element={<Appointments />} />
                  <Route path="/dashboard/reviews" element={<Reviews />} />
                  <Route path="/dashboard/settings" element={<Settings />} />
                  <Route path="/dashboard/billing" element={<Billing />} />
                  <Route path="/dashboard/billing/plans" element={<Plans />} />
                  <Route path="/dashboard/help" element={<HelpCenter />} />
                  <Route path="/dashboard/voice-setup" element={<VoiceSetup />} />
                  <Route path="/dashboard/voice-setup/numbers/:numberId" element={<NumberDetails />} />
                  <Route path="/dashboard/voice-setup/setup-subaccount" element={<SetupSubaccount />} />
                  <Route path="/dashboard/voice-setup/buy" element={<GetNewNumber />} />
                  <Route path="/dashboard/voice-setup/existing" element={<UseExistingNumber />} />
                  <Route path="/dashboard/business-details" element={<BusinessSetup />} />

                  {/* Voice Model Setup Routes (Moved inside Dashboard) */}
                  <Route path="/dashboard/voice-model/*" element={
                    <ErrorBoundary>
                      <SetupProvider>
                        <Routes>
                          <Route path="method" element={<Method />} />
                          <Route path="record" element={<Record />} />
                          <Route path="upload" element={<Upload />} />
                          <Route path="processing" element={<Processing />} />
                          <Route path="preview" element={<Preview />} />
                        </Routes>
                      </SetupProvider>
                    </ErrorBoundary>
                  } />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </LazyMotion>
    </Router>
  );
}

export default App;
