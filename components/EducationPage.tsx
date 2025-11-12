import React, { useState, useMemo } from 'react';
import { EducationCourse, EducationNote, CourseVideo } from '../types';
import { JournalIcon, PlusIcon, PencilIcon, TrashIcon, LinkIcon, ArrowLeftIcon, ClipboardDocumentListIcon } from '../constants';
import CourseModal from './CourseModal';
import NoteModal from './NoteModal';
import VideoModal from './VideoModal';
import Tooltip from './Tooltip';
import ProgressBar from './ProgressBar';

interface EducationPageProps {
  courses: EducationCourse[];
  notes: EducationNote[];
  videos: CourseVideo[];
  onAddCourse: (course: Omit<EducationCourse, 'id' | 'created_at' | 'user_id'>) => Promise<EducationCourse | null>;
  onUpdateCourse: (course: EducationCourse) => void;
  onDeleteCourse: (id: string) => void;
  onAddNote: (note: Omit<EducationNote, 'id' | 'created_at' | 'user_id'>) => Promise<EducationNote | null>;
  onUpdateNote: (note: EducationNote) => void;
  onDeleteNote: (id: string) => void;
  onAddVideo: (video: Omit<CourseVideo, 'id' | 'created_at' | 'user_id'>) => Promise<CourseVideo | null>;
  onUpdateVideo: (video: CourseVideo) => void;
  onDeleteVideo: (id: string) => void;
}

const EducationPage: React.FC<EducationPageProps> = (props) => {
    const [view, setView] = useState<'dashboard' | 'courses' | 'notes' | 'detail'>('dashboard');
    const [selectedCourse, setSelectedCourse] = useState<EducationCourse | null>(null);

    const handleViewCourse = (course: EducationCourse) => {
        setSelectedCourse(course);
        setView('detail');
    };

    const handleBackToDashboard = () => setView('dashboard');
    const handleBackToCourses = () => {
        setView('courses');
        setSelectedCourse(null);
    };

    const renderContent = () => {
        switch (view) {
            case 'courses':
                return <CourseListView {...props} onViewCourse={handleViewCourse} onBack={handleBackToDashboard} />;
            case 'notes':
                return <NoteListView {...props} onBack={handleBackToDashboard} />;
            case 'detail':
                return selectedCourse ? <CourseDetailView {...props} course={selectedCourse} onBack={handleBackToCourses} /> : <p>Course not found.</p>;
            case 'dashboard':
            default:
                return <DashboardView setView={setView} />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <JournalIcon className="h-8 w-8 text-brand-blue" />
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Education Hub</h1>
                    <p className="text-md text-gray-500 dark:text-gray-400 mt-1">Organize your learning journey.</p>
                </div>
            </div>
            {renderContent()}
        </div>
    );
};

// --- Sub-Views ---

const DashboardView: React.FC<{ setView: (view: 'courses' | 'notes') => void }> = ({ setView }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <button onClick={() => setView('courses')} className="group bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-left hover:border-brand-blue hover:scale-[1.03] transform transition-all duration-300">
            <JournalIcon className="h-10 w-10 text-brand-blue mb-4" />
            <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-2">Manage Courses</h2>
            <p className="text-gray-500 dark:text-gray-400">Track your courses, add videos, and monitor your progress.</p>
        </button>
        <button onClick={() => setView('notes')} className="group bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-left hover:border-brand-blue hover:scale-[1.03] transform transition-all duration-300">
            <ClipboardDocumentListIcon className="h-10 w-10 text-brand-blue mb-4" />
            <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-2">Browse Notes</h2>
            <p className="text-gray-500 dark:text-gray-400">Review all your personal and course-related notes in one place.</p>
        </button>
    </div>
);

const CourseListView: React.FC<Omit<EducationPageProps, 'videos' | 'onAddVideo' | 'onUpdateVideo' | 'onDeleteVideo'> & { onViewCourse: (c: EducationCourse) => void, onBack: () => void }> = 
({ courses, onAddCourse, onUpdateCourse, onDeleteCourse, onViewCourse, onBack }) => {
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState<EducationCourse | null>(null);
    const courseCategories = useMemo(() => ['All', ...new Set(courses.map(c => c.category).filter(Boolean))], [courses]);
    const [courseFilter, setCourseFilter] = useState('All');
    const filteredCourses = useMemo(() => {
        if (courseFilter === 'All') return courses;
        return courses.filter(c => c.category === courseFilter);
    }, [courses, courseFilter]);

    const handleEditCourse = (course: EducationCourse) => {
        setCourseToEdit(course);
        setIsCourseModalOpen(true);
    };

    return (
        <div>
            <CourseModal isOpen={isCourseModalOpen} onClose={() => { setIsCourseModalOpen(false); setCourseToEdit(null); }} onSave={courseToEdit ? onUpdateCourse : onAddCourse} courseToEdit={courseToEdit} />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><ArrowLeftIcon className="h-4 w-4" /> Back to Hub</button>
                <div className="flex items-center gap-2">
                    <select onChange={(e) => setCourseFilter(e.target.value)} value={courseFilter} className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 text-sm">
                        {courseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <button onClick={() => { setCourseToEdit(null); setIsCourseModalOpen(true); }} className="flex items-center gap-2 bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm">
                        <PlusIcon className="h-4 w-4" /> Add Course
                    </button>
                </div>
            </div>
            {filteredCourses.length === 0 ? (
                <EmptyState message="No courses found. Click 'Add Course' to start your library." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => (
                        <CourseCard key={course.id} course={course} onEdit={handleEditCourse} onDelete={onDeleteCourse} onView={onViewCourse} />
                    ))}
                </div>
            )}
        </div>
    );
};

const NoteListView: React.FC<Omit<EducationPageProps, 'onAddCourse' | 'onUpdateCourse' | 'onDeleteCourse' | 'onAddVideo' | 'onUpdateVideo' | 'onDeleteVideo'> & { onBack: () => void }> = 
(props) => {
    const { courses, notes, videos, onAddNote, onUpdateNote, onDeleteNote, onBack } = props;
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState<EducationNote | null>(null);
    const [noteSearch, setNoteSearch] = useState('');
    const [noteCourseFilter, setNoteCourseFilter] = useState('All');
    const noCoursesExist = courses.length === 0;

    const filteredNotes = useMemo(() => {
        return notes
            .filter(note => noteCourseFilter === 'All' || note.course_id === noteCourseFilter)
            .filter(note => {
                const course = courses.find(c => c.id === note.course_id);
                const searchTerm = noteSearch.toLowerCase();
                return (
                    note.note_text.toLowerCase().includes(searchTerm) ||
                    (note.video_title && note.video_title.toLowerCase().includes(searchTerm)) ||
                    (course?.title.toLowerCase().includes(searchTerm) ?? false)
                );
            });
    }, [notes, noteSearch, noteCourseFilter, courses]);

    const handleEditNote = (note: EducationNote) => {
        setNoteToEdit(note);
        setIsNoteModalOpen(true);
    };

    const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c])), [courses]);
    const videoMap = useMemo(() => new Map(videos.map(v => [v.id, v])), [videos]);

    return (
        <div>
            <NoteModal isOpen={isNoteModalOpen} onClose={() => { setIsNoteModalOpen(false); setNoteToEdit(null); }} onSave={noteToEdit ? onUpdateNote : onAddNote} noteToEdit={noteToEdit} courses={courses} videos={videos} />
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><ArrowLeftIcon className="h-4 w-4" /> Back to Hub</button>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-2">
                    <input type="search" placeholder="Search notes..." value={noteSearch} onChange={e => setNoteSearch(e.target.value)} className="w-full sm:w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-1.5 px-3 text-sm focus:ring-brand-blue focus:border-brand-blue" />
                    <select onChange={e => setNoteCourseFilter(e.target.value)} value={noteCourseFilter} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-1.5 px-3 text-sm disabled:bg-gray-200 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed focus:ring-brand-blue focus:border-brand-blue" disabled={noCoursesExist}>
                        <option value="All">All Courses</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
                <button onClick={() => { setNoteToEdit(null); setIsNoteModalOpen(true); }} className="flex items-center gap-2 bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm">
                    <PlusIcon className="h-4 w-4" /> Add Note
                </button>
            </div>
             {filteredNotes.length === 0 ? (
                <EmptyState message={notes.length === 0 ? "You haven't added any notes yet." : "No notes match your current search or filter."} />
            ) : (
                <div className="space-y-4">
                    {filteredNotes.map(note => (
                        <NoteCard key={note.id} note={note} course={note.course_id ? courseMap.get(note.course_id) : undefined} video={note.video_id ? videoMap.get(note.video_id) : undefined} onEdit={handleEditNote} onDelete={onDeleteNote} />
                    ))}
                </div>
            )}
        </div>
    );
};

const CourseDetailView: React.FC<EducationPageProps & { course: EducationCourse, onBack: () => void }> = (props) => {
    const { course, videos, notes, onAddVideo, onUpdateVideo, onDeleteVideo, onAddNote, onUpdateNote, onDeleteNote, onBack } = props;
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState<EducationNote | null>(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [videoToEdit, setVideoToEdit] = useState<CourseVideo | null>(null);

    const courseVideos = useMemo(() => videos.filter(v => v.course_id === course.id), [videos, course.id]);
    const courseVideoIds = useMemo(() => new Set(courseVideos.map(v => v.id)), [courseVideos]);
    const courseNotes = useMemo(() => notes.filter(n => n.course_id === course.id || (n.video_id && courseVideoIds.has(n.video_id))), [notes, course.id, courseVideoIds]);

    const videoMap = useMemo(() => new Map(videos.map(v => [v.id, v])), [videos]);

    return (
        <div>
            <NoteModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} onSave={noteToEdit ? onUpdateNote : onAddNote} noteToEdit={noteToEdit} courses={[course]} videos={courseVideos} preselectedCourseId={course.id} />
            <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} onSave={videoToEdit ? onUpdateVideo : onAddVideo} videoToEdit={videoToEdit} courseId={course.id} />

            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"><ArrowLeftIcon className="h-4 w-4" /> Back to Courses</button>
            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h2>
                <p className="text-gray-500 dark:text-gray-400">{course.platform} - {course.category}</p>
                <div className="mt-4"><ProgressBar progress={course.progress} /></div>
            </div>
            
            {/* Videos Section */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white">Videos</h3>
                    <button onClick={() => {setVideoToEdit(null); setIsVideoModalOpen(true)}} className="flex items-center gap-2 bg-blue-500/10 text-brand-blue font-bold py-2 px-4 rounded-md hover:bg-blue-500/20 transition-colors text-sm"><PlusIcon className="h-4 w-4" /> Add Video</button>
                </div>
                {courseVideos.length > 0 ? (
                    <div className="space-y-3">
                        {courseVideos.map(video => <VideoCard key={video.id} video={video} onEdit={v => {setVideoToEdit(v); setIsVideoModalOpen(true)}} onDelete={onDeleteVideo} />)}
                    </div>
                ) : <p className="text-sm text-gray-500 italic">No videos added for this course yet.</p>}
            </div>

            {/* Notes Section */}
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white">Notes</h3>
                    <button onClick={() => {setNoteToEdit(null); setIsNoteModalOpen(true)}} className="flex items-center gap-2 bg-blue-500/10 text-brand-blue font-bold py-2 px-4 rounded-md hover:bg-blue-500/20 transition-colors text-sm"><PlusIcon className="h-4 w-4" /> Add Course Note</button>
                </div>
                 {courseNotes.length > 0 ? (
                    <div className="space-y-3">
                        {courseNotes.map(note => <NoteCard key={note.id} note={note} course={course} video={note.video_id ? videoMap.get(note.video_id) : undefined} onEdit={n => {setNoteToEdit(n); setIsNoteModalOpen(true)}} onDelete={onDeleteNote} />)}
                    </div>
                ) : <p className="text-sm text-gray-500 italic">No notes for this course yet.</p>}
            </div>
        </div>
    )
};


// --- Reusable Child Components ---

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-center text-gray-500 py-24 bg-gray-100 dark:bg-gray-900/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
        <p className="text-lg">{message}</p>
    </div>
);

const CourseCard: React.FC<{ course: EducationCourse, onEdit: (c: EducationCourse) => void, onDelete: (id: string) => void, onView: (c: EducationCourse) => void }> = ({ course, onEdit, onDelete, onView }) => (
    <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col justify-between">
        <div>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs text-brand-blue font-semibold uppercase">{course.category || 'Uncategorized'}</p>
                    <button onClick={() => onView(course)} className="text-left"><h3 className="font-bold text-lg text-gray-900 dark:text-white hover:underline">{course.title}</h3></button>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{course.platform}</p>
                </div>
                <div className="flex gap-1">
                     <button onClick={() => onEdit(course)} className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"><PencilIcon className="h-4 w-4" /></button>
                     <button onClick={() => onDelete(course.id)} className="p-1.5 text-gray-500 hover:bg-red-500/10 hover:text-red-500 rounded-md"><TrashIcon className="h-4 w-4" /></button>
                </div>
            </div>
        </div>
        <div className="mt-4 space-y-2">
            <ProgressBar progress={course.progress} />
             <button onClick={() => onView(course)} className="w-full text-center bg-blue-500/10 text-brand-blue font-semibold py-2 rounded-md hover:bg-blue-500/20 text-sm">View Details</button>
        </div>
    </div>
);

const VideoCard: React.FC<{ video: CourseVideo, onEdit: (v: CourseVideo) => void, onDelete: (id: string) => void }> = ({ video, onEdit, onDelete }) => (
    <div className="bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
            <div>
                 <a href={video.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-800 dark:text-white hover:underline flex items-center gap-1.5 group">
                    {video.title}
                    <LinkIcon className="h-3.5 w-3.5 text-gray-400 group-hover:text-brand-blue transition-colors" />
                </a>
                <p className="text-xs text-gray-500 dark:text-gray-400">{video.description}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0 ml-4">
                <button onClick={() => onEdit(video)} className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"><PencilIcon className="h-4 w-4" /></button>
                <button onClick={() => onDelete(video.id)} className="p-1.5 text-gray-500 hover:bg-red-500/10 hover:text-red-500 rounded-md"><TrashIcon className="h-4 w-4" /></button>
            </div>
        </div>
    </div>
);

const NoteCard: React.FC<{ note: EducationNote, course?: EducationCourse, video?: CourseVideo, onEdit: (n: EducationNote) => void, onDelete: (id: string) => void }> = ({ note, course, video, onEdit, onDelete }) => {
    const getNoteTitle = () => {
        if (note.type === 'personal') return 'Personal Note';
        if (video) return video.title;
        if (note.video_title) return note.video_title; // Backwards compatibility
        if (course) return `${course.title} (General)`;
        return 'Note';
    };
    
    const getLink = () => video?.link || note.video_link;

    return (
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{note.type === 'personal' ? 'Personal' : (course?.title || 'Course Note')}</p>
                    <div className="font-semibold text-gray-800 dark:text-white flex items-center gap-1.5 group">
                        {getNoteTitle()}
                        {getLink() && <a href={getLink()} target="_blank" rel="noopener noreferrer"><LinkIcon className="h-3.5 w-3.5 text-gray-400 group-hover:text-brand-blue transition-colors" /></a>}
                    </div>
                    {note.timestamp && <span className="text-xs font-mono bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded mt-1 inline-block">{note.timestamp}</span>}
                </div>
                 <div className="flex gap-1">
                     <button onClick={() => onEdit(note)} className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"><PencilIcon className="h-4 w-4" /></button>
                     <button onClick={() => onDelete(note.id)} className="p-1.5 text-gray-500 hover:bg-red-500/10 hover:text-red-500 rounded-md"><TrashIcon className="h-4 w-4" /></button>
                </div>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{note.note_text}</p>
        </div>
    );
};

export default EducationPage;
