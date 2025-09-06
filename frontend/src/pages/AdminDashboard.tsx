import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin';
import type { User, AdminWorkout } from '../api/admin';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import {
  FaUsers,
  FaDumbbell,
  FaChartLine,
  FaCog,
  FaTrash,
  FaStar,
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaUserShield,
  FaServer
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [workoutSearch, setWorkoutSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [workoutPage, setWorkoutPage] = useState(1);
  const queryClient = useQueryClient();

  // Check admin access
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <Navigate to="/" replace />;
  }

  // Dashboard stats query
  const { data: dashboardData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.getDashboardStats,
    enabled: activeTab === 'overview'
  });

  // Users query
  const { data: usersData } = useQuery({
    queryKey: ['admin-users', userPage, userSearch],
    queryFn: () => adminApi.getUsers({ page: userPage, search: userSearch }),
    enabled: activeTab === 'users'
  });

  // Workouts query
  const { data: workoutsData } = useQuery({
    queryKey: ['admin-workouts', workoutPage, workoutSearch],
    queryFn: () => adminApi.getWorkouts({ page: workoutPage, search: workoutSearch }),
    enabled: activeTab === 'workouts'
  });

  // System health query
  const { data: healthData } = useQuery({
    queryKey: ['system-health'],
    queryFn: adminApi.getSystemHealth,
    enabled: activeTab === 'system',
    refetchInterval: 5000
  });

  // User mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted');
    }
  });

  // Workout mutations
  const toggleFeaturedMutation = useMutation({
    mutationFn: adminApi.toggleWorkoutFeatured,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workouts'] });
      toast.success('Featured status updated');
    }
  });

  const togglePublishedMutation = useMutation({
    mutationFn: adminApi.toggleWorkoutPublished,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workouts'] });
      toast.success('Published status updated');
    }
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: adminApi.deleteWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workouts'] });
      toast.success('Workout deleted');
    }
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'workouts', label: 'Workouts', icon: FaDumbbell },
    { id: 'system', label: 'System', icon: FaServer }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <FaUserShield className="mr-3 text-primary-500" />
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage users, workouts, and system settings
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm flex items-center
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }
                  `}
                >
                  <Icon className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {statsLoading ? (
              <div className="text-center py-8">Loading stats...</div>
            ) : dashboardData && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Total Users
                        </p>
                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                          {dashboardData.stats.totalUsers}
                        </p>
                        <p className="mt-2 text-sm text-green-600">
                          +{dashboardData.stats.userGrowthPercentage}% this week
                        </p>
                      </div>
                      <FaUsers className="text-4xl text-primary-500 opacity-30" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Active Users
                        </p>
                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                          {dashboardData.stats.activeUsers}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          Last 7 days
                        </p>
                      </div>
                      <FaChartLine className="text-4xl text-green-500 opacity-30" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Total Workouts
                        </p>
                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                          {dashboardData.stats.totalWorkouts}
                        </p>
                      </div>
                      <FaDumbbell className="text-4xl text-blue-500 opacity-30" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Total Exercises
                        </p>
                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                          {dashboardData.stats.totalExercises}
                        </p>
                      </div>
                      <FaCog className="text-4xl text-purple-500 opacity-30" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Total Programs
                        </p>
                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                          {dashboardData.stats.totalPrograms}
                        </p>
                      </div>
                      <FaStar className="text-4xl text-yellow-500 opacity-30" />
                    </div>
                  </div>
                </div>

                {/* Recent Sessions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Recent Workout Sessions
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Workout
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {dashboardData.recentSessions.map((session: any) => (
                          <tr key={session.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {session.user.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {session.workout.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(session.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Popular Workouts */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Most Popular Workouts
                    </h3>
                  </div>
                  <div className="p-6">
                    {dashboardData.popularWorkouts.map((workout: any) => (
                      <div key={workout.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {workout.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {workout._count.workoutSessions} sessions • {workout._count.favoritedBy} favorites
                          </p>
                        </div>
                        {workout.isFeatured && (
                          <FaStar className="text-yellow-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {usersData?.users.map((user: User) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.username}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {user.email}
                          {user.isEmailVerified && (
                            <span className="ml-2 text-green-600">✓</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => updateRoleMutation.mutate({
                              userId: user.id,
                              role: e.target.value
                            })}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                            disabled={user.role === 'SUPER_ADMIN'}
                          >
                            <option value="USER">User</option>
                            <option value="TRAINER">Trainer</option>
                            <option value="ADMIN">Admin</option>
                            {user.role === 'SUPER_ADMIN' && (
                              <option value="SUPER_ADMIN">Super Admin</option>
                            )}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user._count.workoutSessions} sessions
                          <br />
                          {user._count.createdWorkouts} workouts
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => {
                              if (confirm('Delete this user?')) {
                                deleteUserMutation.mutate(user.id);
                              }
                            }}
                            disabled={user.role === 'SUPER_ADMIN'}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usersData?.pagination && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                  <button
                    onClick={() => setUserPage(p => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="btn-outline disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {userPage} of {usersData.pagination.pages}
                  </span>
                  <button
                    onClick={() => setUserPage(p => p + 1)}
                    disabled={userPage >= usersData.pagination.pages}
                    className="btn-outline disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workouts Tab */}
        {activeTab === 'workouts' && (
          <div>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workouts..."
                  value={workoutSearch}
                  onChange={(e) => setWorkoutSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Workouts Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Workout
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Creator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {workoutsData?.workouts.map((workout: AdminWorkout) => (
                      <tr key={workout.id}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {workout.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {workout.description?.slice(0, 50)}...
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {workout.creator.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {workout._count.workoutSessions} sessions
                          <br />
                          {workout._count.favoritedBy} favorites
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {workout.isFeatured && (
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                Featured
                              </span>
                            )}
                            {workout.isPublished ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Published
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                Draft
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleFeaturedMutation.mutate(workout.id)}
                              className={`${workout.isFeatured ? 'text-yellow-600' : 'text-gray-400'} hover:text-yellow-500`}
                            >
                              <FaStar />
                            </button>
                            <button
                              onClick={() => togglePublishedMutation.mutate(workout.id)}
                              className={`${workout.isPublished ? 'text-green-600' : 'text-gray-400'} hover:text-green-500`}
                            >
                              {workout.isPublished ? <FaEye /> : <FaEyeSlash />}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this workout?')) {
                                  deleteWorkoutMutation.mutate(workout.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {workoutsData?.pagination && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                  <button
                    onClick={() => setWorkoutPage(p => Math.max(1, p - 1))}
                    disabled={workoutPage === 1}
                    className="btn-outline disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {workoutPage} of {workoutsData.pagination.pages}
                  </span>
                  <button
                    onClick={() => setWorkoutPage(p => p + 1)}
                    disabled={workoutPage >= workoutsData.pagination.pages}
                    className="btn-outline disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                System Health
              </h3>
              {healthData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      healthData.status === 'healthy'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {healthData.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Database</span>
                    <span className="text-gray-900 dark:text-white">{healthData.database}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Memory Usage</span>
                    <span className="text-gray-900 dark:text-white">{healthData.memory?.heapUsed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Uptime</span>
                    <span className="text-gray-900 dark:text-white">{healthData.uptime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Node Version</span>
                    <span className="text-gray-900 dark:text-white">{healthData.nodeVersion}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                  <p className="font-medium text-gray-900 dark:text-white">Clear Cache</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Remove temporary data</p>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                  <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Download database backup</p>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                  <p className="font-medium text-gray-900 dark:text-white">View Logs</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Check system logs</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}