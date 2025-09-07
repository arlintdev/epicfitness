import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { FaDumbbell, FaUser, FaSignOutAlt, FaBars, FaTimes, FaSun, FaMoon } from 'react-icons/fa';
import useDarkMode from '../../hooks/useDarkMode';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useDarkMode();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <FaDumbbell className="h-8 w-8 text-primary-500" />
                <span className="font-display font-bold text-xl gradient-text">
                  Epic Fitness
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {isAuthenticated && (
                  <Link
                    to="/dashboard"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/workouts"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2 text-sm font-medium"
                >
                  Workouts
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      to="/schedule"
                      className="text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2 text-sm font-medium"
                    >
                      Schedule
                    </Link>
                    <Link
                      to="/progress"
                      className="text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2 text-sm font-medium"
                    >
                      Progress
                    </Link>
                    <Link
                      to="/create-workout"
                      className="text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2 text-sm font-medium"
                    >
                      Create
                    </Link>
                  </>
                )}
                {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
                  <Link
                    to="/admin"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2 text-sm font-medium"
                  >
                    Admin
                  </Link>
                ) : null}
              </div>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <FaSun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <FaMoon className="h-5 w-5 text-gray-600" />
                )}
              </button>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-500"
                  >
                    <FaUser />
                    <span>{user?.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-red-500"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="btn-outline">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-500"
              >
                {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              {/* Dark Mode Toggle for Mobile */}
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-3 w-full text-left text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2"
              >
                {theme === 'dark' ? (
                  <>
                    <FaSun className="h-5 w-5 text-yellow-500" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <FaMoon className="h-5 w-5 text-gray-600" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
              
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="block text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/workouts"
                className="block text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Workouts
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/schedule"
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Schedule
                  </Link>
                  <Link
                    to="/progress"
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Progress
                  </Link>
                  <Link
                    to="/create-workout"
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Workout
                  </Link>
                  <Link
                    to="/profile"
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                    <Link
                      to="/admin"
                      className="block text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-red-500 px-3 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary-500 px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FaDumbbell className="h-6 w-6 text-primary-500" />
                <span className="font-display font-bold text-lg">Epic Fitness</span>
              </div>
              <p className="text-gray-400">
                Transform your body and mind with our comprehensive workout platform.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/workouts" className="hover:text-primary-500">Browse Workouts</Link></li>
                <li><Link to="/exercises" className="hover:text-primary-500">Exercise Library</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary-500">Blog</a></li>
                <li><a href="#" className="hover:text-primary-500">Success Stories</a></li>
                <li><a href="#" className="hover:text-primary-500">Forums</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary-500">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-500">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary-500">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; 2024 Epic Fitness Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}