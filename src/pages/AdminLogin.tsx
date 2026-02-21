import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent regular users from accessing /admin
    const isUser = localStorage.getItem('userAuth') === 'true';
    const isAdmin = localStorage.getItem('adminAuth') === 'true';
    
    if (isUser && !isAdmin) {
      window.location.replace('/');
      return;
    }

    if (isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@dolordprince.com' && password === 'DolordPrince@Admin2025') {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#07070d] flex items-center justify-center p-6 font-['Bricolage_Grotesque']">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#12121e] border border-white/5 rounded-[32px] p-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-xl font-black tracking-tighter text-white mb-2">
            Dolor D Prince — Secure Access
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-500 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-[#00d4aa] transition-colors"
                placeholder="Email Address"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-[#00d4aa] transition-colors"
                placeholder="Password"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#00d4aa] text-[#07070d] py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-[#00d4aa]/20 hover:opacity-90 transition-all active:scale-[0.98]"
          >
            Login
          </button>
        </form>

        <p className="mt-10 text-center text-[10px] text-white/20 uppercase tracking-widest leading-relaxed">
          Authorized personnel only.
        </p>
      </motion.div>
    </div>
  );
}
