import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, registerUser } from '../firebase/authFunctions';
import toast from 'react-hot-toast';

const TeacherLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    employeeId: '',
    department: '',
    subject: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { user, userData, error } = await loginUser(formData.email, formData.password);
      if (error) {
        toast.error(error);
      } else {
        if (userData.role !== 'teacher') {
          toast.error('Invalid role. Please login from correct portal.');
        } else {
          toast.success('Logged in successfully!');
          localStorage.setItem('user', JSON.stringify({ uid: user.uid, ...userData }));
          navigate('/teacher/dashboard');
        }
      }
    } else {
      const userDataToSave = {
        name: formData.fullName,
        role: 'teacher',
        employeeId: formData.employeeId,
        department: formData.department,
        subject: formData.subject
      };
      const { user, error } = await registerUser(formData.email, formData.password, userDataToSave);
      if (error) {
        toast.error(error);
      } else {
        toast.success('Registered successfully!');
        localStorage.setItem('user', JSON.stringify({ uid: user.uid, ...userDataToSave, email: formData.email }));
        navigate('/teacher/dashboard');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-3">Teacher {isLogin ? 'Login' : 'Registration'}</h2>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="fullName" className="form-control" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Employee ID</label>
                <input type="text" name="employeeId" className="form-control" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" name="department" className="form-control" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input type="text" name="subject" className="form-control" required onChange={handleChange} />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" className="form-control" required onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" className="form-control" required onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-success" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <p className="text-center mt-3">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button className="btn" style={{ background: 'none', color: 'var(--success)', padding: 0 }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register Here' : 'Login Here'}
          </button>
        </p>
        <div className="text-center mt-3">
          <Link to="/">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
