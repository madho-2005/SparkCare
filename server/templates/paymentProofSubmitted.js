import { escapeHtml, wrapEmailTemplate } from './baseTemplate.js';

/**
 * Builds Payment Proof Submitted email template.
 */
export const buildPaymentProofSubmittedTemplate = (order, user) => {
  const customerName = escapeHtml(user?.name || 'Valued Customer');
  const orderId = escapeHtml(order?.orderNumber || order?._id?.toString() || '');
  const amount = Number(order?.totals?.grandTotal || 0).toFixed(2);

  const contentHtml = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 22px;">Payment Proof Received</h2>
    <p>Hi <strong>${customerName}</strong>,</p>
    <p>We have successfully received your payment proof screenshot for Order <strong>#${orderId}</strong>.</p>

    <div class="card" style="background: #eff6ff; border-color: #bfdbfe; text-align: center; padding: 20px;">
      <span class="badge badge-warning" style="font-size: 13px;">UNDER VERIFICATION</span>
      <p style="margin: 12px 0 0 0; font-size: 14px; color: #1e40af; font-weight: 600;">
        Payment proof submitted. Your order will be confirmed after admin verification.
      </p>
    </div>

    <div class="card">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="color: #64748b; width: 140px; padding: 4px 0;">Order ID:</td>
          <td style="padding: 4px 0;"><strong>#${orderId}</strong></td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Payable Amount:</td>
          <td style="padding: 4px 0;"><strong>₹${amount}</strong></td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Payment Method:</td>
          <td style="padding: 4px 0;">Manual UPI QR Transfer</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 14px; color: #475569; margin-top: 20px;">
      Our finance team is auditing the transfer against our bank records. Once verified, your order will transition to <strong>CONFIRMED</strong> status and you will receive another email confirmation.
    </p>
  `;

  const html = wrapEmailTemplate({
    title: `Payment Proof Received for Order #${orderId} — SparkCare`,
    preheader: `Payment proof received for Order #${orderId}. Pending admin review.`,
    contentHtml,
  });

  const text = `Payment Proof Received - Order #${orderId} - SparkCare

Hi ${user?.name || 'Customer'},
We have received your payment screenshot for Order #${orderId} (₹${amount}).

Status: Payment proof submitted. Your order will be confirmed after admin verification.

Our finance team will verify the transfer against bank records shortly.

For support, call 1800-SPARKCARE or email support@sparkcare.com
`;

  return {
    subject: `Payment Proof Received for Order #${orderId} — SparkCare`,
    html,
    text,
  };
};
