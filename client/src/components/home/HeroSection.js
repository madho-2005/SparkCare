import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Star, Wrench } from 'lucide-react';
import { formatINR } from '../../utils/currency';

export const HeroSection = () => {
  const [selectedService, setSelectedService] = useState('panel');

  const mockEstimates = {
    panel: { name: 'Smart Panel Upgrade', price: 499, duration: '3-4 hrs', icon: ShieldCheck },
    ev: { name: 'EV Charger Installation', price: 299, duration: '2 hrs', icon: Zap },
    lighting: { name: 'Custom Lighting Setup', price: 180, duration: '1.5 hrs', icon: Sparkles }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const floatVariants = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (/*#__PURE__*/
    React.createElement("section", { className: "relative overflow-hidden pt-16 pb-24 md:py-32 bg-gradient-to-b from-bg-primary via-bg-secondary/40 to-bg-primary transition-colors duration-300" }, /*#__PURE__*/

    React.createElement("div", { className: "absolute top-[-5%] left-[-5%] w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none animate-pulse", style: { animationDuration: '6s' } }), /*#__PURE__*/
    React.createElement("div", { className: "absolute bottom-[15%] right-[-5%] w-[450px] h-[450px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" }), /*#__PURE__*/

    React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" }, /*#__PURE__*/
    React.createElement("div", { className: "grid lg:grid-cols-12 gap-12 lg:gap-8 items-center" }, /*#__PURE__*/


    React.createElement(motion.div, {
      variants: containerVariants,
      initial: "hidden",
      animate: "visible",
      className: "lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start" }, /*#__PURE__*/


    React.createElement(motion.div, {
      variants: itemVariants,
      className: "inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 py-1.5 px-4 rounded-full text-xs font-black uppercase tracking-wider mb-6 border border-amber-500/20 shadow-sm" }, /*#__PURE__*/

    React.createElement(Zap, { size: 14, className: "animate-bounce" }), " Ready 24/7 to Help with Any Electrical Issue"
    ), /*#__PURE__*/


    React.createElement(motion.h1, {
      variants: itemVariants,
      className: "text-4xl sm:text-6xl font-black tracking-tight max-w-2xl text-text-main leading-none font-heading" },
    "Safe & Reliable ", /*#__PURE__*/
    React.createElement("br", { className: "hidden sm:inline" }), "Local Electricians for ", /*#__PURE__*/
    React.createElement("span", { className: "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent" }, "Your Home")
    ), /*#__PURE__*/


    React.createElement(motion.p, {
      variants: itemVariants,
      className: "text-sm sm:text-base text-text-muted mt-6 max-w-xl font-medium leading-relaxed" },
    "Book qualified local electricians instantly with simple, upfront pricing. You can also shop our selected smart home panels, safety switches, and wall outlets."

    ), /*#__PURE__*/


    React.createElement(motion.div, {
      variants: itemVariants,
      className: "flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto" }, /*#__PURE__*/

    React.createElement(Link, {
      to: "/services",
      className: "flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black px-8 py-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-xs uppercase tracking-wider" },
    "Book Electrician ", /*#__PURE__*/
    React.createElement(Wrench, { size: 14 })
    ), /*#__PURE__*/
    React.createElement(Link, {
      to: "/products",
      className: "flex items-center justify-center gap-2 border border-border bg-bg-primary/80 hover:bg-bg-secondary font-black px-8 py-4 rounded-xl transition-all text-xs uppercase tracking-wider glass-card" },
    "Shop Hardware"

    )
    ), /*#__PURE__*/


    React.createElement(motion.div, {
      variants: itemVariants,
      className: "grid grid-cols-3 gap-6 sm:gap-10 mt-12 pt-8 border-t border-border/80 w-full text-left" }, /*#__PURE__*/

    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h3", { className: "text-2xl sm:text-3xl font-black text-text-main" }, "100%"), /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] text-text-muted font-extrabold mt-1 uppercase tracking-wider" }, "Safety Certified")
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h3", { className: "text-2xl sm:text-3xl font-black text-text-main flex items-center gap-1" }, "4.9 ", /*#__PURE__*/
    React.createElement(Star, { size: 18, className: "fill-amber-400 text-amber-400" })
    ), /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] text-text-muted font-extrabold mt-1 uppercase tracking-wider" }, "Happy Customers")
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h3", { className: "text-2xl sm:text-3xl font-black text-text-main" }, "24 min"), /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] text-text-muted font-extrabold mt-1 uppercase tracking-wider" }, "Average Arrival")
    )
    )
    ), /*#__PURE__*/


    React.createElement(motion.div, {
      initial: { opacity: 0, x: 25 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.6, delay: 0.2 },
      className: "lg:col-span-5 relative w-full flex justify-center mt-8 lg:mt-0" }, /*#__PURE__*/


    React.createElement("div", { className: "absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-primary/10 rounded-3xl blur-[40px] pointer-events-none" }), /*#__PURE__*/


    React.createElement("div", { className: "glass-card p-6 md:p-8 rounded-3xl w-full max-w-md border border-border shadow-2xl relative z-10 flex flex-col gap-6 bg-bg-primary/90" }, /*#__PURE__*/

    React.createElement("div", { className: "flex justify-between items-center pb-4 border-b border-border/80" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-2" }, /*#__PURE__*/
    React.createElement("div", { className: "w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" }), /*#__PURE__*/
    React.createElement("span", { className: "text-[10px] font-black text-text-muted uppercase tracking-wider" }, "Instant Price Calculator")
    ), /*#__PURE__*/
    React.createElement("div", { className: "text-[9px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 py-1 px-3 rounded-full border border-amber-500/20" }, "Fixed Upfront Price")
    ), /*#__PURE__*/


    React.createElement("div", { className: "flex flex-col gap-3" }, /*#__PURE__*/
    React.createElement("label", { className: "text-[10px] font-black text-text-muted uppercase tracking-wider" }, "Choose Your Service"), /*#__PURE__*/
    React.createElement("div", { className: "grid grid-cols-3 gap-2" },
    Object.keys(mockEstimates).map((key) => /*#__PURE__*/
    React.createElement("button", {
      key: key,
      onClick: () => setSelectedService(key),
      className: `py-2 px-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all duration-200 cursor-pointer ${
      selectedService === key ?
      'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm shadow-amber-500/10' :
      'border-border bg-bg-secondary/40 text-text-muted hover:bg-bg-secondary hover:text-text-main'}` },


    key === 'panel' ? 'Panel Upgrade' : key === 'ev' ? 'EV Charger' : 'Custom Lights'
    )
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "bg-bg-secondary/40 border border-border/80 p-5 rounded-2xl flex flex-col gap-4" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-3" }, /*#__PURE__*/
    React.createElement("div", { className: "w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0" }, /*#__PURE__*/
    React.createElement(mockEstimates[selectedService].icon, { size: 18 })
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h4", { className: "text-xs font-black text-text-main uppercase tracking-wider" }, mockEstimates[selectedService].name), /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] text-text-muted font-bold mt-0.5" }, "How long it takes: ", mockEstimates[selectedService].duration)
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "flex items-end justify-between border-t border-border/60 pt-3" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("span", { className: "text-[9px] font-black text-text-muted uppercase tracking-wider" }, "Estimated Price"), /*#__PURE__*/
    React.createElement("h3", { className: "text-xl font-black text-text-main mt-0.5" }, formatINR(mockEstimates[selectedService].price))
    ), /*#__PURE__*/
    React.createElement(Link, {
      to: "/services",
      className: "flex items-center gap-1 text-[10px] font-black text-amber-500 hover:text-amber-600 transition-colors uppercase tracking-wider" },
    "Book Appointment ", /*#__PURE__*/
    React.createElement(ArrowRight, { size: 12 })
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider" }, /*#__PURE__*/
    React.createElement(ShieldCheck, { size: 16, className: "shrink-0" }), /*#__PURE__*/
    React.createElement("span", null, "Our Electrician Can Arrive in ", /*#__PURE__*/React.createElement("strong", null, "24 Mins"))
    )
    ), /*#__PURE__*/


    React.createElement(motion.div, {
      variants: floatVariants,
      animate: "animate",
      className: "absolute top-[-20px] right-[-10px] hidden sm:flex items-center gap-2 bg-bg-primary text-text-main py-2 px-3 rounded-xl shadow-lg border border-border z-20" }, /*#__PURE__*/

    React.createElement("div", { className: "w-2 h-2 rounded-full bg-red-500 animate-ping" }), /*#__PURE__*/
    React.createElement("span", { className: "text-[9px] font-black uppercase tracking-wider" }, "Emergency Help Ready")
    ), /*#__PURE__*/

    React.createElement(motion.div, {
      variants: floatVariants,
      animate: "animate",
      className: "absolute bottom-[-15px] left-[-15px] hidden sm:flex items-center gap-2 bg-bg-primary text-text-main py-2 px-3 rounded-xl shadow-lg border border-border z-20",
      style: { animationDelay: '1.2s' } }, /*#__PURE__*/

    React.createElement(Zap, { size: 12, className: "text-amber-500 animate-pulse" }), /*#__PURE__*/
    React.createElement("span", { className: "text-[9px] font-black uppercase tracking-wider" }, "Fully Certified for Safety")
    )

    )

    )
    )
    ));

};
export default HeroSection;