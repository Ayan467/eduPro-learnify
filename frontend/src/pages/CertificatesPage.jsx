import { useCertificates } from '../hooks/useApi';
import { Spinner, EmptyState } from '../components/common/UI';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function CertificatesPage() {
  const { certificates, loading } = useCertificates();

  const handleDownload = async (cert) => {
    try {
      const response = await API.get(`/certificates/${cert._id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${cert.uniqueId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Certificate downloaded!');
    } catch {
      toast.error('Download failed');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Certificates</h1>
        <p className="text-gray-500 text-sm mt-1">{certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned</p>
      </div>

      {certificates.length === 0 ? (
        <EmptyState icon="🏆" title="No certificates yet"
          description="Complete a course to earn your first certificate!" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certificates.map((cert) => (
            <div key={cert._id}
              className="bg-gradient-to-br from-primary-light to-blue-50 border-2 border-primary rounded-2xl p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-dark mb-1">
                Learnify · Certificate of Completion
              </p>
              <p className="text-sm text-gray-500 mb-2">This certifies that</p>
              <p className="text-xl font-bold text-gray-800 border-b-2 border-primary pb-2 mb-2 inline-block px-4">
                {cert.studentName}
              </p>
              <p className="text-sm text-gray-500 mb-1">has successfully completed</p>
              <p className="text-lg font-semibold text-primary-dark mb-1">{cert.courseName}</p>
              <p className="text-sm text-gray-600 mb-1">Instructor: {cert.instructorName}</p>
              <p className="text-xs text-gray-400 mb-4">
                {new Date(cert.completionDate).toLocaleDateString('en-IN', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
              <p className="text-xs text-gray-400 mb-4">ID: {cert.uniqueId}</p>
              <button onClick={() => handleDownload(cert)}
                className="btn-primary text-sm px-6">
                ⬇ Download PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
