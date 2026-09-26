import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Zap, CheckCircle } from 'lucide-react';

export const WhyChooseUs = () => {
  const cards = [
  {
    title: 'Trusted & Licensed',
    description: "Every electrician is fully licensed, insured, and background-checked so you know your home is in safe hands.",
    icon: ShieldCheck,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10'
  },
  {
    title: 'No Hidden Fees',
    description: "See the exact cost before we start. No surprise hourly rates, extra fees, or hidden charges.",
    icon: Award,
    color: 'bg-primary/10 text-primary border-primary/10'
  },
  {
    title: 'Fast Emergency Help',
    description: "Have sparks or a power outage? We will send the nearest electrician to your door in minutes.",
    icon: Zap,
    color: 'bg-red-500/10 text-red-500 border-red-500/10 animate-pulse'
  },
  {
    title: '1-Year Warranty',
    description: "We stand by our work. Every repair and smart home installation comes with a full 1-year warranty.",
    icon: CheckCircle,
    color: 'bg-green-500/10 text-green-500 border-green-500/10'
  }];


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" }
    }
  };

  return (/*#__PURE__*/
    React.createElement("section", { className: "py-20 bg-bg-secondary/30 relative overflow-hidden" }, /*#__PURE__*/

    React.createElement("div", { className: "absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-[550px] h-[550px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" }), /*#__PURE__*/

    React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" }, /*#__PURE__*/


    React.createElement("div", { className: "text-center max-w-3xl mx-auto mb-16" }, /*#__PURE__*/
    React.createElement("div", { className: "inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-amber-500/20" }, "Safety Guaranteed"

    ), /*#__PURE__*/
    React.createElement("h2", { className: "text-3xl sm:text-4xl font-black text-text-main font-heading" }, "Carefully Checked Experts for ", /*#__PURE__*/
    React.createElement("span", { className: "bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent" }, "a Safe & Reliable Home")
    ), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted mt-4 font-semibold text-xs sm:text-sm leading-relaxed" }, "We make home electrical services stress-free by offering vetted experts, clear upfront pricing, and a full 1-year warranty."

    )
    ), /*#__PURE__*/


    React.createElement(motion.div, {
      variants: containerVariants,
      initial: "hidden",
      whileInView: "visible",
      viewport: { once: true, margin: "-100px" },
      className: "grid md:grid-cols-2 lg:grid-cols-4 gap-8" },

    cards.map((card, i) => {
      const IconComponent = card.icon;
      return (/*#__PURE__*/
        React.createElement(motion.div, {
          key: i,
          variants: itemVariants,
          whileHover: { scale: 1.02, y: -4, transition: { duration: 0.15 } },
          className: "glass-card p-6 md:p-8 rounded-3xl border border-border bg-bg-primary/70 flex flex-col gap-5 hover:shadow-xl transition-all duration-300 relative overflow-hidden group" }, /*#__PURE__*/


        React.createElement("div", { className: "absolute bottom-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" }), /*#__PURE__*/

        React.createElement("div", { className: `w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${card.color}` }, /*#__PURE__*/
        React.createElement(IconComponent, { size: 22 })
        ), /*#__PURE__*/

        React.createElement("div", { className: "flex flex-col gap-2" }, /*#__PURE__*/
        React.createElement("h3", { className: "text-base font-black text-text-main group-hover:text-amber-500 transition-colors uppercase tracking-tight" },
        card.title
        ), /*#__PURE__*/
        React.createElement("p", { className: "text-xs text-text-muted font-semibold leading-relaxed" },
        card.description
        )
        )
        ));

    })
    ), /*#__PURE__*/


    React.createElement("div", { className: "mt-16 bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-4 text-left" }, /*#__PURE__*/
    React.createElement("div", { className: "w-12 h-12 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0" }, /*#__PURE__*/
    React.createElement(ShieldCheck, { size: 24 })
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h4", { className: "text-xs sm:text-sm font-black uppercase text-text-main tracking-wider" }, "Safety Code Guarantee"), /*#__PURE__*/
    React.createElement("p", { className: "text-xxs sm:text-xs text-text-muted font-semibold mt-1" }, "Every job is done to the highest safety standards and local electrical rules.")
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "text-[10px] font-black bg-bg-primary border border-border py-2.5 px-6 rounded-xl shrink-0 shadow-sm text-text-main uppercase tracking-wider" }, "Licensed, Bonded & Insured"

    )
    )

    )
    ));

};
export default WhyChooseUs;