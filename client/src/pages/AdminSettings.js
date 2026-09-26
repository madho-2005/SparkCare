import React, { useState } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  Phone,
  Mail,
  IndianRupee,
  Percent,
  QrCode,
  ShieldCheck } from
'lucide-react';
import toast from 'react-hot-toast';

export const AdminSettings = () => {
  // Helper to safely load a setting from localStorage at mount time
  const getSavedSetting = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem('sparkcare_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed[key]?.toString() || defaultValue;
      }
    } catch (e) {
      console.error(e);
    }
    return defaultValue;
  };

  // Config states initialized with industry defaults or saved preferences
  const [taxRate, setTaxRate] = useState(() => getSavedSetting('taxRate', '8'));
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(() => getSavedSetting('freeShippingThreshold', '100'));
  const [shippingFee, setShippingFee] = useState(() => getSavedSetting('shippingFee', '10'));
  const [supportPhone, setSupportPhone] = useState(() => getSavedSetting('supportPhone', '+1 (800) 555-CARE'));
  const [supportEmail, setSupportEmail] = useState(() => getSavedSetting('supportEmail', 'support@sparkcare.com'));
  const [upiId, setUpiId] = useState(() => getSavedSetting('upiId', 'sparkcare@upi'));

  // Saves system constants to local cache and emits event
  const handleSave = (e) => {
    e.preventDefault();

    if (Number(taxRate) < 0 || Number(freeShippingThreshold) < 0 || Number(shippingFee) < 0) {
      toast.error('System variables must be positive numbers');
      return;
    }

    const settings = {
      taxRate: Number(taxRate),
      freeShippingThreshold: Number(freeShippingThreshold),
      shippingFee: Number(shippingFee),
      supportPhone: supportPhone.trim(),
      supportEmail: supportEmail.trim(),
      upiId: upiId.trim()
    };

    localStorage.setItem('sparkcare_settings', JSON.stringify(settings));
    // Emit sync event for dynamic components to update in real-time
    window.dispatchEvent(new Event('sparkcare-settings-sync'));
    toast.success('Platform system settings updated successfully!');
  };

  // Restores defaults
  const handleReset = () => {
    if (window.confirm('Are you sure you want to revert all system variables to factory defaults?')) {
      setTaxRate('8');
      setFreeShippingThreshold('100');
      setShippingFee('10');
      setSupportPhone('+1 (800) 555-CARE');
      setSupportEmail('support@sparkcare.com');
      setUpiId('sparkcare@upi');
      localStorage.removeItem('sparkcare_settings');
      window.dispatchEvent(new Event('sparkcare-settings-sync'));
      toast.success('System settings restored to platform defaults');
    }
  };

  return (/*#__PURE__*/
    React.createElement("div", { className: "space-y-8" }, /*#__PURE__*/

    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h1", { className: "text-3xl font-extrabold tracking-tight" }, "System Constants & Config"), /*#__PURE__*/
    React.createElement("p", { className: "text-text-muted mt-2 font-semibold" }, "Oversee global store tax limits, free-delivery subtotal minimums, and support contact configurations.")
    ), /*#__PURE__*/

    React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8 items-start" }, /*#__PURE__*/

    React.createElement("div", { className: "lg:col-span-2 glass-card bg-bg-primary p-6 md:p-8 rounded-3xl border border-border shadow-lg space-y-6" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-2 border-b border-border pb-3.5" }, /*#__PURE__*/
    React.createElement("div", { className: "p-2 bg-primary/10 text-primary rounded-xl" }, /*#__PURE__*/
    React.createElement(Settings, { size: 20 })
    ), /*#__PURE__*/
    React.createElement("h2", { className: "font-extrabold text-base text-text-main uppercase" }, "Store Operations Ledger")
    ), /*#__PURE__*/

    React.createElement("form", { onSubmit: handleSave, className: "space-y-6" }, /*#__PURE__*/


    React.createElement("div", { className: "space-y-4" }, /*#__PURE__*/
    React.createElement("h3", { className: "text-xs font-black text-primary uppercase tracking-wider" }, "A. Ledger Pricing Calculations"), /*#__PURE__*/
    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" }, /*#__PURE__*/


    React.createElement("div", { className: "space-y-1.5" }, /*#__PURE__*/
    React.createElement("label", { className: "text-xs font-bold text-text-muted" }, "Flat Sales Tax (%)"), /*#__PURE__*/
    React.createElement("div", { className: "relative" }, /*#__PURE__*/
    React.createElement("span", { className: "absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none" }, /*#__PURE__*/
    React.createElement(Percent, { size: 12 })
    ), /*#__PURE__*/
    React.createElement("input", {
      type: "number",
      required: true,
      value: taxRate,
      onChange: (e) => setTaxRate(e.target.value),
      className: "w-full bg-bg-secondary text-sm font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-border/80 focus:outline-none focus:border-primary" }
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "space-y-1.5" }, /*#__PURE__*/
    React.createElement("label", { className: "text-xs font-bold text-text-muted" }, "Free Shipping Minimum (₹)"), /*#__PURE__*/
    React.createElement("div", { className: "relative" }, /*#__PURE__*/
    React.createElement("span", { className: "absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none" }, /*#__PURE__*/
    React.createElement(IndianRupee, { size: 12 })
    ), /*#__PURE__*/
    React.createElement("input", {
      type: "number",
      required: true,
      value: freeShippingThreshold,
      onChange: (e) => setFreeShippingThreshold(e.target.value),
      className: "w-full bg-bg-secondary text-sm font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-border/80 focus:outline-none focus:border-primary" }
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "space-y-1.5" }, /*#__PURE__*/
    React.createElement("label", { className: "text-xs font-bold text-text-muted" }, "Flat Delivery Fee (₹)"), /*#__PURE__*/
    React.createElement("div", { className: "relative" }, /*#__PURE__*/
    React.createElement("span", { className: "absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none" }, /*#__PURE__*/
    React.createElement(IndianRupee, { size: 12 })
    ), /*#__PURE__*/
    React.createElement("input", {
      type: "number",
      required: true,
      value: shippingFee,
      onChange: (e) => setShippingFee(e.target.value),
      className: "w-full bg-bg-secondary text-sm font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-border/80 focus:outline-none focus:border-primary" }
    )
    )
    )

    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "space-y-4 pt-4 border-t border-border/40" }, /*#__PURE__*/
    React.createElement("h3", { className: "text-xs font-black text-primary uppercase tracking-wider" }, "B. Payment Gateways"), /*#__PURE__*/
    React.createElement("div", { className: "space-y-1.5" }, /*#__PURE__*/
    React.createElement("label", { className: "text-xs font-bold text-text-muted font-heading" }, "Active Store QR UPI ID"), /*#__PURE__*/
    React.createElement("div", { className: "relative" }, /*#__PURE__*/
    React.createElement("span", { className: "absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none" }, /*#__PURE__*/
    React.createElement(QrCode, { size: 13 })
    ), /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      required: true,
      value: upiId,
      onChange: (e) => setUpiId(e.target.value),
      className: "w-full bg-bg-secondary text-sm font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-border/80 focus:outline-none focus:border-primary font-mono tracking-wide" }
    )
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "space-y-4 pt-4 border-t border-border/40" }, /*#__PURE__*/
    React.createElement("h3", { className: "text-xs font-black text-primary uppercase tracking-wider" }, "C. Customer Support Lines"), /*#__PURE__*/
    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, /*#__PURE__*/


    React.createElement("div", { className: "space-y-1.5" }, /*#__PURE__*/
    React.createElement("label", { className: "text-xs font-bold text-text-muted" }, "Support Hotline"), /*#__PURE__*/
    React.createElement("div", { className: "relative" }, /*#__PURE__*/
    React.createElement("span", { className: "absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none" }, /*#__PURE__*/
    React.createElement(Phone, { size: 13 })
    ), /*#__PURE__*/
    React.createElement("input", {
      type: "text",
      required: true,
      value: supportPhone,
      onChange: (e) => setSupportPhone(e.target.value),
      className: "w-full bg-bg-secondary text-sm font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-border/80 focus:outline-none focus:border-primary" }
    )
    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "space-y-1.5" }, /*#__PURE__*/
    React.createElement("label", { className: "text-xs font-bold text-text-muted" }, "Support Dispatch Email"), /*#__PURE__*/
    React.createElement("div", { className: "relative" }, /*#__PURE__*/
    React.createElement("span", { className: "absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none" }, /*#__PURE__*/
    React.createElement(Mail, { size: 13 })
    ), /*#__PURE__*/
    React.createElement("input", {
      type: "email",
      required: true,
      value: supportEmail,
      onChange: (e) => setSupportEmail(e.target.value),
      className: "w-full bg-bg-secondary text-sm font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-border/80 focus:outline-none focus:border-primary" }
    )
    )
    )

    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "flex items-center gap-3 pt-6 border-t border-border/40" }, /*#__PURE__*/
    React.createElement("button", {
      type: "submit",
      className: "flex items-center gap-1.5 bg-primary hover:bg-primary-light text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-colors cursor-pointer" }, /*#__PURE__*/

    React.createElement(Save, { size: 14 }), " Save Variables"
    ), /*#__PURE__*/
    React.createElement("button", {
      type: "button",
      onClick: handleReset,
      className: "flex items-center gap-1.5 bg-bg-secondary hover:bg-border text-text-main border border-border font-extrabold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer" }, /*#__PURE__*/

    React.createElement(RefreshCw, { size: 14 }), " Restore Factory Defaults"
    )
    )

    )
    ), /*#__PURE__*/


    React.createElement("div", { className: "glass-card bg-bg-primary p-6 rounded-2xl border border-border shadow-md space-y-4 lg:col-span-1" }, /*#__PURE__*/
    React.createElement("h3", { className: "font-extrabold text-sm border-b border-border pb-2.5 text-text-main uppercase" }, "Information Guide"), /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-text-muted leading-relaxed font-semibold" }, "Modifying these variables alters the platform's checkout system calculations instantly."

    ), /*#__PURE__*/
    React.createElement("div", { className: "p-3.5 bg-bg-secondary rounded-xl border border-border/60 text-[10px] text-text-muted font-bold space-y-2" }, /*#__PURE__*/
    React.createElement("p", { className: "text-text-main font-extrabold flex items-center gap-1" }, /*#__PURE__*/React.createElement(ShieldCheck, { size: 12, className: "text-primary" }), " Active Rules"), /*#__PURE__*/
    React.createElement("p", null, "1. ", /*#__PURE__*/React.createElement("strong", null, "Taxes"), " are calculated on checkout totals after coupon reductions are applied."), /*#__PURE__*/
    React.createElement("p", null, "2. ", /*#__PURE__*/React.createElement("strong", null, "Delivery"), " pricing automatically changes to ", /*#__PURE__*/React.createElement("strong", null, "FREE (₹0)"), " when client subtotals surpass the threshold variable."), /*#__PURE__*/
    React.createElement("p", null, "3. ", /*#__PURE__*/React.createElement("strong", null, "Hotlines"), " appear on printable invoices and header email communications.")
    )
    )
    )
    ));

};

export default AdminSettings;