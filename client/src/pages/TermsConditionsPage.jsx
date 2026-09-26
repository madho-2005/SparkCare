import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, ShieldAlert, CreditCard, ShoppingCart, Calendar, ArrowLeft, Mail, AlertTriangle } from 'lucide-react';

export const TermsConditionsPage = () => {
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
            <FileCheck size={26} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-text-main tracking-tight font-heading">
              Terms & Conditions
            </h1>
            <p className="text-xs text-text-muted font-semibold mt-1">
              Effective Date: September 2026 • Governs all platform usage, purchases, and bookings
            </p>
          </div>
        </div>
      </div>

      {/* Critical Payment Notice */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
        <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-black text-text-main uppercase tracking-wider">
            Important Notice on Manual UPI Payments:
          </p>
          <p className="text-text-muted font-medium leading-relaxed">
            SparkCare operates a verified manual UPI workflow. Uploading a payment proof or transaction ID does <strong className="text-text-main">not</strong> automatically confirm your order. Orders placed via QR UPI remain in a pending verification status until an authorized SparkCare administrator validates the transaction against bank and UPI application records.
          </p>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="space-y-8 text-sm text-text-muted font-medium leading-relaxed">
        {/* Section 1 */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <h2 className="text-text-main font-black text-lg">1. Platform Scope & Purpose</h2>
          <p>
            SparkCare provides a dual-purpose web platform offering:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>An on-demand scheduling portal for residential electrical services, installations, and repairs.</li>
            <li>An e-commerce marketplace for certified electrical hardware, including switches, panels, fast chargers, and smart fixtures.</li>
          </ul>
          <p>
            By accessing SparkCare, creating an account, or placing orders/bookings, you agree to be bound by these Terms and Conditions in full.
          </p>
        </section>

        {/* Section 2 */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <h2 className="text-text-main font-black text-lg">2. User Accounts & Responsibilities</h2>
          <p>
            When registering an account with SparkCare, you agree to provide true, accurate, and current information. You are solely responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.
          </p>
          <p>
            Role tampering, privilege escalation attempts, or unauthorized access to administrative functions are strictly prohibited and will result in immediate account termination and legal reporting.
          </p>
        </section>

        {/* Section 3 */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <ShoppingCart size={18} className="text-primary" />
            <h2>3. Product Catalog, Inventory & Pricing</h2>
          </div>
          <p>
            All electrical product prices, specifications, and availability displayed on SparkCare are server-authoritative and subject to real-time inventory checks. Placing an item in your shopping cart does not reserve inventory until an order is successfully created.
          </p>
          <p>
            SparkCare reserves the right to correct typographical or computational pricing errors. In the event an item is ordered at an incorrect price due to an error, we reserve the right to cancel the order and issue a full refund.
          </p>
        </section>

        {/* Section 4 */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <Calendar size={18} className="text-primary" />
            <h2>4. Home Electrical Service Bookings</h2>
          </div>
          <p>
            Home service appointments are scheduled based on customer-selected dates and arrival windows. Service baseline quotes are calculated authoritatively by the SparkCare server based on active service definitions.
          </p>
          <p>
            Customers must provide safe, accessible entry to the property and electrical panel during the scheduled time window. SparkCare team members reserve the right to decline service if site conditions are deemed unsafe or hazardous.
          </p>
        </section>

        {/* Section 5 */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <CreditCard size={18} className="text-primary" />
            <h2>5. Manual UPI Payment & Verification Rules</h2>
          </div>
          <p>
            SparkCare utilizes a manual UPI payment verification workflow to ensure direct, transparent billing:
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>
              <strong className="text-text-main">Payment Execution:</strong> The customer transfers the exact order total to the official SparkCare UPI ID or scans the displayed QR code via their personal UPI banking app.
            </li>
            <li>
              <strong className="text-text-main">Proof Submission:</strong> The customer must upload a clear screenshot of the completed transfer and/or provide the corresponding Bank Transaction ID (UTR).
            </li>
            <li>
              <strong className="text-text-main">Admin Manual Verification:</strong> A SparkCare administrator manually audits the transaction against official banking statements.
            </li>
            <li>
              <strong className="text-text-main">Order Confirmation:</strong> An order transitions to <span className="text-green-500 font-bold">Confirmed</span> status only after successful administrative approval. If the proof is fraudulent, incomplete, or unverified, the order will be rejected.
            </li>
          </ol>
        </section>

        {/* Section 6 */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <ShieldAlert size={18} className="text-primary" />
            <h2>6. Prohibited Activities</h2>
          </div>
          <p>You agree not to engage in any of the following prohibited behaviors:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Submitting falsified or altered payment screenshots or non-existent transaction IDs.</li>
            <li>Attempting price tampering by modifying HTTP payloads or tampering with client requests.</li>
            <li>Submitting fake, unverified reviews or rating products/services you have not genuinely purchased or utilized.</li>
            <li>Uploading malicious files, executable scripts, or unapproved file types (such as SVG files containing executable scripts).</li>
            <li>Using automated crawlers, scrapers, or bots to harvest catalog content or overload the platform.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <h2 className="text-text-main font-black text-lg">7. Limitation of Liability</h2>
          <p>
            SparkCare strives for uninterrupted service availability and accurate product representations. However, to the maximum extent permitted by applicable law, SparkCare shall not be liable for indirect, incidental, punitive, or consequential damages resulting from platform downtime, power fluctuations, delays in courier transit, or scheduling conflicts beyond our reasonable control.
          </p>
        </section>

        {/* Section 8 */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <Mail size={18} className="text-primary" />
            <h2>8. Inquiries & Contact</h2>
          </div>
          <p>
            For any questions or legal inquiries regarding these Terms & Conditions, please reach out to us:
          </p>
          <div className="p-4 bg-bg-secondary rounded-2xl border border-border/70 space-y-1 text-xs">
            <p className="font-black text-text-main">SparkCare Support & Legal Desk</p>
            <p>Email: <a href="mailto:support@sparkcare.com" className="text-primary hover:underline font-bold">support@sparkcare.com</a></p>
            <p>Help Center: <Link to="/contact-us" className="text-primary hover:underline font-bold">Contact Us</Link></p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsConditionsPage;
