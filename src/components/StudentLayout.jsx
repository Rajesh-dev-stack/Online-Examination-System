import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const StudentLayout = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || user.role !== 'student') {
    return <Navigate to="/student-login" />;
  }

  return (
    <div className="app-container">
      <Sidebar role="student" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '250px' }}>
        <Navbar role="Student" />
        <main style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
