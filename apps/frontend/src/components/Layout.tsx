import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Briefcase, Server, Settings, PieChart } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Workers', path: '/workers', icon: Server },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-white/5 flex flex-col z-20">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-[var(--color-brand-600)] to-[var(--color-accent-500)] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-black text-xl">C</span>
            </div>
            Codity
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-500)] text-white font-medium shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--color-bg-elevated)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[var(--color-text-secondary)] hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="h-20 glass-panel border-b border-white/5 flex items-center justify-between px-8 z-10">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-white">Admin User</span>
              <span className="text-xs text-[var(--color-text-secondary)]">admin@codity.io</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--color-brand-500)] to-[var(--color-accent-500)] p-[2px]">
              <div className="w-full h-full bg-black/50 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-sm">
                <span className="text-sm font-bold">AD</span>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
