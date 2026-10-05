import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/authSlice';
import {
  LayoutDashboard, Users, ShoppingBag, Calendar, Wrench,
  Menu, X, LogOut, ChevronRight, Home,
  CreditCard, MessageSquare, FileText, Ticket, Settings, Truck } from
'lucide-react';
import toast from 'react-hot-toast';

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Prevent background scroll bleed when mobile sidebar drawer is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isSidebarOpen]);

  // Auto-close sidebar on route navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      toast.success('Successfully logged out');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  // Configure all 11 navigation tabs for complete system administrative controls
  const adminLinks = [
    { title: 'Overview', path: '/admin', icon: /*#__PURE__*/React.createElement(LayoutDashboard, { size: 18 }) },
    { title: 'Orders', path: '/admin/orders', icon: /*#__PURE__*/React.createElement(Truck, { size: 18 }) },
    { title: 'Bookings', path: '/admin/bookings', icon: /*#__PURE__*/React.createElement(Calendar, { size: 18 }) },
    { title: 'Products', path: '/admin/products', icon: /*#__PURE__*/React.createElement(ShoppingBag, { size: 18 }) },
    { title: 'Services', path: '/admin/services', icon: /*#__PURE__*/React.createElement(Wrench, { size: 18 }) },
    { title: 'Users List', path: '/admin/users', icon: /*#__PURE__*/React.createElement(Users, { size: 18 }) },
    { title: 'Payment Verification', path: '/admin/payments', icon: /*#__PURE__*/React.createElement(CreditCard, { size: 18 }) },
    { title: 'Reviews', path: '/admin/reviews', icon: /*#__PURE__*/React.createElement(MessageSquare, { size: 18 }) },
    { title: 'Financial Reports', path: '/admin/reports', icon: /*#__PURE__*/React.createElement(FileText, { size: 18 }) },
    { title: 'Promo Coupons', path: '/admin/coupons', icon: /*#__PURE__*/React.createElement(Ticket, { size: 18 }) },
    { title: 'Settings', path: '/admin/settings', icon: /*#__PURE__*/React.createElement(Settings, { size: 18 }) }
  ];

  const links = adminLinks;

  return (/*#__PURE__*/
    React.createElement("div", { className: "min-h-screen flex bg-bg-secondary text-text-main transition-colors duration-300" }, /*#__PURE__*/

    /* Desktop Sidebar */
    React.createElement("aside", { className: "hidden md:flex flex-col w-64 glass-card border-r border-border bg-bg-primary h-screen sticky top-0 overflow-hidden select-none shrink-0" }, /*#__PURE__*/
    React.createElement("div", { className: "h-16 flex items-center justify-between px-6 border-b border-border shrink-0" }, /*#__PURE__*/
    React.createElement(Link, { to: "/admin", className: "flex items-center gap-2.5 group" }, /*#__PURE__*/
    React.createElement("div", { className: "w-9 h-9 rounded-xl overflow-hidden border border-border shadow-md shadow-primary/20 group-hover:scale-105 transition-transform bg-bg-secondary flex items-center justify-center shrink-0" }, /*#__PURE__*/
    React.createElement("img", {
      src: "/favicon.jpg",
      alt: "SparkCare Logo",
      className: "w-full h-full object-cover select-none"
    })
    ), /*#__PURE__*/
    React.createElement("div", { className: "flex flex-col" }, /*#__PURE__*/
    React.createElement("span", { className: "text-base font-extrabold font-heading text-text-main tracking-tight leading-none" }, "Spark", /*#__PURE__*/
    React.createElement("span", { className: "text-primary" }, "Care")
    ), /*#__PURE__*/
    React.createElement("span", { className: "text-[9px] font-black uppercase text-amber-500 tracking-wider mt-0.5" }, "Admin Panel")
    )
    )
    ), /*#__PURE__*/

    React.createElement("nav", { className: "flex-1 min-h-0 overflow-y-auto p-4 space-y-1.5 overscroll-contain" },
    links.map((link) => {
      const isActive = location.pathname === link.path;
      return (/*#__PURE__*/
        React.createElement(Link, {
          key: link.title,
          to: link.path,
          className: `flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs ${
          isActive ?
          'bg-primary text-white shadow-md shadow-primary/20' :
          'hover:bg-bg-secondary text-text-muted hover:text-text-main'}` }, /*#__PURE__*/

        React.createElement("div", { className: "flex items-center gap-3" },
        link.icon, /*#__PURE__*/
        React.createElement("span", null, link.title)
        ),
        isActive && /*#__PURE__*/React.createElement(ChevronRight, { size: 16 })
        ));
    })
    ), /*#__PURE__*/

    React.createElement("div", { className: "p-4 border-t border-border bg-bg-secondary/40 shrink-0 mt-auto" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-3 mb-4 px-2" }, /*#__PURE__*/
    React.createElement("div", { className: "w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0" },
    user?.name?.[0]?.toUpperCase() || 'U'
    ), /*#__PURE__*/
    React.createElement("div", { className: "min-w-0 flex-1" }, /*#__PURE__*/
    React.createElement("p", { className: "text-sm font-bold truncate text-text-main" }, user?.name), /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-text-muted truncate capitalize" }, user?.role)
    )
    ), /*#__PURE__*/
    React.createElement(Link, {
      to: "/",
      className: "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-text-muted hover:text-text-main font-semibold hover:bg-bg-secondary transition-all mb-1 text-xs" }, /*#__PURE__*/
    React.createElement(Home, { size: 16 }), /*#__PURE__*/
    React.createElement("span", null, "Back to Main Store")
    ), /*#__PURE__*/
    React.createElement("button", {
      onClick: handleLogout,
      className: "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 font-semibold transition-all text-xs" }, /*#__PURE__*/
    React.createElement(LogOut, { size: 16 }), /*#__PURE__*/
    React.createElement("span", null, "Sign Out")
    )
    )
    ), /*#__PURE__*/

    /* Content Area */
    React.createElement("div", { className: "flex-1 flex flex-col min-w-0 h-screen overflow-hidden" }, /*#__PURE__*/

    /* Mobile Header */
    React.createElement("header", { className: "flex md:hidden items-center justify-between h-16 px-4 bg-bg-primary border-b border-border sticky top-0 z-30 shrink-0" }, /*#__PURE__*/
    React.createElement("button", {
      onClick: () => setIsSidebarOpen(true),
      className: "p-2 rounded-lg hover:bg-bg-secondary text-text-muted transition-colors",
      "aria-label": "Open Navigation" }, /*#__PURE__*/
    React.createElement(Menu, { size: 24 })
    ), /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-2" }, /*#__PURE__*/
    React.createElement("div", { className: "w-7 h-7 rounded-lg overflow-hidden border border-border shadow-sm bg-bg-secondary flex items-center justify-center shrink-0" }, /*#__PURE__*/
    React.createElement("img", {
      src: "/favicon.jpg",
      alt: "SparkCare Logo",
      className: "w-full h-full object-cover select-none"
    })
    ), /*#__PURE__*/
    React.createElement("span", { className: "text-base font-extrabold font-heading text-text-main" }, "Spark", /*#__PURE__*/
    React.createElement("span", { className: "text-primary" }, "Care"), " ", /*#__PURE__*/
    React.createElement("span", { className: "text-[9px] font-black uppercase text-amber-500 ml-1" }, "Admin")
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs" },
    user?.name?.[0]?.toUpperCase() || 'A'
    )
    ),

    /* Main Page Outlet with Isolated Scrolling */
    React.createElement("main", { className: "flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto overscroll-contain" }, /*#__PURE__*/
    React.createElement(Outlet, null)
    )
    ),

    /* Mobile Drawer with Isolated Scrolling & Background Scroll Lock */
    isSidebarOpen && /*#__PURE__*/
    React.createElement("div", {
      className: "fixed inset-0 z-50 flex md:hidden",
      style: { touchAction: 'none' } }, /*#__PURE__*/

    /* Backdrop */
    React.createElement("div", {
      className: "fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity",
      onClick: () => setIsSidebarOpen(false),
      style: { touchAction: 'none' } }
    ), /*#__PURE__*/

    /* Drawer Surface */
    React.createElement("div", {
      className: "relative flex flex-col w-72 max-w-[85vw] bg-bg-primary border-r border-border h-full p-4 z-10 shadow-2xl overscroll-contain select-none",
      style: { touchAction: 'pan-y' } }, /*#__PURE__*/

    /* Drawer Header */
    React.createElement("div", { className: "flex items-center justify-between pb-3 border-b border-border shrink-0 mb-2" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-2.5" }, /*#__PURE__*/
    React.createElement("div", { className: "w-8 h-8 rounded-lg overflow-hidden border border-border shadow-sm bg-bg-secondary flex items-center justify-center shrink-0" }, /*#__PURE__*/
    React.createElement("img", { src: "/favicon.jpg", alt: "SparkCare Logo", className: "w-full h-full object-cover select-none" })
    ), /*#__PURE__*/
    React.createElement("div", { className: "flex flex-col" }, /*#__PURE__*/
    React.createElement("span", { className: "text-base font-extrabold text-primary font-heading leading-tight" }, "SparkCare"), /*#__PURE__*/
    React.createElement("span", { className: "text-[9px] font-black uppercase text-amber-500 tracking-wider" }, "Admin Panel")
    )
    ), /*#__PURE__*/
    React.createElement("button", {
      onClick: () => setIsSidebarOpen(false),
      className: "p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-main transition-colors",
      "aria-label": "Close Sidebar" }, /*#__PURE__*/
    React.createElement(X, { size: 20 })
    )
    ), /*#__PURE__*/

    /* Scrollable Tab Links (Shows all 11 tabs without bleeding to background) */
    React.createElement("nav", {
      className: "flex-1 min-h-0 overflow-y-auto py-2 space-y-1 overscroll-contain pr-1",
      style: { touchAction: 'pan-y' } },
    links.map((link) => {
      const isActive = location.pathname === link.path;
      return (/*#__PURE__*/
        React.createElement(Link, {
          key: link.title,
          to: link.path,
          onClick: () => setIsSidebarOpen(false),
          className: `flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
          isActive ?
          'bg-primary text-white shadow-md shadow-primary/20' :
          'hover:bg-bg-secondary text-text-muted hover:text-text-main'}` }, /*#__PURE__*/

        React.createElement("div", { className: "flex items-center gap-2.5" },
        link.icon, /*#__PURE__*/
        React.createElement("span", null, link.title)
        ),
        isActive && /*#__PURE__*/React.createElement(ChevronRight, { size: 14 })
        ));
    })
    ), /*#__PURE__*/

    /* Drawer Footer */
    React.createElement("div", { className: "border-t border-border pt-3 mt-auto shrink-0 bg-bg-secondary/30 p-2 rounded-xl" }, /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] text-text-muted font-bold px-2 mb-0.5 uppercase tracking-wider" }, "Signed in as"), /*#__PURE__*/
    React.createElement("p", { className: "text-xs font-extrabold px-2 truncate text-text-main" }, user?.name), /*#__PURE__*/
    React.createElement(Link, {
      to: "/",
      onClick: () => setIsSidebarOpen(false),
      className: "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-muted hover:text-text-main font-semibold text-xs hover:bg-bg-secondary transition-all mt-2" }, /*#__PURE__*/
    React.createElement(Home, { size: 15 }), /*#__PURE__*/
    React.createElement("span", null, "Back to Main Store")
    ), /*#__PURE__*/
    React.createElement("button", {
      onClick: () => {
        setIsSidebarOpen(false);
        handleLogout();
      },
      className: "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 font-semibold text-xs transition-all mt-1" }, /*#__PURE__*/
    React.createElement(LogOut, { size: 15 }), /*#__PURE__*/
    React.createElement("span", null, "Sign Out")
    )
    )
    )
    )
    ));
};

export default DashboardLayout;