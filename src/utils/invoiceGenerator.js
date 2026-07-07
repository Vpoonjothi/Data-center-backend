import pdf from 'html-pdf-node';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoicePDF = async (payment, user, service, quote) => {
  try {
    const invoiceDir = path.join(__dirname, '../../public/uploads/invoices');
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    const fileName = `INV-${payment.invoice_reference}.pdf`;
    const filePath = path.join(invoiceDir, fileName);

    // Use exact quote values for invoice, ensuring 1:1 match
    const quantity = parseInt(quote?.quantity || 1, 10);
    const unitPrice = parseFloat(quote?.unit_price || quote?.monthly_price || 0);
    const subtotal = parseFloat(quote?.subtotal || quote?.subtotal_price || quote?.monthly_price || 0);
    const discountAmount = parseFloat(quote?.discount_amount || 0);
    const taxableAmount = parseFloat(quote?.taxable_amount || subtotal);
    const gstAmount = parseFloat(quote?.gst_amount || 0);
    const grandTotal = parseFloat(quote?.grand_total || payment.amount || 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; line-height: 24px; }
          .invoice-box table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
          .invoice-box table td { padding: 5px; vertical-align: top; }
          .invoice-box table tr.top table td { padding-bottom: 20px; }
          .invoice-box table tr.top table td.title { font-size: 45px; line-height: 45px; color: #333; }
          .invoice-box table tr.information table td { padding-bottom: 40px; }
          .invoice-box table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
          .invoice-box table tr.details td { padding-bottom: 20px; }
          .invoice-box table tr.item td { border-bottom: 1px solid #eee; }
          .invoice-box table tr.item.last td { border-bottom: none; }
          .invoice-box table tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; }
          .text-right { text-align: right; }
          .brand { color: #22C55E; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <table>
            <tr class="top">
              <td colspan="2">
                <table>
                  <tr>
                    <td class="title"><span class="brand">GreenLeaf</span><br/><span style="font-size:20px; color:#555;">Data Center</span></td>
                    <td class="text-right">
                      Invoice #: ${payment.invoice_reference}<br>
                      Created: ${new Date(payment.payment_date).toLocaleDateString()}<br>
                      Payment Method: ${payment.payment_method}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="information">
              <td colspan="2">
                <table>
                  <tr>
                    <td>
                      GreenLeaf Data Center.<br>
                      Tech Park, Cyber City<br>
                      hello@greenleaf.com
                    </td>
                    <td class="text-right">
                      <strong>Billed To:</strong><br>
                      ${user.name}<br>
                      ${user.email}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="heading">
              <td>Billing Details</td>
              <td class="text-right">Amount</td>
            </tr>
            <tr class="item">
              <td>${service?.service_name || quote?.service_type} - Unit Price</td>
              <td class="text-right">₹${unitPrice.toFixed(2)}</td>
            </tr>
            <tr class="item">
              <td>Quantity</td>
              <td class="text-right">${quantity}</td>
            </tr>
            <tr class="item">
              <td>Subtotal</td>
              <td class="text-right">₹${subtotal.toFixed(2)}</td>
            </tr>
            <tr class="item">
              <td>Discount</td>
              <td class="text-right">₹${discountAmount.toFixed(2)}</td>
            </tr>
            <tr class="item">
              <td>Taxable Amount</td>
              <td class="text-right">₹${taxableAmount.toFixed(2)}</td>
            </tr>
            <tr class="item last">
              <td>Tax (GST 18%)</td>
              <td class="text-right">₹${gstAmount.toFixed(2)}</td>
            </tr>
            <tr class="total">
              <td></td>
              <td class="text-right">Grand Total (Including GST): ₹${grandTotal.toFixed(2)}</td>
            </tr>
          </table>
          <div style="margin-top: 40px; text-align: center; font-size: 14px; color: #777;">
            Thank you for choosing GreenLeaf Data Center! This is a computer-generated invoice.
          </div>
        </div>
      </body>
      </html>
    `;

    let options = { format: 'A4' };
    let file = { content: htmlContent };

    await pdf.generatePdf(file, options).then(pdfBuffer => {
      fs.writeFileSync(filePath, pdfBuffer);
    });

    return `/uploads/invoices/${fileName}`;
  } catch (error) {
    console.error('Error generating PDF invoice:', error);
    return null;
  }
};
