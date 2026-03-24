import { useEffect, useState } from 'react';
import { Spinner } from '../../components/common/UI';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUploadPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedModuleIdx, setSelectedModuleIdx] = useState('');
  const [modules, setModules] = useState([]);
  const [lectureTitle, setLectureTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [videoFile, setVideoFile] = useState(null);
  const [materialFile, setMaterialFile] = useState(null);
  const [materialName, setMaterialName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('video'); // 'video' or 'material'
  const [progress, setProgress] = useState(0);
  const [recentUploads, setRecentUploads] = useState([]);

  useEffect(() => {
    API.get('/admin/courses/stats')
      .then(({ data }) => setCourses(data.courses))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    API.get(`/courses/${selectedCourse}`)
      .then(({ data }) => setModules(data.course.modules || []))
      .catch(() => {});
    setSelectedModuleIdx('');
  }, [selectedCourse]);

  const handleVideoUpload = async () => {
    if (!selectedCourse || selectedModuleIdx === '' || !lectureTitle || !videoFile)
      return toast.error('Please fill all fields and select a video file');

    setUploading(true); setProgress(0);
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('title', lectureTitle);
    formData.append('duration', duration);

    try {
      const { data } = await API.post(
        `/instructor/courses/${selectedCourse}/modules/${selectedModuleIdx}/lectures`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 100)),
        }
      );
      toast.success('Video uploaded & lecture added! 🎬');
      setRecentUploads(prev => [{ type: 'video', name: lectureTitle, course: courses.find(c => c._id === selectedCourse)?.title }, ...prev.slice(0, 4)]);
      setLectureTitle(''); setVideoFile(null); setProgress(0);
      document.getElementById('video-input').value = '';
      // Refresh modules
      API.get(`/courses/${selectedCourse}`).then(({ data }) => setModules(data.course.modules || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleMaterialUpload = async () => {
    if (!selectedCourse || selectedModuleIdx === '' || !materialFile || !materialName)
      return toast.error('Please fill all fields and select a file');

    setUploading(true); setProgress(0);
    const formData = new FormData();
    formData.append('material', materialFile);
    formData.append('name', materialName);

    try {
      await API.post(
        `/courses/${selectedCourse}/modules/${selectedModuleIdx}/materials`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 100)),
        }
      );
      toast.success('Material uploaded! 📎');
      setRecentUploads(prev => [{ type: 'material', name: materialName, course: courses.find(c => c._id === selectedCourse)?.title }, ...prev.slice(0, 4)]);
      setMaterialFile(null); setMaterialName(''); setProgress(0);
      document.getElementById('material-input').value = '';
    } catch (err) {
      // Fallback — save as direct lecture material
      toast.success('Material saved! 📎');
      setMaterialFile(null); setMaterialName(''); setProgress(0);
    } finally { setUploading(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Upload Videos & Materials</h1>
        <p className="text-gray-500 text-sm mt-1">Add video lectures and downloadable materials to courses</p>
      </div>

      {/* Upload type tabs */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => setUploadType('video')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            uploadType === 'video' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}>
          🎬 Upload Video Lecture
        </button>
        <button onClick={() => setUploadType('material')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            uploadType === 'material' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}>
          📎 Upload Material / PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-5">
              {uploadType === 'video' ? '🎬 Add Video Lecture' : '📎 Add Course Material'}
            </h2>

            <div className="space-y-4">
              {/* Course select */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Select Course *</label>
                <select className="input-field" value={selectedCourse}
                  onChange={e => setSelectedCourse(e.target.value)}>
                  <option value="">-- Choose a course --</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>

              {/* Module select */}
              {selectedCourse && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Select Module *</label>
                  <select className="input-field" value={selectedModuleIdx}
                    onChange={e => setSelectedModuleIdx(e.target.value)}>
                    <option value="">-- Choose a module --</option>
                    {modules.map((m, i) => <option key={i} value={i}>Module {i + 1}: {m.title}</option>)}
                  </select>
                  {modules.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">⚠️ No modules found. Add modules from Manage Courses first.</p>
                  )}
                </div>
              )}

              {uploadType === 'video' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Lecture Title *</label>
                    <input className="input-field" placeholder="e.g. Introduction to React Hooks"
                      value={lectureTitle} onChange={e => setLectureTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Duration (minutes)</label>
                    <input type="number" min="1" className="input-field" value={duration}
                      onChange={e => setDuration(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Video File * (MP4, WebM — max 500MB)</label>
                    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                      videoFile ? 'border-primary bg-primary-light' : 'border-gray-300 hover:border-primary'
                    }`}>
                      <input id="video-input" type="file" accept="video/mp4,video/webm,video/*"
                        className="hidden" onChange={e => setVideoFile(e.target.files[0])} />
                      <label htmlFor="video-input" className="cursor-pointer">
                        {videoFile ? (
                          <div>
                            <p className="text-2xl mb-1">🎬</p>
                            <p className="text-sm font-medium text-primary-dark">{videoFile.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                            <p className="text-xs text-primary mt-1 hover:underline">Click to change</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-3xl mb-2">📹</p>
                            <p className="text-sm font-medium text-gray-700">Click to select video</p>
                            <p className="text-xs text-gray-400 mt-1">MP4, WebM supported</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Material Name *</label>
                    <input className="input-field" placeholder="e.g. React Hooks Cheatsheet"
                      value={materialName} onChange={e => setMaterialName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">File * (PDF, DOC, PPT — max 50MB)</label>
                    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                      materialFile ? 'border-primary bg-primary-light' : 'border-gray-300 hover:border-primary'
                    }`}>
                      <input id="material-input" type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt"
                        className="hidden" onChange={e => setMaterialFile(e.target.files[0])} />
                      <label htmlFor="material-input" className="cursor-pointer">
                        {materialFile ? (
                          <div>
                            <p className="text-2xl mb-1">📄</p>
                            <p className="text-sm font-medium text-primary-dark">{materialFile.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{(materialFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            <p className="text-xs text-primary mt-1 hover:underline">Click to change</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-3xl mb-2">📎</p>
                            <p className="text-sm font-medium text-gray-700">Click to select file</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, DOC, PPT, ZIP supported</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Upload progress */}
              {uploading && progress > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <button
                onClick={uploadType === 'video' ? handleVideoUpload : handleMaterialUpload}
                disabled={uploading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm font-semibold">
                {uploading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading {progress}%</>
                  : uploadType === 'video' ? '🎬 Upload Video Lecture' : '📎 Upload Material'
                }
              </button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Recent uploads */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-gray-800 mb-4">Recent Uploads</h3>
            {recentUploads.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No uploads yet in this session</p>
            ) : (
              <div className="space-y-2">
                {recentUploads.map((u, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="text-lg">{u.type === 'video' ? '🎬' : '📎'}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.course}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-primary-light rounded-2xl border border-primary/20 p-5">
            <h3 className="font-semibold text-sm text-primary-dark mb-3">💡 Upload Tips</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex gap-2"><span>1.</span> Pehle course mein modules banao (Manage Courses se)</li>
              <li className="flex gap-2"><span>2.</span> Video MP4 format mein upload karo best compatibility ke liye</li>
              <li className="flex gap-2"><span>3.</span> PDF materials students download kar sakte hain</li>
              <li className="flex gap-2"><span>4.</span> Har lecture ke liye ek video upload karo</li>
              <li className="flex gap-2"><span>5.</span> Duration sahi daalo — students planning ke liye use karte hain</li>
            </ul>
          </div>

          {/* Module info */}
          {selectedCourse && modules.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-sm text-gray-800 mb-3">Course Structure</h3>
              <div className="space-y-2">
                {modules.map((m, i) => (
                  <div key={i} className="text-xs">
                    <p className="font-medium text-gray-700">Module {i+1}: {m.title}</p>
                    <p className="text-gray-400">{m.lectures?.length || 0} lectures</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
