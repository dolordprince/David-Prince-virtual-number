/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Building2, 
  Smartphone, 
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

type PaymentMethod = 'opay' | 'bank' | 'card';

export default function AddMoneyModal({ isOpen, onClose, onSuccess }: AddMoneyModalProps) {
  const [step, setStep] = useState<'amount' | 'method' | 'details' | 'processing' | 'success'>('amount');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(amount) >= 100) {
      setStep('method');
    }
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('details');
  };

  const handlePayment = () => {
    setStep('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      setStep('success');
      onSuccess(parseFloat(amount));
    }, 2000);
  };

  const resetAndClose = () => {
    setStep('amount');
    setAmount('');
    setSelectedMethod(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-app-bg border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] p-8 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Add Money</h2>
              <button 
                onClick={resetAndClose}
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="min-h-[300px]">
              {step === 'amount' && (
                <motion.form 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleAmountSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">
                      Enter Amount
                    </label>
                    <div className="relative">
                      <input 
                        autoFocus
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-6 text-3xl font-bold focus:outline-none focus:border-app-accent transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {['500', '1000', '2000', '5000', '10000', '20000'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        className="py-3 rounded-xl glass-card text-sm font-bold hover:bg-app-accent/10 hover:text-app-accent transition-all"
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  <button 
                    disabled={!amount || parseFloat(amount) < 100}
                    className="w-full py-4 rounded-2xl bg-app-accent text-white font-bold shadow-lg shadow-app-accent/20 disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    Continue
                  </button>
                </motion.form>
              )}

              {step === 'method' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Select Payment Method</p>
                  
                  <PaymentMethodItem 
                    id="opay"
                    icon={<Smartphone className="text-emerald-500" />}
                    title="Opay"
                    description="Pay to Opay Account"
                    selected={selectedMethod === 'opay'}
                    onClick={() => handleMethodSelect('opay')}
                  />
                  
                  <PaymentMethodItem 
                    id="bank"
                    icon={<Building2 className="text-blue-500" />}
                    title="Bank Transfer"
                    description="Manual transfer to Bank"
                    selected={selectedMethod === 'bank'}
                    onClick={() => handleMethodSelect('bank')}
                  />
                  
                  <PaymentMethodItem 
                    id="card"
                    icon={<CreditCard className="text-purple-500" />}
                    title="Debit Card"
                    description="Visa, Mastercard, Verve"
                    selected={selectedMethod === 'card'}
                    onClick={() => handleMethodSelect('card')}
                  />

                  <div className="pt-4">
                    <button 
                      onClick={() => setStep('amount')}
                      className="w-full py-4 text-white/40 text-sm font-bold"
                    >
                      Go Back
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'details' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {selectedMethod === 'card' ? (
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Enter Card Details</p>
                      <div className="space-y-3">
                        <input type="text" placeholder="Card Number" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-app-accent" />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder="MM/YY" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-app-accent" />
                          <input type="text" placeholder="CVV" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-app-accent" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Payment Instructions</p>
                      <div className="glass-card p-6 rounded-2xl space-y-4 border border-app-accent/20">
                        <div className="flex items-center justify-between">
                          <span className="text-white/40 text-xs">Account Name</span>
                          <span className="font-bold text-sm">David Prince</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/40 text-xs">Account Number</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">8116457480</span>
                            <button onClick={() => navigator.clipboard.writeText('8116457480')} className="text-app-accent"><Smartphone size={14}/></button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/40 text-xs">Bank Name</span>
                          <span className="font-bold text-sm">Opay</span>
                        </div>
                        <div className="pt-2 border-t border-white/5">
                          <p className="text-[10px] text-white/30 text-center">Transfer the specified amount to the account above. Your wallet will be credited automatically.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <button 
                      onClick={handlePayment}
                      className="w-full py-4 rounded-2xl bg-app-accent text-white font-bold shadow-lg shadow-app-accent/20 transition-all"
                    >
                      {selectedMethod === 'card' ? 'Pay Now' : 'I have made the transfer'}
                    </button>
                    <button 
                      onClick={() => setStep('method')}
                      className="w-full py-4 text-white/40 text-sm font-bold"
                    >
                      Change Method
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 space-y-6"
                >
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-app-accent/20 border-t-app-accent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CreditCard size={24} className="text-app-accent" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">Processing Payment</h3>
                    <p className="text-white/40 text-sm">Please do not close this window...</p>
                  </div>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 space-y-6"
                >
                  <div className="w-20 h-20 rounded-full bg-app-accent/20 flex items-center justify-center text-app-accent">
                    <CheckCircle2 size={48} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
                    <p className="text-white/40 text-sm mb-8">Funds have been added to your wallet.</p>
                    <button 
                      onClick={resetAndClose}
                      className="w-full bg-app-accent text-white py-4 px-12 rounded-2xl font-bold"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function PaymentMethodItem({ id, icon, title, description, selected, onClick }: { 
  id: string; 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
        selected ? 'bg-app-accent/10 border-app-accent' : 'glass-card border-white/5'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <h4 className="font-bold text-sm">{title}</h4>
        <p className="text-xs text-white/40">{description}</p>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
        selected ? 'border-app-accent bg-app-accent' : 'border-white/10'
      }`}>
        {selected && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
    </button>
  );
}
