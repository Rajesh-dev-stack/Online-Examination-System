import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { logoutUser } from '../firebase/authFunctions';

const Navbar = ({ role }) => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user'));
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = async () => {
    await logoutUser();
    sessionStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  return (
    <>
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
            onClick={() => setShowLogoutModal(true)} 
            className="btn"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {showLogoutModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999
        }}>
          <div className="card" style={{ width: '400px', textAlign: 'center', padding: '30px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: 'var(--text-dark)' }}>Confirm Logout</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Are you sure you want to log out of your account?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowLogoutModal(false)}
                style={{ backgroundColor: '#e5e7eb', color: '#374151' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmLogout}
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
