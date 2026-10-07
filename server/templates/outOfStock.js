import { escapeHtml, wrapEmailTemplate } from './baseTemplate.js';

/**
 * Builds Admin Out of Stock Alert email template.
 */
export const buildOutOfStockTemplate = (product) => {
  const productName = escapeHtml(product?.name || 'Unknown Product');
  const productId = escapeHtml(product?._id?.toString() || '');
  const sku = escapeHtml(product?.sku || 'N/A');
  const brand = escapeHtml(product?.brand || 'SparkCare');
  const category = escapeHtml(product?.category || 'General');

  const contentHtml = `
    <h2 style="margin-top: 0; color: #dc2626; font-size: 22px;">🛑 CRITICAL: Product Out of Stock</h2>
    <p>This is an urgent inventory alert for SparkCare administrators.</p>

    <div class="card" style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px;">
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #991b1b; font-weight: 700; text-transform: uppercase;">
        Zero Inventory Reached
      </p>
      <p style="margin: 0; font-size: 15px; color: #7f1d1d; font-weight: 600;">
        <strong>${productName}</strong> is now completely OUT OF STOCK (0 units remaining).
      </p>
    </div>

    <div class="card">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="color: #64748b; width: 150px; padding: 6px 0;">Product:</td>
          <td style="padding: 6px 0;"><strong>${productName}</strong></td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Current Stock:</td>
          <td style="padding: 6px 0;"><strong style="color: #dc2626; font-size: 18px;">0</strong></td>
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
      </table>
    </div>

    <p style="font-size: 14px; color: #475569; margin-top: 24px;">
      Customers cannot purchase this item until new inventory arrives and is checked into the catalog.
    </p>
  `;

  const subject = `SparkCare — Product Out of Stock: ${product?.name || 'Product'}`;

  const html = wrapEmailTemplate({
    title: subject,
    preheader: `URGENT: ${productName} is completely out of stock.`,
    contentHtml,
  });

  const text = `SparkCare — Product Out of Stock

Product: ${product?.name || 'Product'}
Current Stock: 0
Product ID: ${productId}
SKU: ${sku}
Brand: ${brand}

This product is now out of stock and unavailable for customer checkout.
`;

  return {
    subject,
    html,
    text,
  };
};
