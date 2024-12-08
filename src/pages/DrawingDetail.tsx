import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Drawing, Comment } from '../types';
import { useAuthStore } from '../store/authStore';

interface CommentForm {
  content: string;
}

export default function DrawingDetail() {
  const { id: drawingId } = useParams<{ id: string }>();
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<CommentForm>();

  const { data: drawing, isLoading: isDrawingLoading } = useQuery<Drawing>(
    ['drawing', drawingId],
    async () => {
      const response = await api.get(`/drawings/${drawingId}`);
      return response.data;
    }
  );

  const { data: comments, isLoading: isCommentsLoading } = useQuery<Comment[]>(
    ['comments', drawingId],
    async () => {
      const response = await api.get(`/drawings/${drawingId}/comments`);
      return response.data;
    },
    { enabled: !!drawingId }
  );

  const rateMutation = useMutation(
    async (rating: number) => {
      await api.post(`/drawings/${drawingId}/rate`, { rating });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['drawing', drawingId]);
        toast.success('Rating submitted successfully');
      },
      onError: () => {
        toast.error('Failed to submit rating');
      },
    }
  );

  const commentMutation = useMutation(
    async (data: CommentForm) => {
      const response = await api.post(`/drawings/${drawingId}/comments`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', drawingId]);
        queryClient.invalidateQueries(['drawing', drawingId]);
        reset();
        toast.success('Comment added successfully');
      },
      onError: (error) => {
        toast.error('Failed to add comment');
      },
    }
  );

  if (isDrawingLoading || isCommentsLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <img
          src={drawing?.imageUrl}
          alt={drawing?.title}
          className="w-full h-96 object-cover"
        />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">{drawing?.title}</h1>
          <p className="mt-2 text-gray-600">{drawing?.description}</p>
          
          {token && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Rate this drawing</h3>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => rateMutation.mutate(rating)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg
                      className={`h-6 w-6 ${
                        (drawing?.averageRating || 0) >= rating
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 15.934l-6.18 3.254 1.18-6.875L.083 7.571l6.9-1.002L10 .333l3.017 6.236 6.9 1.002-4.917 4.742 1.18 6.875z"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-semibold">Comments</h2>
            {token && (
              <form
                onSubmit={handleSubmit((data) => commentMutation.mutate(data))}
                className="mt-4"
              >
                <textarea
                  {...register('content', { required: true })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Add a comment..."
                />
                <button
                  type="submit"
                  className="mt-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Post comment
                </button>
              </form>
            )}
            <div className="mt-6 space-y-6">
              {comments?.map((comment) => (
                <div key={comment._id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {comment.user?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {comment.user?.username || 'Unknown User'}
                    </div>
                    <div className="mt-1 text-sm text-gray-700">
                      {comment.content}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              {comments?.length === 0 && (
                <p className="text-gray-500 text-center">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}