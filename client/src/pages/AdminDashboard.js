import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  TrendingUp, IndianRupee, Calendar, Clock,
  AlertTriangle, ShieldCheck } from
'lucide-react';
import { fetchDashboardStats } from '../redux/adminSlice';
import Skeleton from '../components/ui/Skeleton';
import { formatINR } from '../utils/currency';

export const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const { summary = {}, salesHistory = [] } = stats;

  return (/*#__PURE__*/
    React.createElement("div", { className: "space-y-10" }, /*#__PURE__*/


    React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4" }, /*#__PURE__*/
    React.createElement("div", { className: "space-y-1" }, /*#__PURE__*/
    React.createElement("h1", { className: "text-3xl font-extrabold tracking-tight" }, "System Administration Overview"), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted text-sm font-semibold" }, "Real-time financial aggregates, live scheduling telemetry, and product inventory alerts."

    )
    ), /*#__PURE__*/
    React.createElement("span", { className: "text-xs font-bold bg-bg-secondary px-3.5 py-2 rounded-xl border border-border self-start flex items-center gap-1.5 shadow-sm" }, /*#__PURE__*/
    React.createElement("span", { className: "w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" }), "Live Telemetry Stream"

    )
    ),

    loading ? /*#__PURE__*/
    /* Dynamic loading skeleton cards */
    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" },
    Array.from({ length: 4 }).map((_, i) => /*#__PURE__*/
    React.createElement("div", { key: i, className: "glass-card bg-bg-primary p-6 rounded-2xl border border-border shadow-sm space-y-3" }, /*#__PURE__*/
    React.createElement(Skeleton, { variant: "text", className: "w-1/3 h-3" }), /*#__PURE__*/
    React.createElement(Skeleton, { variant: "text", className: "w-2/3 h-8" }), /*#__PURE__*/
    React.createElement(Skeleton, { variant: "text", className: "w-1/2 h-3" })
    )
    )
    ) : /*#__PURE__*/

    /* Metrics Scorecards Grid */
    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" }, /*#__PURE__*/


    React.createElement(motion.div, {
      whileHover: { y: -3 },
      className: "glass-card bg-bg-primary p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between" }, /*#__PURE__*/

    React.createElement("div", { className: "space-y-2" }, /*#__PURE__*/
    React.createElement("p", { className: "text-xs font-bold text-text-muted uppercase tracking-wider" }, "Gross Revenue"), /*#__PURE__*/
    React.createElement("p", { className: "text-3xl font-black text-text-main" }, formatINR(summary.grossRevenue || 0)), /*#__PURE__*/
    React.createElement("span", { className: "inline-flex items-center gap-1 text-[10px] text-green-500 font-extrabold" }, /*#__PURE__*/
    React.createElement(TrendingUp, { size: 12 }), " +12.4% this month"
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white shadow-lg shadow-emerald-500/10" }, /*#__PURE__*/
    React.createElement(IndianRupee, { size: 24 })
    )
    ), /*#__PURE__*/


    React.createElement(motion.div, {
      whileHover: { y: -3 },
      className: "glass-card bg-bg-primary p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between" }, /*#__PURE__*/

    React.createElement("div", { className: "space-y-2" }, /*#__PURE__*/
    React.createElement("p", { className: "text-xs font-bold text-text-muted uppercase tracking-wider" }, "Electrician Bookings"), /*#__PURE__*/
    React.createElement("p", { className: "text-3xl font-black text-text-main" }, summary.totalBookings || 0), /*#__PURE__*/
    React.createElement("span", { className: "inline-flex items-center gap-1 text-[10px] text-primary font-extrabold" }, /*#__PURE__*/
    React.createElement(ShieldCheck, { size: 12 }), " Assigned schedules"
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "p-4 bg-gradient-to-r from-primary to-primary-light rounded-2xl text-white shadow-lg shadow-primary/10" }, /*#__PURE__*/
    React.createElement(Calendar, { size: 24 })
    )
    ), /*#__PURE__*/


    React.createElement(motion.div, {
      whileHover: { y: -3 },
      className: "glass-card bg-bg-primary p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between" }, /*#__PURE__*/

    React.createElement("div", { className: "space-y-2" }, /*#__PURE__*/
    React.createElement("p", { className: "text-xs font-bold text-text-muted uppercase tracking-wider" }, "Unassigned Jobs"), /*#__PURE__*/
    React.createElement("p", { className: "text-3xl font-black text-text-main" }, summary.pendingBookings || 0), /*#__PURE__*/
    React.createElement("span", { className: "inline-flex items-center gap-1 text-[10px] text-secondary font-extrabold" }, /*#__PURE__*/
    React.createElement(Clock, { size: 12 }), " Requires dispatching"
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "p-4 bg-gradient-to-r from-secondary to-secondary-light rounded-2xl text-white shadow-lg shadow-secondary/10" }, /*#__PURE__*/
    React.createElement(Clock, { size: 24 })
    )
    ), /*#__PURE__*/


    React.createElement(motion.div, {
      whileHover: { y: -3 },
      className: "glass-card bg-bg-primary p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between" }, /*#__PURE__*/

    React.createElement("div", { className: "space-y-2" }, /*#__PURE__*/
    React.createElement("p", { className: "text-xs font-bold text-text-muted uppercase tracking-wider" }, "Low Stock SKUs"), /*#__PURE__*/
    React.createElement("p", { className: "text-3xl font-black text-red-500" }, summary.lowStockProductsCount || 0), /*#__PURE__*/
    React.createElement("span", { className: "inline-flex items-center gap-1 text-[10px] text-red-500 font-extrabold animate-pulse" }, /*#__PURE__*/
    React.createElement(AlertTriangle, { size: 12 }), " Under stock threshold"
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "p-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl text-white shadow-lg shadow-red-500/10" }, /*#__PURE__*/
    React.createElement(AlertTriangle, { size: 24 })
    )
    )

    ), /*#__PURE__*/




    React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8" }, /*#__PURE__*/


    React.createElement("div", { className: "glass-card bg-bg-primary border border-border p-6 rounded-2xl shadow-sm space-y-6" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h3", { className: "font-extrabold text-lg" }, "Sales Revenue Trends"), /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-text-muted mt-0.5" }, "Historical breakdown of monthly orders and repair ticket turnovers.")
    ), /*#__PURE__*/

    React.createElement("div", { className: "w-full h-64 relative flex items-end" }, /*#__PURE__*/

    React.createElement("svg", { viewBox: "0 0 500 200", className: "w-full h-full text-primary" }, /*#__PURE__*/
    React.createElement("defs", null, /*#__PURE__*/
    React.createElement("linearGradient", { id: "areaGrad", x1: "0", y1: "0", x2: "0", y2: "1" }, /*#__PURE__*/
    React.createElement("stop", { offset: "0%", stopColor: "hsl(var(--color-primary))", stopOpacity: "0.4" }), /*#__PURE__*/
    React.createElement("stop", { offset: "100%", stopColor: "hsl(var(--color-primary))", stopOpacity: "0.0" })
    )
    ), /*#__PURE__*/

    React.createElement("line", { x1: "0", y1: "50", x2: "500", y2: "50", stroke: "currentColor", opacity: "0.05", strokeDasharray: "4" }), /*#__PURE__*/
    React.createElement("line", { x1: "0", y1: "100", x2: "500", y2: "100", stroke: "currentColor", opacity: "0.05", strokeDasharray: "4" }), /*#__PURE__*/
    React.createElement("line", { x1: "0", y1: "150", x2: "500", y2: "150", stroke: "currentColor", opacity: "0.05", strokeDasharray: "4" }), /*#__PURE__*/


    React.createElement("path", {
      d: "M 10 180 Q 100 120, 180 140 T 320 80 T 420 50 T 490 30",
      fill: "none",
      stroke: "hsl(var(--color-primary))",
      strokeWidth: "4",
      strokeLinecap: "round" }
    ), /*#__PURE__*/

    React.createElement("path", {
      d: "M 10 180 Q 100 120, 180 140 T 320 80 T 420 50 T 490 30 L 490 190 L 10 190 Z",
      fill: "url(#areaGrad)" }
    ), /*#__PURE__*/

    React.createElement("circle", { cx: "10", cy: "180", r: "5", fill: "hsl(var(--color-primary))" }), /*#__PURE__*/
    React.createElement("circle", { cx: "180", cy: "140", r: "5", fill: "hsl(var(--color-primary))" }), /*#__PURE__*/
    React.createElement("circle", { cx: "320", cy: "80", r: "5", fill: "hsl(var(--color-primary))" }), /*#__PURE__*/
    React.createElement("circle", { cx: "490", cy: "30", r: "5", fill: "hsl(var(--color-primary))" })
    ), /*#__PURE__*/
    React.createElement("div", { className: "absolute bottom-1.5 left-0 right-0 flex justify-between text-[10px] text-text-muted font-bold px-2" }, /*#__PURE__*/
    React.createElement("span", null, "Jan"), /*#__PURE__*/
    React.createElement("span", null, "Mar"), /*#__PURE__*/
    React.createElement("span", null, "May"), /*#__PURE__*/
    React.createElement("span", null, "Jun")
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "glass-card bg-bg-primary border border-border p-6 rounded-2xl shadow-sm space-y-6" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h3", { className: "font-extrabold text-lg" }, "Lead Generation Distribution"), /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-text-muted mt-0.5" }, "Quantity ratios comparing orders packages and technician repair booking schedules.")
    ), /*#__PURE__*/

    React.createElement("div", { className: "w-full h-64 flex items-end justify-between px-4 pb-8 relative" },
    salesHistory.map((item, index) => /*#__PURE__*/
    React.createElement("div", { key: item.name, className: "flex flex-col items-center gap-2 flex-grow mx-2" }, /*#__PURE__*/
    React.createElement("div", { className: "w-full flex justify-center gap-1.5 items-end h-40" }, /*#__PURE__*/

    React.createElement(motion.div, {
      initial: { height: 0 },
      animate: { height: `${item.orders / 8000 * 100}%` },
      transition: { duration: 0.8, delay: index * 0.05 },
      className: "w-4 bg-primary rounded-t-md shadow-sm" }
    ), /*#__PURE__*/

    React.createElement(motion.div, {
      initial: { height: 0 },
      animate: { height: `${item.services / 8000 * 100}%` },
      transition: { duration: 0.8, delay: index * 0.05 + 0.1 },
      className: "w-4 bg-secondary rounded-t-md shadow-sm" }
    )
    ), /*#__PURE__*/
    React.createElement("span", { className: "text-[10px] font-bold text-text-muted" }, item.name)
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "absolute top-2 right-4 flex gap-4 text-[10px] font-black uppercase" }, /*#__PURE__*/
    React.createElement("span", { className: "flex items-center gap-1 text-primary" }, /*#__PURE__*/React.createElement("span", { className: "w-2.5 h-2.5 bg-primary rounded-sm" }), " Orders"), /*#__PURE__*/
    React.createElement("span", { className: "flex items-center gap-1 text-secondary" }, /*#__PURE__*/React.createElement("span", { className: "w-2.5 h-2.5 bg-secondary rounded-sm" }), " Services")
    )
    )
    )

    )

    ));

};

export default AdminDashboard;