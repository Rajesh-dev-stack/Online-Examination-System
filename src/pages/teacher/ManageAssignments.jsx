import { useState, useEffect } from 'react';
import { getTeacherAssignments, updateAssignmentStatus, deleteAssignment } from '../../firebase/dbFunctions';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ManageAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchAssignments = async () => {
    setLoading(true);
    const { assignments: fetched, error } = await getTeacherAssignments(user.uid);
    if (!error) {
      fetched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAssignments(fetched);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAssignments(); }, []);

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    await updateAssignmentStatus(id, newStatus);
    toast.success(`Assignment marked as ${newStatus}`);
    fetchAssignments();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this assignment?')) {
      await deleteAssignment(id);
      toast.success('Deleted');
      fetchAssignments();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="mb-4">Manage Assignments</h2>
      
      {assignments.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px' }}>
          <h3 className="text-muted" style={{ margin: 0 }}>No assignments created.</h3>
          <p className="text-muted mt-2">Go to "Create Assignment" to set up your first assignment.</p>
        </div>
      ) : (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>Title</th>
                <th style={{ padding: '12px' }}>Due Date</th>
                <th style={{ padding: '12px' }}>Total Marks</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}><strong>{a.title}</strong><br/><small>{a.subject}</small></td>
                  <td style={{ padding: '12px' }}>{new Date(a.dueDate).toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>{a.totalMarks}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${a.status === 'active' ? 'badge-active' : 'badge-completed'}`}>{a.status}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div className="d-flex gap-2">
                      <Link to={`/teacher/view-submissions?assignmentId=${a.id}`} className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '0.85rem' }}>View Submissions</Link>
                      <button onClick={() => handleStatusToggle(a.id, a.status)} className="btn btn-warning" style={{ padding: '6px 10px', fontSize: '0.85rem' }}>
                        {a.status === 'active' ? 'Close' : 'Reopen'}
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '0.85rem' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageAssignments;
