import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface User {
  _id: string;
  username: string;
  role: string;
  status: 'pending' | 'active' | 'rejected';
  createdAt: string;
}

interface UserListResponse {
  users: User[];
  currentPage: number;
  totalPages: number;
  totalUsers: number;
}

export default function UserList() {
  const [page, setPage] = React.useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<UserListResponse>(
    ['users', page],
    async () => {
      const response = await api.get(`/admin/users?page=${page}&limit=10`);
      return response.data;
    }
  );

  const approveUserMutation = useMutation(
    async (userId: string) => {
      await api.patch(`/admin/users/${userId}/approve`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        queryClient.invalidateQueries(['adminStats']);
        toast.success('User approved successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error approving user');
      },
    }
  );

  const rejectUserMutation = useMutation(
    async (userId: string) => {
      await api.patch(`/admin/users/${userId}/reject`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        queryClient.invalidateQueries(['adminStats']);
        toast.success('User rejected successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error rejecting user');
      },
    }
  );

  const updateRoleMutation = useMutation(
    async ({ userId, role }: { userId: string; role: string }) => {
      await api.patch(`/admin/users/${userId}/role`, { role });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success('User role updated successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error updating user role');
      },
    }
  );

  const deleteUserMutation = useMutation(
    async (userId: string) => {
      await api.delete(`/admin/users/${userId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        queryClient.invalidateQueries(['adminStats']);
        toast.success('User deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error deleting user');
      },
    }
  );

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Username
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data?.users.map((user) => (
            <tr key={user._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.username}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <select
                    value={user.role}
                    onChange={(e) => updateRoleMutation.mutate({ userId: user._id, role: e.target.value })}
                    className="text-sm text-gray-900 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : user.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                {user.status === 'pending' && (
                  <>
                    <button
                      onClick={() => approveUserMutation.mutate(user._id)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectUserMutation.mutate(user._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="text-red-600 hover:text-red-900 ml-4"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data && data.totalPages > 1 && (
        <div className="px-6 py-4 flex justify-between items-center bg-white">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {data.currentPage} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
