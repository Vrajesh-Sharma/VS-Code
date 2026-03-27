import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import useStore from '../store/useStore';

export default function ScannerPage() {
  const navigate = useNavigate();
  const { mriImage, setScanResult } = useStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!mriImage) {
      navigate('/upload');
      return;
    }

    // Create a fake progress incrementer to keep UI alive
    // while the real network request happens
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Hold at 90% until backend responds
        return prev + 2; 
      });
    }, 100);

    const performScan = async () => {
      try {
        const formData = new FormData();
        formData.append('file', mriImage);

        // Fallback to local port 8000 (FastAPI default)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
        
        const response = await axios.post(`${apiUrl}/predict`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        clearInterval(timer);
        setProgress(100);

        // Wait a tiny bit so user sees 100% completion
        setTimeout(() => {
          setScanResult(response.data);
          toast.success("Scan processing complete");
          navigate('/results');
        }, 600);
        
      } catch (error) {
        clearInterval(timer);
        console.error("Scan Error:", error);
        toast.error(error.response?.data?.message || "Failed to process scan. Backend unavailable.", {
          duration: 5000,
        });
        
        // Return to upload so they can retry
        setTimeout(() => {
          navigate('/upload');
        }, 2000);
      }
    };

    performScan();

    return () => clearInterval(timer);
  }, [mriImage, navigate, setScanResult]);

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Background Pulse */}
      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[800px] h-[800px] border border-primary/20 rounded-full pointer-events-none"
      />
      <motion.div 
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.05, 0.2, 0.05],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[1200px] h-[1200px] border border-primary/10 rounded-full pointer-events-none"
      />

      {/* Central Scanner UI */}
      <div className="relative z-10 flex flex-col items-center">
        
        <div className="relative w-64 h-64 mb-12">
          {/* Outer Rotating Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-t-2 border-r-2 border-primary rounded-full blur-[1px]"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border-b-2 border-l-2 border-primary/50 border-dashed rounded-full"
          />
          
          {/* Radar Sweep Effect */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full overflow-hidden"
          >
            <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] origin-top-left bg-gradient-to-r from-transparent via-transparent to-primary/40 -translate-x-1/2 -translate-y-1/2" />
          </motion.div>

          <div className="absolute inset-0 m-auto w-40 h-40 bg-primary/10 rounded-full backdrop-blur-md border border-primary/20 flex items-center justify-center shadow-[0_0_50px_rgba(var(--color-primary),0.3)]">
            {/* Inner Core Pulse */}
             <motion.div
               animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
               className="w-20 h-20 bg-primary rounded-full blur-xl"
             />
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-widest text-primary mb-4 uppercase text-glow">
            Analyzing
          </h2>
          <div className="flex font-mono text-sm text-primary/80 space-x-4 mb-8 pt-4">
            <p className="flex flex-col">
              <span className="text-muted-foreground text-xs uppercase tracking-widest">Neural</span>
              0x1928FFA
            </p>
            <p className="flex flex-col">
              <span className="text-muted-foreground text-xs uppercase tracking-widest">Model</span>
              V4-DeepRes
            </p>
            <p className="flex flex-col">
              <span className="text-muted-foreground text-xs uppercase tracking-widest">Live API</span>
              Connecting...
            </p>
          </div>

          <div className="w-80 h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
            <motion.div 
              style={{ width: `${progress}%` }}
              className="absolute top-0 left-0 h-full bg-primary box-glow transition-all duration-300"
            />
          </div>
          <p className="mt-3 font-mono text-sm text-primary/80">{Math.round(progress)}% Complete</p>
        </motion.div>
      </div>

    </div>
  );
}
