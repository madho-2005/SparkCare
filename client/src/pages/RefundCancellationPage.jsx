import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, XCircle, Clock, CheckCircle, ArrowLeft, Mail, HelpCircle } from 'lucide-react';

export const RefundCancellationPage = () => {
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
            <RefreshCw size={26} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-text-main tracking-tight font-heading">
              Refund & Cancellation Policy
            </h1>
            <p className="text-xs text-text-muted font-semibold mt-1">
              Clear, honest guidelines on order cancellations, service rescheduling, and manual UPI refunds
            </p>
          </div>
        </div>
      </div>

      {/* Overview Card */}
      <div className="p-5 rounded-2xl bg-bg-secondary border border-border flex items-start gap-4">
        <HelpCircle size={20} className="text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted font-medium leading-relaxed">
          We want you to be completely satisfied with your SparkCare experience. Because we operate a dedicated manual UPI payment confirmation model, refunds and cancellations are processed with human oversight to ensure complete accuracy and financial reconciliation.
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-8 text-sm text-text-muted font-medium leading-relaxed">
        {/* Section 1: Order Cancellations */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <XCircle size={18} className="text-primary" />
            <h2>1. Product Order Cancellation Eligibility</h2>
          </div>
          <p>
            You can cancel an electrical store order directly from your <Link to="/account?tab=orders" className="text-primary hover:underline font-bold">Orders Dashboard</Link> or by contacting support, subject to the following rules:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-text-main">Eligible for Full Cancellation:</strong> Orders in <code className="text-primary bg-primary/5 px-1.5 py-0.5 rounded font-bold">placed</code> or <code className="text-primary bg-primary/5 px-1.5 py-0.5 rounded font-bold">awaiting_payment_verification</code> status can be cancelled immediately without penalty.
            </li>
            <li>
              <strong className="text-text-main">Restricted Cancellation:</strong> Once an order transitions to <code className="text-primary bg-primary/5 px-1.5 py-0.5 rounded font-bold">shipped</code> or <code className="text-primary bg-primary/5 px-1.5 py-0.5 rounded font-bold">delivered</code>, it cannot be cancelled directly online. You must initiate a return inquiry upon physical delivery.
            </li>
            <li>
              <strong className="text-text-main">Inventory Restoration:</strong> Whenever an order is cancelled, all reserved inventory counts are automatically and atomically restored to the product catalog.
            </li>
          </ul>
        </section>

        {/* Section 2: Service Booking Cancellations */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <Clock size={18} className="text-primary" />
            <h2>2. Home Service Booking Cancellation & Rescheduling</h2>
          </div>
          <p>
            We recognize that household schedules can change unexpectedly:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-text-main">Free Cancellation:</strong> You may cancel any scheduled booking free of charge up to 4 hours prior to the scheduled time slot.
            </li>
            <li>
              <strong className="text-text-main">Active Jobs:</strong> Once a service appointment has reached <code className="text-primary bg-primary/5 px-1.5 py-0.5 rounded font-bold">in_progress</code> status, the booking cannot be cancelled via the website. Please communicate directly with customer support to resolve any on-site adjustments.
            </li>
          </ul>
        </section>

        {/* Section 3: Payment Proof Rejection */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <XCircle size={18} className="text-red-500" />
            <h2>3. Payment-Proof Rejection & Dispute Resolution</h2>
          </div>
          <p>
            An uploaded UPI payment proof may be rejected by the admin team under the following circumstances:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>The uploaded screenshot is blurry, cropped, illegible, or does not show the bank transaction reference (UTR).</li>
            <li>The paid amount does not match the authoritative invoice grand total.</li>
            <li>The transaction ID has already been verified for another prior order.</li>
            <li>The transaction is not reflected in official SparkCare bank receiving statements.</li>
          </ul>
          <p>
            If your payment proof is rejected, you will receive an admin review note. You can upload a corrected screenshot via your account orders tab or contact our support team with your bank statement proof.
          </p>
        </section>

        {/* Section 4: Refund Process */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <CheckCircle size={18} className="text-green-500" />
            <h2>4. Manual UPI Refund Workflow & Timelines</h2>
          </div>
          <p>
            SparkCare does not use automated online payment gateways. Therefore, refunds are executed directly via manual UPI reverse transfer:
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>
              <strong className="text-text-main">Audit & Verification:</strong> Our finance desk verifies the cancellation request against the original payment receipt (typically completed within 24 to 48 hours).
            </li>
            <li>
              <strong className="text-text-main">Direct Reverse Transfer:</strong> The verified refund is transferred directly to the originating customer UPI ID or bank account.
            </li>
            <li>
              <strong className="text-text-main">Timeline:</strong> The complete refund reconciliation typically takes <strong className="text-text-main">3 to 5 business days</strong> depending on your banking provider.
            </li>
            <li>
              <strong className="text-text-main">Cash on Delivery (COD):</strong> For orders or services settled via Cash on Delivery, refunds are provided via bank NEFT/IMPS or UPI after customer bank details verification.
            </li>
          </ol>
        </section>

        {/* Section 5: Non-Refundable Cases */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <h2 className="text-text-main font-black text-lg">5. Non-Refundable Situations</h2>
          <p>Refunds will not be issued for:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Physical products returned in opened, physically damaged, altered, or unsealed condition without original packaging.</li>
            <li>Custom cut cables or custom wiring items modified specifically for a project.</li>
            <li>Completed electrical service jobs where the agreed scope of work was fully inspected and signed off.</li>
          </ul>
        </section>

        {/* Section 6: Contact Support */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <Mail size={18} className="text-primary" />
            <h2>6. Request Assistance or File a Refund Claim</h2>
          </div>
          <p>
            To submit a cancellation notice or inquire about an existing refund status, please provide your <strong className="text-text-main">Order ID</strong> or <strong className="text-text-main">Booking ID</strong>:
          </p>
          <div className="p-4 bg-bg-secondary rounded-2xl border border-border/70 space-y-1 text-xs">
            <p className="font-black text-text-main">SparkCare Support Helpdesk</p>
            <p>Email: <a href="mailto:support@sparkcare.com" className="text-primary hover:underline font-bold">support@sparkcare.com</a></p>
            <p>Direct Support Portal: <Link to="/contact-us" className="text-primary hover:underline font-bold">Contact Us</Link></p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RefundCancellationPage;
