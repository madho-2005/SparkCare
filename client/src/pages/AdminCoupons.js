import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminCoupons,
  createCoupon,
  deleteCoupon } from
'../redux/adminSlice';
import {
  Ticket,
  Plus,
  Trash2,
  Calendar,
  IndianRupee,
  Percent,
  Clock,
  AlertTriangle } from
'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';

export const AdminCoupons = () => {
  const dispatch = useDispatch();
  const { coupons, loading } = useSelector((state) => state.admin);

  // Form State variables
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminCoupons());
  }, [dispatch]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code || !discountValue || !expiryDate) {
      toast.error('Please complete all required fields (Code, Value, Expiry Date)');
      return;
    }

    const couponData = {
      code: code.trim().toUpperCase(),
      description: description.trim() || undefined,
      discountType,
      discountValue: Number(discountValue),
      expiryDate,
      minPurchaseAmount: minPurchaseAmount ? Number(minPurchaseAmount) : 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null
    };

    setIsSubmitting(true);
    try {
      await dispatch(createCoupon(couponData)).unwrap();
      // Reset form on success
      setCode('');
      setDescription('');
      setDiscountValue('');
      setMinPurchaseAmount('');
      setMaxDiscountAmount('');
      setExpiryDate('');
      setUsageLimit('');
    } catch {

      // toast.error is already handled by Redux thunk extraReducers
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (couponId) => {
    if (window.confirm('Are you sure you want to permanently delete this coupon code?')) {
      try {
        await dispatch(deleteCoupon(couponId)).unwrap();
      } catch {
        // Handled
      }}
  };

  // Helper: check if expired
  const isExpired = (expiry) => {
    return new Date() > new Date(expiry);
  };

  // Helper: check if limit reached
  const isLimitReached = (used, limit) => {
    return limit !== null && used >= limit;
  };

  return (/*#__PURE__*/
    React.createElement("div", { className: "space-y-8" }, /*#__PURE__*/

    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h1", { className: "text-3xl font-extrabold tracking-tight" }, "Promo Coupon Manager"), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted mt-2 font-semibold" }, "Oversee campaign discount codes, construct percentage rates, and adjust minimum subtotal thresholds.")
    ), /*#__PURE__*/

    React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8 items-start" }, /*#__PURE__*/

    React.createElement("div", { className: "glass-card bg-bg-primary p-6 rounded-2xl border border-border shadow-lg space-y-6 lg:col-span-1 sticky top-24" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-2 border-b border-border pb-3" }, /*#__PURE__*/
    React.createElement("div", { className: "p-1.5 bg-primary/10 text-primary rounded-lg" }, /*#__PURE__*/
    React.createElement(Plus, { size: 16 })
    ), /*#__PURE__*/
    React.createElement("h2", { className: "font-extrabold text-sm text-text-main uppercase" }, "Generate Promo Code")
    ), /*#__PURE__*/

    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" }, /*#__PURE__*/

    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-black text-text-muted uppercase mb-1.5" }, "Coupon Code *"), /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      placeholder: "e.g. SPARKSUMMER30",
      value: code,
      onChange: (e) => setCode(e.target.value),
      required: true,
      className: "w-full bg-bg-secondary text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all font-semibold uppercase tracking-wider" }
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-black text-text-muted uppercase mb-1.5" }, "Type *"), /*#__PURE__*/
    React.createElement("select", {
      value: discountType,
      onChange: (e) => setDiscountType(e.target.value),
      className: "w-full bg-bg-secondary text-text-main text-xs px-3 py-2.5 rounded-xl border border-border focus:outline-none cursor-pointer font-bold" }, /*#__PURE__*/

    React.createElement("option", { value: "percentage" }, "Percent (%)"), /*#__PURE__*/
    React.createElement("option", { value: "fixed_amount" }, "Fixed (₹)")
    )
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-black text-text-muted uppercase mb-1.5" }, "Value *"), /*#__PURE__*/
    React.createElement("div", { className: "relative" }, /*#__PURE__*/
    React.createElement("span", { className: "absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none" },
    discountType === 'percentage' ? /*#__PURE__*/React.createElement(Percent, { size: 12 }) : /*#__PURE__*/React.createElement(IndianRupee, { size: 12 })
    ), /*#__PURE__*/
    React.createElement("input", {
      type: "number",
      placeholder: discountType === 'percentage' ? '15' : '10',
      value: discountValue,
      onChange: (e) => setDiscountValue(e.target.value),
      required: true,
      min: "1",
      className: "w-full bg-bg-secondary text-text-main text-xs pl-8 pr-3 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/30 focus:outline-none font-semibold" }
    )
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-black text-text-muted uppercase mb-1.5" }, "Expiry Date *"), /*#__PURE__*/
    React.createElement("div", { className: "relative" }, /*#__PURE__*/
    React.createElement("span", { className: "absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none" }, /*#__PURE__*/
    React.createElement(Calendar, { size: 12 })
    ), /*#__PURE__*/
    React.createElement("input", {
      type: "date",
      value: expiryDate,
      onChange: (e) => setExpiryDate(e.target.value),
      required: true,
      className: "w-full bg-bg-secondary text-text-main text-xs pl-8 pr-3 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/30 focus:outline-none font-semibold cursor-pointer" }
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-black text-text-muted uppercase mb-1.5" }, "Min Purchase Limit (₹)"), /*#__PURE__*/
    React.createElement("div", { className: "relative" }, /*#__PURE__*/
    React.createElement("span", { className: "absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none" }, /*#__PURE__*/
    React.createElement(IndianRupee, { size: 12 })
    ), /*#__PURE__*/
    React.createElement("input", {
      type: "number",
      placeholder: "0 (no limit)",
      value: minPurchaseAmount,
      onChange: (e) => setMinPurchaseAmount(e.target.value),
      min: "0",
      className: "w-full bg-bg-secondary text-text-main text-xs pl-8 pr-3 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/30 focus:outline-none font-semibold" }
    )
    )
    ),


    discountType === 'percentage' && /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-black text-text-muted uppercase mb-1.5" }, "Max Discount (₹ limit)"), /*#__PURE__*/
    React.createElement("div", { className: "relative" }, /*#__PURE__*/
    React.createElement("span", { className: "absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none" }, /*#__PURE__*/
    React.createElement(IndianRupee, { size: 12 })
    ), /*#__PURE__*/
    React.createElement("input", {
      type: "number",
      placeholder: "e.g. 50 (cap value)",
      value: maxDiscountAmount,
      onChange: (e) => setMaxDiscountAmount(e.target.value),
      min: "1",
      className: "w-full bg-bg-secondary text-text-main text-xs pl-8 pr-3 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/30 focus:outline-none font-semibold" }
    )
    )
    ), /*#__PURE__*/



    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-black text-text-muted uppercase mb-1.5" }, "Offer Description / Campaign Note"), /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      placeholder: "e.g. Save on all summer services",
      value: description,
      onChange: (e) => setDescription(e.target.value),
      className: "w-full bg-bg-secondary text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/30 focus:outline-none font-semibold" }
    )
    ), /*#__PURE__*/

    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-black text-text-muted uppercase mb-1.5" }, "Max usage count"), /*#__PURE__*/
    React.createElement("input", {
      type: "number",
      placeholder: "No limit",
      value: usageLimit,
      onChange: (e) => setUsageLimit(e.target.value),
      min: "1",
      className: "w-full bg-bg-secondary text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/30 focus:outline-none font-semibold" }
    )
    ), /*#__PURE__*/

    React.createElement("button", {
      type: "submit",
      disabled: isSubmitting,
      className: "w-full bg-primary hover:bg-primary-light text-white font-extrabold py-3.5 rounded-xl text-xs shadow-md transition-colors disabled:opacity-50 cursor-pointer" },

    isSubmitting ? 'Activating code...' : 'Activate Promo Coupon'
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "glass-card bg-bg-primary p-6 rounded-2xl border border-border shadow-lg lg:col-span-2 space-y-6" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-2 border-b border-border pb-3" }, /*#__PURE__*/
    React.createElement("div", { className: "p-1.5 bg-primary/10 text-primary rounded-lg" }, /*#__PURE__*/
    React.createElement(Ticket, { size: 16 })
    ), /*#__PURE__*/
    React.createElement("h2", { className: "font-extrabold text-sm text-text-main uppercase" }, "Registered Campaign Coupons (", coupons.length, ")")
    ),

    loading ? /*#__PURE__*/
    React.createElement(Skeleton.Table, { cols: 5, rows: 4 }) :
    coupons.length === 0 ? /*#__PURE__*/
    React.createElement("div", { className: "text-center py-16" }, /*#__PURE__*/
    React.createElement(AlertTriangle, { size: 48, className: "mx-auto text-text-muted mb-4" }), /*#__PURE__*/
    React.createElement("h3", { className: "text-base font-extrabold text-text-main" }, "No Promo Coupons Found"), /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-text-muted mt-2 max-w-sm mx-auto font-semibold" }, "Generate your first promotional discount coupon code using the form to expedite shop checkouts."

    )
    ) : /*#__PURE__*/

    React.createElement("div", { className: "overflow-x-auto w-full" }, /*#__PURE__*/
    React.createElement("table", { className: "w-full text-left border-collapse" }, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/
    React.createElement("tr", { className: "border-b border-border/80 text-xxs text-text-muted uppercase font-black tracking-wider" }, /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5 pl-2" }, "Coupon Info"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5" }, "Discount Rate"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5" }, "Fulfillment Limits"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5" }, "Campaign Status"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5" }, "Expiry Date"), /*#__PURE__*/
    React.createElement("th", { className: "pb-3.5 text-right pr-4" }, "Actions")
    )
    ), /*#__PURE__*/
    React.createElement("tbody", { className: "divide-y divide-border/50 text-xs font-semibold" },
    coupons.map((c) => {
      const expired = isExpired(c.expiryDate);
      const limitReached = isLimitReached(c.usedCount, c.usageLimit);
      const active = !c.isActive ? false : !expired && !limitReached;

      return (/*#__PURE__*/
        React.createElement("tr", { key: c._id, className: "hover:bg-bg-secondary/40 transition-colors" }, /*#__PURE__*/

        React.createElement("td", { className: "py-4 pl-2" }, /*#__PURE__*/
        React.createElement("span", { className: "text-text-main font-black block tracking-tight uppercase" }, c.code),
        c.description && /*#__PURE__*/React.createElement("span", { className: "text-[10px] text-text-muted italic block line-clamp-1" }, c.description), /*#__PURE__*/
        React.createElement("span", { className: "text-[10px] text-text-muted block mt-0.5 font-bold" }, "Usages: ",
        c.usedCount, " ", c.usageLimit !== null ? `/ ${c.usageLimit}` : 'times'
        )
        ), /*#__PURE__*/

        React.createElement("td", { className: "py-4 font-extrabold text-primary" },
        c.discountType === 'percentage' ? /*#__PURE__*/
        React.createElement("span", { className: "flex items-center gap-0.5" }, /*#__PURE__*/React.createElement(Percent, { size: 12 }), " ", c.discountValue, "% Off") : /*#__PURE__*/

        React.createElement("span", { className: "flex items-center gap-0.5" }, formatINR(c.discountValue), " Off")

        ), /*#__PURE__*/

        React.createElement("td", { className: "py-4 space-y-1" }, /*#__PURE__*/
        React.createElement("span", { className: "block text-[10px] text-text-muted" }, "Min Purchase: ", /*#__PURE__*/
        React.createElement("strong", null, formatINR(c.minPurchaseAmount))
        ),
        c.maxDiscountAmount && /*#__PURE__*/
        React.createElement("span", { className: "block text-[10px] text-text-muted" }, "Cap Limit: ", /*#__PURE__*/
        React.createElement("strong", null, formatINR(c.maxDiscountAmount))
        )

        ), /*#__PURE__*/

        React.createElement("td", { className: "py-4" }, /*#__PURE__*/
        React.createElement("span", { className: `inline-flex items-center text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
          active ?
          'bg-green-500/10 text-green-500 border-green-500/20' :
          'bg-red-500/10 text-red-500 border-red-500/20'}` },

        active ? 'Active' : expired ? 'Expired' : limitReached ? 'Usage Cap Reached' : 'Suspended'
        )
        ), /*#__PURE__*/

        React.createElement("td", { className: "py-4" }, /*#__PURE__*/
        React.createElement("span", { className: "text-text-muted text-[10px] flex items-center gap-1" }, /*#__PURE__*/
        React.createElement(Clock, { size: 12, className: "text-primary shrink-0" }),
        new Date(c.expiryDate).toLocaleDateString()
        )
        ), /*#__PURE__*/

        React.createElement("td", { className: "py-4 text-right pr-4" }, /*#__PURE__*/
        React.createElement("button", {
          onClick: () => handleDelete(c._id),
          className: "p-2.5 text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all",
          title: "Delete Coupon" }, /*#__PURE__*/

        React.createElement(Trash2, { size: 14 })
        )
        )
        ));

    })
    )
    )
    )

    )
    )
    ));

};

export default AdminCoupons;