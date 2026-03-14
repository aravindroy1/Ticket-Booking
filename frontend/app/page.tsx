"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Ticket, ChevronRight } from 'lucide-react';
import SeatMap from './components/SeatMap';

// Sample events data
const EVENTS = [
  {
    id: "evt_001",
    title: "Neon Dreams Music Festival",
    date: "Dec 31, 2026",
    location: "Cyber Arena, Neo Tokyo",
    imageUrl: "https://images.unsplash.com/photo-1540039155732-6a7105cb5cd7?q=80&w=1000&auto=format&fit=crop",
    availableSeats: 450,
    tags: ["Music", "Electronic"]
  },
  {
    id: "evt_002",
    title: "Global Tech Summit 2027",
    date: "Jan 15, 2027",
    location: "Convention Center, SF",
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1000&auto=format&fit=crop",
    availableSeats: 120,
    tags: ["Conference", "Technology"]
  }
];

export default function Home() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  return (
    <div className="animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <header className="flex justify-between items-center py-6 mb-12 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center">
            <Ticket className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">TixFlow<span className="text-brand-500">.</span></h1>
        </div>
        <nav className="flex gap-6">
          <a href="/admin" className="text-sm text-gray-400 hover:text-white transition">Admin Dashboard</a>
        </nav>
      </header>

      {!selectedEventId ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          <div className="max-w-3xl">
            <h2 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
              Discover & Book <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-500">Amazing Events</span>
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
              Experience the next generation of event ticketing. Fast reservations, secure matching, and interactive digital seat maps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
            {EVENTS.map((event) => (
              <motion.div
                key={event.id}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedEventId(event.id)}
                className="glass-panel group rounded-3xl overflow-hidden cursor-pointer flex flex-col"
              >
                <div className="h-48 relative overflow-hidden bg-gray-900">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                  <img src={event.imageUrl} alt={event.title} className="object-cover w-full h-full opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
                  <div className="absolute top-4 right-4 z-20 flex gap-2">
                    {event.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-brand-400 transition-colors">{event.title}</h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-400 text-sm gap-3">
                        <Calendar size={18} className="text-brand-500/70" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center text-gray-400 text-sm gap-3">
                        <MapPin size={18} className="text-brand-500/70" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-400 text-sm gap-3">
                        <Users size={18} className="text-brand-500/70" />
                        <span>{event.availableSeats} tickets available</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-brand-400 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-brand-400 group-hover:after:w-full after:transition-all after:duration-300">
                      View Seat Map
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-600 transition-colors">
                      <ChevronRight size={20} className="text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <button 
            onClick={() => setSelectedEventId(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition px-4 py-2 rounded-full hover:bg-white/5"
          >
            ← Back to Events
          </button>
          
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{EVENTS.find(e => e.id === selectedEventId)?.title}</h2>
              <p className="text-brand-400 flex items-center gap-2">
                <MapPin size={16} /> {EVENTS.find(e => e.id === selectedEventId)?.location}
              </p>
            </div>
          </div>

          <SeatMap eventId={selectedEventId} />
        </motion.div>
      )}
    </div>
  );
}
