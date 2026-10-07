import { escapeHtml, wrapEmailTemplate } from './baseTemplate.js';

/**
 * Builds Admin Low Stock Alert email template.
 */
export const buildLowStockTemplate = (product, threshold = 5, currentStockOverride = null) => {
  const productName = escapeHtml(product?.name || 'Unknown Product');
  const productId = escapeHtml(product?._id?.toString() || '');
  const sku = escapeHtml(product?.sku || 'N/A');
  const currentStock = currentStockOverride !== null && currentStockOverride !== undefined
    ? Number(currentStockOverride)
    : Number(product?.stockCount || 0);
  const brand = escapeHtml(product?.brand || 'SparkCare');
  const category = escapeHtml(product?.category || 'General');

  const contentHtml = `
    <h2 style="margin-top: 0; color: #b45309; font-size: 22px;">⚠️ Low Stock Inventory Alert</h2>
    <p>This is an automated inventory warning notification for SparkCare administrators.</p>

    <div class="card" style="background: #fffbeb; border: 1px solid #fde68a; padding: 20px;">
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #92400e; font-weight: 700; text-transform: uppercase;">
        Stock Alert Triggered
      </p>
      <p style="margin: 0; font-size: 15px; color: #78350f;">
        The inventory level for <strong>${productName}</strong> has dropped to or below the alert threshold (${threshold} units).
      </p>
    </div>

    <div class="card">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="color: #64748b; width: 150px; padding: 6px 0;">Product Name:</td>
          <td style="padding: 6px 0;"><strong>${productName}</strong></td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Product ID:</td>
          <td style="padding: 6px 0;"><code>${productId}</code></td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">SKU:</td>
          <td style="padding: 6px 0;"><code>${sku}</code></td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Brand &amp; Category:</td>
          <td style="padding: 6px 0;">${brand} (${category})</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Current Stock:</td>
          <td style="padding: 6px 0;"><strong style="color: #dc2626; font-size: 16px;">${currentStock} unit(s) remaining</strong></td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Configured Threshold:</td>
          <td style="padding: 6px 0;">${threshold} unit(s)</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 14px; color: #475569; margin-top: 24px;">
      Please replenish inventory from supplier or manufacturer to avoid stock-out disruptions.
    </p>
  `;

  const subject = `SparkCare — Low Stock Alert: ${product?.name || 'Product'} (${currentStock} left)`;

  const html = wrapEmailTemplate({
    title: subject,
    preheader: `Low Stock: ${productName} only has ${currentStock} units left.`,
    contentHtml,
  });

  const text = `SparkCare — Low Stock Alert

Product: ${product?.name || 'Product'}
Product ID: ${productId}
SKU: ${sku}
Brand: ${brand}
Current Stock: ${currentStock}
Low Stock Threshold: ${threshold}

Please restock this item to prevent order fulfillment disruption.
`;

  return {
    subject,
    html,
    text,
  };
};
