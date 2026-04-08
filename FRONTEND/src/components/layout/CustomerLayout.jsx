import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from '../shared/Footer';
import { useNavigate } from 'react-router-dom';

/**
 * Shared shell: modern navbar + slide sidebar + main content.
 * Used by authenticated customer routes and the public home page.
 */
export default function CustomerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const requireAuth = Boolean(isAuthenticated && currentUser);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={currentUser?.name}
        userEmail={currentUser?.email}
        avatarUrl={currentUser?.avatarUrl || currentUser?.imageUrl}
        onLogout={handleLogout}
        requireAuth={requireAuth}
      />
      <main
        className={`flex-1 transition-[margin] duration-300 ease-out ${
          sidebarOpen ? 'lg:ml-80' : ''
        }`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}