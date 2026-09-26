import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, MapPin, XCircle, Truck, Play } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';

export const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings');
      if (response.data?.data) {
        setBookings(response.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const response = await api.get('/bookings');
        if (active && response.data?.data) {
          setBookings(response.data.data);
        }
      } catch (err) {
        if (active) {
          toast.error(err.response?.data?.message || 'Failed to fetch bookings');
          setBookings([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleUpdateStatus = async (bookingId, nextStatus) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: nextStatus });
      toast.success(`Booking status changed to ${nextStatus.replace('_', ' ')}!`);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Manage Home Bookings</h1>
        <p className="text-text-muted mt-2 font-semibold">
          Review scheduled service appointments, update progress milestones, and manage customer booking fulfillments.
        </p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-border shadow-lg">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-center text-text-muted py-10 font-bold">No active booking logs registered.</p>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <motion.div
                key={booking._id}
                className="p-5 rounded-xl border border-border bg-bg-primary/40 hover:bg-bg-primary/80 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
              >
                <div className="space-y-2 max-w-lg">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-md">
                      {booking.service?.title || 'Home Electrical Service'}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        booking.paymentStatus === 'paid'
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}
                    >
                      Payment: {booking.paymentStatus}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold tracking-tight">
                    Customer: {booking.customer?.name} ({booking.customer?.phoneNumber || booking.customer?.email})
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-primary" />
                      {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'TBD'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-primary" />
                      {booking.timeSlot || 'Standard Slot'}
                    </span>
                    {booking.address && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-primary" />
                        {booking.address.street}, {booking.address.city}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 flex items-center gap-4 text-xs font-bold text-text-muted">
                    <span className="text-text-main font-black">Fee: {formatINR(booking.totalPrice)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                  {booking.bookingStatus === 'scheduled' && (
                    <button
                      onClick={() => handleUpdateStatus(booking._id, 'in_transit')}
                      className="px-3 py-2 text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 text-indigo-500 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Truck size={14} /> Dispatch Service
                    </button>
                  )}

                  {booking.bookingStatus === 'in_transit' && (
                    <button
                      onClick={() => handleUpdateStatus(booking._id, 'in_progress')}
                      className="px-3 py-2 text-xs font-bold bg-amber-500/10 hover:bg-amber-500 hover:text-white border border-amber-500/20 text-amber-500 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play size={14} /> Mark Active
                    </button>
                  )}

                  {booking.bookingStatus === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(booking._id, 'completed')}
                      className="px-3 py-2 text-xs font-bold bg-green-500/10 hover:bg-green-500 hover:text-white border border-green-500/20 text-green-500 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle size={14} /> Complete Job
                    </button>
                  )}

                  {!['completed', 'cancelled'].includes(booking.bookingStatus) && (
                    <button
                      onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                      className="px-3 py-2 text-xs font-bold bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  )}

                  <span className="px-3.5 py-2 text-xs font-black uppercase rounded-xl bg-bg-secondary border border-border">
                    {booking.bookingStatus?.replace('_', ' ')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;