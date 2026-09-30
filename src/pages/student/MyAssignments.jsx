import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentSubmissions } from '../../firebase/dbFunctions';
import toast from 'react-hot-toast';

const MyAssignments = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    const fetchSubmissions = async () => {
      const { submissions: fetched, error } = await getStudentSubmissions(user.uid);
      if (error) {
        toast.error('Failed to fetch assignments history');
      } else {
        fetched.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        setSubmissions(fetched);
      }
      setLoading(false);
    };
    fetchSubmissions();
  }, [user.uid]);

  if (loading) return <div>Loading history...</div>;

  return (
    <div>
      <h2 className="mb-4">My Submissions</h2>
      <div className="card">
        {submissions.length === 0 ? (
          <p>You have not submitted any assignments yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>Assignment Name</th>
                <th style={{ padding: '12px' }}>Submitted Date</th>
                <th style={{ padding: '12px' }}>File</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Marks</th>
                <th style={{ padding: '12px' }}>Feedback</th>
                <th style={{ padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}><strong>{sub.assignmentTitle}</strong></td>
                  <td style={{ padding: '12px' }}>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    {sub.fileURL ? <a href={sub.fileURL} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>View File</a> : <span className="text-muted">N/A</span>}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${sub.status === 'graded' ? 'badge-active' : (sub.status === 'resubmit' ? 'badge-warning' : 'badge-upcoming')}`}>
                      {sub.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{sub.marks !== null ? sub.marks : '-'}</td>
                  <td style={{ padding: '12px' }}>{sub.feedback || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    {sub.status === 'resubmit' && (
                      <Link to="/student/assignments" className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem', textDecoration: 'none' }}>
                        Resubmit Now
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyAssignments;
