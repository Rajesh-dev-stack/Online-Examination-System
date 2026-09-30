import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeacherExams, getTeacherAssignments } from '../../firebase/dbFunctions';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    total: 0, active: 0, upcoming: 0, completed: 0, assignments: 0
  });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    const fetchStats = async () => {
      const { exams, error: exErr } = await getTeacherExams(user.uid);
      const { assignments, error: asErr } = await getTeacherAssignments(user.uid);
      
      if (exErr || asErr) {
        toast.error('Failed to load dashboard data');
      } else {
        let active = 0, upcoming = 0, completed = 0;
        exams.forEach(exam => {
          if (exam.status === 'active') active++;
          else if (exam.status === 'upcoming') upcoming++;
          else if (exam.status === 'completed') completed++;
        });

        setStats({ total: exams.length, active, upcoming, completed, assignments: assignments.length });
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
          <p className="text-muted">Total Exams</p>
        </div>
        <div className="card text-center">
          <h3 style={{ color: 'var(--success)', fontSize: '2rem' }}>{stats.active}</h3>
          <p className="text-muted">Active Exams</p>
        </div>
        <div className="card text-center">
          <h3 style={{ color: '#7c3aed', fontSize: '2rem' }}>{stats.assignments}</h3>
          <p className="text-muted">Assignments Created</p>
        </div>
        <div className="card text-center">
          <h3 style={{ color: 'var(--danger)', fontSize: '2rem' }}>{stats.completed}</h3>
          <p className="text-muted">Completed Exams</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <h3 className="mb-3">Exam Quick Actions</h3>
          <div className="d-flex flex-column gap-3">
            <Link to="/teacher/create-exam" className="btn btn-primary text-center">Create New Exam</Link>
            <Link to="/teacher/manage-exams" className="btn btn-secondary text-center" style={{ backgroundColor: '#4b5563', color: 'white' }}>Manage Exams</Link>
          </div>
        </div>
        <div className="card">
          <h3 className="mb-3">Assignment Quick Actions</h3>
          <div className="d-flex flex-column gap-3">
            <Link to="/teacher/create-assignment" className="btn text-center" style={{ backgroundColor: '#7c3aed', color: 'white' }}>Create Assignment</Link>
            <Link to="/teacher/manage-assignments" className="btn btn-secondary text-center" style={{ backgroundColor: '#4b5563', color: 'white' }}>Manage Assignments</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
