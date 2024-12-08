import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import api from '../api/axios';

interface UploadForm {
  title: string;
  description: string;
  file?: File[];
}

export default function Upload() {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm<UploadForm>();
  const [preview, setPreview] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 0,
    y: 0,
    width: 100,
    height: 100
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setValue('file', acceptedFiles);
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.gif']
    },
    maxFiles: 1
  });

  const uploadMutation = useMutation(
    async (data: FormData) => {
      const response = await api.post('/drawings', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Drawing uploaded successfully');
        navigate(`/drawing/${data._id}`);
      },
      onError: () => {
        toast.error('Failed to upload drawing');
      }
    }
  );

  const onSubmit = async (data: UploadForm) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    
    if (!data.file || !data.file[0]) {
      toast.error('Please select an image to upload');
      return;
    }

    console.log('File:', data.file[0]);
    console.log('File name:', data.file[0].name);
    console.log('File type:', data.file[0].type);
    console.log('File size:', data.file[0].size);

    formData.append('image', data.file[0], data.file[0].name);

    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    uploadMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Upload Your Artwork</h2>
            <div>
              <div
                {...getRootProps()}
                className={`mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 ${
                  isDragActive ? 'border-indigo-500' : 'border-gray-300'
                }`}
              >
                <div className="space-y-1 text-center">
                  {!preview ? (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <input {...getInputProps()} />
                        <p className="pl-1">Drag and drop an image, or click to select a file</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                  ) : (
                    <div className="relative">
                      <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        aspect={16 / 9}
                      >
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-[400px] w-auto"
                        />
                      </ReactCrop>
                      <button
                        type="button"
                        onClick={() => setPreview(null)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    {...register('title', { required: true })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    placeholder="Enter artwork title"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    {...register('description', { required: true })}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    placeholder="Describe your artwork"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploadMutation.isLoading || !preview}
              className={`w-full rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                uploadMutation.isLoading || !preview
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
              onClick={handleSubmit(onSubmit)}
            >
              {uploadMutation.isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                'Upload Drawing'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}