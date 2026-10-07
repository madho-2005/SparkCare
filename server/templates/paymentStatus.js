import { escapeHtml, wrapEmailTemplate } from './baseTemplate.js';

/**
 * Builds Payment Verification Outcome (Approved / Rejected) email template.
 */
export const buildPaymentStatusTemplate = (payment, user, status, note = '') => {
  const customerName = escapeHtml(user?.name || 'Valued Customer');
  const isVerified = status === 'verified' || status === 'succeeded' || status === 'approved';
  const txnId = escapeHtml(payment?.transactionId || payment?._id?.toString() || 'N/A');
  const amount = Number(payment?.amount || 0).toFixed(2);
  const targetType = (payment?.paymentType || 'order').toUpperCase();
  const referenceId = escapeHtml(payment?.referenceId?.toString() || payment?.order?.toString() || '');
  const cleanNote = escapeHtml(note || '');

  const contentHtml = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 22px;">Payment Verification Notice</h2>
    <p>Hi <strong>${customerName}</strong>,</p>
    <p>Your manual UPI payment review for transaction reference <strong>#${txnId}</strong> has been completed by our operations team.</p>

    <div class="card" style="text-align: center; padding: 24px;">
      <span class="badge ${isVerified ? 'badge-success' : 'badge-danger'}" style="font-size: 15px; padding: 8px 20px;">
        ${isVerified ? 'PAYMENT VERIFIED &amp; CONFIRMED' : 'PAYMENT REJECTED'}
      </span>
      <p style="margin: 14px 0 0 0; font-size: 14px; color: ${isVerified ? '#166534' : '#991b1b'}; font-weight: 500;">
        ${
          isVerified
            ? 'Your payment was successfully reconciled with our bank ledger.'
            : 'We could not match this payment with our bank transaction ledger.'
        }
      </p>
    </div>

    <div class="card">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="color: #64748b; width: 140px; padding: 4px 0;">Transaction ID:</td>
          <td style="padding: 4px 0;"><strong>#${txnId}</strong></td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Target:</td>
          <td style="padding: 4px 0;">${targetType} ${referenceId ? `#${referenceId}` : ''}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Amount:</td>
          <td style="padding: 4px 0;"><strong>₹${amount}</strong></td>
        </tr>
        ${
          cleanNote
            ? `<tr>
                <td style="color: #64748b; padding: 4px 0;">Review Note:</td>
                <td style="padding: 4px 0;">${cleanNote}</td>
              </tr>`
            : ''
        }
      </table>
    </div>

    <p style="font-size: 14px; color: #475569; margin-top: 24px;">
      ${
        isVerified
          ? 'Your order is now being processed for dispatch. You will receive a tracking link once shipped.'
          : 'Please log in to your account and re-upload a clear transaction receipt screenshot showing the UTR / Ref Number, or contact our support team.'
      }
    </p>
  `;

  const subject = `Payment Verification ${isVerified ? 'Approved' : 'Rejected'} #${txnId} — SparkCare`;

  const html = wrapEmailTemplate({
    title: subject,
    preheader: `Payment for ${targetType} #${referenceId} was ${isVerified ? 'verified' : 'rejected'}.`,
    contentHtml,
  });

  const text = `Payment Verification ${isVerified ? 'Approved' : 'Rejected'} #${txnId} - SparkCare

Hi ${user?.name || 'Customer'},
Your manual UPI payment review has been processed.

Status: ${isVerified ? 'VERIFIED & CONFIRMED' : 'REJECTED'}
Transaction ID: ${txnId}
Target: ${targetType} #${referenceId}
Amount: ₹${amount}
${note ? `Review Note: ${note}\n` : ''}
${isVerified ? 'Your order is confirmed and forwarded to dispatch.' : 'Please re-upload a clear transaction screenshot or reach out to support.'}

For support, call 1800-SPARKCARE or email support@sparkcare.com
`;

  return {
    subject,
    html,
    text,
  };
};
