import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Layers, ScanFace, Database, BrainCircuit } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
           animate={{
             x: [0, 100, -100, 0],
             y: [0, -100, 100, 0],
             scale: [1, 1.2, 0.8, 1],
           }}
           transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
           className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]"
        />
        <motion.div
           animate={{
             x: [0, -150, 150, 0],
             y: [0, 150, -150, 0],
             scale: [1, 0.8, 1.2, 1],
           }}
           transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
           className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"
        />
        <motion.div
           animate={{
             x: [100, -50, 0, 100],
             y: [-50, 100, -100, -50],
           }}
           transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
           className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[90px]"
        />
      </div>

      {/* Floating Anti-Gravity Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
         {[...Array(6)].map((_, i) => (
           <motion.div
             key={i}
             animate={{
               y: [0, Math.random() * -50 - 20, 0],
               x: [0, Math.random() * 30 - 15, 0],
               rotate: [0, 360],
             }}
             transition={{
               duration: Math.random() * 5 + 5,
               repeat: Infinity,
               ease: "easeInOut",
               delay: Math.random() * 2,
             }}
             className={`absolute rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm ${i % 2 === 0 ? 'w-16 h-16' : 'w-24 h-24 rounded-full'}`}
             style={{
               top: `${Math.random() * 80 + 10}%`,
               left: `${Math.random() * 80 + 10}%`,
             }}
           />
         ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 text-center max-w-4xl relative"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold tracking-wide uppercase mb-8 shadow-[0_0_20px_rgba(var(--color-primary),0.2)]">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" /> DeepRes V4 Active
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 text-white text-glow leading-tight">
          Tumor<span className="text-primary relative inline-block">Trace
            <motion.span 
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1, duration: 0.8 }}
              className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full origin-left box-glow" 
            />
          </span>
        </h1>
        
        <p className="text-xl md:text-3xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          AI-powered <span className="text-foreground font-medium">tumor detection</span> visualization system for modern radiologists.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/upload')}
            className="group px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-2xl text-lg hover:bg-primary/90 hover:scale-105 transition-all duration-300 w-full sm:w-auto shadow-[0_0_40px_rgba(var(--color-primary),0.4)] hover:shadow-[0_0_60px_rgba(var(--color-primary),0.6)] flex items-center justify-center gap-3"
          >
            Start Scan <UploadCloud className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          </button>
          
          <button className="px-8 py-4 bg-white/5 border border-white/10 text-foreground font-semibold rounded-2xl text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 w-full sm:w-auto backdrop-blur-md">
            View Capabilities
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl z-10 px-4"
      >
        {[
          { icon: UploadCloud, title: "DICOM Upload", desc: "Securely transmit high-res medical imagery" },
          { icon: BrainCircuit, title: "Neural Detection", desc: "State-of-the-art multi-spectral models" },
          { icon: Layers, title: "Mask Overlays", desc: "High contrast diagnostic overlays" },
          { icon: Database, title: "PACS Integration", desc: "Enterprise automated routing" }
        ].map((feature, i) => (
          <div key={i} className="glass-panel p-8 rounded-3xl flex flex-col items-start hover:scale-105 hover:bg-white/10 border border-white/5 hover:border-primary/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors" />
            <feature.icon className="w-10 h-10 text-primary mb-5 group-hover:scale-110 transition-transform origin-bottom-left block" />
            <h3 className="text-xl font-bold mb-2 text-foreground tracking-tight">{feature.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
