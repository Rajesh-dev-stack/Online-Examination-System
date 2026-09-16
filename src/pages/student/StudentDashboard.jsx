import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentResults, getAvailableExamsForStudents } from '../../firebase/dbFunctions';

const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [stats, setStats] = useState({
    totalAppeared: 0,
    passed: 0,
    failed: 0,
    average: 0
  });
  const [availableExams, setAvailableExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [resultsRes, examsRes] = await Promise.all([
        getStudentResults(user.uid),
        getAvailableExamsForStudents()
      ]);

      if (!resultsRes.error) {
        const results = resultsRes.results;
        const total = results.length;
        const passed = results.filter(r => r.status === 'pass').length;
        const avg = total > 0 ? (results.reduce((acc, r) => acc + r.percentage, 0) / total).toFixed(2) : 0;
        
        setStats({
          totalAppeared: total,
          passed,
          failed: total - passed,
          average: avg
        });

        // Filter out already attempted exams from available list
        if (!examsRes.error) {
          const attemptedExamIds = results.map(r => r.examId);
          const notAttempted = examsRes.exams.filter(e => !attemptedExamIds.includes(e.id));
          setAvailableExams(notAttempted.slice(0, 3)); // Only show up to 3 on dashboard
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user.uid]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h2 className="mb-4">Welcome, {user.name}</h2>
      
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="card text-center">
          <h3 style={{ color: 'var(--primary)', fontSize: '2rem' }}>{stats.totalAppeared}</h3>
          <p className="text-muted">Total Exams Appeared</p>
        </div>
        <div className="card text-center">
          <h3 style={{ color: 'var(--success)', fontSize: '2rem' }}>{stats.passed}</h3>
          <p className="text-muted">Exams Passed</p>
        </div>
        <div className="card text-center">
          <h3 style={{ color: 'var(--danger)', fontSize: '2rem' }}>{stats.failed}</h3>
          <p className="text-muted">Exams Failed</p>
        </div>
        <div className="card text-center">
          <h3 style={{ color: 'var(--warning)', fontSize: '2rem' }}>{stats.average}%</h3>
          <p className="text-muted">Average Percentage</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="d-flex justify-between align-center mb-3">
            <h3>Available Exams</h3>
            <Link to="/student/available-exams" style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>View All</Link>
          </div>
          {availableExams.length === 0 ? (
            <p className="text-muted">No new exams available at the moment.</p>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {availableExams.map(exam => (
                <li key={exam.id} style={{ padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <div className="d-flex justify-between align-center">
                    <div>
                      <strong>{exam.title}</strong>
                      <div className="text-muted" style={{ fontSize: '0.85rem' }}>{exam.subject} • {exam.duration} mins</div>
                    </div>
                    <Link to={`/student/available-exams`} className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.85rem' }}>
                      Details
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3>Quick Links</h3>
          <div className="d-flex flex-column gap-2 mt-3" style={{ flexDirection: 'column' }}>
            <Link to="/student/available-exams" className="btn btn-primary" style={{ width: '100%', textAlign: 'left', padding: '15px' }}>
              📚 Browse Available Exams
            </Link>
            <Link to="/student/my-results" className="btn btn-success" style={{ width: '100%', textAlign: 'left', padding: '15px' }}>
              📊 View My Results
            </Link>
            <Link to="/student/profile" className="btn btn-secondary" style={{ width: '100%', textAlign: 'left', padding: '15px', backgroundColor: '#4b5563', color: 'white' }}>
              👤 Update Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
