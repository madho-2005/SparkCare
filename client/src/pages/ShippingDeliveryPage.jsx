import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Clock, PackageCheck, AlertCircle, ArrowLeft, Mail, MapPin } from 'lucide-react';

export const ShippingDeliveryPage = () => {
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
            <Truck size={26} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-text-main tracking-tight font-heading">
              Shipping & Delivery Policy
            </h1>
            <p className="text-xs text-text-muted font-semibold mt-1">
              Transparent fulfillment timelines for physical electrical products and on-site service appointments
            </p>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-8 text-sm text-text-muted font-medium leading-relaxed">
        {/* Section 1: Coverage */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <MapPin size={18} className="text-primary" />
            <h2>1. Delivery Coverage & Service Zones</h2>
          </div>
          <p>
            SparkCare ships electrical hardware and supplies across serviceable postal codes within our active regional fulfillment zones. Delivery availability is verified at checkout based on your entered destination zip code.
          </p>
          <p>
            For home electrical services, our certified on-site service teams currently serve residential and commercial properties within designated metropolitan and suburban service perimeters.
          </p>
        </section>

        {/* Section 2: Order Processing */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <Clock size={18} className="text-primary" />
            <h2>2. Order Processing & Verification Timeline</h2>
          </div>
          <p>
            Because SparkCare uses human-verified manual UPI payment auditing, orders move through distinct fulfillment milestones:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-text-main">Payment Verification Window:</strong> Admin verification of uploaded UPI payment screenshots typically occurs within 1 to 4 business hours during working periods.
            </li>
            <li>
              <strong className="text-text-main">Warehouse Packaging:</strong> Once payment is confirmed, warehouse packaging and quality inspection require 1 to 2 business days.
            </li>
            <li>
              <strong className="text-text-main">Transit Duration:</strong> Standard ground shipment delivery generally requires 3 to 5 business days depending on destination proximity.
            </li>
          </ul>
        </section>

        {/* Section 3: Service Appointment Windows */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <Clock size={18} className="text-primary" />
            <h2>3. Service Appointment Arrival Windows</h2>
          </div>
          <p>
            Home electrical service appointments are scheduled within selected operational time blocks:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-bg-secondary rounded-xl border border-border text-xs">
              <span className="font-bold text-text-main">Morning Window:</span> 08:00 AM – 11:00 AM
            </div>
            <div className="p-3 bg-bg-secondary rounded-xl border border-border text-xs">
              <span className="font-bold text-text-main">Midday Window:</span> 11:00 AM – 02:00 PM
            </div>
            <div className="p-3 bg-bg-secondary rounded-xl border border-border text-xs">
              <span className="font-bold text-text-main">Afternoon Window:</span> 02:00 PM – 05:00 PM
            </div>
            <div className="p-3 bg-bg-secondary rounded-xl border border-border text-xs">
              <span className="font-bold text-text-main">Evening Window:</span> 05:00 PM – 08:00 PM
            </div>
          </div>
          <p className="text-xs text-text-muted">
            The service team will call ahead at your registered phone number prior to arriving at the service address.
          </p>
        </section>

        {/* Section 4: Tracking & Status Updates */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <PackageCheck size={18} className="text-primary" />
            <h2>4. Live Order Status Tracking</h2>
          </div>
          <p>
            You can monitor real-time fulfillment progress directly in your account:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-text-main">Awaiting Payment Verification:</strong> Payment proof uploaded; undergoing admin verification.</li>
            <li><strong className="text-text-main">Confirmed:</strong> Payment verified; order routed to fulfillment.</li>
            <li><strong className="text-text-main">Processing:</strong> Hardware items packed and staged for courier handover.</li>
            <li><strong className="text-text-main">Shipped:</strong> Dispatched via regional delivery logistics.</li>
            <li><strong className="text-text-main">Delivered:</strong> Package successfully received at the destination address.</li>
          </ul>
        </section>

        {/* Section 5: Damaged Products & Failed Deliveries */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <AlertCircle size={18} className="text-amber-500" />
            <h2>5. Damaged Items & Delivery Issues</h2>
          </div>
          <p>
            In the rare event that an electrical package arrives damaged or defective:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Notify our team within <strong className="text-text-main">48 hours</strong> of physical delivery.</li>
            <li>Provide clear photographs of the damaged product and the outer shipping parcel with tracking label visible.</li>
            <li>We will arrange a priority replacement shipment or execute a full manual UPI refund upon verification.</li>
          </ul>
        </section>

        {/* Section 6: Contact */}
        <section className="glass-card bg-bg-primary p-6 sm:p-8 rounded-3xl border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-text-main font-black text-lg">
            <Mail size={18} className="text-primary" />
            <h2>6. Shipping Support Assistance</h2>
          </div>
          <p>
            If you need to update an incorrect shipping address before dispatch or check on an in-transit order:
          </p>
          <div className="p-4 bg-bg-secondary rounded-2xl border border-border/70 space-y-1 text-xs">
            <p className="font-black text-text-main">SparkCare Logistics Desk</p>
            <p>Email: <a href="mailto:support@sparkcare.com" className="text-primary hover:underline font-bold">support@sparkcare.com</a></p>
            <p>Support Desk: <Link to="/contact-us" className="text-primary hover:underline font-bold">Contact Form</Link></p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShippingDeliveryPage;
