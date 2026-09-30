import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const TeacherLayout = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));

  if (!user || user.role !== 'teacher') {
    return <Navigate to="/teacher-login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar role="teacher" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '250px' }}>
        <Navbar role="Teacher" />
        <main style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
