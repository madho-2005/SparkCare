import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Trash2, Star, ShieldAlert, ShoppingBag, Wrench } from 'lucide-react';
import { fetchLatestReviews, deleteReviewAdmin } from '../redux/reviewSlice';
import Skeleton from '../components/ui/Skeleton';

export const AdminReviews = () => {
  const dispatch = useDispatch();
  const { latestReviews, loading } = useSelector((state) => state.reviews);

  useEffect(() => {
    dispatch(fetchLatestReviews());
  }, [dispatch]);

  const handlePurge = (id) => {
    if (window.confirm('Are you sure you want to permanently purge this comment? This will automatically recalculate item rating scores.')) {
      dispatch(deleteReviewAdmin(id));
    }
  };

  return (/*#__PURE__*/
    React.createElement("div", { className: "space-y-8" }, /*#__PURE__*/

    React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h1", { className: "text-3xl font-extrabold tracking-tight" }, "Reviews Moderation Center"), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted text-sm font-semibold mt-1" }, "Audit rating logs, review text submissions, and purge spam comments system-wide."

    )
    ), /*#__PURE__*/
    React.createElement("span", { className: "text-[10px] font-black bg-red-500/10 text-red-500 border border-red-500/15 px-3 py-1.5 rounded-full flex items-center gap-1 self-start" }, /*#__PURE__*/
    React.createElement(ShieldAlert, { size: 12 }), " Compliance Moderation Active"
    )
    ),

    loading ? /*#__PURE__*/
    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
    Array.from({ length: 4 }).map((_, i) => /*#__PURE__*/
    React.createElement("div", { key: i, className: "glass-card p-6 rounded-2xl border border-border shadow-sm space-y-4" }, /*#__PURE__*/
    React.createElement("div", { className: "flex justify-between" }, /*#__PURE__*/
    React.createElement(Skeleton, { variant: "text", className: "w-1/3 h-4" }), /*#__PURE__*/
    React.createElement(Skeleton, { variant: "text", className: "w-1/4 h-3" })
    ), /*#__PURE__*/
    React.createElement(Skeleton, { variant: "text", className: "w-full h-8" })
    )
    )
    ) :
    latestReviews.length === 0 ? /*#__PURE__*/
    React.createElement("div", { className: "glass-card p-12 text-center rounded-3xl border border-border space-y-4 max-w-md mx-auto" }, /*#__PURE__*/
    React.createElement("div", { className: "w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto" }, /*#__PURE__*/
    React.createElement(MessageSquare, { size: 30 })
    ), /*#__PURE__*/
    React.createElement("div", { className: "space-y-1" }, /*#__PURE__*/
    React.createElement("h3", { className: "font-extrabold text-lg" }, "No reviews found"), /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-text-muted font-semibold leading-relaxed" }, "Your users haven't posted any reviews yet or all testimonials have been purged."

    )
    )
    ) : /*#__PURE__*/

    /* Grid of reviews cards */
    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, /*#__PURE__*/
    React.createElement(AnimatePresence, null,
    latestReviews.map((review) => /*#__PURE__*/
    React.createElement(motion.div, {
      layout: true,
      key: review._id,
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      className: "glass-card bg-bg-primary border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-5" }, /*#__PURE__*/


    React.createElement("div", { className: "space-y-3" }, /*#__PURE__*/
    React.createElement("div", { className: "flex justify-between items-start gap-4" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("p", { className: "font-extrabold text-sm text-text-main" }, review.user?.name), /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] text-text-muted mt-0.5" }, review.user?.email)
    ), /*#__PURE__*/


    React.createElement("div", { className: "flex items-center gap-0.5" },
    Array.from({ length: 5 }).map((_, idx) => /*#__PURE__*/
    React.createElement(Star, {
      key: idx,
      size: 12,
      className: idx < review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 dark:text-slate-800' }
    )
    )
    )
    ), /*#__PURE__*/


    React.createElement("p", { className: "text-xs font-semibold text-text-muted leading-relaxed italic bg-bg-secondary/40 p-3 rounded-xl border border-border/40" }, "\"",
    review.comment, "\""
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "flex justify-between items-center border-t border-border/80 pt-4 text-[10px] font-bold" }, /*#__PURE__*/

    React.createElement("div", null,
    review.product ? /*#__PURE__*/
    React.createElement("span", { className: "inline-flex items-center gap-1 text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/10" }, /*#__PURE__*/
    React.createElement(ShoppingBag, { size: 10 }), " Product: ", review.product.name
    ) :
    review.service ? /*#__PURE__*/
    React.createElement("span", { className: "inline-flex items-center gap-1 text-secondary bg-secondary/10 px-2.5 py-1 rounded-md border border-secondary/10" }, /*#__PURE__*/
    React.createElement(Wrench, { size: 10 }), " Service: ", review.service.title
    ) : /*#__PURE__*/

    React.createElement("span", { className: "inline-flex items-center gap-1 text-slate-500 bg-slate-500/10 px-2.5 py-1 rounded-md border border-slate-500/10" }, "General Audit"

    )

    ), /*#__PURE__*/


    React.createElement("button", {
      onClick: () => handlePurge(review._id),
      className: "inline-flex items-center gap-1 text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/15 hover:border-red-500 px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-95" }, /*#__PURE__*/

    React.createElement(Trash2, { size: 12 }), " Purge Comment"
    )
    )
    )
    )
    )
    )

    ));

};

export default AdminReviews;