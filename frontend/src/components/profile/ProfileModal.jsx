import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Activity, Database, Check, Edit2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useStore from '../../store/useStore';
import { toast } from 'sonner';

export default function ProfileModal({ isOpen, onClose }) {
  const { user } = useStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ patients: 0, scans: 0 });
  
  const [profile, setProfile] = useState({ username: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadProfileData();
    }
  }, [isOpen, user]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      
      const username = profileData?.username || '';
      setProfile({ username });
      setEditName(username);

      // Fetch Patient Count exactly linking to user
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch Scans Count exactly linking to user
      const { count: scansCount } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        patients: patientsCount || 0,
        scans: scansCount || 0
      });

      toast.success("Profile loaded");
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const saveUsername = async () => {
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: editName.trim() })
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile({ username: editName.trim() });
      setIsEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           className="glass-panel w-full max-w-md rounded-3xl p-8 relative z-10 border border-white/10 shadow-2xl"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mb-4 text-primary shadow-[0_0_20px_rgba(var(--color-primary),0.3)]">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-glow">Radiologist Profile</h2>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Username Section */}
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-semibold">Display Name</p>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input 
                      autoFocus
                      type="text"
                      className="flex-1 bg-input/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-white"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <button onClick={saveUsername} disabled={isSaving} className="p-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { setIsEditing(false); setEditName(profile.username); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-lg text-white">
                      {profile.username || <span className="text-muted-foreground italic text-sm">Not set</span>}
                    </span>
                    <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex flex-col items-center relative overflow-hidden group hover:border-emerald-400/30 transition-colors">
                  <div className="absolute inset-0 bg-emerald-400/5 group-hover:bg-emerald-400/10 transition-colors" />
                  <Activity className="w-6 h-6 text-emerald-400 mb-2 relative z-10" />
                  <span className="text-3xl font-bold text-white mb-1 font-mono relative z-10">{stats.patients}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest text-center font-medium relative z-10">Patients<br/>Managed</span>
                </div>
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex flex-col items-center relative overflow-hidden group hover:border-blue-400/30 transition-colors">
                  <div className="absolute inset-0 bg-blue-400/5 group-hover:bg-blue-400/10 transition-colors" />
                  <Database className="w-6 h-6 text-blue-400 mb-2 relative z-10" />
                  <span className="text-3xl font-bold text-white mb-1 font-mono relative z-10">{stats.scans}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest text-center font-medium relative z-10">Total<br/>Scans</span>
                </div>
              </div>

            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
