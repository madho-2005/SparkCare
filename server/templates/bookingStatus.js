import { escapeHtml, wrapEmailTemplate } from './baseTemplate.js';

/**
 * Builds Booking Status Update email template.
 */
export const buildBookingStatusTemplate = (booking, user, newStatus, previousStatus = '') => {
  const customerName = escapeHtml(user?.name || 'Valued Customer');
  const bookingId = escapeHtml(booking?._id?.toString() || '');
  const serviceTitle = escapeHtml(booking?.service?.title || 'Certified Electrician Service');
  const cleanNewStatus = (newStatus || booking?.bookingStatus || 'updated').toUpperCase().replace(/_/g, ' ');
  const cleanPrevStatus = previousStatus ? previousStatus.toUpperCase().replace(/_/g, ' ') : null;

  let badgeClass = 'badge-info';
  let message = 'Your service appointment status has changed.';

  switch (newStatus) {
    case 'in_transit':
      badgeClass = 'badge-info';
      message = 'Your assigned electrician is currently in transit and heading to your location.';
      break;
    case 'in_progress':
      badgeClass = 'badge-warning';
      message = 'The electrician has arrived at your address and service work is actively in progress.';
      break;
    case 'completed':
      badgeClass = 'badge-success';
      message = 'Your electrician service has been successfully completed. Thank you for choosing SparkCare!';
      break;
    case 'cancelled':
      badgeClass = 'badge-danger';
      message = 'Your service booking has been cancelled.';
      break;
    default:
      badgeClass = 'badge-info';
  }

  const scheduledDate = booking?.scheduledDate
    ? new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const timeSlot = escapeHtml(booking?.timeSlot || '');

  const contentHtml = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 22px;">Service Status Update</h2>
    <p>Hi <strong>${customerName}</strong>,</p>
    <p>Your electrician service booking <strong>#${bookingId}</strong> for <strong>${serviceTitle}</strong> has an update.</p>

    <div class="card" style="text-align: center; padding: 24px;">
      <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px;">UPDATED STATUS</p>
      <span class="badge ${badgeClass}" style="font-size: 15px; padding: 8px 20px;">${cleanNewStatus}</span>
      ${
        cleanPrevStatus
          ? `<p style="margin: 12px 0 0 0; font-size: 13px; color: #94a3b8;">Previous status: ${cleanPrevStatus}</p>`
          : ''
      }
      <p style="margin: 16px 0 0 0; font-size: 14px; color: #334155; font-weight: 500;">
        ${message}
      </p>
    </div>

    <div class="card">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="color: #64748b; width: 140px; padding: 4px 0;">Scheduled Date:</td>
          <td style="padding: 4px 0;">${scheduledDate}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Time Window:</td>
          <td style="padding: 4px 0;">${timeSlot}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 14px; color: #475569; margin-top: 24px;">
      If you need to reschedule or have any questions, our support team is available 24/7 at 1800-SPARKCARE.
    </p>
  `;

  const subject = `Booking Status Update #${bookingId}: ${cleanNewStatus} — SparkCare`;

  const html = wrapEmailTemplate({
    title: subject,
    preheader: `Your appointment #${bookingId} is now ${cleanNewStatus}.`,
    contentHtml,
  });

  const text = `Booking Status Update #${bookingId} - SparkCare

Hi ${user?.name || 'Customer'},
Your booking #${bookingId} status is now: ${cleanNewStatus}
${cleanPrevStatus ? `Previous status: ${cleanPrevStatus}\n` : ''}
${message}
Scheduled Date: ${scheduledDate} (${timeSlot})

For support, call 1800-SPARKCARE or email support@sparkcare.com
`;

  return {
    subject,
    html,
    text,
  };
};
