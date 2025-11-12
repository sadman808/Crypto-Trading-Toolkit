import React, { useState, useEffect } from 'react';
import { EducationCourse } from '../types';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Omit<EducationCourse, 'id' | 'created_at' | 'user_id'> | EducationCourse) => void;
  courseToEdit: EducationCourse | null;
}

const CourseModal: React.FC<CourseModalProps> = ({ isOpen, onClose, onSave, courseToEdit }) => {
  const [course, setCourse] = useState({
    title: '',
    platform: '',
    link: '',
    category: '',
    progress: 0,
  });

  useEffect(() => {
    if (courseToEdit) {
      setCourse(courseToEdit);
    } else {
      setCourse({ title: '', platform: '', link: '', category: '', progress: 0 });
    }
  }, [courseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCourse(prev => ({ ...prev, [name]: name === 'progress' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course.title) {
        alert("Title is required.");
        return;
    }
    onSave(courseToEdit ? { ...courseToEdit, ...course } : course);
    onClose();
  };

  const inputStyles = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition";
  const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-6">{courseToEdit ? 'Edit Course' : 'Add New Course'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className={labelStyles}>Title</label>
            <input type="text" name="title" value={course.title} onChange={handleChange} className={inputStyles} required placeholder="e.g., Complete Price Action Mastery" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="platform" className={labelStyles}>Platform</label>
              <input type="text" name="platform" value={course.platform} onChange={handleChange} className={inputStyles} placeholder="e.g., YouTube" />
            </div>
            <div>
              <label htmlFor="category" className={labelStyles}>Category</label>
              <input type="text" name="category" value={course.category} onChange={handleChange} className={inputStyles} placeholder="e.g., Psychology" />
            </div>
          </div>
          <div>
            <label htmlFor="link" className={labelStyles}>Link (URL)</label>
            <input type="url" name="link" value={course.link} onChange={handleChange} className={inputStyles} placeholder="https://..." />
          </div>
          <div>
            <label htmlFor="progress" className={labelStyles}>Progress ({course.progress}%)</label>
            <input type="range" name="progress" min="0" max="100" step="1" value={course.progress} onChange={handleChange} className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="text-gray-600 dark:text-gray-400 font-semibold py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" className="bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">Save Course</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
