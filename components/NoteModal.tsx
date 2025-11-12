import React, { useState, useEffect, useMemo } from 'react';
import { EducationNote, EducationCourse, CourseVideo } from '../types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<EducationNote, 'id' | 'created_at' | 'user_id'> | EducationNote) => void;
  noteToEdit: EducationNote | null;
  courses: EducationCourse[];
  videos: CourseVideo[];
  // Optionally pre-select a course/video
  preselectedCourseId?: string | null;
  preselectedVideoId?: string | null;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, onSave, noteToEdit, courses, videos, preselectedCourseId, preselectedVideoId }) => {
  const [noteType, setNoteType] = useState<'course' | 'personal'>(noteToEdit?.type || 'course');
  
  const [note, setNote] = useState({
    course_id: preselectedCourseId || noteToEdit?.course_id || courses[0]?.id || null,
    video_id: preselectedVideoId || noteToEdit?.video_id || null,
    video_title: noteToEdit?.video_title || '',
    video_link: noteToEdit?.video_link || '',
    timestamp: noteToEdit?.timestamp || '',
    note_text: noteToEdit?.note_text || '',
  });

  useEffect(() => {
    if (isOpen) {
        const type = preselectedCourseId ? 'course' : (noteToEdit?.type || 'course');
        setNoteType(type);
        
        if (noteToEdit) {
            setNote({
                course_id: noteToEdit.course_id,
                video_id: noteToEdit.video_id,
                video_title: noteToEdit.video_title,
                video_link: noteToEdit.video_link,
                timestamp: noteToEdit.timestamp,
                note_text: noteToEdit.note_text,
            });
        } else {
             setNote({
                course_id: preselectedCourseId || courses[0]?.id || null,
                video_id: preselectedVideoId || null,
                video_title: '',
                video_link: '',
                timestamp: '',
                note_text: '',
            });
        }
    }
  }, [noteToEdit, isOpen, courses, preselectedCourseId, preselectedVideoId]);

  const availableVideos = useMemo(() => {
      return videos.filter(v => v.course_id === note.course_id);
  }, [videos, note.course_id]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNote(prev => {
        const newState = { ...prev, [name]: value };
        // If course changes, reset video selection
        if (name === 'course_id') {
            newState.video_id = null;
        }
        return newState;
    });
  };
  
  const handleTypeChange = (type: 'course' | 'personal') => {
      setNoteType(type);
      if (type === 'personal') {
          setNote(prev => ({...prev, course_id: null, video_id: null}));
      } else {
          setNote(prev => ({...prev, course_id: courses[0]?.id || null}));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteType === 'course' && !note.course_id) {
        alert("Please select a course.");
        return;
    }
    if (!note.note_text.trim()) {
        alert("Note text cannot be empty.");
        return;
    }
    const notePayload = {
      ...note,
      type: noteType,
      course_id: noteType === 'personal' ? null : note.course_id,
      video_id: noteType === 'personal' ? null : note.video_id,
    };
    onSave(noteToEdit ? { ...noteToEdit, ...notePayload } : notePayload);
    onClose();
  };

  const inputStyles = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition";
  const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 max-w-2xl w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-6">{noteToEdit ? 'Edit Note' : 'Add New Note'}</h2>
        
        {/* Note Type Toggle */}
        <div className="flex space-x-2 rounded-lg bg-gray-200 dark:bg-gray-800 p-1 mb-4">
            <button type="button" onClick={() => handleTypeChange('course')} className={`w-full rounded-md py-2 text-sm font-semibold ${noteType === 'course' ? 'bg-white dark:bg-gray-900 text-brand-blue shadow' : 'text-gray-600 dark:text-gray-400'}`}>Course Note</button>
            <button type="button" onClick={() => handleTypeChange('personal')} className={`w-full rounded-md py-2 text-sm font-semibold ${noteType === 'personal' ? 'bg-white dark:bg-gray-900 text-brand-blue shadow' : 'text-gray-600 dark:text-gray-400'}`}>Personal Note</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {noteType === 'course' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="course_id" className={labelStyles}>Course</label>
                <select name="course_id" value={note.course_id || ''} onChange={handleChange} className={`${inputStyles} appearance-none`} required>
                  {courses.length === 0 ? (
                    <option disabled>Please add a course first</option>
                  ) : (
                    courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="video_id" className={labelStyles}>Video (Optional)</label>
                <select name="video_id" value={note.video_id || ''} onChange={handleChange} className={`${inputStyles} appearance-none`} disabled={availableVideos.length === 0}>
                  <option value="">General Course Note</option>
                   {availableVideos.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Legacy Fields for old notes or non-video notes */}
          {!note.video_id && noteType === 'course' && (
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="video_title" className={labelStyles}>Topic / Video Title</label>
                    <input type="text" name="video_title" value={note.video_title} onChange={handleChange} className={inputStyles} placeholder="e.g., Understanding Market Structure" />
                 </div>
                 <div>
                    <label htmlFor="timestamp" className={labelStyles}>Timestamp (Optional)</label>
                    <input type="text" name="timestamp" value={note.timestamp} onChange={handleChange} className={inputStyles} placeholder="e.g., 12:45" />
                </div>
              </div>
          )}
          
          <div>
            <label htmlFor="note_text" className={labelStyles}>{noteType === 'personal' ? 'Note' : 'Key Takeaways'}</label>
            <textarea name="note_text" value={note.note_text} onChange={handleChange} rows={5} className={inputStyles} placeholder="Jot down your thoughts, insights, questions..." required />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="text-gray-600 dark:text-gray-400 font-semibold py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" className="bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">Save Note</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
