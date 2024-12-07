import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface Drawing {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function DrawingManagement() {
  const queryClient = useQueryClient();

  const { data: drawings, isLoading } = useQuery<Drawing[]>(
    ['drawings'],
    async () => {
      const response = await api.get('/drawings');
      return response.data;
    }
  );

  const deleteDrawingMutation = useMutation(
    async (id: string) => {
      await api.delete(`/admin/drawings/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['drawings']);
        toast.success('Drawing deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete drawing');
      }
    }
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this drawing?')) {
      deleteDrawingMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Drawing Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drawings?.map((drawing) => (
          <div
            key={drawing._id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <img
              src={drawing.imageUrl}
              alt={drawing.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900">{drawing.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{drawing.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                <p>By: {drawing.user.name}</p>
                <p>Email: {drawing.user.email}</p>
                <p>
                  Posted:{' '}
                  {new Date(drawing.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => handleDelete(drawing._id)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Delete Drawing
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
