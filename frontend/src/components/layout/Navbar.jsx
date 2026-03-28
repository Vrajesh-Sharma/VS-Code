import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Activity, Plus, Menu } from 'lucide-react';
import ProfileModal from '../profile/ProfileModal';
import useStore from '../../store/useStore';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, toggleMobileMenu } = useStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full h-20 glass-panel border-b border-white/5 z-50 flex items-center justify-between px-6 lg:px-12 backdrop-blur-xl bg-background/40">
      
      {/* Mobile Menu Toggle & Brand */}
      <div className="flex items-center gap-4">
        {user && (
          <button 
            onClick={() => toggleMobileMenu()}
            className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-white transition-colors rounded-xl hover:bg-white/5"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,255,255,0.2)]">
          <Activity className="w-6 h-6" />
        </div>
        <div className="font-heading font-bold text-xl tracking-tight hidden sm:block text-glow">
          Tumor<span className="text-primary">Trace</span>
        </div>
      </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary border border-primary/30 rounded-full font-semibold hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(var(--color-primary),0.3)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Scan</span>
        </button>
        
        <button 
          onClick={() => {
            if (user) setIsProfileOpen(true);
            else navigate('/login');
          }}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
        >
          <User className="w-5 h-5" />
        </button>
      </div>

    </nav>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}