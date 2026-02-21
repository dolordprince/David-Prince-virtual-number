/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  Copy, 
  RefreshCw, 
  XCircle, 
  CheckCircle2, 
  Clock,
  Smartphone,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OTPScreenProps {
  orderID: string;
  phoneNumber: string;
  serviceName: string;
  onBack: () => void;
  onNewNumber: () => void;
}

const OTPScreen = ({ 
  orderID, 
  phoneNumber, 
  serviceName, 
  onBack,
  onNewNumber 
}: OTPScreenProps) => {
  const [isPolling, setIsPolling] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutes
  const [otpReceived, setOtpReceived] = useState<string | null>(null);
  const [status, setStatus] = useState<'waiting' | 'received' | 'cancelled' | 'expired' | 'error'>('waiting');
  const [statusMessage, setStatusMessage] = useState('⏳ Waiting for OTP...');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedOTP, setCopiedOTP] = useState(false);

  // --- Helper: Extract OTP ---
  const extractOTP = (smsText: string) => {
    const digits = smsText.replace(/\D/g, '');
    if (digits.length >= 4) {
      return digits.substring(0, 6);
    }
    return smsText;
  };

  // --- API: Check OTP ---
  const checkOTP = useCallback(async () => {
    if (!isPolling) return;

    try {
      const response = await fetch(`/api/5sim/check/${orderID}`);

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const currentStatus = data.status;

      if (currentStatus === 'RECEIVED') {
        setIsPolling(false);
        const smsText = data.sms[0]?.text || "";
        const otp = extractOTP(smsText);
        setOtpReceived(otp);
        setStatus('received');
        setStatusMessage('✅ OTP Received!');
        
        // Finalize order
        fetch(`/api/5sim/finish/${orderID}`);
      } else if (currentStatus === 'PENDING') {
        setStatusMessage('⏳ Waiting for OTP...');
      } else if (currentStatus === 'CANCELLED') {
        setIsPolling(false);
        setStatus('cancelled');
        setStatusMessage('❌ Number Cancelled');
      } else if (currentStatus === 'TIMEOUT') {
        setIsPolling(false);
        setStatus('expired');
        setStatusMessage('⌛ OTP Expired');
      }
    } catch (error) {
      console.error('Polling error:', error);
      setStatusMessage('⚠️ Connection error. Retrying...');
    }
  }, [orderID, isPolling]);

  // --- API: Cancel Order ---
  const handleCancel = async () => {
    if (window.confirm("Are you sure? You will NOT get a refund if cancelled.")) {
      setIsPolling(false);
      try {
        await fetch(`/api/5sim/cancel/${orderID}`);
        setStatus('cancelled');
        setStatusMessage('❌ Number Cancelled');
        setTimeout(onBack, 1500);
      } catch (error) {
        alert("Could not cancel. Try again.");
      }
    }
  };

  // --- Timers ---
  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;
    let pollTimer: NodeJS.Timeout;

    if (isPolling && timeRemaining > 0) {
      countdownTimer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);

      pollTimer = setInterval(() => {
        checkOTP();
      }, 5000);
    }

    if (timeRemaining <= 0 && isPolling) {
      setIsPolling(false);
      setStatus('expired');
      setStatusMessage('⌛ OTP Expired');
      handleCancel();
    }

    return () => {
      clearInterval(countdownTimer);
      clearInterval(pollTimer);
    };
  }, [isPolling, timeRemaining, checkOTP]);

  // --- Formatting ---
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const copyToClipboard = (text: string, type: 'number' | 'otp') => {
    navigator.clipboard.writeText(text);
    if (type === 'number') {
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    } else {
      setCopiedOTP(true);
      setTimeout(() => setCopiedOTP(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-white flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Background Glow */}
      <div className={`absolute top-0 left-0 w-full h-full transition-colors duration-1000 ${
        status === 'received' ? 'bg-app-accent/5' : 
        status === 'cancelled' || status === 'expired' ? 'bg-red-500/5' : 'bg-transparent'
      }`} />

      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center gap-4 z-10">
        <button onClick={onBack} className="w-10 h-10 rounded-full glass-card flex items-center justify-center">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-lg font-bold">{serviceName} OTP</h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Order ID: {orderID}</p>
        </div>
      </header>

      <main className="flex-1 px-6 pt-4 pb-12 z-10 flex flex-col items-center">
        {/* Number Display */}
        <div className="w-full glass-card rounded-[32px] p-8 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Smartphone size={120} />
          </div>
          
          <p className="text-white/50 text-sm mb-2">Enter this number in {serviceName}:</p>
          <h2 className="text-3xl font-black tracking-tight mb-6">{phoneNumber}</h2>
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => copyToClipboard(phoneNumber, 'number')}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
              copiedNumber ? 'bg-app-accent text-white' : 'bg-white/5 text-app-accent border border-app-accent/20'
            }`}
          >
            {copiedNumber ? <Check size={20} /> : <Copy size={20} />}
            {copiedNumber ? 'Number Copied!' : 'Copy Number'}
          </motion.button>
        </div>

        {/* Status & Timer */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className={`px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${
            status === 'received' ? 'bg-app-accent/20 text-app-accent' :
            status === 'cancelled' || status === 'expired' ? 'bg-red-500/20 text-red-500' :
            'bg-yellow-500/20 text-yellow-500'
          }`}>
            {status === 'waiting' && <RefreshCw size={16} className="animate-spin" />}
            {status === 'received' && <CheckCircle2 size={16} />}
            {(status === 'cancelled' || status === 'expired') && <XCircle size={16} />}
            {statusMessage}
          </div>

          <div className="flex items-center gap-2 text-white/40 font-mono text-xl">
            <Clock size={20} />
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* OTP Result */}
        <AnimatePresence>
          {otpReceived && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full glass-card rounded-[32px] p-8 text-center border-2 border-app-accent/30 glow-accent"
            >
              <p className="text-app-accent text-sm font-bold uppercase tracking-widest mb-4">Your OTP Code</p>
              <h3 className="text-6xl font-black tracking-[0.2em] text-app-accent mb-8 drop-shadow-[0_0_15px_rgba(0,201,167,0.5)]">
                {otpReceived}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(otpReceived, 'otp')}
                  className={`py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                    copiedOTP ? 'bg-app-accent text-white' : 'bg-app-accent/10 text-app-accent'
                  }`}
                >
                  {copiedOTP ? <Check size={20} /> : <Copy size={20} />}
                  {copiedOTP ? 'Copied!' : 'Copy OTP'}
                </motion.button>
                
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={onNewNumber}
                  className="py-4 rounded-2xl bg-white/5 text-white font-bold flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} />
                  New Number
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {!otpReceived && (
          <div className="w-full mt-auto flex flex-col gap-4">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold border border-red-500/20"
            >
              Cancel Number
            </motion.button>
            <p className="text-[10px] text-center text-white/30 px-8 uppercase tracking-widest leading-relaxed">
              You will not be charged if the OTP is not received. 
              Refunds are automatic after cancellation.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default OTPScreen;
