import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Smartphone, Lock, AlertCircle } from 'lucide-react';

export default function UserLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('userAuth') === 'true') {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock login for demo
    if (phone.length >= 10 && password.length >= 4) {
      localStorage.setItem('userAuth', 'true');
      navigate('/');
    } else {
      setError('Invalid phone number or password');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 font-['Inter']">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#12121e] border border-white/5 rounded-[32px] p-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black tracking-tighter text-white mb-2">
            DOLOR D <span className="text-[#00c9a7]">PRINCE</span>
          </h1>
          <p className="text-xs text-white/40 font-bold uppercase tracking-[0.2em]">Customer Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-500 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-4">Phone Number</label>
            <div className="relative">
              <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-[#00c9a7] transition-colors"
                placeholder="08012345678"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-4">Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-[#00c9a7] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#00c9a7] text-[#0a0a0f] py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-[#00c9a7]/20 hover:opacity-90 transition-all active:scale-[0.98]"
          >
            Login to Dashboard
          </button>
        </form>

        <p className="mt-10 text-center text-[10px] text-white/20 uppercase tracking-widest leading-relaxed">
          By logging in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
