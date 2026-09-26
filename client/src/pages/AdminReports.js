import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FileText, Download, IndianRupee, Clock } from 'lucide-react';
import { fetchAdminReports } from '../redux/adminSlice';
import Skeleton from '../components/ui/Skeleton';
import { formatINR } from '../utils/currency';

export const AdminReports = () => {
  const dispatch = useDispatch();
  const { reports, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminReports());
  }, [dispatch]);

  const payments = reports?.payments || [];

  // Calculation summaries
  const totalTransactionsCount = payments.length;
  const succeededSum = payments.
  filter((p) => p.status === 'succeeded').
  reduce((sum, p) => sum + p.amount, 0);
  const pendingSum = payments.
  filter((p) => p.status === 'pending').
  reduce((sum, p) => sum + p.amount, 0);

  return (/*#__PURE__*/
    React.createElement("div", { className: "space-y-8" }, /*#__PURE__*/

    React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h1", { className: "text-3xl font-extrabold tracking-tight" }, "Financial Reports Center"), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted text-sm font-semibold mt-1" }, "System transaction audit ledger, approved gross sales totals, and pending receivable summaries."

    )
    ), /*#__PURE__*/
    React.createElement("button", {
      onClick: () => window.print(),
      className: "inline-flex items-center gap-1.5 bg-primary hover:bg-primary-light text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-colors self-start cursor-pointer" }, /*#__PURE__*/

    React.createElement(Download, { size: 14 }), " Export Audit Log"
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-6" }, /*#__PURE__*/


    React.createElement("div", { className: "glass-card bg-bg-primary p-5 rounded-2xl border border-border flex items-center justify-between shadow-sm" }, /*#__PURE__*/
    React.createElement("div", { className: "space-y-1" }, /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] font-bold text-text-muted uppercase" }, "Gross Audited Sales"), /*#__PURE__*/
    React.createElement("p", { className: "text-2xl font-black text-text-main" }, formatINR(succeededSum))
    ), /*#__PURE__*/
    React.createElement("div", { className: "p-3 bg-emerald-500/10 text-emerald-500 rounded-xl" }, /*#__PURE__*/
    React.createElement(IndianRupee, { size: 20 })
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "glass-card bg-bg-primary p-5 rounded-2xl border border-border flex items-center justify-between shadow-sm" }, /*#__PURE__*/
    React.createElement("div", { className: "space-y-1" }, /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] font-bold text-text-muted uppercase" }, "Pending Receivables"), /*#__PURE__*/
    React.createElement("p", { className: "text-2xl font-black text-text-main" }, formatINR(pendingSum))
    ), /*#__PURE__*/
    React.createElement("div", { className: "p-3 bg-amber-500/10 text-amber-500 rounded-xl" }, /*#__PURE__*/
    React.createElement(Clock, { size: 20 })
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "glass-card bg-bg-primary p-5 rounded-2xl border border-border flex items-center justify-between shadow-sm" }, /*#__PURE__*/
    React.createElement("div", { className: "space-y-1" }, /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] font-bold text-text-muted uppercase" }, "Audit Records Count"), /*#__PURE__*/
    React.createElement("p", { className: "text-2xl font-black text-text-main" }, totalTransactionsCount, " logs")
    ), /*#__PURE__*/
    React.createElement("div", { className: "p-3 bg-primary/10 text-primary rounded-xl" }, /*#__PURE__*/
    React.createElement(FileText, { size: 20 })
    )
    )

    ),

    loading ? /*#__PURE__*/
    React.createElement(Skeleton.Table, { rows: 5, cols: 5 }) :
    payments.length === 0 ? /*#__PURE__*/
    React.createElement("div", { className: "glass-card p-12 text-center rounded-3xl border border-border space-y-4 max-w-md mx-auto" }, /*#__PURE__*/
    React.createElement("div", { className: "w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto" }, /*#__PURE__*/
    React.createElement(FileText, { size: 30 })
    ), /*#__PURE__*/
    React.createElement("div", { className: "space-y-1" }, /*#__PURE__*/
    React.createElement("h3", { className: "font-extrabold text-lg" }, "Transaction database empty"), /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-text-muted font-semibold leading-relaxed" }, "No transactions have been recorded in the platform database yet."

    )
    )
    ) : /*#__PURE__*/

    /* Report table */
    React.createElement("div", { className: "glass-card p-6 rounded-2xl border border-border shadow-md overflow-x-auto" }, /*#__PURE__*/
    React.createElement("table", { className: "w-full text-left border-collapse text-xs" }, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/
    React.createElement("tr", { className: "border-b border-border text-slate-400 font-bold uppercase tracking-wider" }, /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5 pl-2" }, "Created Date"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5" }, "Audit Client"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5" }, "Gateway"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5" }, "Transaction ID"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5" }, "Amount"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5 text-right" }, "Status")
    )
    ), /*#__PURE__*/
    React.createElement("tbody", { className: "divide-y divide-border/60 font-bold text-text-main" },
    payments.map((p) => /*#__PURE__*/
    React.createElement("tr", { key: p._id, className: "hover:bg-bg-secondary/40 transition-colors" }, /*#__PURE__*/
    React.createElement("td", { className: "py-4 pl-2 text-text-muted" },
    new Date(p.createdAt).toLocaleDateString([], { dateStyle: 'medium' })
    ), /*#__PURE__*/
    React.createElement("td", { className: "py-4" }, /*#__PURE__*/
    React.createElement("p", { className: "font-extrabold" }, p.customer?.name || 'Guest Client'), /*#__PURE__*/
    React.createElement("p", { className: "text-[9px] text-text-muted mt-0.5" }, p.customer?.email)
    ), /*#__PURE__*/
    React.createElement("td", { className: "py-4 uppercase tracking-wider text-xs" }, p.gateway), /*#__PURE__*/
    React.createElement("td", { className: "py-4 font-mono text-[10px] text-primary" }, p.transactionId), /*#__PURE__*/
    React.createElement("td", { className: "py-4 text-sm font-black" }, formatINR(p.amount)), /*#__PURE__*/
    React.createElement("td", { className: "py-4 text-right" }, /*#__PURE__*/
    React.createElement("span", { className: `inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm border ${
      p.status === 'succeeded' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
      p.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
      'bg-red-500/10 text-red-500 border-red-500/20'}` },

    p.status
    )
    )
    )
    )
    )
    )
    )

    ));

};

export default AdminReports;