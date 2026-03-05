import nodemailer from 'nodemailer';
import fs from 'fs';

const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    throw new Error('SMTP_USER and SMTP_PASS must be set in .env for email to work');
  }
  const isGmail = (process.env.SMTP_HOST || 'smtp.gmail.com').includes('gmail');
  return nodemailer.createTransport(
    isGmail
      ? { service: 'gmail', auth: { user, pass } }
      : {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: false,
          auth: { user, pass },
        }
  );
};

const getFromAddress = () => process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@example.com';
const getAppName = () => process.env.APP_NAME || 'JK Electrical & Hardwares';

/**
 * Send order confirmation email with order details and PDF invoice attached
 */
export const sendOrderConfirmationEmail = async (email, name, order, user, invoicePath = null) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error(`Invalid recipient email: ${email}`);
  }
  const transporter = createTransporter();
  const orderId = order._id.toString();
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const itemsRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right;">₹${Number(item.price).toFixed(2)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.quantity * item.price).toFixed(2)}</td>
    </tr>`
    )
    .join('');
  const totalAmount = order.totalAmount;
  const appName = getAppName();
  const fromAddress = getFromAddress();

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="margin:0; font-family: 'Segoe UI', Tahoma, sans-serif; background:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding: 24px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="padding: 24px 40px; border-bottom: 1px solid #eee;">
          <h1 style="margin:0; font-size: 22px; color: #333;">${appName}</h1>
          <p style="margin: 8px 0 0; font-size: 14px; color: #666;">Order Confirmation & Invoice</p>
        </td></tr>
        <tr><td style="padding: 24px 40px;">
          <p style="margin:0 0 16px; font-size: 16px;">Hi ${name || 'Customer'},</p>
          <p style="margin:0 0 24px; font-size: 15px; color: #555;">Thank you for your order. Your payment has been received successfully.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 6px;">
            <tr style="background:#f9fafb;"><td style="padding: 10px 12px; font-weight: 600;">Order ID</td><td style="padding: 10px 12px;">${orderId}</td></tr>
            <tr><td style="padding: 10px 12px; font-weight: 600;">Date</td><td style="padding: 10px 12px;">${orderDate}</td></tr>
            <tr style="background:#f9fafb;"><td style="padding: 10px 12px; font-weight: 600;">Payment Status</td><td style="padding: 10px 12px;">Paid</td></tr>
          </table>
          <p style="margin:0 0 8px; font-size: 14px; font-weight: 600;">Order details</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 16px;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="padding: 10px 12px; text-align: left; border: 1px solid #e5e7eb;">Item</th>
                <th style="padding: 10px 12px; text-align: center; border: 1px solid #e5e7eb;">Qty</th>
                <th style="padding: 10px 12px; text-align: right; border: 1px solid #e5e7eb;">Unit Price</th>
                <th style="padding: 10px 12px; text-align: right; border: 1px solid #e5e7eb;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>
          <table width="100%"><tr>
            <td style="padding: 8px 12px; text-align: right; font-weight: 600; font-size: 16px;">Total Amount</td>
            <td style="padding: 8px 12px; text-align: right; font-weight: 600; font-size: 16px;">₹${Number(totalAmount).toFixed(2)}</td>
          </tr></table>
          ${invoicePath ? '<p style="margin: 16px 0 0; font-size: 13px; color: #666;">A PDF invoice is attached to this email.</p>' : ''}
        </td></tr>
        <tr><td style="padding: 20px 40px; background:#f9fafb;">Thank you for shopping with us.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const mailOptions = {
    from: `"${appName}" <${fromAddress}>`,
    to: email,
    subject: `Order Confirmation #${orderId} – ${appName}`,
    html,
  };
  if (invoicePath && fs.existsSync(invoicePath)) {
    mailOptions.attachments = [
      { filename: `invoice_${orderId}.pdf`, content: fs.readFileSync(invoicePath) },
    ];
  }
  const result = await transporter.sendMail(mailOptions);
  console.log('[Email] Order confirmation sent to', email, 'MessageId:', result.messageId);
  return result;
};

export { createTransporter };
