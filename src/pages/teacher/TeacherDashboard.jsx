import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeacherExams } from '../../firebase/dbFunctions';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchStats = async () => {
      const { exams, error } = await getTeacherExams(user.uid);
      if (error) {
        toast.error('Failed to load dashboard data');
      } else {
        const now = new Date().getTime();
        let active = 0, upcoming = 0, completed = 0;

        exams.forEach(exam => {
          if (exam.status === 'active') active++;
          else if (exam.status === 'upcoming') upcoming++;
          else if (exam.status === 'completed') completed++;
        });

        setStats({
          total: exams.length,
          active,
          upcoming,
          completed
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, [user.uid]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h2 className="mb-4">Welcome, {user.name}</h2>
      
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="card text-center">
          <h3 style={{ color: 'var(--primary)', fontSize: '2rem' }}>{stats.total}</h3>
          <p className="text-muted">Total Exams Created</p>
        </div>
        <div className="card text-center">
          <h3 style={{ color: 'var(--success)', fontSize: '2rem' }}>{stats.active}</h3>
          <p className="text-muted">Active Exams</p>
        </div>
        <div className="card text-center">
          <h3 style={{ color: 'var(--warning)', fontSize: '2rem' }}>{stats.upcoming}</h3>
          <p className="text-muted">Upcoming Exams</p>
        </div>
        <div className="card text-center">
          <h3 style={{ color: 'var(--danger)', fontSize: '2rem' }}>{stats.completed}</h3>
          <p className="text-muted">Completed Exams</p>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-3">Quick Actions</h3>
        <div className="d-flex gap-3">
          <Link to="/teacher/create-exam" className="btn btn-primary">Create New Exam</Link>
          <Link to="/teacher/manage-exams" className="btn btn-secondary" style={{ backgroundColor: '#4b5563', color: 'white' }}>Manage Exams</Link>
          <Link to="/teacher/results" className="btn btn-success">View Results</Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
