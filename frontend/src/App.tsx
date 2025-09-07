import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { LudicrousProvider } from './contexts/LudicrousContext';

// Pages
import HomePage from './pages/HomePage';
import WorkoutLibrary from './pages/WorkoutLibrary';
import WorkoutDetail from './pages/WorkoutDetail';
import WorkoutSession from './pages/WorkoutSession';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateWorkout from './pages/CreateWorkout';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import AuthCallback from './pages/AuthCallback';
import Schedule from './pages/Schedule';
import Programs from './pages/Programs';

// Components
import Layout from './components/common/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import ScrollToTop from './components/ScrollToTop';

// Styles
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LudicrousProvider>
        <Router>
          <ScrollToTop />
          <Layout>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/workouts" element={<WorkoutLibrary />} />
            <Route path="/workout/:id" element={<WorkoutDetail />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/create-workout" element={<CreateWorkout />} />
              <Route path="/workout/:id/session" element={<WorkoutSession />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </Layout>
      </Router>

      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: 'green',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: 'red',
            },
          },
        }}
      />
      
      <ReactQueryDevtools initialIsOpen={false} />
      </LudicrousProvider>
    </QueryClientProvider>
  );
}

export default App;