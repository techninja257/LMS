// src/pages/instructor/ManageLessons.jsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ManageLessons = () => {
  const { courseId } = useParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link 
          to="/instructor/dashboard"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mr-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-900">Manage Lessons</h1>
      </div>
      
      <Card>
        <div className="text-center py-8">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h2>
          <p className="text-gray-600">This page is under development.</p>
          <p className="text-gray-600">Course ID: {courseId}</p>
        </div>
      </Card>
    </div>
  );
};

export default ManageLessons;