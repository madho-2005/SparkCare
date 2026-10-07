import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, ShieldCheck, MapPin,
  CreditCard, CheckCircle, Copy, Check, Upload,
  Printer, Landmark, Package, Clock } from
'lucide-react';
import {
  setShippingAddress,
  setPaymentMethod } from
'../redux/cartSlice';
import { placeOrder, uploadQrProof, resetOrderState } from '../redux/orderSlice';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';

export const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Selector mappings
  const { items, shippingAddress, paymentMethod, coupon } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { currentOrder, loading, success } = useSelector((state) => state.order);

  // States
  const [step, setStep] = useState(1); // Steps: 1 = Address, 2 = Payment/Review
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: shippingAddress.street || '',
    city: shippingAddress.city || '',
    state: shippingAddress.state || '',
    zipCode: shippingAddress.zipCode || ''
  });

  const [qrScreenshot, setQrScreenshot] = useState(null);
  const [qrTxnId, setQrTxnId] = useState('');
  const [copied, setCopied] = useState(false);

  // Operational Settings sync states
  const [settings, setSettings] = useState({
    taxRate: 8,
    freeShippingThreshold: 100,
    shippingFee: 10,
    upiId: 'sparkcare@upi'
  });

  useEffect(() => {
    const syncSettings = () => {
      const saved = localStorage.getItem('sparkcare_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings({
            taxRate: typeof parsed.taxRate === 'number' ? parsed.taxRate : 8,
            freeShippingThreshold: typeof parsed.freeShippingThreshold === 'number' ? parsed.freeShippingThreshold : 100,
            shippingFee: typeof parsed.shippingFee === 'number' ? parsed.shippingFee : 10,
            upiId: parsed.upiId || 'sparkcare@upi'
          });
        } catch (e) {
          console.error(e);
        }
      }
    };

    syncSettings();
    window.addEventListener('sparkcare-settings-sync', syncSettings);
    return () => window.removeEventListener('sparkcare-settings-sync', syncSettings);
  }, []);

  // Subtotal calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = coupon ? coupon.discountAmount : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number((taxableAmount * (settings.taxRate / 100)).toFixed(2));
  const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const grandTotal = Number((taxableAmount + tax + shippingFee).toFixed(2));

  // Redirect if cart is empty and order isn't successful yet
  useEffect(() => {
    if (items.length === 0 && !success) {
      navigate('/cart');
    }
  }, [items, success, navigate]);

  // Cleanup order success thunk caches on mount
  useEffect(() => {
    dispatch(resetOrderState());
  }, [dispatch]);

  // Address submission
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const { street, city, state, zipCode } = addressForm;
    if (!street || !city || !state || !zipCode) {
      toast.error('Please fill in all shipping details');
      return;
    }
    dispatch(setShippingAddress(addressForm));
    setStep(2);
  };

  // Clipboard Copier
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopied(true);
    toast.success('UPI ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // QR Proof File Picker
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setQrScreenshot(e.target.files[0]);
    }
  };

  // Submits order
  const handlePlaceOrder = async () => {
    // Prevent duplicate orders from double-clicking or rapid clicking
    if (loading || isSubmitting) return;

    const orderData = {
      items: items.map((item) => ({ product: item.product, quantity: item.quantity })),
      shippingAddress: addressForm,
      paymentMethod,
      couponCode: coupon ? coupon.code : undefined
    };

    // If UPI chosen, verify image proof has been selected before placing order
    if (paymentMethod === 'qr' && !qrScreenshot) {
      toast.error('Please upload your payment screenshot before placing order.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Submit order to backend
      const res = await dispatch(placeOrder(orderData)).unwrap();

      // 2. If UPI receipt proof needs uploading
      if (paymentMethod === 'qr' && res?.order?._id) {
        const formData = new FormData();
        formData.append('screenshot', qrScreenshot);
        if (qrTxnId) {
          formData.append('transactionId', qrTxnId);
        }
        await dispatch(uploadQrProof({ orderId: res.order._id, formData })).unwrap();
      }

      // 3. Backend successfully confirmed order creation: redirect directly to customer's Orders page
      toast.success(paymentMethod === 'qr' ? 'Order placed and payment proof submitted!' : 'Order placed successfully!');
      navigate('/account?tab=orders');
    } catch (err) {
      console.error('[Checkout] Order creation failed:', err);
      // Stay on checkout page on failure - do NOT redirect
    } finally {
      setIsSubmitting(false);
    }
  };

  // Launch browser corporate print overlay
  const handlePrintInvoice = () => {
    window.print();
  };

  return (/*#__PURE__*/
    React.createElement("div", { className: "min-h-screen py-12 px-4 md:px-8 max-w-5xl mx-auto space-y-10 print:py-0 print:px-0 print:max-w-full" },


    step < 3 && /*#__PURE__*/
    React.createElement("div", { className: "flex justify-center items-center gap-4 text-xs font-bold uppercase tracking-wider text-text-muted print:hidden" }, /*#__PURE__*/
    React.createElement("div", { className: `flex items-center gap-1.5 ${step >= 1 ? 'text-primary font-black' : ''}` }, /*#__PURE__*/
    React.createElement("span", { className: `w-6 h-6 rounded-full flex items-center justify-center border ${step >= 1 ? 'border-primary bg-primary/10' : 'border-border'}` }, "1"), /*#__PURE__*/
    React.createElement("span", null, "Address")
    ), /*#__PURE__*/
    React.createElement("div", { className: "w-12 h-px bg-border" }), /*#__PURE__*/
    React.createElement("div", { className: `flex items-center gap-1.5 ${step >= 2 ? 'text-primary font-black' : ''}` }, /*#__PURE__*/
    React.createElement("span", { className: `w-6 h-6 rounded-full flex items-center justify-center border ${step >= 2 ? 'border-primary bg-primary/10' : 'border-border'}` }, "2"), /*#__PURE__*/
    React.createElement("span", null, "Payment & Review")
    ), /*#__PURE__*/
    React.createElement("div", { className: "w-12 h-px bg-border" }), /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-1.5" }, /*#__PURE__*/
    React.createElement("span", { className: "w-6 h-6 rounded-full flex items-center justify-center border border-border" }, "3"), /*#__PURE__*/
    React.createElement("span", null, "Success")
    )
    ), /*#__PURE__*/


    React.createElement(AnimatePresence, { mode: "wait" },
    step === 1 && /*#__PURE__*/
    /* STEP 1: SHIPPING ADDRESS */
    React.createElement(motion.div, {
      key: "step1",
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      className: "grid grid-cols-1 md:grid-cols-3 gap-8 items-start print:hidden" }, /*#__PURE__*/


    React.createElement("div", { className: "md:col-span-2 glass-card bg-bg-primary border border-border p-6 md:p-8 rounded-3xl shadow-lg space-y-6" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-3" }, /*#__PURE__*/
    React.createElement("div", { className: "p-3 bg-primary/10 text-primary rounded-2xl" }, /*#__PURE__*/
    React.createElement(MapPin, { size: 22 })
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h2", { className: "text-xl font-extrabold" }, "Shipping Coordinates"), /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-text-muted mt-0.5" }, "Where should we deliver your electrical gear?")
    )
    ), /*#__PURE__*/

    React.createElement("form", { onSubmit: handleAddressSubmit, className: "space-y-4" }, /*#__PURE__*/
    React.createElement("div", { className: "space-y-1.5" }, /*#__PURE__*/
    React.createElement("label", { className: "text-xs font-bold text-text-muted" }, "Street Address"), /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      required: true,
      value: addressForm.street,
      onChange: (e) => setAddressForm({ ...addressForm, street: e.target.value }),
      className: "w-full bg-bg-secondary text-sm font-semibold px-4 py-3 rounded-xl border border-border/80 focus:outline-none focus:border-primary",
      placeholder: "e.g. Mira Madhav Residency, Kosamdi" }
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" }, /*#__PURE__*/
    React.createElement("div", { className: "space-y-1.5" }, /*#__PURE__*/
    React.createElement("label", { className: "text-xs font-bold text-text-muted" }, "City"), /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      required: true,
      value: addressForm.city,
      onChange: (e) => setAddressForm({ ...addressForm, city: e.target.value }),
      className: "w-full bg-bg-secondary text-sm font-semibold px-4 py-3 rounded-xl border border-border/80 focus:outline-none focus:border-primary",
      placeholder: "Ankleshwar" }
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "space-y-1.5" }, /*#__PURE__*/
    React.createElement("label", { className: "text-xs font-bold text-text-muted" }, "State"), /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      required: true,
      value: addressForm.state,
      onChange: (e) => setAddressForm({ ...addressForm, state: e.target.value }),
      className: "w-full bg-bg-secondary text-sm font-semibold px-4 py-3 rounded-xl border border-border/80 focus:outline-none focus:border-primary",
      placeholder: "Gujarat" }
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "space-y-1.5" }, /*#__PURE__*/
    React.createElement("label", { className: "text-xs font-bold text-text-muted" }, "Zip Code"), /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      required: true,
      value: addressForm.zipCode,
      onChange: (e) => setAddressForm({ ...addressForm, zipCode: e.target.value }),
      className: "w-full bg-bg-secondary text-sm font-semibold px-4 py-3 rounded-xl border border-border/80 focus:outline-none focus:border-primary",
      placeholder: "393002" }
    )
    )
    ), /*#__PURE__*/

    React.createElement("button", {
      type: "submit",
      className: "w-full bg-primary hover:bg-primary-light text-white font-extrabold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 cursor-pointer" },
    "Proceed to Payment Gateway ", /*#__PURE__*/
    React.createElement(ArrowRight, { size: 16 })
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "glass-card bg-bg-primary border border-border p-6 rounded-2xl shadow-sm space-y-4" }, /*#__PURE__*/
    React.createElement("h3", { className: "font-extrabold text-sm border-b border-border pb-2.5" }, "Items Summary"), /*#__PURE__*/
    React.createElement("div", { className: "space-y-3 max-h-60 overflow-y-auto" },
    items.map((item) => /*#__PURE__*/
    React.createElement("div", { key: item.product, className: "flex justify-between items-center text-xs font-bold" }, /*#__PURE__*/
    React.createElement("div", { className: "min-w-0 flex-1 pr-2" }, /*#__PURE__*/
    React.createElement("p", { className: "truncate text-text-main" }, item.name), /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] text-text-muted" }, "Qty: ", item.quantity, " × ", formatINR(item.price))
    ), /*#__PURE__*/
    React.createElement("span", { className: "text-primary font-black" }, formatINR(item.quantity * item.price))
    )
    )
    )
    )
    ),


    step === 2 && /*#__PURE__*/
    /* STEP 2: PAYMENT METHOD & REVIEW */
    React.createElement(motion.div, {
      key: "step2",
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      className: "grid grid-cols-1 md:grid-cols-3 gap-8 items-start print:hidden" }, /*#__PURE__*/


    React.createElement("div", { className: "md:col-span-2 space-y-6" }, /*#__PURE__*/


    React.createElement("div", { className: "glass-card bg-bg-primary border border-border p-6 md:p-8 rounded-3xl shadow-lg space-y-6" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-3" }, /*#__PURE__*/
    React.createElement("div", { className: "p-3 bg-primary/10 text-primary rounded-2xl" }, /*#__PURE__*/
    React.createElement(CreditCard, { size: 22 })
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h2", { className: "text-xl font-extrabold" }, "Fulfillment Gateway"), /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-text-muted mt-0.5" }, "Select a payment gateway to complete checkout")
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, /*#__PURE__*/

    React.createElement("div", {
      onClick: () => dispatch(setPaymentMethod('cod')),
      className: `glass-card p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between h-36 ${
      paymentMethod === 'cod' ?
      'border-primary bg-primary/5 shadow-md shadow-primary/5' :
      'border-border/80 hover:border-text-muted bg-transparent'}` }, /*#__PURE__*/


    React.createElement("div", { className: "flex justify-between items-center" }, /*#__PURE__*/
    React.createElement(Landmark, { className: paymentMethod === 'cod' ? 'text-primary' : 'text-text-muted', size: 24 }), /*#__PURE__*/
    React.createElement("div", { className: `w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary bg-primary text-white' : 'border-border'}` },
    paymentMethod === 'cod' && /*#__PURE__*/React.createElement(Check, { size: 12 })
    )
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("p", { className: "font-extrabold text-sm" }, "Cash on Delivery (COD)"), /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] text-text-muted mt-0.5" }, "Pay in cash when order arrives at address")
    )
    ), /*#__PURE__*/


    React.createElement("div", {
      onClick: () => dispatch(setPaymentMethod('qr')),
      className: `glass-card p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between h-36 ${
      paymentMethod === 'qr' ?
      'border-primary bg-primary/5 shadow-md shadow-primary/5' :
      'border-border/80 hover:border-text-muted bg-transparent'}` }, /*#__PURE__*/


    React.createElement("div", { className: "flex justify-between items-center" }, /*#__PURE__*/
    React.createElement(Upload, { className: paymentMethod === 'qr' ? 'text-primary' : 'text-text-muted', size: 24 }), /*#__PURE__*/
    React.createElement("div", { className: `w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'qr' ? 'border-primary bg-primary text-white' : 'border-border'}` },
    paymentMethod === 'qr' && /*#__PURE__*/React.createElement(Check, { size: 12 })
    )
    ), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("p", { className: "font-extrabold text-sm" }, "UPI QR Receipt Scan"), /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] text-text-muted mt-0.5" }, "Transfer via UPI and submit proof")
    )
    )
    ),


    paymentMethod === 'qr' && /*#__PURE__*/
    React.createElement(motion.div, {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      className: "p-5 bg-bg-secondary rounded-2xl border border-border/80 space-y-4" }, /*#__PURE__*/

    React.createElement("p", { className: "text-xs font-bold text-text-muted" }, "UPI QR Checkout panel"), /*#__PURE__*/
    React.createElement("div", { className: "flex flex-col sm:flex-row items-center gap-5" }, /*#__PURE__*/


    React.createElement("div", { className: "w-32 h-32 bg-white p-2 rounded-xl shadow border border-slate-200 flex flex-col justify-between" }, /*#__PURE__*/
    React.createElement("div", { className: "w-full flex-grow flex items-center justify-center" }, /*#__PURE__*/

    React.createElement("svg", { viewBox: "0 0 100 100", className: "w-24 h-24 text-slate-800" }, /*#__PURE__*/
    React.createElement("rect", { width: "100", height: "100", fill: "#fff" }), /*#__PURE__*/
    React.createElement("rect", { x: "5", y: "5", width: "20", height: "20", fill: "currentColor" }), /*#__PURE__*/
    React.createElement("rect", { x: "10", y: "10", width: "10", height: "10", fill: "#fff" }), /*#__PURE__*/
    React.createElement("rect", { x: "75", y: "5", width: "20", height: "20", fill: "currentColor" }), /*#__PURE__*/
    React.createElement("rect", { x: "80", y: "10", width: "10", height: "10", fill: "#fff" }), /*#__PURE__*/
    React.createElement("rect", { x: "5", y: "75", width: "20", height: "20", fill: "currentColor" }), /*#__PURE__*/
    React.createElement("rect", { x: "10", y: "80", width: "10", height: "10", fill: "#fff" }), /*#__PURE__*/
    React.createElement("rect", { x: "30", y: "30", width: "40", height: "40", fill: "currentColor" }), /*#__PURE__*/
    React.createElement("rect", { x: "40", y: "40", width: "20", height: "20", fill: "#fff" }), /*#__PURE__*/
    React.createElement("rect", { x: "85", y: "85", width: "10", height: "10", fill: "currentColor" })
    )
    ), /*#__PURE__*/
    React.createElement("p", { className: "text-[7px] text-center text-slate-400 font-extrabold uppercase" }, "SparkCare UPI QR")
    ), /*#__PURE__*/

    React.createElement("div", { className: "flex-1 space-y-3 w-full" }, /*#__PURE__*/
    React.createElement("div", { className: "space-y-1" }, /*#__PURE__*/
    React.createElement("span", { className: "text-[10px] text-text-muted uppercase font-bold" }, "UPI ID (Scan & Pay)"), /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-2" }, /*#__PURE__*/
    React.createElement("span", { className: "text-sm font-black text-primary" }, settings.upiId), /*#__PURE__*/
    React.createElement("button", {
      onClick: handleCopyUpi,
      className: "p-1.5 rounded-lg hover:bg-bg-primary text-text-muted transition-colors" },

    copied ? /*#__PURE__*/React.createElement(Check, { size: 14, className: "text-green-500" }) : /*#__PURE__*/React.createElement(Copy, { size: 14 })
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "space-y-2" }, /*#__PURE__*/
    React.createElement("span", { className: "text-[10px] text-text-muted uppercase font-bold" }, "Upload screenshot receipt"), /*#__PURE__*/
    React.createElement("label", { className: "flex items-center justify-center border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-3 bg-bg-primary cursor-pointer transition-colors text-xs font-bold text-text-muted gap-2" }, /*#__PURE__*/
    React.createElement(Upload, { size: 14 }), /*#__PURE__*/
    React.createElement("span", null, qrScreenshot ? qrScreenshot.name : 'Select JPG/PNG receipt proof'), /*#__PURE__*/
    React.createElement("input", {
      type: "file",
      accept: "image/*",
      required: true,
      onChange: handleFileChange,
      className: "hidden" }
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "space-y-1" }, /*#__PURE__*/
    React.createElement("label", { className: "text-[10px] text-text-muted uppercase font-bold" }, "Transaction Reference ID (Optional)"), /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      value: qrTxnId,
      onChange: (e) => setQrTxnId(e.target.value),
      placeholder: "e.g. UPI1092837482",
      className: "w-full bg-bg-primary text-xs font-bold px-3 py-2 rounded-lg border border-border/80 focus:outline-none focus:border-primary" }
    )
    )
    )

    )
    )

    ), /*#__PURE__*/


    React.createElement("button", {
      onClick: () => setStep(1),
      className: "inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-text-main" }, /*#__PURE__*/

    React.createElement(ArrowLeft, { size: 12 }), " Back to Shipping Address"
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "space-y-6" }, /*#__PURE__*/
    React.createElement("div", { className: "glass-card bg-bg-primary border border-border p-6 rounded-2xl shadow-sm space-y-6" }, /*#__PURE__*/
    React.createElement("h3", { className: "font-extrabold text-sm border-b border-border pb-3" }, "Final Ledger"), /*#__PURE__*/

    React.createElement("div", { className: "space-y-3.5 text-xs font-bold" }, /*#__PURE__*/
    React.createElement("div", { className: "flex justify-between text-text-muted" }, /*#__PURE__*/
    React.createElement("span", null, "Subtotal"), /*#__PURE__*/
    React.createElement("span", null, formatINR(subtotal))
    ),

    coupon && /*#__PURE__*/
    React.createElement("div", { className: "flex justify-between text-green-500" }, /*#__PURE__*/
    React.createElement("span", null, "Discount (", coupon.code, ")"), /*#__PURE__*/
    React.createElement("span", null, "-", formatINR(coupon.discountAmount))
    ), /*#__PURE__*/


    React.createElement("div", { className: "flex justify-between text-text-muted" }, /*#__PURE__*/
    React.createElement("span", null, "Flat Tax (", settings.taxRate, "%)"), /*#__PURE__*/
    React.createElement("span", null, formatINR(tax))
    ), /*#__PURE__*/

    React.createElement("div", { className: "flex justify-between text-text-muted" }, /*#__PURE__*/
    React.createElement("span", null, "Shipping Fee"), /*#__PURE__*/
    React.createElement("span", null, shippingFee === 0 ? 'FREE' : formatINR(shippingFee))
    ), /*#__PURE__*/

    React.createElement("div", { className: "border-t border-border pt-4 flex justify-between items-end" }, /*#__PURE__*/
    React.createElement("span", { className: "text-xs text-text-muted font-bold" }, "Total Payment Due"), /*#__PURE__*/
    React.createElement("span", { className: "text-xl font-black text-primary" }, formatINR(grandTotal))
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "p-3.5 bg-bg-secondary rounded-xl border border-border text-[10px] text-text-muted font-bold space-y-1" }, /*#__PURE__*/
    React.createElement("p", { className: "text-text-main font-extrabold flex items-center gap-1" }, "🔒 Secure SparkCare Processing"), /*#__PURE__*/
    React.createElement("p", null, "By hitting Place Order, you authorize this transaction and accept SparkCare's ",
      React.createElement(Link, { to: "/terms-and-conditions", target: "_blank", className: "text-primary hover:underline font-extrabold" }, "Terms & Conditions"),
      " and ",
      React.createElement(Link, { to: "/privacy-policy", target: "_blank", className: "text-primary hover:underline font-extrabold" }, "Privacy Policy"),
      "."
    )
    ), /*#__PURE__*/

    React.createElement("button", {
      onClick: handlePlaceOrder,
      disabled: loading || isSubmitting,
      className: "w-full bg-primary hover:bg-primary-light text-white font-extrabold py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none" },

    (loading || isSubmitting) ? 'Processing Order...' : /*#__PURE__*/React.createElement(React.Fragment, null, "Place Order & Generate Invoice ", /*#__PURE__*/React.createElement(ShieldCheck, { size: 18 }))
    )
    )
    )
    ),


    step === 3 && /*#__PURE__*/
    /* STEP 3: SUCCESS AND CORPORATE PRINT-READY INVOICE VIEW */
    React.createElement(motion.div, {
      key: "step3",
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      className: "space-y-8" }, /*#__PURE__*/



    React.createElement("div", { className: "glass-card bg-bg-primary border border-border p-6 md:p-8 rounded-3xl shadow-xl flex flex-col gap-6 print:hidden" },
    React.createElement("div", { className: "flex flex-col sm:flex-row items-center gap-6" },
    React.createElement("div", { className: "w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center flex-shrink-0 animate-bounce" },
    React.createElement(CheckCircle, { size: 36 })
    ),
    React.createElement("div", { className: "flex-1 space-y-2 text-center sm:text-left" },
    React.createElement("h2", { className: "text-2xl font-black text-text-main" }, paymentMethod === 'qr' ? "Payment Proof Submitted!" : "Order Successfully Placed!"),
    React.createElement("p", { className: "text-xs text-text-muted font-semibold leading-relaxed" },
      paymentMethod === 'qr'
        ? React.createElement(React.Fragment, null, "Your order ", React.createElement("strong", null, "#", currentOrder?.order?._id), " has been placed. Payment proof submitted. Your order will be confirmed after admin verification.")
        : React.createElement(React.Fragment, null, "Thank you for placing order ", React.createElement("strong", null, "#", currentOrder?.order?._id), ". We've compiled your corporate receipt. Confirmation email spooled.")
    )
    ),
    React.createElement("div", { className: "flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto" },
    React.createElement("button", {
      onClick: () => navigate('/account?tab=orders'),
      className: "bg-primary hover:bg-primary-light text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95" },
    React.createElement(Package, { size: 16 }), " View Order Summary & Tracking"
    ),
    React.createElement("button", {
      onClick: handlePrintInvoice,
      className: "bg-bg-secondary hover:bg-bg-primary text-text-main border border-border font-extrabold text-xs px-4 py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer" },
    React.createElement(Printer, { size: 14 }), " Download PDF"
    )
    )
    ),

    /* Auto-redirect countdown banner */
    !redirectCancelled ?
    React.createElement("div", { className: "bg-primary/10 border border-primary/25 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-primary animate-pulse" },
    React.createElement("div", { className: "flex items-center gap-2" },
    React.createElement(Clock, { size: 16 }),
    React.createElement("span", null, "Auto-redirecting to your live Order Summary in ", React.createElement("strong", { className: "font-black text-sm" }, countdown), " seconds...")
    ),
    React.createElement("div", { className: "flex items-center gap-2" },
    React.createElement("button", {
      onClick: () => navigate('/account?tab=orders'),
      className: "underline hover:opacity-80 text-xs font-black cursor-pointer" },
    "Go Now"
    ),
    React.createElement("span", { className: "opacity-40" }, "•"),
    React.createElement("button", {
      onClick: () => setRedirectCancelled(true),
      className: "text-text-muted hover:text-text-main text-xs font-semibold cursor-pointer underline" },
    "Stay on Invoice"
    )
    )
    ) :
    React.createElement("div", { className: "bg-bg-secondary border border-border p-3 rounded-2xl flex items-center justify-between text-xs font-semibold text-text-muted" },
    React.createElement("span", null, "Auto-redirect paused. You can review your official invoice below."),
    React.createElement("button", {
      onClick: () => navigate('/account?tab=orders'),
      className: "text-primary hover:underline font-bold flex items-center gap-1" },
    "Go to My Orders ", React.createElement(ArrowRight, { size: 12 })
    )
    )
    ), /*#__PURE__*/



    React.createElement("div", { className: "glass-card bg-white text-slate-800 border border-slate-200 p-8 md:p-12 rounded-3xl shadow-lg max-w-4xl mx-auto space-y-8 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black" }, /*#__PURE__*/


    React.createElement("div", { className: "flex justify-between items-start border-b border-slate-100 pb-6" }, /*#__PURE__*/
    React.createElement("div", { className: "space-y-1" }, /*#__PURE__*/
    React.createElement("h3", { className: "text-3xl font-extrabold tracking-tight text-blue-600 print:text-black font-heading" }, "SparkCare"), /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-slate-400 font-bold" }, "Premium Home Solutions & Supplies"), /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] text-slate-400" }, "24/7 Corporate Line: +1 (800) 555-CARE")
    ), /*#__PURE__*/
    React.createElement("div", { className: "text-right space-y-1.5" }, /*#__PURE__*/
    React.createElement("span", { className: "inline-block text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 px-3 py-1 rounded print:border print:border-black print:text-black" }, "Official Corporate Receipt"

    ), /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-slate-500 font-bold" }, "Invoice Date: ", new Date().toLocaleDateString())
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-slate-100 pb-6" }, /*#__PURE__*/
    React.createElement("div", { className: "space-y-1" }, /*#__PURE__*/
    React.createElement("p", { className: "text-slate-400 uppercase font-bold text-[9px]" }, "Fulfillment Address"), /*#__PURE__*/
    React.createElement("p", { className: "font-extrabold text-sm" }, user?.name), /*#__PURE__*/
    React.createElement("p", { className: "text-slate-500" }, user?.email), /*#__PURE__*/
    React.createElement("p", { className: "text-slate-500" },
    addressForm.street, ", ", addressForm.city, ", ", addressForm.state, " - ", addressForm.zipCode
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "sm:text-right space-y-1" }, /*#__PURE__*/
    React.createElement("p", { className: "text-slate-400 uppercase font-bold text-[9px]" }, "System Tracking Parameters"), /*#__PURE__*/
    React.createElement("p", { className: "font-bold text-slate-700" }, "Order ID: #", currentOrder?.order?._id), /*#__PURE__*/
    React.createElement("p", { className: "text-slate-500 font-bold" }, "Payment Method: ", /*#__PURE__*/React.createElement("span", { className: "uppercase" }, paymentMethod)), /*#__PURE__*/
    React.createElement("p", { className: "text-slate-500 font-bold" }, "Payment Status: ", /*#__PURE__*/React.createElement("span", { className: "uppercase text-amber-500" }, paymentMethod === 'cod' ? 'unpaid (COD)' : 'Payment proof submitted (Awaiting admin verification)'))
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "space-y-4" }, /*#__PURE__*/
    React.createElement("h4", { className: "font-extrabold text-sm uppercase tracking-wider text-slate-400" }, "Order Items Ledger"), /*#__PURE__*/
    React.createElement("div", { className: "overflow-x-auto w-full" }, /*#__PURE__*/
    React.createElement("table", { className: "w-full text-left border-collapse text-xs" }, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/
    React.createElement("tr", { className: "border-b border-slate-200 text-slate-400 font-bold" }, /*#__PURE__*/
    React.createElement("th", { className: "pb-2.5" }, "Hardware Description"), /*#__PURE__*/
    React.createElement("th", { className: "pb-2.5 text-center" }, "Unit Price"), /*#__PURE__*/
    React.createElement("th", { className: "pb-2.5 text-center" }, "Quantity"), /*#__PURE__*/
    React.createElement("th", { className: "pb-2.5 text-right" }, "Sum")
    )
    ), /*#__PURE__*/
    React.createElement("tbody", { className: "divide-y divide-slate-100 font-bold text-slate-700" },
    items.map((item) => /*#__PURE__*/
    React.createElement("tr", { key: item.product }, /*#__PURE__*/
    React.createElement("td", { className: "py-3" }, /*#__PURE__*/
    React.createElement("p", { className: "font-extrabold" }, item.name), /*#__PURE__*/
    React.createElement("p", { className: "text-[9px] text-slate-400 font-normal" }, "SparkCare Certified hardware unit")
    ), /*#__PURE__*/
    React.createElement("td", { className: "py-3 text-center" }, formatINR(item.price)), /*#__PURE__*/
    React.createElement("td", { className: "py-3 text-center" }, item.quantity), /*#__PURE__*/
    React.createElement("td", { className: "py-3 text-right" }, formatINR(item.quantity * item.price))
    )
    )
    )
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "flex flex-col sm:flex-row sm:justify-between items-start gap-4 border-t border-slate-100 pt-6" }, /*#__PURE__*/
    React.createElement("div", { className: "text-[10px] text-slate-400 max-w-sm leading-relaxed" }, /*#__PURE__*/
    React.createElement("p", { className: "font-bold text-slate-500 mb-1" }, "Corporate Validation Notice")
    ), /*#__PURE__*/
    React.createElement("div", { className: "w-full sm:w-64 space-y-2 text-xs font-bold" }, /*#__PURE__*/
    React.createElement("div", { className: "flex justify-between text-slate-500" }, /*#__PURE__*/
    React.createElement("span", null, "Subtotal"), /*#__PURE__*/
    React.createElement("span", null, formatINR(subtotal))
    ),

    coupon && /*#__PURE__*/
    React.createElement("div", { className: "flex justify-between text-green-500" }, /*#__PURE__*/
    React.createElement("span", null, "Discount (", coupon.code, ")"), /*#__PURE__*/
    React.createElement("span", null, "-", formatINR(coupon.discountAmount))
    ), /*#__PURE__*/


    React.createElement("div", { className: "flex justify-between text-slate-500" }, /*#__PURE__*/
    React.createElement("span", null, "Flat Tax (", settings.taxRate, "%)"), /*#__PURE__*/
    React.createElement("span", null, formatINR(tax))
    ), /*#__PURE__*/

    React.createElement("div", { className: "flex justify-between text-slate-500" }, /*#__PURE__*/
    React.createElement("span", null, "Shipping Fee"), /*#__PURE__*/
    React.createElement("span", null, shippingFee === 0 ? 'FREE' : formatINR(shippingFee))
    ), /*#__PURE__*/

    React.createElement("div", { className: "border-t border-slate-200 pt-3 flex justify-between items-end" }, /*#__PURE__*/
    React.createElement("span", { className: "font-extrabold text-slate-800" }, "Total Invoice Paid"), /*#__PURE__*/
    React.createElement("span", { className: "text-xl font-black text-blue-600 print:text-black" }, formatINR(grandTotal))
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "border-t border-slate-100 pt-6 text-center text-[9px] text-slate-400" }, /*#__PURE__*/
    React.createElement("p", null, "© ", new Date().getFullYear(), " SparkCare Inc. All rights reserved. 200 Corporate Way, NY 10001.")
    )

    )

    )

    )
    ));

};

export default CheckoutPage;