import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Server, UserCheck, FileText, ArrowLeft, Mail, AlertCircle } from 'lucide-react';

export const PrivacyPolicyPage = () => {
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
            <Shield size={26} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-text-main tracking-tight font-heading">
              Privacy Policy
            </h1>
            <p className="text-xs text-text-muted font-semibold mt-1">
              Last Updated: September 2026 • Effective Immediately
            </p>
          </div>
        </div>
      </div>

      {/* Overview Notice */}
      <div className="p-5 rounded-2xl bg-bg-secondary border border-border flex items-start gap-4">
        <AlertCircle size={20} className="text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted font-medium leading-relaxed">
          At SparkCare, your privacy and data security are foundational. This Privacy Policy details how SparkCare collects, uses, stores, and safeguards your personal information when you browse our website, place electrical product orders, schedule home service appointments, or submit manual UPI payment proofs.
        </p>
      </div>

      {/* Policy Sections */}
      <div className="space-y-8 text-sm text-text-muted font-medium leading-relaxed">
        {/* Section 1 */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <UserCheck size={18} className="text-primary" />
            <h2>1. Information We Collect</h2>
          </div>
          <p>
            SparkCare collects only the information necessary to provide, manage, and verify our electrical e-commerce and home service operations:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-text-main">Account Information:</strong> Full name, email address, contact phone number, and encrypted password credentials when you register.
            </li>
            <li>
              <strong className="text-text-main">Delivery & Service Addresses:</strong> Street address, city, state, postal code, and optional location landmarks required to deliver physical hardware or dispatch home electrical services.
            </li>
            <li>
              <strong className="text-text-main">Order & Booking Details:</strong> Items purchased, quantities, service appointment dates, selected time slots, invoice totals, and delivery notes.
            </li>
            <li>
              <strong className="text-text-main">Manual UPI Payment Proofs:</strong> Transaction reference IDs (UTR numbers) and payment screenshot image files uploaded by customers to confirm UPI payments.
            </li>
            <li>
              <strong className="text-text-main">Technical & Log Data:</strong> IP address, browser type, and timestamps collected via server logging to protect against malicious activities and brute-force attacks.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <Lock size={18} className="text-primary" />
            <h2>2. How We Use Your Information</h2>
          </div>
          <p>We use the data we collect solely for direct platform operations:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>To process and fulfill electrical hardware store orders and generate corporate invoices.</li>
            <li>To confirm, schedule, and execute requested residential electrical service bookings.</li>
            <li>To enable our administrative team to manually verify uploaded UPI payment screenshots against bank/UPI app records.</li>
            <li>To deliver critical transactional communications, such as order receipts, payment approval notices, and booking updates.</li>
            <li>To detect, investigate, and prevent fraudulent orders, price tampering, or unauthorized platform access.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <Server size={18} className="text-primary" />
            <h2>3. Cloud Storage & Image Hosting</h2>
          </div>
          <p>
            Customer payment screenshots and product media are stored securely using Cloudinary cloud storage infrastructure. Uploaded payment proofs are strictly accessible only to authenticated administrators for verification purposes and the customer who submitted them.
          </p>
          <p>
            We enforce strict file-type whitelisting (accepting only verified JPEG, PNG, and WebP images) and reject active content (such as SVG files) to prevent cross-site scripting (XSS) and injection vulnerabilities.
          </p>
        </section>

        {/* Section 4 */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <Eye size={18} className="text-primary" />
            <h2>4. Cookies & Session Storage</h2>
          </div>
          <p>
            SparkCare uses strictly necessary cookies to maintain secure authenticated user sessions:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-text-main">JWT Session Cookies:</strong> We store short-lived JSON Web Tokens (JWT) in secure <code className="text-primary bg-primary/5 px-1.5 py-0.5 rounded">HttpOnly</code>, <code className="text-primary bg-primary/5 px-1.5 py-0.5 rounded">SameSite</code> cookies that cannot be accessed by client-side JavaScript, protecting against cross-site scripting (XSS) token theft.
            </li>
            <li>
              <strong className="text-text-main">Local Storage:</strong> Non-sensitive client preferences, such as your active shopping cart for guest sessions and UI theme preferences, are stored locally on your device.
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <Shield size={18} className="text-primary" />
            <h2>5. Data Security & Storage Architecture</h2>
          </div>
          <p>
            SparkCare implements robust technical safeguards to protect your personal data:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Passwords are hashed using bcrypt with adaptive salt work factors before storage.</li>
            <li>Refresh tokens are cryptographically hashed (SHA-256) prior to database persistence, preventing plaintext credential exposure in the event of unauthorized database inspection.</li>
            <li>Rate limiting is enforced on sensitive authentication endpoints to prevent brute-force credential stuffing.</li>
            <li>Input sanitization and strict schema validation prevent NoSQL injection and HTTP parameter pollution.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <FileText size={18} className="text-primary" />
            <h2>6. User Rights & Data Requests</h2>
          </div>
          <p>
            You retain full control over your personal information:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-text-main">Access & Correction:</strong> You can review and update your name, phone number, and delivery addresses anytime directly via your <Link to="/account" className="text-primary hover:underline font-bold">Account Dashboard</Link>.
            </li>
            <li>
              <strong className="text-text-main">Account Deletion:</strong> You may request permanent deletion of your account and associated profile data by contacting our support team. Please note that certain transactional records must be retained for tax, accounting, and legal audit obligations.
            </li>
            <li>
              <strong className="text-text-main">Data Portability:</strong> You may request a digital export of your order and service history by contacting customer support.
            </li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <Mail size={18} className="text-primary" />
            <h2>7. Contact Information</h2>
          </div>
          <p>
            If you have questions, feedback, or privacy-related requests, please contact our privacy compliance desk:
          </p>
          <div className="p-4 bg-bg-secondary rounded-2xl border border-border/70 space-y-1 text-xs">
            <p className="font-black text-text-main">SparkCare Support & Privacy Desk</p>
            <p>Email: <a href="mailto:support@sparkcare.com" className="text-primary hover:underline font-bold">support@sparkcare.com</a></p>
            <p>Inquiries: <Link to="/contact-us" className="text-primary hover:underline font-bold">Contact Support Page</Link></p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
