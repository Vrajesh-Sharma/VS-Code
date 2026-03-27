import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, UploadCloud, FileText, LogOut, Database } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, clearUser } = useStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Upload Scan', path: '/upload', icon: UploadCloud },
    { name: 'Results', path: '/results', icon: FileText },
    { name: 'Archive', path: '/history', icon: Database },
  ];

  return (
    <aside className="w-20 md:w-64 h-screen fixed left-0 top-0 pt-20 flex flex-col items-center md:items-start glass-panel border-r border-white/5 z-40 transition-all duration-300">
      <div className="w-full px-4 space-y-2 mt-8 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(0,255,255,0.1)]'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`
            }
          >
            <item.icon className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>
      
      {user && (
        <div className="w-full px-4 pb-8">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center md:justify-start gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group"
          >
            <LogOut className="w-6 h-6 shrink-0 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden md:inline font-medium">Log out</span>
          </button>
        </div>
      )}
    </aside>
  );
}