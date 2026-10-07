import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Menu, X, Sun, Moon, ShoppingCart, User,
  ShieldAlert, ShieldCheck, Send, Home, Wrench, ShoppingBag, Heart } from
'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  const isProductsRoute = location.pathname.startsWith('/products') || location.pathname === '/cart' || location.pathname === '/checkout';

  // Dynamic Theme handling
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Cart count directly synced from Redux store
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterLoading(true);
    setTimeout(() => {
      setNewsletterLoading(false);
      toast.success(`Successfully subscribed! Welcome to the SparkCare Smart Energy newsletter.`);
      setNewsletterEmail('');
    }, 1200);
  };

  return (/*#__PURE__*/
    React.createElement("div", { className: "min-h-screen flex flex-col bg-bg-primary text-text-main transition-colors duration-300" }, /*#__PURE__*/


    React.createElement("nav", { className: "sticky top-0 z-50 glass-card border-b border-border bg-opacity-70 backdrop-blur-md" }, /*#__PURE__*/
    React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" }, /*#__PURE__*/
    React.createElement("div", { className: "flex justify-between h-16" }, /*#__PURE__*/


    React.createElement("div", { className: "flex items-center" }, /*#__PURE__*/
    React.createElement(Link, { to: "/", className: "flex-shrink-0 flex items-center gap-2" }, /*#__PURE__*/
    React.createElement("span", { className: "text-2xl font-extrabold font-heading text-primary tracking-tight hover:opacity-90 transition-opacity" }, "Spark", /*#__PURE__*/
    React.createElement("span", { className: "text-secondary" }, "Care")
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "hidden md:ml-8 md:flex md:space-x-6 font-bold text-xs uppercase tracking-wider" }, /*#__PURE__*/
    React.createElement(Link, { to: "/", className: "hover:text-primary text-text-muted hover:text-text-main transition-colors py-2 px-1" }, "Home"), /*#__PURE__*/
    React.createElement(Link, { to: "/services", className: "hover:text-primary text-text-muted hover:text-text-main transition-colors py-2 px-1" }, "Services"), /*#__PURE__*/
    React.createElement(Link, { to: "/products", className: "hover:text-primary text-text-muted hover:text-text-main transition-colors py-2 px-1" }, "E-Store")
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "hidden md:flex items-center gap-4" }, /*#__PURE__*/


    React.createElement("button", {
      onClick: toggleTheme,
      className: "p-2.5 rounded-xl hover:bg-bg-secondary text-text-muted hover:text-text-main transition-colors border border-transparent hover:border-border cursor-pointer",
      "aria-label": "Toggle Theme" },

    theme === 'light' ? /*#__PURE__*/React.createElement(Moon, { size: 18 }) : /*#__PURE__*/React.createElement(Sun, { size: 18 })
    ), /*#__PURE__*/


    React.createElement(Link, {
      to: "/cart",
      className: "p-2.5 rounded-xl hover:bg-bg-secondary text-text-muted hover:text-text-main transition-all border border-transparent hover:border-border relative flex items-center justify-center cursor-pointer",
      title: "View E-Store Cart" }, /*#__PURE__*/

    React.createElement(ShoppingCart, { size: 18 }),
    cartCount > 0 && /*#__PURE__*/
    React.createElement("span", { className: "absolute top-[-3px] right-[-3px] bg-red-500 text-white text-[9px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center border-2 border-white shadow-md" },
    cartCount
    )

    ), /*#__PURE__*/


    React.createElement("div", { className: "w-[1px] h-6 bg-border" }),


    isAuthenticated ? /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-3" },
    user?.role === 'admin' && /*#__PURE__*/
    React.createElement(Link, {
      to: "/admin",
      className: "flex items-center gap-1.5 text-xs font-black bg-red-500/10 text-red-500 py-1.5 px-3.5 rounded-full hover:bg-red-500/20 transition-colors border border-red-500/20" }, /*#__PURE__*/

    React.createElement(ShieldAlert, { size: 14 }), " Admin Portal"
    ), /*#__PURE__*/

    React.createElement(Link, {
      to: "/account",
      className: "flex items-center gap-1.5 text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all py-1.5 px-3.5 rounded-full border border-primary/20" }, /*#__PURE__*/
    React.createElement(User, { size: 14 }),
    user?.name || "Account"
    )
    ) : /*#__PURE__*/

    React.createElement("div", { className: "flex items-center gap-3" }, /*#__PURE__*/
    React.createElement(Link, {
      to: "/login",
      className: "text-xs font-black text-text-muted hover:text-text-main transition-colors py-2 px-4" },
    "Sign In"

    ), /*#__PURE__*/
    React.createElement(Link, {
      to: "/register",
      className: "text-xs font-black bg-primary text-white hover:bg-primary-light transition-all rounded-full py-2.5 px-5.5 shadow-md shadow-primary/20 active:scale-95" },
    "Get Started"

    )
    )

    ), /*#__PURE__*/


    React.createElement("div", { className: "flex items-center md:hidden gap-2" }, /*#__PURE__*/
    React.createElement(Link, {
      to: "/products",
      className: "p-2 rounded-xl text-text-muted relative flex items-center justify-center cursor-pointer" }, /*#__PURE__*/

    React.createElement(ShoppingCart, { size: 20 }),
    cartCount > 0 && /*#__PURE__*/
    React.createElement("span", { className: "absolute top-[-3px] right-[-3px] bg-red-500 text-white text-[9px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center border-2 border-white shadow-md" },
    cartCount
    )

    ), /*#__PURE__*/
    React.createElement("button", {
      onClick: toggleTheme,
      className: "p-2 rounded-xl text-text-muted transition-colors cursor-pointer" },

    theme === 'light' ? /*#__PURE__*/React.createElement(Moon, { size: 20 }) : /*#__PURE__*/React.createElement(Sun, { size: 20 })
    ), /*#__PURE__*/
    React.createElement("button", {
      onClick: () => setIsMenuOpen(!isMenuOpen),
      className: "p-2 rounded-xl text-text-muted transition-colors cursor-pointer" },

    isMenuOpen ? /*#__PURE__*/React.createElement(X, { size: 24 }) : /*#__PURE__*/React.createElement(Menu, { size: 24 })
    )
    )

    )
    ),


    isMenuOpen && /*#__PURE__*/
    React.createElement("div", { className: "md:hidden glass-card border-t border-border bg-bg-primary bg-opacity-95" }, /*#__PURE__*/
    React.createElement("div", { className: "px-3 pt-2 pb-5 space-y-1 font-bold text-center flex flex-col gap-1 text-sm" }, /*#__PURE__*/
    React.createElement(Link, {
      to: "/",
      onClick: () => setIsMenuOpen(false),
      className: "block px-3 py-3 rounded-xl hover:bg-bg-secondary text-text-muted hover:text-text-main transition-all" },
    "Home"

    ), /*#__PURE__*/
    React.createElement(Link, {
      to: "/services",
      onClick: () => setIsMenuOpen(false),
      className: "block px-3 py-3 rounded-xl hover:bg-bg-secondary text-text-muted hover:text-text-main transition-all" },
    "Services"

    ), /*#__PURE__*/
    React.createElement(Link, {
      to: "/products",
      onClick: () => setIsMenuOpen(false),
      className: "block px-3 py-3 rounded-xl hover:bg-bg-secondary text-text-muted hover:text-text-main transition-all" },
    "E-Store"

    ), /*#__PURE__*/

    React.createElement("div", { className: "pt-4 pb-2 border-t border-border flex flex-col gap-3 items-center justify-center" },
    isAuthenticated ? /*#__PURE__*/
    React.createElement(React.Fragment, null,
    user?.role === 'admin' && /*#__PURE__*/
    React.createElement(Link, {
      to: "/admin",
      onClick: () => setIsMenuOpen(false),
      className: "w-11/12 flex items-center justify-center gap-1.5 text-xs font-black bg-red-500/10 text-red-500 py-3 rounded-full border border-red-500/20" }, /*#__PURE__*/

    React.createElement(ShieldAlert, { size: 14 }), " Admin Portal"
    ), /*#__PURE__*/


    React.createElement(Link, {
      to: "/account",
      onClick: () => setIsMenuOpen(false),
      className: "w-11/12 flex items-center justify-center gap-2 text-xs font-black text-primary bg-primary/10 hover:bg-primary/20 py-3 rounded-full border border-primary/20" }, /*#__PURE__*/

    React.createElement(User, { size: 14 }), " My Account (", user?.name, ")"
    )
    ) : /*#__PURE__*/

    React.createElement("div", { className: "w-full flex flex-col gap-2.5 items-center justify-center px-4" }, /*#__PURE__*/
    React.createElement(Link, {
      to: "/login",
      onClick: () => setIsMenuOpen(false),
      className: "w-full text-center text-xs font-black bg-bg-secondary hover:bg-border py-3 rounded-full border border-border text-text-main transition-colors" },
    "Sign In"

    ), /*#__PURE__*/
    React.createElement(Link, {
      to: "/register",
      onClick: () => setIsMenuOpen(false),
      className: "w-full text-center text-xs font-black bg-primary text-white hover:bg-primary-light py-3 rounded-full shadow-md shadow-primary/10 transition-colors" },
    "Get Started"

    )
    )

    )
    )
    )

    ), /*#__PURE__*/


    React.createElement("main", { className: "flex-grow pb-16 md:pb-0" }, /*#__PURE__*/
    React.createElement(Outlet, null)
    ), /*#__PURE__*/


    React.createElement("footer", { className: "bg-bg-secondary border-t border-border transition-colors duration-300 relative overflow-hidden" }, /*#__PURE__*/

    React.createElement("div", { className: "absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-secondary to-primary" }), /*#__PURE__*/

    React.createElement("div", { className: "max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10" }, /*#__PURE__*/
    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-12" }, /*#__PURE__*/


    React.createElement("div", { className: "lg:col-span-4 flex flex-col gap-4 text-left" }, /*#__PURE__*/
    React.createElement("span", { className: "text-2xl font-extrabold font-heading text-primary" }, "Spark", /*#__PURE__*/
    React.createElement("span", { className: "text-secondary" }, "Care")
    ), /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-text-muted font-medium leading-relaxed max-w-sm" }, "Vetted on-demand electrical installations and premium certified hardware supply. We stand behind our quality guarantees with certified professionals."

    ), /*#__PURE__*/


    React.createElement("div", { className: "inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 py-1.5 px-3 rounded-lg w-fit mt-2" }, /*#__PURE__*/
    React.createElement(ShieldCheck, { size: 14 }), " Licensed, Bonded & Insured"
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "lg:col-span-2.5 flex flex-col gap-4 text-left" }, /*#__PURE__*/
    React.createElement("h4", { className: "text-xs font-black text-text-main uppercase tracking-widest" }, "Home Services"), /*#__PURE__*/
    React.createElement("ul", { className: "flex flex-col gap-2.5 text-xs font-bold text-text-muted" }, /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement(Link, { to: "/services", className: "hover:text-primary transition-colors" }, "Smart Panel Upgrades")), /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement(Link, { to: "/services", className: "hover:text-primary transition-colors" }, "Emergency Outages")), /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement(Link, { to: "/services", className: "hover:text-primary transition-colors" }, "EV Fast Charger Installation")), /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement(Link, { to: "/services", className: "hover:text-primary transition-colors" }, "Lighting Installations"))
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "lg:col-span-2.5 flex flex-col gap-4 text-left" }, /*#__PURE__*/
    React.createElement("h4", { className: "text-xs font-black text-text-main uppercase tracking-widest" }, "Company & Legal"), /*#__PURE__*/
    React.createElement("ul", { className: "flex flex-col gap-2.5 text-xs font-bold text-text-muted" }, /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement(Link, { to: "/about-us", className: "hover:text-primary transition-colors" }, "About SparkCare")), /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement(Link, { to: "/contact-us", className: "hover:text-primary transition-colors" }, "Contact & Help")), /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement(Link, { to: "/privacy-policy", className: "hover:text-primary transition-colors" }, "Privacy Policy")), /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement(Link, { to: "/terms-and-conditions", className: "hover:text-primary transition-colors" }, "Terms & Conditions")), /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement(Link, { to: "/refund-and-cancellation", className: "hover:text-primary transition-colors" }, "Refund & Cancellation")), /*#__PURE__*/
    React.createElement("li", null, /*#__PURE__*/React.createElement(Link, { to: "/shipping-and-delivery", className: "hover:text-primary transition-colors" }, "Shipping & Delivery"))
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "lg:col-span-3 flex flex-col gap-4 text-left" }, /*#__PURE__*/
    React.createElement("h4", { className: "text-xs font-black text-text-main uppercase tracking-widest" }, "Smart Newsletter"), /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-text-muted font-medium leading-relaxed" }, "Receive modern residential energy efficiency tips and exclusive store coupons."

    ), /*#__PURE__*/


    React.createElement("form", { onSubmit: handleNewsletterSubmit, className: "flex gap-2 mt-2 w-full" }, /*#__PURE__*/
    React.createElement("input", {
      type: "email",
      required: true,
      placeholder: "Enter your email",
      value: newsletterEmail,
      onChange: (e) => setNewsletterEmail(e.target.value),
      className: "bg-bg-primary text-text-main border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary flex-grow min-w-0" }
    ), /*#__PURE__*/
    React.createElement("button", {
      type: "submit",
      disabled: newsletterLoading,
      className: "p-3 bg-primary hover:bg-primary-light text-white rounded-xl shadow-md flex items-center justify-center shrink-0 active:scale-95 transition-all cursor-pointer disabled:opacity-50",
      "aria-label": "Subscribe" },

    newsletterLoading ? /*#__PURE__*/
    React.createElement("div", { className: "animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white" }) : /*#__PURE__*/

    React.createElement(Send, { size: 14 })

    )
    )
    )

    ), /*#__PURE__*/


    React.createElement("div", { className: "border-t border-border/60 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center gap-6" }, /*#__PURE__*/
    React.createElement("p", { className: "text-xxs text-text-muted font-bold text-center sm:text-left" }, "© ",
    new Date().getFullYear(), " SparkCare Inc. All rights reserved. Fully licensed electrical contracting network & e-store catalog."
    ), /*#__PURE__*/
    React.createElement("div", { className: "flex flex-wrap gap-4 sm:gap-6 text-xxs font-black text-text-muted shrink-0" }, /*#__PURE__*/
    React.createElement(Link, { to: "/privacy-policy", className: "hover:text-primary transition-colors uppercase tracking-wider" }, "Privacy Policy"), /*#__PURE__*/
    React.createElement(Link, { to: "/terms-and-conditions", className: "hover:text-primary transition-colors uppercase tracking-wider" }, "Terms of Service"), /*#__PURE__*/
    React.createElement(Link, { to: "/refund-and-cancellation", className: "hover:text-primary transition-colors uppercase tracking-wider" }, "Refunds"), /*#__PURE__*/
    React.createElement(Link, { to: "/shipping-and-delivery", className: "hover:text-primary transition-colors uppercase tracking-wider" }, "Shipping"), /*#__PURE__*/
    React.createElement(Link, { to: "/contact-us", className: "hover:text-primary transition-colors uppercase tracking-wider" }, "Contact")
    )
    )

    )
    ), /*#__PURE__*/


    React.createElement(AnimatePresence, null,
    isProductsRoute && cartCount > 0 && location.pathname !== '/cart' && location.pathname !== '/checkout' && /*#__PURE__*/
    React.createElement(motion.div, {
      initial: { scale: 0, opacity: 0, y: 50 },
      animate: { scale: 1, opacity: 1, y: 0 },
      exit: { scale: 0, opacity: 0, y: 50 },
      className: "fixed bottom-20 right-6 md:bottom-8 md:right-8 z-40" }, /*#__PURE__*/

    React.createElement(Link, {
      to: "/cart",
      className: "flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 border border-primary/20 hover:bg-primary-light transition-colors relative cursor-pointer group" }, /*#__PURE__*/

    React.createElement(ShoppingCart, { size: 22, className: "group-hover:scale-110 transition-transform" }), /*#__PURE__*/
    React.createElement("span", { className: "absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-md" },
    cartCount
    )
    )
    )

    ), /*#__PURE__*/


    React.createElement("div", { className: "md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-primary/95 backdrop-blur-md border-t border-border flex justify-around items-center h-16 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.2)]" }, /*#__PURE__*/
    React.createElement(Link, {
      to: "/",
      className: `flex flex-col items-center justify-center w-12 h-12 transition-colors ${location.pathname === '/' ? 'text-primary' : 'text-text-muted hover:text-text-main'}` }, /*#__PURE__*/

    React.createElement(Home, { size: 18 }), /*#__PURE__*/
    React.createElement("span", { className: "text-[9px] font-bold mt-1" }, "Home")
    ), /*#__PURE__*/
    React.createElement(Link, {
      to: "/services",
      className: `flex flex-col items-center justify-center w-12 h-12 transition-colors ${location.pathname === '/services' ? 'text-primary' : 'text-text-muted hover:text-text-main'}` }, /*#__PURE__*/

    React.createElement(Wrench, { size: 18 }), /*#__PURE__*/
    React.createElement("span", { className: "text-[9px] font-bold mt-1" }, "Services")
    ), /*#__PURE__*/
    React.createElement(Link, {
      to: "/products",
      className: `flex flex-col items-center justify-center w-12 h-12 transition-colors ${location.pathname.startsWith('/products') && !location.pathname.startsWith('/products/wishlist') ? 'text-primary' : 'text-text-muted hover:text-text-main'}` }, /*#__PURE__*/

    React.createElement(ShoppingBag, { size: 18 }), /*#__PURE__*/
    React.createElement("span", { className: "text-[9px] font-bold mt-1" }, "E-Store")
    ), /*#__PURE__*/
    React.createElement(Link, {
      to: "/wishlist",
      className: `flex flex-col items-center justify-center w-12 h-12 transition-colors ${location.pathname === '/wishlist' ? 'text-primary' : 'text-text-muted hover:text-text-main'}` }, /*#__PURE__*/

    React.createElement(Heart, { size: 18 }), /*#__PURE__*/
    React.createElement("span", { className: "text-[9px] font-bold mt-1" }, "Wishlist")
    ), /*#__PURE__*/
    React.createElement(Link, {
      to: "/cart",
      className: `flex flex-col items-center justify-center w-12 h-12 transition-colors relative ${location.pathname === '/cart' ? 'text-primary' : 'text-text-muted hover:text-text-main'}` }, /*#__PURE__*/

    React.createElement(ShoppingCart, { size: 18 }), /*#__PURE__*/
    React.createElement("span", { className: "text-[9px] font-bold mt-1" }, "Cart"),
    cartCount > 0 && /*#__PURE__*/
    React.createElement("span", { className: "absolute top-1 right-2 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-white shadow-md" },
    cartCount
    )

    )
    )
    ));

};
export default MainLayout;