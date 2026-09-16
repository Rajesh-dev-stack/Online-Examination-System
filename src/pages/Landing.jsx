import { Link } from 'react-router-dom';

const Landing = () => {
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
          <h2 className="mb-4">Welcome to ExamPortal</h2>
          <p className="mb-4 text-muted">Please select your role to continue.</p>
          
          <div className="grid grid-cols-2 gap-3">
            <Link to="/student-login" className="btn btn-primary" style={{ padding: '20px', fontSize: '1.2rem' }}>
              Login as Student
            </Link>
            <Link to="/teacher-login" className="btn btn-success" style={{ padding: '20px', fontSize: '1.2rem' }}>
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
