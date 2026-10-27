import { Client, Order } from '../types';

export function base64urlEncode(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function generateOrderEmailHtml(order: Order, client: Client): string {
  const itemsHtml = order.items
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-size: 14px; color: #1e293b;">${idx + 1}. <strong>${escapeHtml(item.name)}</strong></td>
        <td style="padding: 10px 12px; font-size: 14px; color: #475569; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 12px; font-size: 14px; color: #475569; text-align: right;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding: 10px 12px; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${formatCurrency(item.total)}</td>
      </tr>
    `
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order ${order.orderNumber} - ${client.name}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 28px; color: #ffffff;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; background: #38bdf8; color: #0f172a; padding: 3px 8px; border-radius: 9999px; font-weight: 700;">Android OrderNote</span>
          <h1 style="margin: 8px 0 2px 0; font-size: 22px; font-weight: 700; color: #ffffff;">Order ${order.orderNumber}</h1>
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">Saved on ${order.orderDate} at ${order.orderTime || 'N/A'}</p>
        </div>
      </div>
    </div>

    <!-- Client Card -->
    <div style="padding: 20px 28px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
      <h3 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Client Details</h3>
      <div style="font-size: 16px; font-weight: 700; color: #0f172a;">${escapeHtml(client.name)} ${client.company ? `<span style="font-size: 14px; font-weight: normal; color: #64748b;">(${escapeHtml(client.company)})</span>` : ''}</div>
      <div style="margin-top: 6px; font-size: 13px; color: #475569; line-height: 1.5;">
        ${client.phone ? `<div>📱 <strong>Phone:</strong> ${escapeHtml(client.phone)}</div>` : ''}
        ${client.email ? `<div>✉️ <strong>Email:</strong> ${escapeHtml(client.email)}</div>` : ''}
        ${client.address ? `<div>📍 <strong>Address:</strong> ${escapeHtml(client.address)}</div>` : ''}
      </div>
    </div>

    <!-- Order Items Table -->
    <div style="padding: 24px 28px;">
      <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Items Ordered</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
            <th style="padding: 8px 12px; font-size: 12px; color: #475569; text-transform: uppercase;">Item Description</th>
            <th style="padding: 8px 12px; font-size: 12px; color: #475569; text-transform: uppercase; text-align: center;">Qty</th>
            <th style="padding: 8px 12px; font-size: 12px; color: #475569; text-transform: uppercase; text-align: right;">Unit Price</th>
            <th style="padding: 8px 12px; font-size: 12px; color: #475569; text-transform: uppercase; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Grand Total -->
      <div style="margin-top: 20px; padding: 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 15px; font-weight: 700; color: #065f46;">TOTAL ORDER AMOUNT:</span>
        <span style="font-size: 22px; font-weight: 800; color: #047857;">${formatCurrency(order.totalAmount)}</span>
      </div>

      <!-- Notes / Status -->
      ${order.note ? `
        <div style="margin-top: 20px; padding: 14px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px;">
          <strong style="font-size: 12px; text-transform: uppercase; color: #b45309; display: block; margin-bottom: 4px;">Order Notes / Instructions:</strong>
          <div style="font-size: 14px; color: #78350f; white-space: pre-wrap;">${escapeHtml(order.note)}</div>
        </div>
      ` : ''}

      <div style="margin-top: 20px; display: flex; justify-content: space-between; font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        <span>Status: <strong style="text-transform: capitalize; color: #0f172a;">${order.status}</strong></span>
        <span>Order ID: <code>${order.id.slice(0, 8)}</code></span>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 28px; text-align: center; font-size: 12px; color: #94a3b8;">
      Sent from your Android Order Note App • Viewable on mobile and computer
    </div>
  </div>
</body>
</html>`;
}

export function generatePlainTextOrder(order: Order, client: Client): string {
  const itemsText = order.items
    .map((item, idx) => `  ${idx + 1}. ${item.name} x ${item.quantity} @ ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.total)}`)
    .join('\n');

  return `ORDER NOTE: ${order.orderNumber}
=========================================
Client: ${client.name} ${client.company ? `(${client.company})` : ''}
Phone: ${client.phone || 'N/A'}
Email: ${client.email || 'N/A'}
Address: ${client.address || 'N/A'}
Date of Order: ${order.orderDate} ${order.orderTime || ''}
Status: ${order.status.toUpperCase()}

ITEMS:
${itemsText}

-----------------------------------------
TOTAL AMOUNT: ${formatCurrency(order.totalAmount)}
-----------------------------------------

${order.note ? `NOTES:\n${order.note}\n\n` : ''}
Generated from Android OrderNote App`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendOrderToGmailApi({
  order,
  client,
  targetEmail,
  accessToken,
}: {
  order: Order;
  client: Client;
  targetEmail: string;
  accessToken: string;
}): Promise<{ id: string; threadId: string }> {
  const subject = `Order Note: ${order.orderNumber} - ${client.name} (${formatCurrency(order.totalAmount)}) [${order.orderDate}]`;
  const htmlContent = generateOrderEmailHtml(order, client);

  const rawMessage = [
    `To: ${targetEmail}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    htmlContent,
  ].join('\r\n');

  const encodedMessage = base64urlEncode(rawMessage);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let parsedMessage = errorBody;
    try {
      const parsed = JSON.parse(errorBody);
      parsedMessage = parsed.error?.message || errorBody;
    } catch {
      // ignore
    }
    throw new Error(`Gmail API Error (${res.status}): ${parsedMessage}`);
  }

  return await res.json();
}

export function getGmailWebComposeUrl(order: Order, client: Client, targetEmail: string): string {
  const subject = `Order Note: ${order.orderNumber} - ${client.name} (${formatCurrency(order.totalAmount)}) [${order.orderDate}]`;
  const body = generatePlainTextOrder(order, client);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function getMailtoUrl(order: Order, client: Client, targetEmail: string): string {
  const subject = `Order Note: ${order.orderNumber} - ${client.name} (${formatCurrency(order.totalAmount)}) [${order.orderDate}]`;
  const body = generatePlainTextOrder(order, client);
  return `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
