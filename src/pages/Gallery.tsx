import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Drawing } from '../types';

export default function Gallery() {
  const { data: drawings, isLoading } = useQuery<Drawing[]>(['drawings'], async () => {
    const response = await api.get('/drawings');
    return response.data;
  });

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Your Artistic Journey
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Transform your creative vision into reality with personalized drawing lessons
              <br />that nurture your unique artistic style.
            </p>
            <Link
              to="/enroll"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-purple-600 hover:bg-purple-700 hover:scale-105 transform transition-all duration-200 ease-in-out hover:shadow-lg active:scale-95"
            >
              <span className="mr-2">Begin Your Journey</span>
              <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Artworks Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Artworks</h2>
          <p className="text-lg text-gray-600">
            Discover inspiring works from our talented community of artists
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {drawings?.map((drawing) => (
            <Link
              key={drawing._id}
              to={`/drawing/${drawing._id}`}
              className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="aspect-w-3 aspect-h-2 overflow-hidden">
                <img
                  src={drawing.imageUrl}
                  alt={drawing.title}
                  className="object-cover w-full h-full transform transition-transform duration-200 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
              </div>
              <div className="p-4 transform transition-all duration-200">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                  {drawing.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500 transition-colors duration-200 group-hover:text-gray-600">
                  {drawing.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 transform transition-all duration-200 ${
                          i < Math.round(drawing.averageRating)
                            ? 'text-yellow-400 group-hover:scale-110'
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
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 transition-colors duration-200 group-hover:text-gray-600">
                    ({drawing.ratings.length} ratings)
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}