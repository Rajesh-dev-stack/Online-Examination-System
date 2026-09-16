import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { logoutUser } from '../firebase/authFunctions';

const Navbar = ({ role }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header style={{ 
      backgroundColor: 'var(--primary)', 
      color: 'white', 
      padding: '15px 20px', 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>
        ExamPortal <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>({role})</span>
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserIcon size={20} />
          <span>{user?.name}</span>
        </div>
        <button 
          onClick={handleLogout} 
          className="btn"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
