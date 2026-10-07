import { escapeHtml, wrapEmailTemplate } from './baseTemplate.js';

/**
 * Builds Service Booking Confirmation email template.
 */
export const buildBookingConfirmationTemplate = (booking, user) => {
  const customerName = escapeHtml(user?.name || 'Valued Customer');
  const bookingId = escapeHtml(booking?._id?.toString() || '');
  const serviceTitle = escapeHtml(booking?.service?.title || 'Certified Electrician Service');

  const scheduledDate = booking?.scheduledDate
    ? new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Scheduled Date';

  const timeSlot = escapeHtml(booking?.timeSlot || '11:00 - 14:00');
  const basePrice = Number(booking?.basePrice || 0).toFixed(2);
  const discount = Number(booking?.discount || 0);
  const totalPrice = Number(booking?.totalPrice || 0).toFixed(2);

  const address = booking?.address
    ? `${escapeHtml(booking.address.street || '')}, ${escapeHtml(booking.address.city || '')}, ${escapeHtml(booking.address.state || '')} - ${escapeHtml(booking.address.zipCode || '')}`
    : 'Provided at booking';

  const notes = booking?.notes ? escapeHtml(booking.notes) : null;

  const contentHtml = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 22px;">Service Appointment Scheduled!</h2>
    <p>Hi <strong>${customerName}</strong>,</p>
    <p>Your certified electrician service booking <strong>#${bookingId}</strong> has been registered successfully.</p>

    <div class="card" style="border-left: 4px solid #2563eb;">
      <h3 style="margin-top: 0; color: #1e3a8a; font-size: 16px;">${serviceTitle}</h3>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="color: #64748b; width: 140px; padding: 4px 0;">Appointment Date:</td>
          <td style="padding: 4px 0;"><strong>${scheduledDate}</strong></td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Time Window:</td>
          <td style="padding: 4px 0;"><strong>${timeSlot}</strong></td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Service Address:</td>
          <td style="padding: 4px 0;">${address}</td>
        </tr>
        ${
          notes
            ? `<tr>
                <td style="color: #64748b; padding: 4px 0;">Special Instructions:</td>
                <td style="padding: 4px 0;"><em>${notes}</em></td>
              </tr>`
            : ''
        }
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Booking Status:</td>
          <td style="padding: 4px 0;"><span class="badge badge-warning">SCHEDULED</span></td>
        </tr>
      </table>
    </div>

    <div class="card" style="background: #ffffff; border: 2px solid #e2e8f0;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Base Service Fee</td>
          <td style="text-align: right; padding: 4px 0;">₹${basePrice}</td>
        </tr>
        ${
          discount > 0
            ? `<tr>
                <td style="color: #dc2626; padding: 4px 0;">Promotional Discount</td>
                <td style="text-align: right; color: #dc2626; padding: 4px 0;">-₹${discount.toFixed(2)}</td>
              </tr>`
            : ''
        }
        <tr style="border-top: 2px solid #e2e8f0;">
          <td style="padding-top: 10px; font-weight: bold; font-size: 16px;">Estimated Total</td>
          <td style="text-align: right; padding-top: 10px;" class="price-total">₹${totalPrice}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 14px; color: #475569; margin-top: 24px;">
      A verified, licensed electrician will arrive at your address with tools and safety gear during your selected time window.
    </p>
  `;

  const subject = `Electrician Service Scheduled #${bookingId} — SparkCare`;

  const html = wrapEmailTemplate({
    title: subject,
    preheader: `Your service appointment #${bookingId} is confirmed for ${scheduledDate}.`,
    contentHtml,
  });

  const text = `Electrician Service Scheduled #${bookingId} - SparkCare

Hi ${user?.name || 'Customer'},
Your service booking has been scheduled.

Booking ID: #${bookingId}
Service: ${booking?.service?.title || 'Certified Electrician Service'}
Scheduled Date: ${scheduledDate}
Time Window: ${timeSlot}
Address: ${address}
Total Estimate: ₹${totalPrice}

For support, call 1800-SPARKCARE or email support@sparkcare.com
`;

  return {
    subject,
    html,
    text,
  };
};
