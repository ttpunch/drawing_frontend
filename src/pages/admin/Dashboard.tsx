import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../../api/axios';
import UserList from '../../components/UserList';
import EnrollmentList from '../../components/EnrollmentList';
import DrawingManagement from '../../components/DrawingManagement';

interface AdminStats {
  totalUsers: number;
  pendingUsers: number;
  totalDrawings: number;
  totalComments: number;
}

export default function Dashboard() {
  // Fetch general stats (no auto-refresh)
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery<AdminStats>(
    ['adminStats'],
    async () => {
      try {
        const response = await api.get('/admin/stats');
        console.log('Admin stats response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Error fetching admin stats:', error);
        // Check for specific error types
        if (error.response?.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (error.response?.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw error;
      }
    },
    {
      refetchInterval: 30000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error: any) => {
        console.error('Query error:', error);
      }
    }
  );

  // Debug logs
  console.log('Stats loading:', statsLoading);
  console.log('Stats error:', statsError);
  console.log('Stats data:', stats);

  // Fetch page views with auto-refresh
  const { data: pageViewData } = useQuery<{ pageViews: number }>(
    ['pageViews'],
    async () => {
      try {
        const response = await api.get('/admin/stats/pageviews');
        return response.data;
      } catch (error) {
        console.error('Error fetching page views:', error);
        throw error;
      }
    },
    {
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
      retry: 3,
      retryDelay: 1000,
    }
  );

  // Early return for loading state
  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (statsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <h2 className="text-red-600 text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-700 mb-4">{statsError instanceof Error ? statsError.message : 'An error occurred'}</p>
          <button 
            onClick={() => refetchStats()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.totalUsers || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.pendingUsers || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Drawings</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.totalDrawings || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Comments</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.totalComments || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Page Views</dt>
                  <dd className="text-lg font-medium text-gray-900 transition-all duration-300 ease-in-out">
                    {pageViewData?.pageViews?.toLocaleString() || '0'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-purple-600 font-medium">
                {pageViewData?.pageViews && pageViewData.pageViews > 0 ? '↑' : '•'} Live
              </span>
              <span className="text-gray-500 ml-2">
                Updates every 5s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Statistics Overview</h2>
        <div className="mt-4 bg-white shadow rounded-lg p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Total Users', value: stats?.totalUsers || 0 },
              { name: 'Pending Users', value: stats?.pendingUsers || 0 },
              { name: 'Total Drawings', value: stats?.totalDrawings || 0 },
              { name: 'Total Comments', value: stats?.totalComments || 0 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#7C3AED" 
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              >
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drawing Management */}
      <DrawingManagement />

      {/* Enrollments */}
      <EnrollmentList />

      {/* User List */}
      <div className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-lg font-medium text-gray-900 mb-4">User Management</h2>
        <UserList />
      </div>
    </div>
  );
}