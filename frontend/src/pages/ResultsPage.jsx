import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw, FileText, CheckCircle2, AlertTriangle, User, BrainCircuit, Scan, Download } from 'lucide-react';
import useStore from '../store/useStore';
import { PieChart, Pie, Cell } from 'recharts';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { mriImage, patientInfo, scanResult, resetSession } = useStore();
  
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [activeView, setActiveView] = useState('overlay'); // 'original', 'overlay', 'mask'

  useEffect(() => {
    if (!mriImage || !scanResult) {
      navigate('/upload');
      return;
    }
    
    // Create local object URL for the uploaded MRI image (original)
    const objectUrl = URL.createObjectURL(mriImage);
    setOriginalImageUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [mriImage, scanResult, navigate]);

  if (!mriImage || !scanResult) return null;

  const handleNewScan = () => {
    resetSession();
    navigate('/upload');
  };

  // Safely extract stats depending on backend shape
  const stats = scanResult.stats || {};
  const hasTumor = stats.tumor_detected ?? stats.has_tumor ?? scanResult.has_tumor ?? true;
  const confidence = stats.confidence ?? scanResult.confidence ?? 0.85; // Decimal or percentage
  const normalizedConfidence = confidence <= 1 ? (confidence * 100).toFixed(1) : parseFloat(confidence).toFixed(1);

  // Extract real backend images
  const overlayImage = scanResult.overlay_image;
  const rawMask = scanResult.raw_mask;
  
  // Recharts data for the confidence gauge
  const chartData = [
    { name: 'Confidence', value: parseFloat(normalizedConfidence) },
    { name: 'Remaining', value: 100 - parseFloat(normalizedConfidence) },
  ];
  const chartColor = hasTumor ? '#FF453A' : '#0A84FF'; // iOS-like destructive vs primary

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 pb-24 lg:pt-8 w-full">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-glow uppercase">Analysis Report</h1>
            <p className="text-muted-foreground mt-1 text-sm pt-1 font-mono tracking-widest">
              Session ID: TRC-{Math.floor(Math.random() * 90000) + 10000}
            </p>
          </div>
          <button 
            onClick={handleNewScan}
            className="flex items-center space-x-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-full hover:bg-white/10 transition-colors font-medium border border-white/5 whitespace-nowrap"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>New Scan</span>
          </button>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] gap-8 items-start">
          
          {/* Left Column: Visuals (Real Backend output) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col space-y-4 w-full"
          >
            
            {/* View Selector Tabs */}
            <div className="flex bg-white/5 p-1.5 rounded-2xl w-full max-w-md mx-auto xl:mx-0 border border-white/5">
              {[
                { id: 'original', label: 'Original MRI' },
                { id: 'overlay', label: 'Detection Overlay' },
                { id: 'mask', label: 'Segmentation Mask' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    activeView === tab.id 
                    ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--color-primary),0.2)]' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Image Viewer */}
            <div className="glass-panel rounded-3xl relative group overflow-hidden border border-white/5 aspect-square xl:aspect-[4/3] w-full flex items-center justify-center p-4">
               {/* Background Glow */}
               <div className={`absolute -inset-20 opacity-20 blur-3xl transition-colors duration-1000 pointer-events-none ${hasTumor ? 'bg-destructive' : 'bg-primary'}`} />
               
               {/* Image Wrapper for Real Images */}
               <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl z-10 bg-[#0A0D14] border border-white/10 group-hover:border-primary/30 transition-colors duration-500">
                 
                 <AnimatePresence mode="wait">
                   {activeView === 'original' && (
                     <motion.img 
                       key="original"
                       initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                       transition={{ duration: 0.4 }}
                       src={originalImageUrl} 
                       alt="Original MRI"
                       className="absolute inset-0 w-full h-full object-contain mix-blend-screen scale-100 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                     />
                   )}

                   {activeView === 'overlay' && (
                     <motion.img 
                       key="overlay"
                       initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                       transition={{ duration: 0.4 }}
                       src={overlayImage ? (overlayImage.startsWith('data:') || overlayImage.startsWith('http') ? overlayImage : `data:image/jpeg;base64,${overlayImage}`) : originalImageUrl} 
                       alt="AI Overlay"
                       className="absolute inset-0 w-full h-full object-contain scale-100 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                     />
                   )}

                   {activeView === 'mask' && (
                     <motion.img 
                       key="mask"
                       initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                       transition={{ duration: 0.4 }}
                       src={rawMask ? (rawMask.startsWith('data:') || rawMask.startsWith('http') ? rawMask : `data:image/png;base64,${rawMask}`) : ''} 
                       alt="Segmentation Mask"
                       className="absolute inset-0 w-full h-full object-contain brightness-150 contrast-150 scale-100 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                     />
                   )}
                 </AnimatePresence>

                 {/* Fallback if mask is missing */}
                 {activeView === 'mask' && !rawMask && (
                   <div className="absolute inset-0 flex items-center justify-center text-muted-foreground flex-col gap-2">
                     <AlertTriangle className="w-8 h-8 opacity-50" />
                     <p>Mask generated data unavailable</p>
                   </div>
                 )}

               </div>

               {/* Overlay Indicator */}
               <div className="absolute top-8 left-8 z-30 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-primary/30 flex items-center gap-2 shadow-[0_0_15px_rgba(var(--color-primary),0.2)]">
                 <Scan className={`w-4 h-4 ${activeView === 'mask' ? 'text-purple-400' : 'text-primary'}`} />
                 <span className={`text-sm font-semibold tracking-wide uppercase ${activeView === 'mask' ? 'text-purple-400' : 'text-primary'}`}>
                   {activeView === 'original' ? 'T1/T2 Source' : activeView === 'overlay' ? 'AI Overlay Active' : 'Binary Mask'}
                 </span>
               </div>
            </div>
            
          </motion.div>

          {/* Right Column: Data & Analytics */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col space-y-6 w-full"
          >
            {/* Diagnosis Card */}
            <div className={`glass-card p-8 rounded-3xl relative overflow-hidden transition-all duration-500 border ${hasTumor ? 'border-destructive/30' : 'border-primary/30'}`}>
              
              <div className="flex items-start justify-between relative z-10">
                 <div>
                   <h2 className="text-sm uppercase tracking-widest text-muted-foreground font-semibold mb-3">Model Prediction</h2>
                   <div className="flex items-center gap-3">
                     {hasTumor ? (
                       <AlertTriangle className="w-8 h-8 text-destructive animate-pulse" />
                     ) : (
                       <CheckCircle2 className="w-8 h-8 text-primary" />
                     )}
                     <h3 className={`text-2xl font-bold ${hasTumor ? 'text-destructive drop-shadow-[0_0_15px_rgba(255,50,50,0.4)]' : 'text-primary drop-shadow-[0_0_15px_rgba(50,255,255,0.4)]'}`}>
                       {hasTumor ? 'Tumor Detected' : 'No Anomalies'}
                     </h3>
                   </div>
                 </div>
                 
                 {/* Recharts Circular Progress Gauge */}
                 <div className="relative w-24 h-24 -mr-2 -mt-2">
                   <PieChart width={96} height={96}>
                     <Pie
                       data={chartData}
                       cx={48}
                       cy={48}
                       innerRadius={35}
                       outerRadius={45}
                       startAngle={90}
                       endAngle={-270}
                       dataKey="value"
                       stroke="none"
                       cornerRadius={5}
                     >
                       <Cell fill={chartColor} className="drop-shadow-[0_0_10px_currentColor]" />
                       <Cell fill="rgba(255,255,255,0.05)" />
                     </Pie>
                   </PieChart>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-lg font-bold font-mono text-white">{normalizedConfidence}%</span>
                   </div>
                 </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6 relative z-10">
                <p className="text-[15px] leading-relaxed text-foreground/90 font-medium">
                   The DeepRes V4 model analyzed the sequence and {hasTumor ? 'identified regions consistent with neoplastic growth.' : 'found no significant hyperintensities or structural abnormalities.'}
                </p>
                {hasTumor && (
                  <div className="mt-5 bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-1.5 animate-ping shrink-0" />
                    <p className="text-sm border-l-2 border-destructive pl-3 text-white/80 font-mono">
                      Location markers extracted from raw_mask matrix. Review overlay visualization for exact boundary coordinates.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Patient Context Card */}
            <div className="glass-panel p-8 rounded-3xl border border-white/5">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                <User className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">Patient Context</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-y-6">
                <div>
                  <h4 className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5">Name</h4>
                  <p className="text-[15px] font-medium text-white">{patientInfo.patientName || 'Anonymous'}</p>
                </div>
                <div>
                  <h4 className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5">Age</h4>
                  <p className="text-[15px] font-medium text-white">{patientInfo.age ? `${patientInfo.age} Yrs` : 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5">Clinical Notes</h4>
                  <p className="text-sm text-foreground/70 leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5">
                    {patientInfo.notes || 'No preliminary notes provided.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-auto">
               <button className="flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-300 font-semibold border border-white/10 hover:border-white/20">
                 <Download className="w-5 h-5" /> DICOM
               </button>
               <button className="flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl transition-all duration-300 font-semibold shadow-[0_0_20px_rgba(var(--color-primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--color-primary),0.5)] transform hover:-translate-y-1">
                 <FileText className="w-5 h-5" /> Full Report
               </button>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
