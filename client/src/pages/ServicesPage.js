import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, AlertTriangle, ArrowRight, ShieldCheck, Star, Calendar } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';

// Service card images (served from public/images/services)
const imgCeilingFan = '/images/services/ceiling-fan.png';
const imgSmartPanel = '/images/services/smart-panel.png';
const imgEvCharger = '/images/services/ev-charger.png';
const imgWiringRepair = '/images/services/wiring-repair.png';
const imgLedLighting = '/images/services/led-lighting.png';
const imgThermostat = '/images/services/thermostat.png';
const imgOutdoorLighting = '/images/services/outdoor-lighting.png';
const imgSafetyInspection = '/images/services/safety-inspection.png';
const imgSurgeProtection = '/images/services/surge-protection.png';

const SEED_SERVICES = [
{
  _id: 's1',
  title: 'Ceiling Fan Installation & Setup',
  description: 'Expert assembly, mounting, wiring, and balancing of ceiling fans. Includes safe testing and switch alignment.',
  category: 'Installation',
  basePrice: 120,
  durationEstimateMinutes: 60,
  difficulty: 'standard',
  images: [imgCeilingFan]
},
{
  _id: 's2',
  title: 'Smart Panel Upgrade (200 Amp)',
  description: 'Replace obsolete or dangerous fuse boxes/panels with state-of-the-art breaker systems featuring remote mobile tracking.',
  category: 'Wiring',
  basePrice: 499,
  durationEstimateMinutes: 240,
  difficulty: 'complex',
  images: [imgSmartPanel]
},
{
  _id: 's3',
  title: 'EV Fast Charger Installation',
  description: 'Premium circuit setup and hardware mounting of high-power Level 2 electric vehicle chargers in residential garages.',
  category: 'Installation',
  basePrice: 299,
  durationEstimateMinutes: 120,
  difficulty: 'complex',
  images: [imgEvCharger]
},
{
  _id: 's4',
  title: 'Faulty Wiring Diagnosis & Repair',
  description: 'Full inspection of dead outlets, burning odors, flickering bulbs, and tripping breakers to ensure home safety.',
  category: 'Repair',
  basePrice: 95,
  durationEstimateMinutes: 90,
  difficulty: 'standard',
  images: [imgWiringRepair]
},
{
  _id: 's5',
  title: 'LED Recessed Lighting Setup',
  description: 'Layout and installation of modern, ultra-slim recessed LED downlights with dimmable switches for a sleek environment.',
  category: 'Installation',
  basePrice: 180,
  durationEstimateMinutes: 150,
  difficulty: 'standard',
  images: [imgLedLighting]
},
{
  _id: 's6',
  title: 'Smart Thermostat Integration',
  description: 'Secure installation and software integration of Nest, Ecobee, or Honeywell smart units with home network syncing.',
  category: 'Installation',
  basePrice: 85,
  durationEstimateMinutes: 45,
  difficulty: 'basic',
  images: [imgThermostat]
},
{
  _id: 's7',
  title: 'Outdoor Flood & Security Lighting',
  description: 'Weatherproof LED floodlights, motion sensors, and smart dusk-to-dawn controllers for perimeter protection.',
  category: 'Installation',
  basePrice: 210,
  durationEstimateMinutes: 90,
  difficulty: 'standard',
  images: [imgOutdoorLighting]
},
{
  _id: 's8',
  title: 'Electrical Safety Inspection',
  description: 'Comprehensive NFPA-compliant home audit covering outlets, grounding, panel load analysis, and AFCI protection.',
  category: 'Inspection',
  basePrice: 75,
  durationEstimateMinutes: 75,
  difficulty: 'basic',
  images: [imgSafetyInspection]
},
{
  _id: 's9',
  title: 'Whole-Home Surge Protection',
  description: 'Install whole-panel surge protectors to shield appliances, electronics, and HVAC from voltage spikes.',
  category: 'Wiring',
  basePrice: 185,
  durationEstimateMinutes: 60,
  difficulty: 'standard',
  images: [imgSurgeProtection]
}];

const getServiceImage = (service) => {
  const rawImg = typeof service.images?.[0] === 'object' ? service.images[0]?.secure_url : service.images?.[0];
  if (rawImg && typeof rawImg === 'string' && rawImg.startsWith('/images/services/')) {
    return rawImg;
  }
  const title = (service.title || '').toLowerCase();
  if (title.includes('ceiling fan')) return imgCeilingFan;
  if (title.includes('smart panel')) return imgSmartPanel;
  if (title.includes('ev') || title.includes('charger')) return imgEvCharger;
  if (title.includes('wiring') || title.includes('repair')) return imgWiringRepair;
  if (title.includes('recessed') || title.includes('led')) return imgLedLighting;
  if (title.includes('thermostat')) return imgThermostat;
  if (title.includes('outdoor') || title.includes('flood') || title.includes('security')) return imgOutdoorLighting;
  if (title.includes('inspection') || title.includes('safety')) return imgSafetyInspection;
  if (title.includes('surge') || title.includes('protection')) return imgSurgeProtection;
  return rawImg || imgWiringRepair;
};

export const ServicesPage = () => {
  const [services, setServices] = useState(SEED_SERVICES);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Booking Form State
  const [scheduledDate, setScheduledDate] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const datePickerRef = useRef(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await api.get('/services');
        if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          const uniqueItems = Array.from(
            new Map(
              response.data.data
                .filter((s) => s && s._id)
                .map((s) => [String(s._id), s])
            ).values()
          );
          setServices(uniqueItems);
        }
      } catch (err) {
        console.warn('API /services not seeded yet, utilizing high-fidelity seed data.', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleOpenBooking = (service) => {
    setSelectedService(service);
    setScheduledDate('');
    setStreet('');
    setCity('');
    setZipCode('');
    setNotes('');
    setBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setBookingModalOpen(false);
    setSelectedService(null);
    setScheduledDate('');
    setStreet('');
    setCity('');
    setZipCode('');
    setNotes('');
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!scheduledDate || !street || !city || !zipCode) {
      toast.error('Please fill in all required booking details');
      return;
    }

    setBookingLoading(true);
    try {
      let formattedDate = scheduledDate;
      const dateParts = scheduledDate.split('/');
      if (dateParts.length === 3) {
        const [dd, mm, yyyy] = dateParts;
        formattedDate = `${yyyy}-${mm}-${dd}`;
      }

      const payload = {
        serviceId: selectedService._id,
        scheduledDate: formattedDate,
        address: { street, city, zipCode, state: 'Staging' },
        totalPrice: selectedService.basePrice,
        notes
      };

      await api.post('/bookings', payload);
      toast.success(`Booking request for "${selectedService.title}" submitted successfully!`);
      handleCloseBooking();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking submission failed. Please sign in first.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Category Aggregator
  const categories = ['All', ...new Set(services.map((s) => s.category))];

  // Filtering Logic
  const filteredServices = services.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Deduplicate filtered services safely by stable database _id
  const uniqueServices = React.useMemo(() => {
    if (!filteredServices || !Array.isArray(filteredServices)) return [];
    return Array.from(
      new Map(
        filteredServices
          .filter((s) => s && s._id)
          .map((s) => [String(s._id), s])
      ).values()
    );
  }, [filteredServices]);

  return (/*#__PURE__*/
    React.createElement("div", { className: "py-12 bg-bg-secondary min-h-screen relative overflow-hidden" }, /*#__PURE__*/

    React.createElement("div", { className: "absolute top-0 right-[-10%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" }), /*#__PURE__*/
    React.createElement("div", { className: "absolute bottom-10 left-[-10%] w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[100px] pointer-events-none" }), /*#__PURE__*/

    React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" }, /*#__PURE__*/


    React.createElement("div", { className: "text-center max-w-3xl mx-auto mb-16" }, /*#__PURE__*/
    React.createElement(motion.h1, {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      className: "text-4xl sm:text-5xl font-extrabold tracking-tight" },
    "Home Services Catalog"

    ), /*#__PURE__*/
    React.createElement(motion.p, {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { delay: 0.2 },
      className: "text-text-muted mt-4 text-lg font-medium" },
    "Book premium-certified electrical solutions in seconds. Transparent baseline quotes, dedicated service slots, and certified local technicians."

    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "glass-card p-6 rounded-2xl mb-12 shadow-lg flex flex-col md:flex-row gap-6 justify-between items-center" }, /*#__PURE__*/


    React.createElement("div", { className: "relative w-full md:w-96" }, /*#__PURE__*/
    React.createElement("span", { className: "absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted pointer-events-none" }, /*#__PURE__*/
    React.createElement(Search, { size: 18 })
    ), /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      placeholder: "Search services (e.g. Smart panel, EV setup)...",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      className: "w-full bg-bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold" }
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "flex flex-wrap gap-2 w-full md:w-auto" },
    categories.map((cat) => /*#__PURE__*/
    React.createElement("button", {
      key: cat,
      onClick: () => setSelectedCategory(cat),
      className: `px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
      selectedCategory === cat ?
      'bg-primary text-white border-primary shadow-md shadow-primary/20' :
      'bg-bg-primary text-text-muted hover:text-text-main border-border'}` },

    cat
    )
    )
    )
    ), /*#__PURE__*/


    loading ? /*#__PURE__*/
    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" },
    Array.from({ length: 6 }).map((_, i) => /*#__PURE__*/
    React.createElement("div", { key: i, className: "glass-card p-6 rounded-2xl border border-border space-y-4 animate-pulse" }, /*#__PURE__*/
    React.createElement("div", { className: "h-48 bg-bg-secondary rounded-xl" }), /*#__PURE__*/
    React.createElement("div", { className: "h-6 bg-bg-secondary rounded w-3/4" }), /*#__PURE__*/
    React.createElement("div", { className: "h-4 bg-bg-secondary rounded w-full" }), /*#__PURE__*/
    React.createElement("div", { className: "h-10 bg-bg-secondary rounded-xl" })
    )
    )
    ) :
    uniqueServices.length === 0 ? /*#__PURE__*/
    React.createElement("div", { className: "text-center py-16 glass-card rounded-2xl border border-border" }, /*#__PURE__*/
    React.createElement(AlertTriangle, { size: 40, className: "mx-auto text-secondary mb-3" }), /*#__PURE__*/
    React.createElement("h3", { className: "text-lg font-bold text-text-main" }, "No Services Found"), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted text-xs font-medium mt-1" }, "Try broadening your search query or switching categories.")
    ) : /*#__PURE__*/

    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" },
    uniqueServices.map((service) => /*#__PURE__*/
    React.createElement(motion.div, {
      key: service._id,
      layout: true,
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      className: "glass-card bg-bg-primary rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-border flex flex-col justify-between group" }, /*#__PURE__*/

    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { className: "h-48 overflow-hidden relative bg-bg-secondary" }, /*#__PURE__*/
    React.createElement("img", {
      src: getServiceImage(service),
      alt: service.title,
      className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
      onError: (e) => { e.target.onerror = null; e.target.src = '/images/services/wiring-repair.png'; } }
    ), /*#__PURE__*/
    React.createElement("span", { className: "absolute top-3 left-3 bg-primary/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow" },
    service.category
    ), /*#__PURE__*/
    React.createElement("span", { className: "absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 border border-white/10" }, /*#__PURE__*/
    React.createElement(Clock, { size: 12, className: "text-secondary" }), " ~",
    service.durationEstimateMinutes || 60, " mins"
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "p-6" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center justify-between gap-2 mb-2" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-1 text-amber-500 font-extrabold text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20" }, /*#__PURE__*/
    React.createElement(Star, { size: 12, className: "fill-amber-400 text-amber-400" }), " 4.8\u2605 (42 ratings)"
    ), /*#__PURE__*/
    React.createElement("span", { className: "text-[10px] font-extrabold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/20" },
    service.difficulty || 'Standard'
    )
    ), /*#__PURE__*/

    React.createElement("h3", { className: "text-lg font-extrabold text-text-main group-hover:text-primary transition-colors" },
    service.title
    ), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted text-xs font-semibold mt-2 line-clamp-3 leading-relaxed" },
    service.description
    )
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "p-6 pt-0 space-y-4" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center justify-between pt-4 border-t border-border/60" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("span", { className: "text-[11px] font-bold text-text-muted block uppercase" }, "Starting At"), /*#__PURE__*/
    React.createElement("span", { className: "text-xl font-black text-text-main" }, formatINR(service.basePrice))
    ), /*#__PURE__*/
    React.createElement("span", { className: "text-[10px] font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20" }, "Insured Work"

    )
    ), /*#__PURE__*/

    React.createElement("button", {
      onClick: () => handleOpenBooking(service),
      className: "w-full py-3 bg-bg-primary hover:bg-primary hover:text-white border border-border group-hover:border-primary transition-all text-xs font-bold rounded-xl flex items-center justify-center gap-2" }, /*#__PURE__*/

    React.createElement("span", null, "Schedule Dynamic Visit"), " ", /*#__PURE__*/React.createElement(ArrowRight, { size: 14 })
    )
    )
    )
    )
    ),



    bookingModalOpen && selectedService && /*#__PURE__*/
    React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4" }, /*#__PURE__*/
    React.createElement("div", { className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm", onClick: handleCloseBooking }), /*#__PURE__*/

    React.createElement(motion.div, {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      className: "glass-card bg-bg-primary max-w-lg w-full rounded-2xl shadow-2xl p-6 relative z-10 border border-border overflow-y-auto max-h-[90vh]" }, /*#__PURE__*/

    React.createElement("div", { className: "mb-6 flex justify-between items-start" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("span", { className: "text-xs font-bold text-primary uppercase tracking-wider" }, "New Reservation"), /*#__PURE__*/
    React.createElement("h3", { className: "text-xl font-extrabold mt-1" }, selectedService.title)
    ), /*#__PURE__*/
    React.createElement("button", {
      onClick: handleCloseBooking,
      className: "p-1 rounded-lg hover:bg-bg-secondary text-text-muted text-xs font-bold" },
    "✕"

    )
    ), /*#__PURE__*/

    React.createElement("form", { onSubmit: handleCreateBooking, className: "space-y-4" }, /*#__PURE__*/

    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-1" }, "Target Date *"), /*#__PURE__*/
    React.createElement("div", { className: "relative" }, /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      required: true,
      placeholder: "DD/MM/YYYY",
      value: scheduledDate,
      onChange: (e) => setScheduledDate(e.target.value),
      className: "w-full bg-bg-secondary border border-border rounded-xl p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold text-text-main" }
    ), /*#__PURE__*/
    React.createElement("button", {
      type: "button",
      onClick: () => {
        if (datePickerRef.current) {
          if (typeof datePickerRef.current.showPicker === 'function') {
            datePickerRef.current.showPicker();
          } else {
            datePickerRef.current.click();
          }
        }
      },
      className: "absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary-light transition-colors p-1" }, /*#__PURE__*/
    React.createElement(Calendar, { size: 18 })
    ), /*#__PURE__*/
    React.createElement("input", {
      ref: datePickerRef,
      type: "date",
      tabIndex: -1,
      className: "sr-only absolute pointer-events-none opacity-0 invisible",
      onChange: (e) => {
        if (e.target.value) {
          const [yyyy, mm, dd] = e.target.value.split('-');
          if (yyyy && mm && dd) {
            setScheduledDate(`${dd}/${mm}/${yyyy}`);
          }
        }
      }
    })
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "grid grid-cols-2 gap-4" }, /*#__PURE__*/
    React.createElement("div", { className: "col-span-2" }, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-1" }, "Street Address *"), /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      required: true,
      placeholder: "Mira Madhav Residency",
      value: street,
      onChange: (e) => setStreet(e.target.value),
      className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold" }
    )
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-1" }, "City *"), /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      required: true,
      placeholder: "Ankleshwar",
      value: city,
      onChange: (e) => setCity(e.target.value),
      className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold" }
    )
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-1" }, "ZIP Code *"), /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      required: true,
      placeholder: "393002",
      value: zipCode,
      onChange: (e) => setZipCode(e.target.value),
      className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold" }
    )
    )
    ), /*#__PURE__*/

    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-bold text-text-muted uppercase mb-1" }, "Special Instructions / Fault Symptoms"), /*#__PURE__*/
    React.createElement("textarea", {
      placeholder: "e.g. Ceiling high switch broken, smells like burnt wire when fan runs...",
      rows: "3",
      value: notes,
      onChange: (e) => setNotes(e.target.value),
      className: "w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold" }
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "bg-primary/5 rounded-xl p-4 border border-primary/10 flex justify-between items-center text-xs" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("p", { className: "font-bold text-text-muted uppercase" }, "Estimated Baseline Price"), /*#__PURE__*/
    React.createElement("p", { className: "text-lg font-black text-text-main mt-0.5" }, formatINR(selectedService.basePrice))
    ), /*#__PURE__*/
    React.createElement("div", { className: "text-right font-medium text-text-muted" }, /*#__PURE__*/
    React.createElement("span", { className: "flex items-center gap-1" }, /*#__PURE__*/React.createElement(ShieldCheck, { size: 14, className: "text-green-500" }), " Insured Work"), /*#__PURE__*/
    React.createElement("span", { className: "block text-[10px]" }, "Tax calculated during service completion")
    )
    ), /*#__PURE__*/

    React.createElement("button", {
      type: "submit",
      disabled: bookingLoading,
      className: "w-full bg-primary hover:bg-primary-light text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all text-sm disabled:opacity-50" },

    bookingLoading ? 'Submitting Reservation...' : 'Confirm Booking Order'
    )
    )
    )
    )


    )
    ));

};
export default ServicesPage;