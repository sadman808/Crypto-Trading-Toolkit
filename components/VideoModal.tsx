import React, { useState, useEffect } from 'react';
import { CourseVideo } from '../types';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (video: Omit<CourseVideo, 'id' | 'created_at' | 'user_id'> | CourseVideo) => void;
  videoToEdit: CourseVideo | null;
  courseId: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, onSave, videoToEdit, courseId }) => {
  const [video, setVideo] = useState({
    title: '',
    link: '',
    description: '',
    timestamp: '',
    course_id: courseId,
  });

  useEffect(() => {
    if (videoToEdit) {
      setVideo(videoToEdit);
    } else {
      setVideo({ title: '', link: '', description: '', timestamp: '', course_id: courseId });
    }
  }, [videoToEdit, isOpen, courseId]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVideo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!video.title) {
        alert("Title is required.");
        return;
    }
    onSave(videoToEdit ? { ...videoToEdit, ...video } : video);
    onClose();
  };

  const inputStyles = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition";
  const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-6">{videoToEdit ? 'Edit Video' : 'Add New Video'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className={labelStyles}>Video Title</label>
              <input type="text" name="title" value={video.title} onChange={handleChange} className={inputStyles} required placeholder="e.g., Key Concepts" />
            </div>
             <div>
              <label htmlFor="timestamp" className={labelStyles}>Timestamp (Optional)</label>
              <input type="text" name="timestamp" value={video.timestamp} onChange={handleChange} className={inputStyles} placeholder="e.g., 05:30" />
            </div>
          </div>
          <div>
            <label htmlFor="link" className={labelStyles}>Video Link (URL)</label>
            <input type="url" name="link" value={video.link} onChange={handleChange} className={inputStyles} placeholder="https://..." />
          </div>
          <div>
            <label htmlFor="description" className={labelStyles}>Description (Optional)</label>
            <textarea name="description" value={video.description} onChange={handleChange} rows={3} className={inputStyles} placeholder="Brief summary of the video content..." />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="text-gray-600 dark:text-gray-400 font-semibold py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" className="bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">Save Video</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoModal;
