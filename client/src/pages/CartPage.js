import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Ticket, Check, X, ShieldCheck, Lock } from 'lucide-react';
import {
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon } from
'../redux/cartSlice';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';
import { getProductImage } from '../utils/productImage';

export const CartPage = () => {
  const { items, coupon } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [validating, setValidating] = useState(false);

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

  // Unauthenticated Guest View: Strict Security Isolation
  if (!isAuthenticated) {
    return (/*#__PURE__*/
      React.createElement("div", { className: "min-h-[70vh] py-16 px-4 md:px-8 max-w-2xl mx-auto flex flex-col items-center justify-center text-center space-y-8" }, /*#__PURE__*/
      React.createElement(motion.div, {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        className: "glass-card bg-bg-primary rounded-3xl p-10 sm:p-14 border border-border space-y-6 shadow-2xl w-full" }, /*#__PURE__*/

      React.createElement("div", { className: "w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto border border-primary/20 shadow-inner" }, /*#__PURE__*/
      React.createElement(Lock, { size: 36 })
      ), /*#__PURE__*/

      React.createElement("div", { className: "space-y-3" }, /*#__PURE__*/
      React.createElement("span", { className: "text-xxs font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full inline-block" },
      "Authentication Required"
      ), /*#__PURE__*/
      React.createElement("h1", { className: "text-3xl font-black text-text-main tracking-tight" },
      "Please login to view your cart"
      ), /*#__PURE__*/
      React.createElement("p", { className: "text-text-muted text-sm font-semibold max-w-md mx-auto leading-relaxed" },
      "Your shopping cart is private and securely tied to your SparkCare account. Please sign in to access your electrical fittings, smart switches, and saved items."
      )
      ), /*#__PURE__*/

      React.createElement("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2" }, /*#__PURE__*/
      React.createElement(Link, {
        to: "/login?redirect=cart",
        className: "w-full sm:w-auto px-7 py-3.5 bg-primary hover:bg-primary-light text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer" },
      "Sign In to View Cart"
      ), /*#__PURE__*/
      React.createElement(Link, {
        to: "/register",
        className: "w-full sm:w-auto px-7 py-3.5 bg-bg-secondary hover:bg-border text-text-main text-xs font-black uppercase tracking-wider rounded-xl border border-border transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer" },
      "Create Account"
      )
      ), /*#__PURE__*/

      React.createElement("div", { className: "border-t border-border/60 pt-6 mt-6" }, /*#__PURE__*/
      React.createElement(Link, {
        to: "/products",
        className: "inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors" }, /*#__PURE__*/
      React.createElement(ArrowLeft, { size: 14 }), " Continue browsing hardware catalog"
      )
      )
      )
      )
    );
  }

  // Subtotal calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = coupon ? coupon.discountAmount : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number((taxableAmount * (settings.taxRate / 100)).toFixed(2));
  const shippingFee = subtotal === 0 ? 0 : subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const grandTotal = Number((taxableAmount + tax + shippingFee).toFixed(2));

  // Validates Coupon code via REST API
  const handleValidateCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (!isAuthenticated) {
      toast.error('Please login to apply coupons');
      return;
    }

    setValidating(true);
    try {
      const response = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        subtotal
      });
      if (response.data?.data) {
        dispatch(applyCoupon(response.data.data));
        setCouponCode('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to validate coupon code.');
    } finally {
      setValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
  };

  const handleQuantityChange = (productId, currentQty, amount, stock) => {
    const newQty = currentQty + amount;
    if (newQty > stock) {
      toast.error(`Stock threshold reached. Only ${stock} units available.`);
      return;
    }
    if (newQty < 1) return;
    dispatch(updateQuantity({ productId, quantity: newQty }));
  };

  const handleCheckoutRedirect = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to proceed to checkout.');
      navigate('/login?redirect=checkout');
      return;
    }
    navigate('/checkout');
  };

  return (/*#__PURE__*/
    React.createElement("div", { className: "min-h-screen py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8" }, /*#__PURE__*/

    React.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4" }, /*#__PURE__*/
    React.createElement("div", { className: "space-y-1" }, /*#__PURE__*/
    React.createElement(Link, { to: "/products", className: "inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline" }, /*#__PURE__*/
    React.createElement(ArrowLeft, { size: 14 }), " Back to Hardware Store"
    ), /*#__PURE__*/
    React.createElement("h1", { className: "text-3xl font-extrabold tracking-tight" }, "Shopping Cart"), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted text-sm font-semibold" }, "Review your electrical fixtures, fittings, and smart adapters.")
    ),
    items.length > 0 && /*#__PURE__*/
    React.createElement("span", { className: "text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-3.5 py-1.5 rounded-full self-start" }, "⚡ Synced with Secure Local Cache"

    )

    ), /*#__PURE__*/

    React.createElement(AnimatePresence, { mode: "wait" },
    items.length === 0 ? /*#__PURE__*/
    /* Empty State Guide */
    React.createElement(motion.div, {
      initial: { opacity: 0, y: 15 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -15 },
      className: "glass-card bg-bg-primary rounded-3xl p-10 py-16 border border-border text-center max-w-xl mx-auto space-y-6 shadow-xl" }, /*#__PURE__*/

    React.createElement("div", { className: "w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary animate-bounce" }, /*#__PURE__*/
    React.createElement(ShoppingBag, { size: 40 })
    ), /*#__PURE__*/
    React.createElement("div", { className: "space-y-2" }, /*#__PURE__*/
    React.createElement("h2", { className: "text-2xl font-black text-text-main" }, "Your shopping cart is empty"), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted text-sm font-semibold max-w-xs mx-auto" }, "Explore SparkCare's catalog of industrial LED fixtures, high-grade wires, and smart panels."

    )
    ), /*#__PURE__*/
    React.createElement(Link, {
      to: "/products",
      className: "inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-extrabold px-6 py-3 rounded-xl shadow-md transition-all active:scale-95" }, /*#__PURE__*/

    React.createElement(ShoppingBag, { size: 18 }), " Continue Shopping"
    )
    ) : /*#__PURE__*/

    /* Checkout Grid */
    React.createElement(motion.div, {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "grid grid-cols-1 lg:grid-cols-3 gap-8 items-start" }, /*#__PURE__*/


    React.createElement("div", { className: "lg:col-span-2 space-y-4" },
    items.map((item) => /*#__PURE__*/
    React.createElement(motion.div, {
      layout: true,
      key: item.product,
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, x: -10 },
      className: "glass-card bg-bg-primary border border-border/80 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-5 shadow-sm" }, /*#__PURE__*/

    React.createElement("img", {
      src: getProductImage(item),
      alt: item.name,
      className: "w-24 h-24 rounded-xl object-cover border border-border bg-bg-secondary" }
    ), /*#__PURE__*/
    React.createElement("div", { className: "flex-1 min-w-0 space-y-2 text-center sm:text-left" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h3", { className: "font-extrabold text-base text-text-main truncate" }, item.name), /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-text-muted mt-0.5" }, "Supplier: SparkCare Certified")
    ),


    item.stock <= 5 && /*#__PURE__*/
    React.createElement("span", { className: "inline-block text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/15 animate-pulse" }, "⚠️ Low Warehouse Inventory: Only ",
    item.stock, " left"
    ), /*#__PURE__*/


    React.createElement("div", { className: "flex items-center justify-center sm:justify-start gap-4" }, /*#__PURE__*/

    React.createElement("span", { className: "font-black text-primary text-base" }, formatINR(item.price)), /*#__PURE__*/

    React.createElement("span", { className: "text-xs text-text-muted" }, "Total: ", formatINR(item.price * item.quantity))
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "flex items-center gap-6 self-stretch justify-between sm:self-center" }, /*#__PURE__*/

    React.createElement("div", { className: "flex items-center bg-bg-secondary border border-border/80 rounded-xl p-1" }, /*#__PURE__*/
    React.createElement("button", {
      onClick: () => handleQuantityChange(item.product, item.quantity, -1, item.stock),
      className: "p-1.5 rounded-lg hover:bg-bg-primary text-text-muted hover:text-text-main transition-colors disabled:opacity-30",
      disabled: item.quantity <= 1 }, /*#__PURE__*/

    React.createElement(Minus, { size: 14 })
    ), /*#__PURE__*/
    React.createElement("span", { className: "px-3 font-extrabold text-sm" }, item.quantity), /*#__PURE__*/
    React.createElement("button", {
      onClick: () => handleQuantityChange(item.product, item.quantity, 1, item.stock),
      className: "p-1.5 rounded-lg hover:bg-bg-primary text-text-muted hover:text-text-main transition-colors disabled:opacity-30",
      disabled: item.quantity >= item.stock }, /*#__PURE__*/

    React.createElement(Plus, { size: 14 })
    )
    ), /*#__PURE__*/


    React.createElement("button", {
      onClick: () => dispatch(removeFromCart(item.product)),
      className: "p-2.5 rounded-xl text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all active:scale-95" }, /*#__PURE__*/

    React.createElement(Trash2, { size: 16 })
    )
    )
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "space-y-6" }, /*#__PURE__*/

    React.createElement("div", { className: "glass-card bg-bg-primary border border-border p-6 rounded-2xl shadow-sm space-y-4" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-2" }, /*#__PURE__*/
    React.createElement(Ticket, { className: "text-primary", size: 18 }), /*#__PURE__*/
    React.createElement("h3", { className: "font-extrabold text-sm" }, "Promotional Discount")
    ),

    coupon ? /*#__PURE__*/
    React.createElement("div", { className: "bg-green-500/10 text-green-500 border border-green-500/25 p-3 rounded-xl flex items-center justify-between text-xs font-bold" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-1.5" }, /*#__PURE__*/
    React.createElement(Check, { size: 14 }), /*#__PURE__*/
    React.createElement("span", null, "Applied: ", coupon.code)
    ), /*#__PURE__*/
    React.createElement("button", {
      onClick: handleRemoveCoupon,
      className: "p-1 rounded-full hover:bg-green-500/20 text-green-500" }, /*#__PURE__*/

    React.createElement(X, { size: 14 })
    )
    ) : /*#__PURE__*/

    React.createElement("form", { onSubmit: handleValidateCoupon, className: "flex gap-2" }, /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      placeholder: "e.g. WELCOME10",
      value: couponCode,
      onChange: (e) => setCouponCode(e.target.value),
      className: "flex-1 bg-bg-secondary text-xs font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl border border-border/80 focus:outline-none focus:border-primary" }
    ), /*#__PURE__*/
    React.createElement("button", {
      type: "submit",
      disabled: validating || !couponCode.trim(),
      className: "bg-primary hover:bg-primary-light text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:pointer-events-none" },

    validating ? 'Checking...' : 'Apply'
    )
    )

    ), /*#__PURE__*/


    React.createElement("div", { className: "glass-card bg-bg-primary border border-border p-6 rounded-2xl shadow-sm space-y-6" }, /*#__PURE__*/
    React.createElement("h3", { className: "font-extrabold text-sm border-b border-border pb-3" }, "Fulfillment Summary"), /*#__PURE__*/

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
    React.createElement("span", null, "Tax (", settings.taxRate, "% flat)"), /*#__PURE__*/
    React.createElement("span", null, formatINR(tax))
    ), /*#__PURE__*/

    React.createElement("div", { className: "flex justify-between text-text-muted" }, /*#__PURE__*/
    React.createElement("span", null, "Shipping Fee"), /*#__PURE__*/
    React.createElement("span", null, shippingFee === 0 ? 'FREE' : formatINR(shippingFee))
    ),

    shippingFee > 0 && /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] text-text-muted italic bg-bg-secondary p-2 rounded" }, "Add ", /*#__PURE__*/
    React.createElement("strong", null, formatINR(settings.freeShippingThreshold - subtotal)), " more to unlock FREE shipping!"
    )

    ), /*#__PURE__*/

    React.createElement("div", { className: "border-t border-border pt-4 flex justify-between items-end" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-text-muted font-bold" }, "Grand Total"), /*#__PURE__*/
    React.createElement("p", { className: "text-[10px] text-text-muted" }, "Prices inclusive of spooled invoice receipt")
    ), /*#__PURE__*/
    React.createElement("span", { className: "text-2xl font-black text-primary" }, formatINR(grandTotal))
    ), /*#__PURE__*/

    React.createElement("button", {
      onClick: handleCheckoutRedirect,
      className: "w-full bg-primary hover:bg-primary-light text-white font-extrabold py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer" }, /*#__PURE__*/

    React.createElement(ShieldCheck, { size: 18 }), " Proceed to Secure Checkout"
    )
    )
    )
    )

    )
    ));

};

export default CartPage;