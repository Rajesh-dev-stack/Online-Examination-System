import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTeacherAssignments, getAssignmentSubmissions, gradeSubmission } from '../../firebase/dbFunctions';
import toast from 'react-hot-toast';

const ViewSubmissions = () => {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('assignmentId');
  
  const [assignments, setAssignments] = useState([]);
  const [selectedId, setSelectedId] = useState(preselectedId || '');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(sessionStorage.getItem('user'));

  // Grading State
  const [gradeData, setGradeData] = useState({}); // { subId: { marks, feedback } }

  useEffect(() => {
    const fetchAssignments = async () => {
      const { assignments: fetched, error } = await getTeacherAssignments(user.uid);
      if (!error) {
        setAssignments(fetched);
        if (preselectedId && fetched.some(a => a.id === preselectedId)) {
          fetchSubmissions(preselectedId);
        } else if (fetched.length > 0 && !preselectedId) {
          setSelectedId(fetched[0].id);
          fetchSubmissions(fetched[0].id);
        }
      }
      setLoading(false);
    };
    fetchAssignments();
  }, [user.uid]);

  const fetchSubmissions = async (assignmentId) => {
    const { submissions: fetched } = await getAssignmentSubmissions(assignmentId);
    setSubmissions(fetched);
    
    // Initialize grade data state
    const initialGrades = {};
    fetched.forEach(sub => {
      initialGrades[sub.id] = { marks: sub.marks || '', feedback: sub.feedback || '' };
    });
    setGradeData(initialGrades);
  };

  const handleAssignmentChange = (e) => {
    setSelectedId(e.target.value);
    fetchSubmissions(e.target.value);
  };

  const handleGradeChange = (subId, field, value) => {
    setGradeData(prev => ({
      ...prev,
      [subId]: { ...prev[subId], [field]: value }
    }));
  };

  const saveGrade = async (subId) => {
    const data = gradeData[subId];
    if (data.marks === '') {
      toast.error('Please enter marks');
      return;
    }
    
    const { error } = await gradeSubmission(subId, {
      marks: parseInt(data.marks),
      feedback: data.feedback,
      status: 'graded'
    });
    
    if (error) {
      toast.error('Failed to save grade');
    } else {
      toast.success('Grade saved!');
      // Update local state to show 'graded'
      setSubmissions(submissions.map(s => s.id === subId ? { ...s, status: 'graded', marks: parseInt(data.marks), feedback: data.feedback } : s));
    }
  };

  const gradedCount = submissions.filter(s => s.status === 'graded').length;
  const avgMarks = gradedCount > 0 ? (submissions.reduce((acc, s) => acc + (s.marks || 0), 0) / gradedCount).toFixed(2) : 0;

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="mb-4">View Submissions</h2>
      <div className="card mb-4">
        <label>Select Assignment</label>
        <select className="form-control" value={selectedId} onChange={handleAssignmentChange}>
          {assignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
      </div>

      {submissions.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="card text-center" style={{ padding: '15px' }}>
            <h4>{submissions.length}</h4><p className="text-muted text-sm">Total Submissions</p>
          </div>
          <div className="card text-center" style={{ padding: '15px' }}>
            <h4 style={{ color: 'var(--success)' }}>{gradedCount}</h4><p className="text-muted text-sm">Graded</p>
          </div>
          <div className="card text-center" style={{ padding: '15px' }}>
            <h4 style={{ color: 'var(--danger)' }}>{submissions.length - gradedCount}</h4><p className="text-muted text-sm">Pending</p>
          </div>
          <div className="card text-center" style={{ padding: '15px' }}>
            <h4 style={{ color: 'var(--primary)' }}>{avgMarks}</h4><p className="text-muted text-sm">Avg Marks</p>
          </div>
        </div>
      )}

      <div className="card">
        {submissions.length === 0 ? <p>No submissions found.</p> : (
          <div className="d-flex flex-column gap-3" style={{ flexDirection: 'column' }}>
            {submissions.map(sub => (
              <div key={sub.id} style={{ border: '1px solid #e5e7eb', padding: '15px', borderRadius: '8px' }}>
                <div className="d-flex justify-between align-center mb-3">
                  <div>
                    <strong>{sub.studentName}</strong> ({sub.rollNumber})<br/>
                    <small className="text-muted">Submitted: {new Date(sub.submittedAt).toLocaleString()}</small>
                  </div>
                  <span className={`badge ${sub.status === 'graded' ? 'badge-active' : 'badge-upcoming'}`}>{sub.status}</span>
                </div>
                
                <div className="mb-3">
                  <a href={sub.fileURL} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ backgroundColor: '#4b5563', color: 'white', textDecoration: 'none' }}>
                    View Uploaded File
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3" style={{ backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <div className="form-group mb-0">
                    <label>Marks</label>
                    <input type="number" className="form-control" value={gradeData[sub.id]?.marks || ''} onChange={(e) => handleGradeChange(sub.id, 'marks', e.target.value)} />
                  </div>
                  <div className="form-group mb-0">
                    <label>Feedback</label>
                    <input type="text" className="form-control" placeholder="Optional feedback..." value={gradeData[sub.id]?.feedback || ''} onChange={(e) => handleGradeChange(sub.id, 'feedback', e.target.value)} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <button className="btn btn-success" onClick={() => saveGrade(sub.id)}>Save Grade</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSubmissions;
