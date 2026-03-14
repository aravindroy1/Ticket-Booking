"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Ticket as TicketIcon, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTickets: 1200,
    available: 450,
    pending: 120,
    booked: 630
  });

  // Real API fetching for stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
        const res = await fetch(`${API_URL}/tickets/dashboard/stats`);
        if (res.ok) {
          const data = await res.json();
          setStats({
            totalTickets: (data.AVAILABLE || 0) + (data.PENDING || 0) + (data.BOOKED || 0) + (data.CANCELLED || 0),
            available: data.AVAILABLE || 0,
            pending: data.PENDING || 0,
            booked: data.BOOKED || 0
          });
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    }
    fetchStats();
    
    // Auto refresh every 5s
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { label: "Available Tickets", value: stats.available, icon: TicketIcon, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", trend: "+12%" },
    { label: "Pending (Locked)", value: stats.pending, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", trend: "-5%" },
    { label: "Successfully Booked", value: stats.booked, icon: Users, color: "text-brand-400", bg: "bg-brand-500/10", border: "border-brand-500/20", trend: "+24%" },
  ];

  return (
    <div className="py-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <LayoutDashboard className="text-brand-500" />
            Control Center
          </h1>
          <p className="text-gray-400">Monitor ticket inventory across all events</p>
        </div>
        
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 transition">Export CSV</button>
          <button className="px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-sm text-white font-medium transition shadow-lg shadow-brand-500/20">Generate Event Tickets</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-panel p-6 rounded-2xl border ${stat.border} relative overflow-hidden`}
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${stat.bg} blur-2xl`}></div>
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {stat.trend.startsWith('+') ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {stat.trend}
              </div>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-4xl font-bold text-white">{stat.value.toLocaleString()}</p>
            </div>
            
            {/* Visual bar chart equivalent */}
            <div className="w-full h-1.5 bg-black/40 rounded-full mt-6 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(stat.value / stats.totalTickets) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-full ${stat.color.replace('text', 'bg').replace('400', '500')}`}
              ></motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
          <div className="text-sm text-brand-400 cursor-pointer">View All</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-sm border-b border-white/5">
                <th className="pb-4 font-medium">Ticket ID</th>
                <th className="pb-4 font-medium">Event</th>
                <th className="pb-4 font-medium">Seat</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[1, 2, 3, 4, 5].map((item, i) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (i * 0.05) }}
                  key={i} 
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-4 font-mono text-sm">tkt_08{item}</td>
                  <td className="py-4">Neon Dreams Music Festival</td>
                  <td className="py-4 font-semibold text-white">B{item+4}</td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 bg-brand-500/20 text-brand-400 rounded-full text-xs font-medium border border-brand-500/20">
                      BOOKED
                    </span>
                  </td>
                  <td className="py-4 text-right text-gray-500 text-sm">{item * 2} mins ago</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
