import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Check, X, Eye, AlertCircle } from 'lucide-react';
import { fetchPendingQrPayments, verifyPaymentProof } from '../redux/adminSlice';
import Skeleton from '../components/ui/Skeleton';
import { formatINR } from '../utils/currency';

export const AdminPayments = () => {
  const dispatch = useDispatch();
  const { pendingPayments, loading } = useSelector((state) => state.admin);
  const [selectedProof, setSelectedProof] = useState(null); // stores payment object to zoom in lightbox

  useEffect(() => {
    dispatch(fetchPendingQrPayments());
  }, [dispatch]);

  const handleVerify = (paymentId, action) => {
    dispatch(verifyPaymentProof({ paymentId, action }));
  };

  return (/*#__PURE__*/
    React.createElement("div", { className: "space-y-8" }, /*#__PURE__*/

    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h1", { className: "text-3xl font-extrabold tracking-tight" }, "QR UPI Payment Audits"), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted text-sm font-semibold mt-1" }, "Review, analyze, and authorize manual bank transfer receipts submitted by customers during checkout."

    )
    ),

    loading ? /*#__PURE__*/
    React.createElement(Skeleton.Table, { rows: 4, cols: 5 }) :
    pendingPayments.length === 0 ? /*#__PURE__*/
    /* Empty state */
    React.createElement("div", { className: "glass-card p-12 text-center rounded-3xl border border-border space-y-4 max-w-md mx-auto" }, /*#__PURE__*/
    React.createElement("div", { className: "w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto" }, /*#__PURE__*/
    React.createElement(CreditCard, { size: 30 })
    ), /*#__PURE__*/
    React.createElement("div", { className: "space-y-1" }, /*#__PURE__*/
    React.createElement("h3", { className: "font-extrabold text-lg" }, "No pending transfers"), /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-text-muted font-semibold leading-relaxed" }, "All UPI screenshots have been audited. Payments database matches current accounts."

    )
    )
    ) : /*#__PURE__*/

    /* Grid table */
    React.createElement("div", { className: "glass-card p-6 rounded-2xl border border-border shadow-md overflow-x-auto" }, /*#__PURE__*/
    React.createElement("table", { className: "w-full text-left border-collapse text-xs" }, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/
    React.createElement("tr", { className: "border-b border-border text-slate-400 font-bold uppercase tracking-wider" }, /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5 pl-2" }, "Customer Info"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5" }, "Transaction Ref ID"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5" }, "Fulfillment Target"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5" }, "Grand Total Due"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5 text-center" }, "Receipt Proof"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5 text-right" }, "Verification Action")
    )
    ), /*#__PURE__*/
    React.createElement("tbody", { className: "divide-y divide-border/60 font-bold text-text-main" },
    pendingPayments.map((payment) => /*#__PURE__*/
    React.createElement("tr", { key: payment._id, className: "hover:bg-bg-secondary/40 transition-colors" }, /*#__PURE__*/
    React.createElement("td", { className: "py-4 pl-2" }, /*#__PURE__*/
    React.createElement("p", { className: "font-extrabold text-sm" }, payment.customer?.name), /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] text-text-muted mt-0.5" }, payment.customer?.email)
    ), /*#__PURE__*/
    React.createElement("td", { className: "py-4 text-xs font-mono select-all text-primary" }, payment.transactionId), /*#__PURE__*/
    React.createElement("td", { className: "py-4" }, /*#__PURE__*/
    React.createElement("span", { className: "capitalize" }, payment.paymentType), /*#__PURE__*/
    React.createElement("span", { className: "text-[9px] text-text-muted block mt-0.5" }, "#", payment.referenceId)
    ), /*#__PURE__*/
    React.createElement("td", { className: "py-4 text-sm font-black" }, formatINR(payment.amount)), /*#__PURE__*/
    React.createElement("td", { className: "py-4 text-center" },
    payment.screenshot?.secure_url ? /*#__PURE__*/
    React.createElement("button", {
      onClick: () => setSelectedProof(payment),
      className: "relative group inline-block overflow-hidden w-12 h-12 rounded-lg border border-border cursor-pointer shadow-sm" }, /*#__PURE__*/

    React.createElement("img", {
      src: payment.screenshot.secure_url,
      alt: "Proof receipt",
      className: "w-full h-full object-cover transition-transform group-hover:scale-110" }
    ), /*#__PURE__*/
    React.createElement("div", { className: "absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity" }, /*#__PURE__*/
    React.createElement(Eye, { size: 14 })
    )
    ) : /*#__PURE__*/

    React.createElement("span", { className: "text-[10px] text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/15 flex items-center gap-1 w-max mx-auto" }, /*#__PURE__*/
    React.createElement(AlertCircle, { size: 10 }), " Missing"
    )

    ), /*#__PURE__*/
    React.createElement("td", { className: "py-4 text-right space-x-2" }, /*#__PURE__*/
    React.createElement("button", {
      onClick: () => handleVerify(payment._id, 'reject'),
      className: "inline-flex items-center gap-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/15 px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all active:scale-95 cursor-pointer" }, /*#__PURE__*/

    React.createElement(X, { size: 12 }), " Reject"
    ), /*#__PURE__*/
    React.createElement("button", {
      onClick: () => handleVerify(payment._id, 'approve'),
      className: "inline-flex items-center gap-1 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/15 px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all active:scale-95 cursor-pointer" }, /*#__PURE__*/

    React.createElement(Check, { size: 12 }), " Approve"
    )
    )
    )
    )
    )
    )
    ), /*#__PURE__*/



    React.createElement(AnimatePresence, null,
    selectedProof && /*#__PURE__*/
    React.createElement(motion.div, {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md",
      onClick: () => setSelectedProof(null) }, /*#__PURE__*/

    React.createElement(motion.div, {
      initial: { scale: 0.95, y: 15 },
      animate: { scale: 1, y: 0 },
      exit: { scale: 0.95, y: 15 },
      className: "relative max-w-2xl w-full glass-card bg-bg-primary rounded-3xl border border-border overflow-hidden p-4 space-y-4",
      onClick: (e) => e.stopPropagation() }, /*#__PURE__*/


    React.createElement("div", { className: "w-full max-h-[70vh] overflow-y-auto rounded-2xl bg-bg-secondary border border-border p-2" }, /*#__PURE__*/
    React.createElement("img", {
      src: selectedProof.screenshot?.secure_url,
      alt: "Full proof receipt",
      className: "w-full h-auto object-contain mx-auto rounded-xl" }
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-4 text-xs font-bold" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("p", { className: "font-extrabold text-sm text-text-main" }, "Ref ID: ", /*#__PURE__*/
    React.createElement("span", { className: "font-mono text-primary font-bold" }, selectedProof.transactionId)
    ), /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] text-text-muted mt-0.5" }, "Amount Due: ", /*#__PURE__*/
    React.createElement("span", { className: "text-text-main font-black text-xs" }, formatINR(selectedProof.amount)), " • Customer: ", selectedProof.customer?.name
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "flex gap-2" }, /*#__PURE__*/
    React.createElement("button", {
      onClick: () => {
        handleVerify(selectedProof._id, 'reject');
        setSelectedProof(null);
      },
      className: "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-extrabold transition-colors cursor-pointer" },
    "Reject Receipt"

    ), /*#__PURE__*/
    React.createElement("button", {
      onClick: () => {
        handleVerify(selectedProof._id, 'approve');
        setSelectedProof(null);
      },
      className: "bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-extrabold transition-colors cursor-pointer" },
    "Approve Payment"

    )
    )
    ), /*#__PURE__*/


    React.createElement("button", {
      onClick: () => setSelectedProof(null),
      className: "absolute top-2.5 right-2.5 p-2 bg-bg-secondary hover:bg-bg-primary border border-border/80 text-text-muted hover:text-text-main rounded-full transition-colors" }, /*#__PURE__*/

    React.createElement(X, { size: 16 })
    )
    )
    )

    )
    ));

};

export default AdminPayments;