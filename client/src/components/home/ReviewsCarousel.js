import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote, ShieldCheck } from 'lucide-react';

const REVIEWS = [
{
  name: 'Sarah Mitchell',
  role: 'Homeowner',
  review: 'SparkCare replaced my old fuse panel in under 4 hours. The pricing was completely upfront, and the electrician was extremely friendly and explained everything in simple words.',
  rating: 5,
  image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80'
},
{
  name: 'James Reynolds',
  role: 'Real Estate Developer',
  review: 'Outstanding response! We had an emergency outage in our warehouse. They sent an electrician to our door in 30 minutes, and he fixed the issue right away.',
  rating: 5,
  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
},
{
  name: 'Clara Thompson',
  role: 'Property Manager',
  review: 'SparkCare is my favorite service now. It has easy online booking, background-checked electricians, and clear invoices.',
  rating: 5,
  image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80'
}];


export const ReviewsCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const timerRef = useRef(null);

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => prev === 0 ? REVIEWS.length - 1 : prev - 1);
  };

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => prev === REVIEWS.length - 1 ? 0 : prev + 1);
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      handleNext();
    }, 6000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [activeIndex]);

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.35, ease: "easeOut" }
    },
    exit: (dir) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      transition: { duration: 0.25, ease: "easeIn" }
    })
  };

  return (/*#__PURE__*/
    React.createElement("section", { className: "py-20 bg-bg-secondary/40 border-t border-border/40 relative overflow-hidden" }, /*#__PURE__*/

    React.createElement("div", { className: "absolute top-10 left-[5%] w-[320px] h-[320px] rounded-full bg-amber-500/5 blur-[90px] pointer-events-none" }), /*#__PURE__*/

    React.createElement("div", { className: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" }, /*#__PURE__*/


    React.createElement("div", { className: "text-center max-w-3xl mx-auto mb-16" }, /*#__PURE__*/
    React.createElement("div", { className: "inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-amber-500/20" }, "Customer Reviews"

    ), /*#__PURE__*/
    React.createElement("h2", { className: "text-3xl sm:text-4xl font-black text-text-main font-heading" }, "What People Say ", /*#__PURE__*/
    React.createElement("span", { className: "bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent" }, "About SparkCare")
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "relative min-h-[320px] md:min-h-[260px] flex items-center justify-center" }, /*#__PURE__*/


    React.createElement("button", {
      onClick: handlePrev,
      className: "absolute left-[-10px] md:left-[-60px] p-3 rounded-full border border-border bg-bg-primary hover:bg-bg-secondary text-text-muted hover:text-text-main transition-all shadow-md z-20 cursor-pointer active:scale-95",
      "aria-label": "Previous review" }, /*#__PURE__*/

    React.createElement(ChevronLeft, { size: 18 })
    ), /*#__PURE__*/


    React.createElement("div", { className: "w-full max-w-3xl overflow-hidden py-4 px-2" }, /*#__PURE__*/
    React.createElement(AnimatePresence, { initial: false, custom: direction, mode: "wait" }, /*#__PURE__*/
    React.createElement(motion.div, {
      key: activeIndex,
      custom: direction,
      variants: slideVariants,
      initial: "enter",
      animate: "center",
      exit: "exit",
      className: "glass-card p-6 md:p-10 rounded-3xl border border-border bg-bg-primary/90 shadow-lg flex flex-col md:flex-row gap-6 md:gap-8 items-center relative overflow-hidden" }, /*#__PURE__*/


    React.createElement(Quote, { size: 100, className: "absolute right-4 bottom-[-15px] text-text-muted/5 pointer-events-none" }), /*#__PURE__*/


    React.createElement("div", { className: "w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-amber-500/20 overflow-hidden shrink-0 shadow-md" }, /*#__PURE__*/
    React.createElement("img", {
      src: REVIEWS[activeIndex].image,
      alt: REVIEWS[activeIndex].name,
      className: "w-full h-full object-cover" }
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "flex flex-col gap-3 text-center md:text-left" }, /*#__PURE__*/


    React.createElement("div", { className: "flex gap-1 justify-center md:justify-start" },
    [...Array(REVIEWS[activeIndex].rating)].map((_, i) => /*#__PURE__*/
    React.createElement(Star, { key: i, size: 15, className: "fill-amber-400 text-amber-400" })
    )
    ), /*#__PURE__*/


    React.createElement("p", { className: "text-sm md:text-base font-semibold text-text-main leading-relaxed italic" }, "\"",
    REVIEWS[activeIndex].review, "\""
    ), /*#__PURE__*/


    React.createElement("div", { className: "mt-2 flex items-center justify-center md:justify-start gap-2" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h4", { className: "text-sm font-black uppercase text-text-main tracking-tight" }, REVIEWS[activeIndex].name), /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] text-text-muted font-extrabold tracking-wider uppercase mt-0.5" }, REVIEWS[activeIndex].role)
    ), /*#__PURE__*/
    React.createElement("span", { className: "inline-flex items-center gap-0.5 text-[8px] font-black uppercase tracking-wider text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 py-0.5 px-2 rounded-md" }, /*#__PURE__*/
    React.createElement(ShieldCheck, { size: 10 }), " Verified"
    )
    )

    )

    )
    )
    ), /*#__PURE__*/


    React.createElement("button", {
      onClick: handleNext,
      className: "absolute right-[-10px] md:right-[-60px] p-3 rounded-full border border-border bg-bg-primary hover:bg-bg-secondary text-text-muted hover:text-text-main transition-all shadow-md z-20 cursor-pointer active:scale-95",
      "aria-label": "Next review" }, /*#__PURE__*/

    React.createElement(ChevronRight, { size: 18 })
    )

    ), /*#__PURE__*/


    React.createElement("div", { className: "flex justify-center gap-2 mt-8" },
    REVIEWS.map((_, i) => /*#__PURE__*/
    React.createElement("button", {
      key: i,
      onClick: () => {
        setDirection(i > activeIndex ? 1 : -1);
        setActiveIndex(i);
      },
      className: `w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
      activeIndex === i ? 'bg-amber-500 w-5' : 'bg-border hover:bg-text-muted'}`,

      "aria-label": `Go to slide ${i + 1}` }
    )
    )
    )

    )
    ));

};
export default ReviewsCarousel;