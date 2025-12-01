import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiClock, FiCalendar, FiUser, FiUsers, FiFileText, FiLogOut, FiMenu, FiX, FiMonitor } from 'react-icons/fi';
import useAuthStore from '../../redux/authStore';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const employeeLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/attendance', icon: FiClock, label: 'Mark Attendance' },
    { to: '/history', icon: FiCalendar, label: 'My History' },
    { to: '/profile', icon: FiUser, label: 'Profile' },
  ];

  const managerLinks = [
    { to: '/manager/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/manager/attendance', icon: FiUsers, label: 'All Attendance' },
    { to: '/manager/calendar', icon: FiCalendar, label: 'Team Calendar' },
    { to: '/manager/reports', icon: FiFileText, label: 'Reports' },
    { to: '/manager/login-monitoring', icon: FiMonitor, label: 'Login Monitoring' },
    { to: '/profile', icon: FiUser, label: 'Profile' },
  ];

  const links = user?.role === 'manager' ? managerLinks : employeeLinks;

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <FiClock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-white">AttendEase</h1>
            <p className="text-xs text-slate-400">Attendance System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 mx-4 mt-4 rounded-xl bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.employeeId}</p>
          </div>
        </div>
        <div className="mt-2 px-2 py-1 rounded-md bg-slate-700/50 text-xs text-slate-300 text-center capitalize">
          {user?.role}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-red-500/20 transition-all duration-200"
        >
          <FiLogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-white lg:hidden"
      >
        {isMobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-700/50 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
};

export default Sidebar;
