import { useParams, useNavigate } from 'react-router-dom';
import { useCourseDetail, useProgress } from '../hooks/useApi';
import { ProgressBar, Spinner } from '../components/common/UI';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

export default function LearnPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { course, loading: courseLoading } = useCourseDetail(courseId);
  const { progress, markComplete } = useProgress(courseId);
  const [activeModule, setActiveModule] = useState(0);
  const [activeLecture, setActiveLecture] = useState(0);
  const [marking, setMarking] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  if (courseLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!course) return <p className="text-center text-gray-500 py-20">Course not found</p>;

  const currentModule = course.modules?.[activeModule];
  const currentLecture = currentModule?.lectures?.[activeLecture];
  const completedSet = new Set(progress?.completedLectures || []);
  const totalLectures = course.modules?.reduce((a, m) => a + m.lectures.length, 0) || 0;

  const handleMarkComplete = async () => {
    if (!currentLecture) return;
    setMarking(true);
    try {
      const updated = await markComplete(currentLecture._id);
      toast.success('Lecture marked complete! ✅');
      if (updated.completionPercentage === 100)
        toast.success('🎉 Course completed! Certificate generated!', { duration: 5000 });
      // Auto move to next lecture
      const nextLec = activeLecture + 1;
      if (nextLec < currentModule.lectures.length) {
        setActiveLecture(nextLec);
      } else if (activeModule + 1 < course.modules.length) {
        setActiveModule(activeModule + 1);
        setActiveLecture(0);
      }
    } catch { toast.error('Failed to mark complete'); }
    finally { setMarking(false); }
  };

  const selectLecture = (mi, li) => {
    setActiveModule(mi);
    setActiveLecture(li);
    setVideoError(false);
    if (videoRef.current) { videoRef.current.load(); }
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-80px)]">
      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        <button onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-800 mb-3 flex items-center gap-1 shrink-0">
          ← Back to course
        </button>

        {/* Video Player */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden mb-4 shrink-0" style={{ aspectRatio: '16/9' }}>
          {currentLecture ? (() => {
            const url = currentLecture.videoUrl;
            // Check if YouTube URL
            const ytMatch = url && url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            const ytId = ytMatch ? ytMatch[1] : null;

            if (ytId) {
              return (
                <iframe
                  key={currentLecture._id}
                  src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={currentLecture.title}
                />
              );
            } else if (url && !videoError) {
              return (
                <video ref={videoRef} controls className="w-full h-full object-contain"
                  onError={() => setVideoError(true)}
                  key={currentLecture._id}>
                  <source src={url} type="video/mp4" />
                  <source src={url} type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              );
            } else {
              return (
                <div className="w-full h-full flex flex-col items-center justify-center text-white gap-3">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-4xl">▶</div>
                  <p className="text-lg font-medium">{currentLecture.title}</p>
                  <p className="text-gray-400 text-sm">{currentLecture.duration} minutes</p>
                  {videoError && <p className="text-xs text-red-400">Video file not found — upload via Admin panel</p>}
                </div>
              );
            }
          })() : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <p>Select a lecture to start watching</p>
            </div>
          )}
        </div>

        {/* Lecture Info */}
        {currentLecture && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-800 text-base">{currentLecture.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {currentModule?.title} · {currentLecture.duration} min
                </p>
                {currentLecture.description && (
                  <p className="text-sm text-gray-600 mt-2">{currentLecture.description}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                {completedSet.has(currentLecture._id) ? (
                  <span className="flex items-center gap-1.5 text-sm text-primary font-medium bg-primary-light px-3 py-2 rounded-lg">
                    ✅ Completed
                  </span>
                ) : (
                  <button onClick={handleMarkComplete} disabled={marking}
                    className="btn-primary text-sm flex items-center gap-2 px-4 py-2">
                    {marking && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Mark Complete
                  </button>
                )}
              </div>
            </div>

            {/* Materials download */}
            {currentLecture.materials?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-600 mb-2">📎 Downloadable Materials</p>
                <div className="flex flex-wrap gap-2">
                  {currentLecture.materials.map((m, i) => (
                    <a key={i} href={m.url} download target="_blank" rel="noreferrer"
                      className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1">
                      ⬇ {m.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button onClick={() => navigate(`/quiz/${courseId}`)}
                className="btn-secondary text-xs px-3 py-1.5">📝 Take Quiz</button>
              <button onClick={() => navigate(`/chat/${courseId}`)}
                className="btn-secondary text-xs px-3 py-1.5">💬 Ask Instructor</button>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Course Progress</span>
            <span className="text-sm font-semibold text-primary">{progress?.completionPercentage || 0}%</span>
          </div>
          <ProgressBar value={progress?.completionPercentage || 0} />
          <p className="text-xs text-gray-400 mt-1.5">
            {completedSet.size} of {totalLectures} lectures completed
            {progress?.completionPercentage === 100 && ' 🎉 Course Complete!'}
          </p>
        </div>
      </div>

      {/* Sidebar — Curriculum */}
      <div className="w-72 shrink-0 overflow-y-auto">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-0">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-sm text-gray-800">Course Content</h3>
            <p className="text-xs text-gray-400 mt-0.5">{totalLectures} lectures · {course.modules?.length} modules</p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {course.modules?.map((mod, mi) => (
              <div key={mi}>
                {/* Module header */}
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Module {mi + 1}
                  </p>
                  <p className="text-xs text-gray-700 font-medium mt-0.5">{mod.title}</p>
                </div>
                {/* Lectures */}
                {mod.lectures.map((lec, li) => {
                  const done = completedSet.has(lec._id);
                  const active = activeModule === mi && activeLecture === li;
                  return (
                    <button key={li} onClick={() => selectLecture(mi, li)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 text-xs border-b border-gray-50 transition-colors ${
                        active ? 'bg-primary-light' : 'hover:bg-gray-50'
                      }`}>
                      {/* Status icon */}
                      <span className={`mt-0.5 shrink-0 text-sm ${done ? 'text-primary' : active ? 'text-primary' : 'text-gray-300'}`}>
                        {done ? '✅' : active ? '▶' : '○'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`leading-snug ${active ? 'text-primary-dark font-medium' : done ? 'text-gray-500' : 'text-gray-700'}`}>
                          {lec.title}
                        </p>
                        <p className="text-gray-400 mt-0.5">{lec.duration} min</p>
                      </div>
                    </button>
                  );
                })}
                {mod.lectures.length === 0 && (
                  <p className="px-4 py-3 text-xs text-gray-400 italic">No lectures yet</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
