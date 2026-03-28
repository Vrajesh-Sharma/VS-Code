import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Search, FileImage, User, Calendar, ExternalLink, Loader2, AlertTriangle, CheckCircle2, X, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useStore from '../store/useStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function HistoryPage() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);
  const [deletingScan, setDeletingScan] = useState(null);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scans')
        .select(`
          id,
          patient_id,
          created_at,
          tumor_detected,
          tumor_area_pct,
          tumor_type,
          image_url,
          overlay_url,
          mask_url,
          patients (
            name,
            age
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScans(data || []);
      toast.success("Archive loaded successfully", { id: 'archive-load' });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load scan history");
    } finally {
      setLoading(false);
    }
  };

  const filteredScans = scans.filter(s => 
    s.patients?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteConfirm = async () => {
    if (!deletingScan || !deletingScan.patient_id) return;
    
    try {
      // 1. Delete associated scans first to satisfy foreign keys
      const { error: scansErr } = await supabase
        .from('scans')
        .delete()
        .eq('patient_id', deletingScan.patient_id)
        .eq('user_id', user.id); 
        
      if (scansErr) throw scansErr;

      // 2. Delete patient
      const { error: patientErr } = await supabase
        .from('patients')
        .delete()
        .eq('id', deletingScan.patient_id)
        .eq('user_id', user.id);

      if (patientErr) throw patientErr;

      toast.success("Patient deleted successfully");
      setDeletingScan(null);
      
      // Instantly remove all scans for that patient from the local UI
      setScans(prev => prev.filter(s => s.patient_id !== deletingScan.patient_id));
      
    } catch (err) {
      console.error(err);
      toast.error("Error deleting patient");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full p-6 md:p-12 pb-24 lg:pt-8 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto z-10 relative space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold font-heading tracking-tight text-glow flex items-center gap-3">
              <Database className="w-8 h-8 text-primary" /> Scan Archive
            </h1>
            <p className="text-muted-foreground mt-2 text-sm tracking-wide">
              Securely viewing records isolated to your radiologist profile.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-full pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-white transition-colors"
            />
          </div>
        </motion.div>

        {/* Data Grid */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-primary">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="text-muted-foreground tracking-widest uppercase text-xs">Decrypting Records...</p>
            </div>
          ) : filteredScans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <Database className="w-16 h-16 opacity-20 mb-4" />
              <p className="text-lg font-medium text-white mb-2">No scans found</p>
              <p className="text-sm opacity-60">You haven't archived any predictive scans yet.</p>
              <button onClick={() => navigate('/upload')} className="mt-6 px-6 py-2.5 bg-primary/20 text-primary border border-primary/30 rounded-full font-semibold hover:bg-primary/30 transition-all">
                Start First Scan
              </button>
            </div>
          ) : (
            <div className="w-full">
              {/* Desktop Table View */}
              <div className="hidden lg:block w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-widest text-muted-foreground">
                    <th className="py-4 px-6 font-semibold">Patient</th>
                    <th className="py-4 px-6 font-semibold">Date processed</th>
                    <th className="py-4 px-6 font-semibold">AI Prediction</th>
                    <th className="py-4 px-6 font-semibold">Tumor Area</th>
                    <th className="py-4 px-6 font-semibold">Type</th>
                    <th className="py-4 px-6 font-semibold text-right">Data View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredScans.map((scan) => {
                    const hasTumor = scan.tumor_detected;
                    return (
                      <tr 
                         key={scan.id} 
                         className="hover:bg-white/5 transition-colors group cursor-pointer"
                         onClick={() => setSelectedScan(scan)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 border border-white/5 flex items-center justify-center text-primary shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{scan.patients?.name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{scan.patients?.age ? `${scan.patients.age} Years` : 'Age N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-sm text-foreground/80">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {new Date(scan.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${hasTumor ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                            {hasTumor ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            {hasTumor ? 'Positive' : 'Negative'}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-sm">
                          {scan.tumor_area_pct ? `${scan.tumor_area_pct.toFixed(1)}%` : 'N/A'}
                        </td>
                        <td className="py-4 px-6 font-mono text-sm">
                          {scan.tumor_type || 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                             {scan.image_url && (
                               <a href={scan.image_url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors tooltip-trigger" title="Original MRI">
                                 <FileImage className="w-4 h-4" />
                               </a>
                             )}
                             {scan.overlay_url && (
                               <a href={scan.overlay_url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-purple-500/20 hover:text-purple-400 transition-colors tooltip-trigger" title="AI Overlay">
                                 <ExternalLink className="w-4 h-4" />
                               </a>
                             )}
                             <button 
                               onClick={(e) => { 
                                 e.stopPropagation(); 
                                 setDeletingScan(scan); 
                               }}
                               className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors tooltip-trigger ml-2" 
                               title="Delete Patient"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden flex flex-col p-4 sm:p-6 gap-4">
                {filteredScans.map((scan) => {
                  const hasTumor = scan.tumor_detected;
                  return (
                    <div 
                      key={scan.id} 
                      onClick={() => setSelectedScan(scan)}
                      className="glass-panel p-5 rounded-3xl border border-white/5 flex flex-col gap-4 active:scale-[0.98] transition-all cursor-pointer bg-black/20 hover:border-primary/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 border border-white/5 flex items-center justify-center text-primary shrink-0">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg">{scan.patients?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{scan.patients?.age ? `${scan.patients.age} Years` : 'Age N/A'}</p>
                          </div>
                        </div>
                        <div className={`p-2 rounded-full border ${hasTumor ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                          {hasTumor ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Processed</p>
                          <div className="flex items-center gap-1.5 text-sm font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(scan.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Details</p>
                          <p className="text-sm font-mono font-medium truncate">
                            {scan.tumor_area_pct ? `${scan.tumor_area_pct.toFixed(1)}%` : 'N/A'} {scan.tumor_type ? `- ${scan.tumor_type}` : ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4 mt-1">
                             {scan.image_url && (
                               <a href={scan.image_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors">
                                 <FileImage className="w-4 h-4" />
                               </a>
                             )}
                             {scan.overlay_url && (
                               <a href={scan.overlay_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-purple-500/20 hover:text-purple-400 transition-colors">
                                 <ExternalLink className="w-4 h-4" />
                               </a>
                             )}
                             <button 
                               onClick={(e) => { 
                                 e.stopPropagation(); 
                                 setDeletingScan(scan); 
                               }}
                               className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ml-auto" 
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Patient Preview Modal */}
      <AnimatePresence>
        {selectedScan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedScan(null)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="glass-panel w-full max-w-lg rounded-3xl p-6 relative z-10 border border-white/10 shadow-2xl flex flex-col items-center"
            >
               <button 
                 onClick={(e) => { e.stopPropagation(); setSelectedScan(null); }}
                 className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors z-50"
               >
                 <X className="w-5 h-5" />
               </button>
               
               <div className="w-full aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/5 mb-6 flex items-center justify-center relative group">
                  {selectedScan.overlay_url || selectedScan.image_url ? (
                    <img 
                      src={selectedScan.overlay_url || selectedScan.image_url} 
                      alt="Scan Preview" 
                      className="w-full h-full object-contain mix-blend-screen scale-100 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center gap-2">
                       <FileImage className="w-8 h-8 opacity-50" />
                       <span className="text-sm">Image unavailable</span>
                    </div>
                  )}
                  {selectedScan.overlay_url && (
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest hidden group-hover:block transition-all">
                      AI Overlay Active
                    </div>
                  )}
               </div>

               <div className="w-full flex items-center justify-between border-t border-white/10 pt-4">
                 <div>
                   <h3 className="text-xl font-bold text-white">{selectedScan.patients?.name || 'Unknown Patient'}</h3>
                   <p className="text-sm text-muted-foreground mt-1">
                     {new Date(selectedScan.created_at).toLocaleDateString()}
                   </p>
                 </div>
                 <div className="text-right">
                   <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider border mb-1 ${selectedScan.tumor_detected ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                     {selectedScan.tumor_detected ? 'Tumor Detected' : 'No Anomalies'}
                   </div>
                   <p className="text-xs text-muted-foreground uppercase font-mono tracking-widest mt-1">
                     AREA: {selectedScan.tumor_area_pct ? `${selectedScan.tumor_area_pct.toFixed(1)}%` : 'N/A'}
                   </p>
                   <p className="text-xs text-muted-foreground uppercase font-mono tracking-widest mt-1">
                     TYPE: {selectedScan.tumor_type || 'N/A'}
                   </p>
                   <p className="text-xs text-muted-foreground uppercase font-mono tracking-widest mt-1">
                     CONF: {selectedScan.mean_tumor_confidence ? `${(selectedScan.mean_tumor_confidence <= 1 ? selectedScan.mean_tumor_confidence * 100 : selectedScan.mean_tumor_confidence).toFixed(1)}%` : '0.0%'}
                   </p>
                   <p className="text-xs text-muted-foreground uppercase font-mono tracking-widest mt-1 text-purple-400">
                     PROGNOSIS: {selectedScan.survival_label || 'N/A'}
                   </p>
                 </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingScan && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setDeletingScan(null)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="glass-panel w-full max-w-sm rounded-3xl p-6 relative z-10 border border-destructive/20 shadow-[0_0_50px_rgba(255,50,50,0.1)] flex flex-col items-center text-center"
            >
               <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                 <AlertTriangle className="w-8 h-8 text-destructive" />
               </div>
               
               <h3 className="text-xl font-bold text-white mb-2">Delete Patient</h3>
               <p className="text-muted-foreground text-sm mb-6">
                 Are you sure you want to delete <strong className="text-white">{deletingScan.patients?.name || 'this patient'}</strong> and all associated scans? This action cannot be undone.
               </p>
               
               <div className="flex gap-3 w-full">
                 <button 
                   onClick={() => setDeletingScan(null)}
                   className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/10"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleDeleteConfirm}
                   className="flex-1 py-3 px-4 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-semibold transition-colors shadow-lg"
                 >
                   Confirm Delete
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
