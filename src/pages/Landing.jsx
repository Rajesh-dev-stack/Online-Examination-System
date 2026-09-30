import { Link, Navigate } from 'react-router-dom';

const Landing = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  
  if (user) {
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1>ExamPortal</h1>
        <p>Online Examination Made Simple</p>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div className="card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          <h3 className="mb-4">Welcome</h3>
          <p className="mb-4 text-muted">Please select your role to continue.</p>
          
          <div className="grid grid-cols-2 gap-3">
            <Link to="/student-login" replace className="btn btn-primary" style={{ padding: '20px', fontSize: '1.2rem' }}>
              Login as Student
            </Link>
            <Link to="/teacher-login" replace className="btn btn-success" style={{ padding: '20px', fontSize: '1.2rem' }}>
              Login as Teacher
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '20px', textAlign: 'center' }}>
        <p>&copy; {new Date().getFullYear()} ExamPortal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
