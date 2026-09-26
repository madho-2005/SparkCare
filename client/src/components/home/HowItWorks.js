import React from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick, Calendar, Truck, CheckCircle2 } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
  {
    step: '01',
    title: 'Choose Service or Parts',
    description: 'Choose the electrical service you need or buy parts and hardware directly.',
    icon: MousePointerClick,
    color: 'text-amber-500 border-amber-500/30 bg-amber-500/5 group-hover:border-amber-500 group-hover:bg-amber-500/10'
  },
  {
    step: '02',
    title: 'Pick a Time & Pay',
    description: 'Choose a convenient date and time for your visit, or check out online securely.',
    icon: Calendar,
    color: 'text-primary border-primary/30 bg-primary/5 group-hover:border-primary group-hover:bg-primary/10'
  },
  {
    step: '03',
    title: 'Electrician Arrives',
    description: 'A licensed, background-checked local electrician arrives at your door with all the right tools.',
    icon: Truck,
    color: 'text-red-500 border-red-500/30 bg-red-500/5 group-hover:border-red-500 group-hover:bg-red-500/10'
  },
  {
    step: '04',
    title: 'Job Done & Certified',
    description: 'Check the completed work, pay the agreed price, and enjoy your 1-year warranty.',
    icon: CheckCircle2,
    color: 'text-green-500 border-green-500/30 bg-green-500/5 group-hover:border-green-500 group-hover:bg-green-500/10'
  }];


  return (/*#__PURE__*/
    React.createElement("section", { className: "py-20 bg-bg-primary relative overflow-hidden" }, /*#__PURE__*/

    React.createElement("div", { className: "absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" }), /*#__PURE__*/

    React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" }, /*#__PURE__*/


    React.createElement("div", { className: "text-center max-w-3xl mx-auto mb-20" }, /*#__PURE__*/
    React.createElement("div", { className: "inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-amber-500/20" }, "How it Works"

    ), /*#__PURE__*/
    React.createElement("h2", { className: "text-3xl sm:text-4xl font-black text-text-main font-heading" }, "Easy Booking in ", /*#__PURE__*/
    React.createElement("span", { className: "bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent" }, "Four Simple Steps")
    ), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted mt-4 font-semibold text-xs sm:text-sm leading-relaxed" }, "From booking an electrician to buying wall switches, we make everything quick and simple."

    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "relative" }, /*#__PURE__*/


    React.createElement("div", { className: "absolute top-[48px] left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-amber-500/30 hidden lg:block pointer-events-none z-0" }), /*#__PURE__*/


    React.createElement("div", { className: "grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10" },
    steps.map((step, i) => {
      const IconComponent = step.icon;
      return (/*#__PURE__*/
        React.createElement(motion.div, {
          key: i,
          initial: { opacity: 0, y: 15 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-50px" },
          transition: { delay: i * 0.08, duration: 0.45 },
          className: "flex flex-col items-center text-center group" }, /*#__PURE__*/



        React.createElement("div", { className: `w-24 h-24 rounded-full border flex items-center justify-center relative mb-6 transition-all duration-300 ${step.color}` }, /*#__PURE__*/
        React.createElement(IconComponent, { size: 28, className: "transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" }), /*#__PURE__*/


        React.createElement("span", { className: "absolute bottom-[-4px] right-[-4px] w-8 h-8 rounded-full bg-text-main text-bg-primary text-xs font-black flex items-center justify-center border border-border group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm" },
        step.step
        )
        ), /*#__PURE__*/


        React.createElement("div", { className: "max-w-xs" }, /*#__PURE__*/
        React.createElement("h3", { className: "text-base font-black text-text-main group-hover:text-amber-500 transition-colors uppercase tracking-tight" },
        step.title
        ), /*#__PURE__*/
        React.createElement("p", { className: "text-xs text-text-muted font-semibold mt-2.5 leading-relaxed" },
        step.description
        )
        )

        ));

    })
    )

    )

    )
    ));

};
export default HowItWorks;