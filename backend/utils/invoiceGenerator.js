import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Shop details
const SHOP_DETAILS = {
  name: 'JK ELECTRICAL & HARDWARES',
  address: 'Building No./Flat No.: 19, Sri Kodisamy Nagar, Customs Road, Nattapattu, Cuddalore, Tamil Nadu – 607109',
  phone: '+91 98941 23711',
  email: 'jkelectricalandhardware@gmail.com',
  owner: 'Mr. J. Dineshraj',
};

export const generateInvoice = async (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      // Create invoices directory if it doesn't exist
      const invoicesDir = path.join(__dirname, '../invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const invoiceFileName = `invoice_${order._id}_${Date.now()}.pdf`;
      const invoicePath = path.join(invoicesDir, invoiceFileName);

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(invoicePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text(SHOP_DETAILS.name, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(SHOP_DETAILS.address, { align: 'center' });
      doc.text(`Phone: ${SHOP_DETAILS.phone} | Email: ${SHOP_DETAILS.email}`, { align: 'center' });
      doc.moveDown(1);

      // Invoice title
      doc.fontSize(16).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
      doc.moveDown(1);

      // Invoice details
      doc.fontSize(10).font('Helvetica');
      doc.text(`Invoice #: ${order._id}`, 50, 150);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 50, 165);
      doc.text(`Order ID: ${order._id}`, 50, 180);

      // Customer details
      doc.fontSize(12).font('Helvetica-Bold').text('Bill To:', 350, 150);
      doc.fontSize(10).font('Helvetica');
      doc.text(user.name, 350, 170);
      if (user.email) doc.text(user.email, 350, 185);
      if (order.shippingAddress?.phone) doc.text(`Phone: ${order.shippingAddress.phone}`, 350, 200);
      if (order.shippingAddress?.address) {
        doc.text('Address:', 350, 215);
        doc.text(order.shippingAddress.address, 350, 230, { width: 200 });
      }

      // Line
      doc.moveTo(50, 280).lineTo(550, 280).stroke();
      doc.moveDown(1);

      // Table header
      let yPos = 300;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Item', 50, yPos);
      doc.text('Quantity', 250, yPos);
      doc.text('Price', 350, yPos);
      doc.text('Total', 450, yPos);

      // Line
      yPos += 20;
      doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
      yPos += 10;

      // Items
      doc.fontSize(10).font('Helvetica');
      order.items.forEach((item) => {
        doc.text(item.name, 50, yPos, { width: 180 });
        doc.text(item.quantity.toString(), 250, yPos);
        doc.text(`₹${item.price.toFixed(2)}`, 350, yPos);
        doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, 450, yPos);
        yPos += 20;
      });

      // Line
      doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
      yPos += 20;

      // Total
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Total Amount:', 350, yPos);
      doc.text(`₹${order.totalAmount.toFixed(2)}`, 450, yPos);

      yPos += 40;

      // Payment status
      doc.fontSize(10).font('Helvetica');
      doc.text(`Payment Status: ${order.paymentStatus}`, 50, yPos);
      doc.text(`Order Status: ${order.status}`, 50, yPos + 15);

      // Footer
      doc.fontSize(8).font('Helvetica');
      doc.text('Thank you for your business!', 50, 750, { align: 'center' });
      doc.text('This is a computer-generated invoice.', 50, 765, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(invoicePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};
