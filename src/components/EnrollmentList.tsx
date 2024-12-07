import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface Enrollment {
  _id: string;
  name: string;
  email: string;
  phone: string;
  experienceLevel: string;
  interests: string[];
  message?: string;
  status: 'pending' | 'active' | 'rejected';
  createdAt: string;
}

export default function EnrollmentList() {
  const queryClient = useQueryClient();

  const { data: enrollments, isLoading } = useQuery<Enrollment[]>(
    ['enrollments'],
    async () => {
      const response = await api.get('/admin/enrollments');
      return response.data.data;
    }
  );

  const updateStatusMutation = useMutation(
    async ({ id, status }: { id: string; status: 'active' | 'rejected' }) => {
      await api.patch(`/admin/enrollments/${id}/status`, { status });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['enrollments']);
        toast.success('Enrollment status updated successfully');
      },
      onError: () => {
        toast.error('Failed to update enrollment status');
      }
    }
  );

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Student Enrollments</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Experience Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interests
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
            {enrollments?.map((enrollment) => (
              <tr key={enrollment._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {enrollment.name}
                    </div>
                    <div className="text-sm text-gray-500">{enrollment.email}</div>
                    <div className="text-sm text-gray-500">{enrollment.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {enrollment.experienceLevel}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {enrollment.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      enrollment.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : enrollment.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {enrollment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {enrollment.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: enrollment._id,
                            status: 'active'
                          })
                        }
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: enrollment._id,
                            status: 'rejected'
                          })
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
