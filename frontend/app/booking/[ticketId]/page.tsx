"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, MapPin, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

export default function BookingPage({ params }: { params: { ticketId: string } }) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Countdown timer logic
  useEffect(() => {
    if (timeLeft <= 0 && !isConfirmed) {
      // Simulate booking timeout
      alert('Reservation expired. Redirecting to home...');
      router.push('/');
      return;
    }
    
    if (isConfirmed) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isConfirmed, router]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const API_URL = "https://ticket-booking-fnw9.onrender.com";
      const res = await fetch(`${API_URL}/tickets/confirm/${params.ticketId}`, {
        method: 'PUT'
      });
      if(res.ok) {
        setIsProcessing(false);
        setIsConfirmed(true);
      } else {
        alert("Booking failed or expired");
        setIsProcessing(false);
      }
    } catch(err) {
      alert("Network error");
      setIsProcessing(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (isConfirmed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel p-10 py-16 rounded-3xl max-w-lg w-full text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent"></div>
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6"
            >
              <CheckCircle2 size={48} className="text-green-500" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h2>
            <p className="text-green-400 font-medium mb-8">Ticket #{params.ticketId} secured</p>
            
            <div className="border border-white/10 rounded-2xl p-6 bg-black/40 w-full mb-8 text-left space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="text-brand-500" size={20} />
                <span>Dec 31, 2026 - 9:00 PM</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="text-brand-500" size={20} />
                <span>Cyber Arena, Neo Tokyo</span>
              </div>
            </div>

            <button 
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 transition rounded-xl font-medium text-white"
            >
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-10 pb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Booking</h1>
          <p className="text-gray-400">Please complete payment to secure your seat</p>
        </div>
        
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 px-6 py-3 rounded-2xl text-yellow-500 font-mono text-xl shadow-[0_0_15px_rgba(234,179,8,0.15)]">
          <Clock size={24} className="animate-pulse" />
          <span>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <CreditCard className="text-brand-500" /> Payment Details
            </h3>
            
            <div className="space-y-4 opacity-70 pointer-events-none">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Card Number</label>
                <div className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 flex items-center text-gray-500">
                  **** **** **** 4242
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Expiry</label>
                  <div className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 flex items-center text-gray-500">
                    12/28
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">CVC</label>
                  <div className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 flex items-center text-gray-500">
                    ***
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-green-500/80">
              <ShieldCheck size={16} />
              <span>Payment simulator (no real logic)</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="glass-panel rounded-2xl p-6 sticky top-8 border-t-4 border-t-brand-500">
            <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-gray-300">
                <span>Seat Ticket</span>
                <span className="font-semibold text-white">$150.00</span>
              </div>
              <div className="flex justify-between items-center text-gray-400 text-sm">
                <span>Service Fee</span>
                <span>$15.00</span>
              </div>
              <div className="h-px bg-white/10 w-full my-4"></div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold text-white">Total</span>
                <span className="font-bold text-brand-400">$165.00</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 font-bold text-white shadow-lg flex items-center justify-center disabled:opacity-70 gap-2"
            >
              {isProcessing ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                'Confirm Payment'
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
