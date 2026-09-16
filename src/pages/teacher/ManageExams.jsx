import { useState, useEffect } from 'react';
import { getTeacherExams, updateExamStatus, deleteExam } from '../../firebase/dbFunctions';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchExams = async () => {
    setLoading(true);
    const { exams: fetchedExams, error } = await getTeacherExams(user.uid);
    if (error) {
      toast.error(error);
    } else {
      // sort by created date descending
      fetchedExams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setExams(fetchedExams);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleStatusToggle = async (examId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'upcoming' : 'active';
    const { error } = await updateExamStatus(examId, newStatus);
    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Exam is now ${newStatus}`);
      fetchExams();
    }
  };

  const handleDelete = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      const { error } = await deleteExam(examId);
      if (error) {
        toast.error('Failed to delete exam');
      } else {
        toast.success('Exam deleted');
        fetchExams();
      }
    }
  };

  if (loading) return <div>Loading exams...</div>;

  return (
    <div>
      <h2 className="mb-4">Manage Exams</h2>
      
      <div className="card">
        {exams.length === 0 ? (
          <p>No exams created yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px' }}>Title</th>
                  <th style={{ padding: '12px' }}>Subject</th>
                  <th style={{ padding: '12px' }}>Duration</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => (
                  <tr key={exam.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}><strong>{exam.title}</strong><br/><small>{new Date(exam.startTime).toLocaleString()}</small></td>
                    <td style={{ padding: '12px' }}>{exam.subject}</td>
                    <td style={{ padding: '12px' }}>{exam.duration} mins</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge badge-${exam.status}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div className="d-flex gap-2">
                        <button 
                          onClick={() => handleStatusToggle(exam.id, exam.status)} 
                          className="btn btn-warning" 
                          style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                        >
                          {exam.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link 
                          to={`/teacher/results?examId=${exam.id}`} 
                          className="btn btn-primary"
                          style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                        >
                          Results
                        </Link>
                        {exam.status !== 'completed' && (
                          <button 
                            onClick={() => handleDelete(exam.id)} 
                            className="btn btn-danger"
                            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageExams;
