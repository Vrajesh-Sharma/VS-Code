import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import useStore from '../store/useStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      }

      if (result.error) throw result.error;

      if (result.data?.user) {
        setUser(result.data.user);
        toast.success(isLogin ? 'Login successful' : 'Account created successfully');
        navigate('/upload');
      }
    } catch (error) {
      console.error('Auth Error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      
      {/* Background glow similar to other pages */}
      <div className="absolute w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full top-[10%] left-[20%] z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-md rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 border border-white/5"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-glow mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isLogin ? 'Enter your credentials to access your workspace' : 'Sign up to securely store your MRI scans'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-input/50 border border-white/10 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                placeholder="doctor@hospital.com"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-input/50 border border-white/10 rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:shadow-[0_0_20px_rgba(var(--color-primary),0.6)] hover:bg-primary/90 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
