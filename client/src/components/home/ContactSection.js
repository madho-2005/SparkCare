import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Clock, MapPin, Send, ShieldCheck, AlertOctagon } from 'lucide-react';
import toast from 'react-hot-toast';

export const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Your request has been sent! We will reach out within 15 minutes.');
      setFormData({ name: '', email: '', subject: 'general', message: '' });
    }, 1500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (/*#__PURE__*/
    React.createElement("section", { className: "py-20 bg-bg-primary relative overflow-hidden" }, /*#__PURE__*/
    React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" }, /*#__PURE__*/

    React.createElement("div", { className: "grid lg:grid-cols-12 gap-12 items-stretch" }, /*#__PURE__*/


    React.createElement(motion.div, {
      initial: { opacity: 0, x: -25 },
      whileInView: { opacity: 1, x: 0 },
      viewport: { once: true, margin: "-100px" },
      transition: { duration: 0.5 },
      className: "lg:col-span-7 flex flex-col justify-between" }, /*#__PURE__*/

    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { className: "inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-amber-500/20" }, "Contact & Emergency Help"

    ), /*#__PURE__*/
    React.createElement("h2", { className: "text-3xl sm:text-4xl font-black text-text-main leading-none font-heading uppercase tracking-tight" }, "Need an Electrician or Have ", /*#__PURE__*/
    React.createElement("span", { className: "bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent" }, "an Emergency?")
    ), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted mt-4 font-semibold text-xs sm:text-sm leading-relaxed" }, "Fill out the form below. Our background-checked electricians will reply quickly to help you."

    )
    ), /*#__PURE__*/


    React.createElement("form", { onSubmit: handleSubmit, className: "glass-card p-6 md:p-8 rounded-3xl border border-border bg-bg-primary/50 shadow-xl mt-8 flex flex-col gap-5 relative" }, /*#__PURE__*/
    React.createElement("div", { className: "grid sm:grid-cols-2 gap-4" }, /*#__PURE__*/

    React.createElement("div", { className: "flex flex-col gap-2" }, /*#__PURE__*/
    React.createElement("label", { htmlFor: "name", className: "text-[10px] font-black text-text-muted uppercase tracking-wider" }, "Your Name ", /*#__PURE__*/React.createElement("strong", { className: "text-red-500" }, "*")), /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      id: "name",
      name: "name",
      required: true,
      placeholder: "Enter full name",
      value: formData.name,
      onChange: handleInputChange,
      className: "bg-bg-primary text-text-main border border-border rounded-xl px-4 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all" }
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "flex flex-col gap-2" }, /*#__PURE__*/
    React.createElement("label", { htmlFor: "email", className: "text-[10px] font-black text-text-muted uppercase tracking-wider" }, "Email Address ", /*#__PURE__*/React.createElement("strong", { className: "text-red-500" }, "*")), /*#__PURE__*/
    React.createElement("input", {
      type: "email",
      id: "email",
      name: "email",
      required: true,
      placeholder: "Enter your email",
      value: formData.email,
      onChange: handleInputChange,
      className: "bg-bg-primary text-text-main border border-border rounded-xl px-4 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all" }
    )
    )

    ), /*#__PURE__*/

    React.createElement("div", { className: "flex flex-col gap-2" }, /*#__PURE__*/
    React.createElement("label", { htmlFor: "subject", className: "text-[10px] font-black text-text-muted uppercase tracking-wider" }, "What do you need help with?"), /*#__PURE__*/
    React.createElement("select", {
      id: "subject",
      name: "subject",
      value: formData.subject,
      onChange: handleInputChange,
      className: "bg-bg-primary text-text-main border border-border rounded-xl px-4 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all cursor-pointer" }, /*#__PURE__*/

    React.createElement("option", { value: "general" }, "General Help or Price Estimate"), /*#__PURE__*/
    React.createElement("option", { value: "emergency" }, "Emergency Outage or Dangerous Sparks"), /*#__PURE__*/
    React.createElement("option", { value: "commercial" }, "Business or Office Services"), /*#__PURE__*/
    React.createElement("option", { value: "estore" }, "Online Shop Order Help")
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "flex flex-col gap-2" }, /*#__PURE__*/
    React.createElement("label", { htmlFor: "message", className: "text-[10px] font-black text-text-muted uppercase tracking-wider" }, "How can we help you? ", /*#__PURE__*/React.createElement("strong", { className: "text-red-500" }, "*")), /*#__PURE__*/
    React.createElement("textarea", {
      id: "message",
      name: "message",
      required: true,
      rows: 4,
      placeholder: "Describe your problem, what you need installed, or order details here...",
      value: formData.message,
      onChange: handleInputChange,
      className: "bg-bg-primary text-text-main border border-border rounded-xl px-4 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all resize-none" }
    )
    ), /*#__PURE__*/

    React.createElement("button", {
      type: "submit",
      disabled: loading,
      className: "py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50" },

    loading ? /*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("div", { className: "animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" }), /*#__PURE__*/
    React.createElement("span", null, "Sending Request...")
    ) : /*#__PURE__*/

    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(Send, { size: 14 }), /*#__PURE__*/
    React.createElement("span", null, "Send Request")
    )

    )

    )
    ), /*#__PURE__*/


    React.createElement(motion.div, {
      initial: { opacity: 0, x: 25 },
      whileInView: { opacity: 1, x: 0 },
      viewport: { once: true, margin: "-100px" },
      transition: { duration: 0.5 },
      className: "lg:col-span-5 flex flex-col gap-6" }, /*#__PURE__*/


    React.createElement("div", { className: "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-6 rounded-3xl flex items-center gap-4 relative overflow-hidden shadow-sm" }, /*#__PURE__*/
    React.createElement("div", { className: "absolute top-[-10px] right-[-10px] w-20 h-20 rounded-full bg-red-500/5 blur-md pointer-events-none" }), /*#__PURE__*/
    React.createElement("div", { className: "w-12 h-12 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 animate-pulse" }, /*#__PURE__*/
    React.createElement(AlertOctagon, { size: 24 })
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h4", { className: "text-xs font-black uppercase tracking-wider" }, "24/7 Emergency Phone Line"), /*#__PURE__*/
    React.createElement("p", { className: "text-lg font-black text-text-main mt-0.5" }, "+1 (800) 555-SPARK"), /*#__PURE__*/
    React.createElement("p", { className: "text-[9px] text-text-muted font-bold mt-0.5" }, "Average call back: under 15 minutes")
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "glass-card p-6 md:p-8 rounded-3xl border border-border bg-bg-secondary/40 shadow-md flex flex-col gap-6" }, /*#__PURE__*/
    React.createElement("h3", { className: "text-sm font-black uppercase text-text-main tracking-wider" }, "Our Contact Info"), /*#__PURE__*/

    React.createElement("div", { className: "flex flex-col gap-5 font-semibold text-xs text-text-muted" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-4" }, /*#__PURE__*/
    React.createElement("div", { className: "w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0" }, /*#__PURE__*/
    React.createElement(Mail, { size: 16 })
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("p", { className: "text-[9px] uppercase font-black text-text-muted tracking-wider" }, "Email Us"), /*#__PURE__*/
    React.createElement("p", { className: "text-xs font-bold text-text-main mt-0.5" }, "support@sparkcare.com")
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "flex items-center gap-4" }, /*#__PURE__*/
    React.createElement("div", { className: "w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0" }, /*#__PURE__*/
    React.createElement(Clock, { size: 16 })
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("p", { className: "text-[9px] uppercase font-black text-text-muted tracking-wider" }, "Working Hours"), /*#__PURE__*/
    React.createElement("p", { className: "text-xs font-bold text-text-main mt-0.5" }, "Electricians: 24/7 | Office Phone: 7AM - 9PM EST")
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "flex items-center gap-4" }, /*#__PURE__*/
    React.createElement("div", { className: "w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0" }, /*#__PURE__*/
    React.createElement(MapPin, { size: 16 })
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("p", { className: "text-[9px] uppercase font-black text-text-muted tracking-wider" }, "Our Office Address"), /*#__PURE__*/
    React.createElement("p", { className: "text-xs font-bold text-text-main mt-0.5" }, "Mira Madhav Residency, Kosamdi, Ankleshwar")
    )
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "glass-card rounded-3xl border border-border bg-bg-secondary/40 shadow-md flex-grow relative overflow-hidden flex flex-col justify-between p-6 min-h-[190px]" }, /*#__PURE__*/

    React.createElement("div", { className: "absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-orange-500/5 to-transparent pointer-events-none z-0" }), /*#__PURE__*/
    React.createElement("div", { className: "absolute inset-0 opacity-15 dark:opacity-25 z-0", style: {
        backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 0)',
        backgroundSize: '16px 16px'
      } }), /*#__PURE__*/


    React.createElement("svg", { className: "absolute inset-0 w-full h-full opacity-35 pointer-events-none z-0", xmlns: "http://www.w3.org/2000/svg" }, /*#__PURE__*/
    React.createElement("path", { d: "M-20,90 Q120,40 240,110 T440,50", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeDasharray: "6,6", className: "text-amber-500" }), /*#__PURE__*/
    React.createElement("path", { d: "M40,210 Q190,170 310,230 T510,190", fill: "none", stroke: "currentColor", strokeWidth: "1.5", className: "text-primary" }), /*#__PURE__*/
    React.createElement("circle", { cx: "240", cy: "110", r: "7", className: "fill-amber-500/30 animate-ping" }), /*#__PURE__*/
    React.createElement("circle", { cx: "240", cy: "110", r: "4", className: "fill-amber-500" }), /*#__PURE__*/
    React.createElement("circle", { cx: "310", cy: "230", r: "4", className: "fill-primary" })
    ), /*#__PURE__*/

    React.createElement("div", { className: "relative z-10 bg-bg-primary/95 border border-border p-3.5 rounded-2xl shadow-md w-full max-w-[260px]" }, /*#__PURE__*/
    React.createElement("div", { className: "flex gap-2.5 items-center" }, /*#__PURE__*/
    React.createElement("div", { className: "w-8 h-8 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0" }, /*#__PURE__*/
    React.createElement(ShieldCheck, { size: 16 })
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h4", { className: "text-[9px] font-black uppercase text-text-main tracking-wider" }, "We Are Open & Ready"), /*#__PURE__*/
    React.createElement("p", { className: "text-[8px] text-text-muted font-black uppercase tracking-widest mt-0.5" }, "Electricians Nearby")
    )
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "relative z-10 flex justify-end" }, /*#__PURE__*/
    React.createElement("div", { className: "bg-amber-500/10 border border-amber-500/20 py-1.5 px-3 rounded-xl text-[9px] font-black text-amber-600 dark:text-amber-400 tracking-wider uppercase" }, "We Serve Your Area"

    )
    )

    )

    )

    )

    )
    ));

};
export default ContactSection;