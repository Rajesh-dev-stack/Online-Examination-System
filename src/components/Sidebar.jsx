import { NavLink } from 'react-router-dom';
import { 
  Home, FileText, ClipboardList, BarChart2, User, 
  BookOpen, Calendar, Archive 
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const teacherLinks = [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: <Home size={20} /> },
    { name: 'Create Exam', path: '/teacher/create-exam', icon: <FileText size={20} /> },
    { name: 'Manage Exams', path: '/teacher/manage-exams', icon: <ClipboardList size={20} /> },
    { name: 'View Results', path: '/teacher/results', icon: <BarChart2 size={20} /> },
    { name: 'Profile', path: '/teacher/profile', icon: <User size={20} /> },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: <Home size={20} /> },
    { name: 'Available Exams', path: '/student/available-exams', icon: <BookOpen size={20} /> },
    { name: 'My Results', path: '/student/my-results', icon: <Archive size={20} /> },
    { name: 'Profile', path: '/student/profile', icon: <User size={20} /> },
  ];

  const links = role === 'teacher' ? teacherLinks : studentLinks;

  const sidebarStyle = {
    width: '250px',
    backgroundColor: '#1f2937',
    color: 'white',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    paddingTop: '80px', // Space for navbar if it was fixed, but we'll put it below navbar or separate.
    // Actually let's make it a full height sidebar and put navbar next to it.
  };

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px 20px',
    color: '#d1d5db',
    textDecoration: 'none',
    transition: 'background-color 0.2s, color 0.2s',
  };

  return (
    <aside style={sidebarStyle}>
      <div style={{ padding: '0 20px 20px', fontSize: '1.2rem', fontWeight: 'bold', color: 'white', borderBottom: '1px solid #374151', marginBottom: '10px' }}>
        Menu
      </div>
      <nav>
        {links.map((link, idx) => (
          <NavLink 
            key={idx} 
            to={link.path}
            style={({ isActive }) => ({
              ...linkStyle,
              backgroundColor: isActive ? 'var(--primary)' : 'transparent',
              color: isActive ? 'white' : '#d1d5db',
              borderLeft: isActive ? '4px solid white' : '4px solid transparent'
            })}
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
