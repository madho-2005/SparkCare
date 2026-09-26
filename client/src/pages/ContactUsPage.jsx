import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Clock, Send, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'order_inquiry',
    referenceId: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    // Simulate inquiry submission handling
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Inquiry submitted! Our support desk will reply promptly.');
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header & Breadcrumb */}
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/20">
            <Mail size={26} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-text-main tracking-tight font-heading">
              Contact SparkCare Support
            </h1>
            <p className="text-xs text-text-muted font-semibold mt-1">
              Direct assistance for order tracking, manual UPI verification, and home service appointments
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <div className="glass-card bg-bg-primary p-6 rounded-3xl border border-border space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
              <Mail size={16} className="text-primary" /> Support Channel
            </h3>
            <div className="space-y-1 text-xs text-text-muted font-semibold">
              <p className="font-bold text-text-main">Official Helpdesk Email:</p>
              <a
                href="mailto:support@sparkcare.com"
                className="text-primary hover:underline font-bold text-sm block"
              >
                support@sparkcare.com
              </a>
              <p className="text-xxs text-text-muted mt-1">Monitored during operational hours.</p>
            </div>
          </div>

          <div className="glass-card bg-bg-primary p-6 rounded-3xl border border-border space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-primary" /> Support Hours
            </h3>
            <div className="space-y-1 text-xs text-text-muted font-semibold">
              <p><strong className="text-text-main">Monday – Friday:</strong> 08:00 AM – 08:00 PM</p>
              <p><strong className="text-text-main">Saturday:</strong> 09:00 AM – 06:00 PM</p>
              <p><strong className="text-text-main">Sunday:</strong> Emergency Service Dispatch Only</p>
            </div>
          </div>

          <div className="glass-card bg-bg-primary p-6 rounded-3xl border border-border space-y-3 shadow-sm text-xs text-text-muted font-semibold">
            <h3 className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-green-500" /> Resolution Guidelines
            </h3>
            <p>
              When inquiring about payments, please have your <strong className="text-text-main">Order ID</strong> and <strong className="text-text-main">UPI Reference Number (UTR)</strong> ready.
            </p>
            <p>
              For service appointments, include your <strong className="text-text-main">Booking ID</strong> and registered address.
            </p>
          </div>
        </div>

        {/* Interactive Form */}
        <div className="md:col-span-2">
          <div className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black text-text-main">Message Received</h3>
                <p className="text-xs text-text-muted font-semibold max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out, {formData.name}. Our support desk has logged your inquiry and will reply to <span className="text-text-main font-bold">{formData.email}</span> within 2 to 4 business hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: 'order_inquiry', referenceId: '', message: '' });
                  }}
                  className="mt-4 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary-light transition-all cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-lg font-black text-text-main">Send an Inquiry</h2>
                  <p className="text-xs text-text-muted font-semibold mt-1">
                    Fill out the form below and an authorized representative will contact you.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-main" htmlFor="name">Your Name *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-bg-secondary text-text-main border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-main" htmlFor="email">Email Address *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-bg-secondary text-text-main border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-main" htmlFor="subject">Inquiry Type</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-bg-secondary text-text-main border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                    >
                      <option value="order_inquiry">E-Store Order Support</option>
                      <option value="payment_verification">Manual UPI Payment Proof Query</option>
                      <option value="booking_service">Home Service Appointment</option>
                      <option value="refund_request">Refund or Cancellation Claim</option>
                      <option value="general">General Question</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-main" htmlFor="referenceId">
                      Order / Booking ID (Optional)
                    </label>
                    <input
                      id="referenceId"
                      name="referenceId"
                      type="text"
                      placeholder="e.g. 66e5a8f... or TXN-12345"
                      value={formData.referenceId}
                      onChange={handleChange}
                      className="w-full bg-bg-secondary text-text-main border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-main" htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    required
                    placeholder="Please provide details regarding your inquiry, including any payment or service context..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-bg-secondary text-text-main border border-border rounded-xl p-3.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-primary hover:bg-primary-light text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Submitting Inquiry...' : (
                    <>
                      <Send size={15} /> Submit Support Request
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
