import { escapeHtml, wrapEmailTemplate } from './baseTemplate.js';

/**
 * Builds Order Status Update email dynamically from database records.
 */
export const buildOrderStatusTemplate = (order, user, newStatus, previousStatus = '') => {
  const customerName = escapeHtml(user?.name || 'Valued Customer');
  const orderId = escapeHtml(order?.orderNumber || order?._id?.toString() || '');
  const cleanNewStatus = (newStatus || order?.orderStatus || 'updated').toUpperCase();
  const cleanPrevStatus = previousStatus ? previousStatus.toUpperCase() : null;

  let statusBadgeClass = 'badge-info';
  let statusMessage = 'Your order status has been updated.';

  switch (newStatus) {
    case 'confirmed':
      statusBadgeClass = 'badge-success';
      statusMessage = 'Your order has been confirmed and assigned to our fulfillment center.';
      break;
    case 'processing':
      statusBadgeClass = 'badge-info';
      statusMessage = 'Your order is currently being inspected and packed with care.';
      break;
    case 'shipped':
      statusBadgeClass = 'badge-info';
      statusMessage = 'Your order has been handed over to our courier partner and is on its way!';
      break;
    case 'delivered':
      statusBadgeClass = 'badge-success';
      statusMessage = 'Your order has been successfully delivered. We hope you love your products!';
      break;
    case 'cancelled':
      statusBadgeClass = 'badge-danger';
      statusMessage = 'Your order has been cancelled. If any payment was captured, refund processing has been initiated.';
      break;
    case 'payment_failed':
      statusBadgeClass = 'badge-danger';
      statusMessage = 'Payment for your order could not be processed or verified. Please review payment details.';
      break;
    case 'awaiting_payment_verification':
      statusBadgeClass = 'badge-warning';
      statusMessage = 'Your payment screenshot is awaiting review by our finance verification team.';
      break;
    default:
      statusBadgeClass = 'badge-info';
  }

  const grandTotal = Number(order?.totals?.grandTotal || 0).toFixed(2);
  const trackingId = order?.trackingId ? escapeHtml(order.trackingId) : null;

  const contentHtml = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 22px;">Order Status Update</h2>
    <p>Hi <strong>${customerName}</strong>,</p>
    <p>The status of your order <strong>#${orderId}</strong> has been updated.</p>

    <div class="card" style="text-align: center; padding: 24px;">
      <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px;">CURRENT ORDER STATUS</p>
      <span class="badge ${statusBadgeClass}" style="font-size: 15px; padding: 8px 20px;">${cleanNewStatus}</span>
      ${
        cleanPrevStatus
          ? `<p style="margin: 12px 0 0 0; font-size: 13px; color: #94a3b8;">Previous status: ${cleanPrevStatus}</p>`
          : ''
      }
      <p style="margin: 16px 0 0 0; font-size: 14px; color: #334155; font-weight: 500;">
        ${statusMessage}
      </p>
    </div>

    ${
      trackingId
        ? `<div class="card" style="background: #eff6ff; border-color: #bfdbfe;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>Tracking Reference:</strong> ${trackingId}
            </p>
          </div>`
        : ''
    }

    <div class="card">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="color: #64748b; width: 140px; padding: 4px 0;">Order Total:</td>
          <td style="padding: 4px 0;"><strong>₹${grandTotal}</strong></td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Items Count:</td>
          <td style="padding: 4px 0;">${order?.items?.length || 0} item(s)</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Payment Method:</td>
          <td style="padding: 4px 0;">${order?.paymentMethod === 'cod' ? 'Cash on Delivery' : order?.paymentMethod === 'qr' ? 'UPI QR' : 'Online'}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 14px; color: #475569; margin-top: 24px;">
      You can track real-time delivery status any time from your SparkCare customer dashboard.
    </p>
  `;

  const html = wrapEmailTemplate({
    title: `Order Status Update: #${orderId} is ${cleanNewStatus} — SparkCare`,
    preheader: `Your order #${orderId} is now ${cleanNewStatus}.`,
    contentHtml,
  });

  const text = `Order Status Update #${orderId} - SparkCare

Hi ${user?.name || 'Customer'},
The status of your order #${orderId} has changed to: ${cleanNewStatus}
${cleanPrevStatus ? `Previous status: ${cleanPrevStatus}\n` : ''}
${statusMessage}
${trackingId ? `Tracking Reference: ${trackingId}\n` : ''}
Order Total: ₹${grandTotal}

For support, call 1800-SPARKCARE or email support@sparkcare.com
`;

  return {
    subject: `Order #${orderId} Status Update: ${cleanNewStatus} — SparkCare`,
    html,
    text,
  };
};
