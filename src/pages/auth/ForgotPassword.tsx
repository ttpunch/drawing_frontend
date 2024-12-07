import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';

type ForgotPasswordForm = {
  username: string;
  securityAnswer?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'username' | 'security' | 'reset'>('username');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const { register, handleSubmit, watch, reset } = useForm<ForgotPasswordForm>();
  const newPassword = watch('newPassword');

  const getQuestionMutation = useMutation(
    async (data: { username: string }) => {
      const response = await api.post('/auth/forgot-password/question', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        setSecurityQuestion(data.securityQuestion);
        setStep('security');
      },
      onError: () => {
        toast.error('User not found');
      },
    }
  );

  const resetPasswordMutation = useMutation(
    async (data: ForgotPasswordForm) => {
      const response = await api.post('/auth/forgot-password/reset', {
        username: data.username,
        securityAnswer: data.securityAnswer,
        newPassword: data.newPassword,
      });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Password reset successful');
        navigate('/login');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to reset password');
        if (error.response?.status === 401) {
          reset({ securityAnswer: '' });
        }
      },
    }
  );

  const onSubmit = (data: ForgotPasswordForm) => {
    if (step === 'username') {
      getQuestionMutation.mutate({ username: data.username });
    } else if (step === 'security') {
      if (data.newPassword !== data.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      resetPasswordMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'username'
              ? 'Enter your username to get started'
              : step === 'security'
              ? 'Answer your security question'
              : 'Create a new password'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            {step === 'username' && (
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  {...register('username', { required: true })}
                  type="text"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                />
              </div>
            )}

            {step === 'security' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Security Question:
                  </label>
                  <p className="mt-1 text-sm text-gray-600">{securityQuestion}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="securityAnswer" className="sr-only">
                      Answer
                    </label>
                    <input
                      {...register('securityAnswer', { required: true })}
                      type="text"
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Your answer"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="sr-only">
                      New Password
                    </label>
                    <input
                      {...register('newPassword', { required: true, minLength: 6 })}
                      type="password"
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="New password"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="sr-only">
                      Confirm Password
                    </label>
                    <input
                      {...register('confirmPassword', {
                        required: true,
                        validate: (value) =>
                          value === newPassword || 'Passwords do not match',
                      })}
                      type="password"
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {step === 'username' ? 'Continue' : 'Reset Password'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
