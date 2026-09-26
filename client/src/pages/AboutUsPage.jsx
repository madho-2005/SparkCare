import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Wrench, ShoppingBag, CheckCircle, ArrowLeft, ArrowRight, HeartHandshake } from 'lucide-react';

export const AboutUsPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header & Breadcrumb */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
          <Zap size={14} /> About SparkCare
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-text-main tracking-tight font-heading leading-tight">
          Safe, Transparent Electrical Solutions for Every Home
        </h1>
        <p className="text-sm text-text-muted font-semibold leading-relaxed">
          SparkCare unites on-demand residential electrical services with a curated electrical hardware marketplace, providing upfront pricing, dependable quality, and human-verified billing.
        </p>
      </div>

      {/* Core Platform Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card bg-bg-primary p-8 rounded-3xl border border-border space-y-5 shadow-sm">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Wrench size={24} />
          </div>
          <h2 className="text-xl font-black text-text-main">Home Electrical Services</h2>
          <p className="text-xs text-text-muted font-medium leading-relaxed">
            From smart panel upgrades and emergency outage troubleshooting to EV fast charger installations and dedicated appliance circuit rewiring, SparkCare connects households with qualified electrical services through a streamlined booking calendar.
          </p>
          <ul className="space-y-2 text-xs font-bold text-text-main">
            <li className="flex items-center gap-2">
              <CheckCircle size={15} className="text-green-500" /> Transparent baseline quotes calculated authoritatively by the server
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={15} className="text-green-500" /> Convenient 3-hour arrival scheduling windows
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={15} className="text-green-500" /> Thorough safety checks on all executed electrical repairs
            </li>
          </ul>
        </div>

        <div className="glass-card bg-bg-primary p-8 rounded-3xl border border-border space-y-5 shadow-sm">
          <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
            <ShoppingBag size={24} />
          </div>
          <h2 className="text-xl font-black text-text-main">Electrical Products E-Store</h2>
          <p className="text-xs text-text-muted font-medium leading-relaxed">
            We provide a vetted hardware catalog of certified smart switches, circuit breakers, protective outlet boxes, and high-efficiency residential lighting. Every catalog item is rigorously screened to meet strict residential safety standards.
          </p>
          <ul className="space-y-2 text-xs font-bold text-text-main">
            <li className="flex items-center gap-2">
              <CheckCircle size={15} className="text-green-500" /> Real-time atomic inventory and live stock tracking
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={15} className="text-green-500" /> Secure checkout with instant printable invoice generation
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={15} className="text-green-500" /> High-speed regional packaging and verified courier dispatch
            </li>
          </ul>
        </div>
      </div>

      {/* Manual UPI Highlight */}
      <div className="p-8 rounded-3xl bg-bg-secondary border border-border space-y-4">
        <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider">
          <HeartHandshake size={16} /> Transparent Manual UPI Verification
        </div>
        <h3 className="text-2xl font-black text-text-main tracking-tight">
          Human-Verified Billing You Can Trust
        </h3>
        <p className="text-xs text-text-muted font-medium leading-relaxed max-w-3xl">
          SparkCare purposely adopts a transparent manual UPI verification workflow. Customers execute payments directly from their own preferred UPI applications and upload screenshot receipts. Every transaction is audited by an administrator before order confirmation, eliminating unexpected gateway processing fees, merchant holds, and hidden third-party markups.
        </p>
      </div>

      {/* Call to Action Bar */}
      <div className="glass-card bg-gradient-to-r from-primary/10 via-bg-primary to-secondary/10 p-8 rounded-3xl border border-primary/20 text-center space-y-6 shadow-md">
        <h3 className="text-2xl font-black text-text-main">Ready to experience SparkCare?</h3>
        <p className="text-xs text-text-muted font-semibold max-w-md mx-auto">
          Explore our professional home electrical solutions or browse our certified product catalog.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/services"
            className="px-6 py-3 bg-primary hover:bg-primary-light text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            Explore Services <ArrowRight size={14} />
          </Link>
          <Link
            to="/products"
            className="px-6 py-3 bg-bg-secondary hover:bg-bg-primary text-text-main border border-border text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            Shop Electrical Hardware
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
