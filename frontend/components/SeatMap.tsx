"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Ticket, Clock, Check, X, CreditCard } from 'lucide-react';
import { cn } from '../utils';

type TicketStatus = 'AVAILABLE' | 'PENDING' | 'BOOKED' | 'CANCELLED';

export interface TicketData {
  ticket_id: string;
  event_id: string;
  seat_number: string;
  price: number;
  status: TicketStatus;
}

interface SeatMapProps {
  eventId: string;
}

export default function SeatMap({ eventId }: SeatMapProps) {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<TicketData | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real API fetch using Render backend or local NGINX gateway
  useEffect(() => {
    async function fetchTickets() {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
      try {
        const res = await fetch(`${API_URL}/tickets/event/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.length === 0) {
            // Auto-generate tickets for this demo if none exist
            await fetch(`${API_URL}/tickets/generate?event_id=${eventId}&num_seats=100&base_price=80`, { method: 'POST' });
            const res2 = await fetch(`${API_URL}/tickets/event/${eventId}`);
            if (res2.ok) {
              setTickets(await res2.json());
            }
          } else {
            setTickets(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch tickets", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
    
    // Auto-refresh every 5 seconds to show locked/unlocked seats live
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, [eventId]);

  const handleSeatClick = (ticket: TicketData) => {
    if (ticket.status !== 'AVAILABLE') return;
    
    setSelectedSeat(ticket);
    setError(null);
  };

  const handleReserve = async () => {
    if (!selectedSeat) return;
    setIsReserving(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
      const res = await fetch(`${API_URL}/tickets/reserve/${selectedSeat.ticket_id}?user_id=demo_user_123`, {
        method: 'PUT'
      });
      
      if (res.ok) {
        router.push(`/booking/${selectedSeat.ticket_id}`);
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "Seat is no longer available");
        setIsReserving(false);
      }
    } catch (err) {
      setError("Failed to communicate with server");
      setIsReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-gray-400 font-medium">Loading seat map...</p>
      </div>
    );
  }

  // Group seats by row
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto items-start">
      {/* Seat Map Visualizer */}
      <div className="flex-1 glass-panel rounded-3xl p-8 relative overflow-hidden shadow-2xl w-full">
        {/* Stage Curved Div */}
        <div className="w-full flex justify-center mb-12 relative pointer-events-none select-none">
           <div className="absolute w-3/4 h-24 border-t-4 border-brand-500 rounded-[100%] blur-[1px]"></div>
           <div className="absolute w-3/4 h-32 bg-brand-500/10 rounded-[100%] blur-xl -top-10"></div>
           <p className="text-brand-100 font-bold uppercase tracking-[0.5em] text-sm pt-4 z-10">STAGE</p>
        </div>

        <div className="flex flex-col gap-3 items-center w-full overflow-x-auto pb-4 select-none">
          {rows.map((row) => (
            <div key={row} className="flex gap-2 lg:gap-3 items-center w-max">
              <span className="w-6 text-center text-gray-500 font-bold text-sm mr-2">{row}</span>
              {tickets
                .filter((t) => t.seat_number.startsWith(row))
                .sort((a, b) => parseInt(a.seat_number.substring(1)) - parseInt(b.seat_number.substring(1)))
                .map((ticket) => {
                  const isSelected = selectedSeat?.ticket_id === ticket.ticket_id;
                  const isAvailable = ticket.status === 'AVAILABLE';
                  const isPending = ticket.status === 'PENDING';
                  const isBooked = ticket.status === 'BOOKED';

                  return (
                    <motion.button
                      key={ticket.ticket_id}
                      whileHover={isAvailable ? { scale: 1.2, y: -2 } : {}}
                      whileTap={isAvailable ? { scale: 0.95 } : {}}
                      onClick={() => handleSeatClick(ticket)}
                      disabled={!isAvailable}
                      className={cn(
                        "w-8 h-8 md:w-10 md:h-10 rounded-t-lg rounded-b-sm font-semibold text-xs md:text-sm shadow-sm transition-colors duration-200 flex items-center justify-center border-b-[3px]",
                        isAvailable && !isSelected && "bg-gray-800/80 text-gray-300 border-green-500/50 hover:bg-gray-700 cursor-pointer",
                        isSelected && "bg-brand-600 shadow-[0_0_15px_rgba(37,99,235,0.6)] text-white border-brand-400",
                        isPending && "bg-yellow-600/30 text-yellow-500/50 border-yellow-600/50 cursor-not-allowed opacity-70",
                        isBooked && "bg-red-900/40 text-red-500/40 border-red-900/50 cursor-not-allowed opacity-50 relative overflow-hidden"
                      )}
                    >
                      {/* Cross for booked seats */}
                      {isBooked && <div className="absolute inset-0 flex items-center justify-center opacity-30"><X size={16} /></div>}
                      {isPending && <Clock size={14} className="opacity-50" />}
                      {(!isBooked && !isPending && isSelected) ? <Check size={16} /> : (!isBooked && !isPending && ticket.seat_number.substring(1))}
                    </motion.button>
                  );
                })}
              <span className="w-6 text-center text-gray-500 font-bold text-sm ml-2">{row}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mt-10 pt-6 border-t border-gray-800/50">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 rounded-t bg-gray-800 border-b-2 border-green-500/50"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 rounded-t bg-brand-600"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 rounded-t bg-yellow-600/30 border-b-2 border-yellow-600/50 flex items-center justify-center"><Clock size={10} className="text-yellow-500/50" /></div>
            <span>Reserved/Pending</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 rounded-t bg-red-900/40 border-b-2 border-red-900/50 flex items-center justify-center"><X size={10} className="text-red-500/50" /></div>
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Seat Details Sidebar */}
      <div className="w-full lg:w-96">
        <AnimatePresence mode="wait">
          {selectedSeat ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform duration-500 group-hover:scale-110"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Ticket className="text-brand-500" />
                    Seat Selected
                  </h3>
                  <button onClick={() => setSelectedSeat(null)} className="text-gray-400 hover:text-white transition">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl">
                    <span className="text-gray-400 text-sm font-medium">Seat Number</span>
                    <span className="text-2xl font-bold text-brand-400">{selectedSeat.seat_number}</span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl">
                    <span className="text-gray-400 text-sm font-medium">Price</span>
                    <span className="text-xl font-bold text-white">${selectedSeat.price.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-blue-200 bg-blue-900/20 p-4 rounded-xl border border-blue-800/30">
                     <Clock size={16} className="text-blue-400" />
                     <p>Seat will be locked for <b>5 minutes</b> upon reservation to complete payment.</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReserve}
                  disabled={isReserving}
                  className="w-full py-4 px-6 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-wait"
                >
                  {isReserving ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Reserve & Pay
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel rounded-2xl p-10 flex flex-col items-center justify-center text-center h-full min-h-[400px] border-dashed border-2 border-gray-800/50"
            >
              <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-6">
                <Ticket size={28} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a Seat</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                Click on any available seat on the interactive map to view details and proceed with booking.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
