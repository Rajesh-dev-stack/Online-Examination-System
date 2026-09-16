const StudentProfile = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="mb-4">Student Profile</h2>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--primary)', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            {user.name.charAt(0)}
          </div>
          <div>
            <h3>{user.name}</h3>
            <p className="text-muted text-uppercase">{user.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label>Email</label>
            <input type="text" className="form-control" value={user.email} disabled />
          </div>
          <div className="form-group">
            <label>Roll Number</label>
            <input type="text" className="form-control" value={user.rollNumber} disabled />
          </div>
          <div className="form-group">
            <label>Course</label>
            <input type="text" className="form-control" value={user.course} disabled />
          </div>
          <div className="form-group">
            <label>Semester</label>
            <input type="text" className="form-control" value={user.semester} disabled />
          </div>
        </div>
        
        <p className="text-muted mt-3" style={{ fontSize: '0.9rem' }}>
          * To update your profile information, please contact the examination department.
        </p>
      </div>
    </div>
  );
};

export default StudentProfile;
