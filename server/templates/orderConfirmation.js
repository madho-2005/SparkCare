import { escapeHtml, wrapEmailTemplate } from './baseTemplate.js';

/**
 * Builds Order Confirmation email dynamically from real database Order and User records.
 */
export const buildOrderConfirmationTemplate = (order, user) => {
  const customerName = escapeHtml(user?.name || 'Valued Customer');
  const orderId = escapeHtml(order?.orderNumber || order?._id?.toString() || '');
  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-IN');

  const paymentMethodLabel =
    order?.paymentMethod === 'cod'
      ? 'Cash on Delivery (COD)'
      : order?.paymentMethod === 'qr'
      ? 'Manual UPI QR Transfer'
      : 'Online Card / Stripe';

  const paymentStatus = (order?.paymentStatus || 'unpaid').toUpperCase();
  const orderStatus = (order?.orderStatus || 'placed').toUpperCase();

  const isPaid = order?.paymentStatus === 'paid' || order?.paymentStatus === 'verified';
  const paymentBadgeClass = isPaid ? 'badge-success' : 'badge-warning';

  const items = Array.isArray(order?.items) ? order.items : [];
  const itemsHtml = items
    .map((item) => {
      const name = escapeHtml(item?.name || item?.product?.name || 'SparkCare Product');
      const qty = Number(item?.quantity) || 1;
      const unitPrice = Number(item?.unitPrice || 0);
      const subtotal = (qty * unitPrice).toFixed(2);
      return `<tr>
        <td><strong>${name}</strong></td>
        <td style="text-align: center;">${qty}</td>
        <td style="text-align: right;">₹${unitPrice.toFixed(2)}</td>
        <td style="text-align: right;">₹${subtotal}</td>
      </tr>`;
    })
    .join('');

  const subtotal = Number(order?.totals?.subtotal || 0).toFixed(2);
  const tax = Number(order?.totals?.tax || 0).toFixed(2);
  const shipping = Number(order?.totals?.shippingFee || 0).toFixed(2);
  const discount = Number(order?.totals?.discount || 0);
  const grandTotal = Number(order?.totals?.grandTotal || 0).toFixed(2);

  const address = order?.shippingAddress
    ? `${escapeHtml(order.shippingAddress.street || '')}, ${escapeHtml(order.shippingAddress.city || '')}, ${escapeHtml(order.shippingAddress.state || '')} - ${escapeHtml(order.shippingAddress.zipCode || '')}`
    : 'Provided at checkout';

  const contentHtml = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 22px;">Order Confirmed!</h2>
    <p>Hi <strong>${customerName}</strong>,</p>
    <p>Thank you for choosing SparkCare. Your order <strong>#${orderId}</strong> has been successfully registered and is being prepared for fulfillment.</p>

    <div class="card">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; color: #64748b; width: 140px;">Order Date:</td>
          <td style="padding: 4px 0;"><strong>${orderDate}</strong></td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;">Order Status:</td>
          <td style="padding: 4px 0;"><span class="badge badge-warning">${orderStatus}</span></td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;">Payment Method:</td>
          <td style="padding: 4px 0;"><strong>${paymentMethodLabel}</strong></td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;">Payment Status:</td>
          <td style="padding: 4px 0;"><span class="badge ${paymentBadgeClass}">${paymentStatus}</span></td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;">Delivery Address:</td>
          <td style="padding: 4px 0;">${address}</td>
        </tr>
      </table>
    </div>

    <h3 style="color: #0f172a; margin-top: 24px; margin-bottom: 8px;">Ordered Items</h3>
    <table class="table">
      <thead>
        <tr>
          <th style="text-align: left;">Item</th>
          <th style="text-align: center; width: 50px;">Qty</th>
          <th style="text-align: right; width: 90px;">Price</th>
          <th style="text-align: right; width: 90px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="card" style="background: #ffffff; border: 2px solid #e2e8f0;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Subtotal</td>
          <td style="text-align: right; padding: 4px 0;">₹${subtotal}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">GST / Tax (8%)</td>
          <td style="text-align: right; padding: 4px 0;">₹${tax}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Delivery Fee</td>
          <td style="text-align: right; padding: 4px 0;">₹${shipping}</td>
        </tr>
        ${
          discount > 0
            ? `<tr>
                <td style="color: #dc2626; padding: 4px 0;">Coupon Discount</td>
                <td style="text-align: right; color: #dc2626; padding: 4px 0;">-₹${discount.toFixed(2)}</td>
              </tr>`
            : ''
        }
        <tr style="border-top: 2px solid #e2e8f0;">
          <td style="padding-top: 12px; font-weight: bold; font-size: 16px;">Total Payable</td>
          <td style="text-align: right; padding-top: 12px;" class="price-total">₹${grandTotal}</td>
        </tr>
      </table>
    </div>

    <p style="margin-top: 24px; font-size: 14px; color: #475569;">
      We will notify you as soon as your shipment is dispatched with tracking information.
    </p>
  `;

  const html = wrapEmailTemplate({
    title: `Order Confirmation #${orderId} — SparkCare`,
    preheader: `Thank you for your order #${orderId}. Total: ₹${grandTotal}`,
    contentHtml,
  });

  const textItems = items
    .map(
      (item) =>
        `- ${item?.name || 'Product'} x ${item?.quantity || 1} (₹${Number(item?.unitPrice || 0).toFixed(2)})`
    )
    .join('\n');

  const text = `Order Confirmation #${orderId} - SparkCare

Hi ${user?.name || 'Customer'},
Thank you for ordering with SparkCare!

Order ID: ${orderId}
Order Date: ${orderDate}
Order Status: ${orderStatus}
Payment Status: ${paymentStatus}
Payment Method: ${paymentMethodLabel}

Items:
${textItems}

Subtotal: ₹${subtotal}
Tax: ₹${tax}
Shipping: ₹${shipping}
${discount > 0 ? `Discount: -₹${discount.toFixed(2)}\n` : ''}Total: ₹${grandTotal}

Delivery Address: ${address}

For support, call 1800-SPARKCARE or email support@sparkcare.com
`;

  return {
    subject: `Order Confirmation #${orderId} — SparkCare`,
    html,
    text,
  };
};
