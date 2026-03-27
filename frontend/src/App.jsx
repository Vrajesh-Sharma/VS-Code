import { useEffect } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Lenis from '@studio-freight/lenis';
import { Toaster } from 'sonner';

// Layout
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";

// Pages
import LandingPage from "./pages/LandingPage";
import UploadPage from "./pages/UploadPage";
import ScannerPage from "./pages/ScannerPage";
import ResultsPage from "./pages/ResultsPage";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Hide sidebar on landing page for cleaner full screen hero, or we can keep it persistent.
  // The user requested a persistent layout, so we will show it everywhere except maybe wait,
  // "persistent layout... Navbar (Top) ... Sidebar (Left)"
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative flex flex-col">
      
      {/* Global Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-primary/5 blur-[200px] rounded-full" />
      </div>

      <Toaster theme="dark" position="top-right" duration={4000} />
      
      <Navbar />

      <div className="flex flex-1 pt-20"> {/* pt-20 to clear fixed Navbar height */}
        {!isLanding && <Sidebar />}
        
        <main className={`flex-1 min-w-0 transition-all duration-300 ${!isLanding ? 'ml-20 md:ml-64' : ''}`}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/scanner" element={<ScannerPage />} />
              <Route path="/results" element={<ResultsPage />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
}