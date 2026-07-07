import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Ensure env vars are loaded BEFORE creating transporter

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection config
const verifySMTP = async () => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('⚠️  SMTP credentials missing in .env. Emailing will be mocked.');
      return;
    }
    console.log(`Checking SMTP Connection for ${process.env.SMTP_USER}...`);
    await transporter.verify();
    console.log('✅ SMTP Connection verified successfully! Ready to send emails.');
  } catch (error) {
    console.error('❌ SMTP Verification failed:');
    console.error(error);
  }
};

verifySMTP();

export const sendEmail = async (to, subject, htmlContent, textContent = '') => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`\n=========================================`);
      console.log(`[MOCK EMAIL DISPATCH]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`=========================================\n`);
      return true;
    }

    console.log(`\n--- NODEMAILER SENDING EMAIL ---`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    
    const info = await transporter.sendMail({
      from: `"GreenLeaf Data Center" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]+>/g, ''), // Fallback to stripped HTML
    });
    
    console.log('✅ Message sent successfully!');
    console.log('Message ID: %s', info.messageId);
    console.log('Full Info object:', JSON.stringify(info, null, 2));
    console.log(`--------------------------------\n`);
    return true;
  } catch (error) {
    console.error('\n❌ ERROR SENDING EMAIL ❌');
    console.error('Full Error Object:');
    console.error(error);
    console.error('------------------------\n');
    return false;
  }
};

export const notifyAdminNewEnquiry = async (enquiry) => {
  const adminEmail = process.env.SMTP_USER 
    ? `dhamugreenleaf@gmail.com, ${process.env.SMTP_USER}`
    : 'dhamugreenleaf@gmail.com';
    
  const subject = `GreenLeaf Data Center | New Customer Enquiry`;
  
  const timestamp = new Date().toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  
  const adminUrl = process.env.NODE_ENV === 'production' 
    ? 'https://greenleaf-datacenter.com/admin/enquiries'
    : 'http://localhost:5173/admin/enquiries';
    
  const ipAddress = enquiry.ip_address || 'Not captured';
  const mobile = enquiry.mobile || 'Not provided';
  const company = enquiry.company || 'Not provided';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding: 40px 0; }
        .main { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .header { background-color: #0B1220; padding: 32px 40px; text-align: left; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0; color: #94a3b8; font-size: 15px; line-height: 1.5; }
        .content { padding: 40px; }
        .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
        .info-grid { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
        .info-grid td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        .info-label { width: 35%; color: #64748b; font-size: 14px; font-weight: 500; }
        .info-value { width: 65%; color: #0f172a; font-size: 15px; font-weight: 600; }
        .message-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 32px; }
        .message-content { margin: 0; font-size: 15px; line-height: 1.6; color: #334155; white-space: pre-wrap; }
        .action-card { background-color: #f0fdf4; border-left: 4px solid #22C55E; padding: 24px; border-radius: 0 8px 8px 0; margin-bottom: 16px; }
        .action-text { margin: 0 0 16px; color: #166534; font-size: 15px; font-weight: 500; }
        .btn { display: inline-block; background-color: #22C55E; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; transition: background-color 0.2s; }
        .btn:hover { background-color: #16a34a; }
        .footer { padding: 32px 40px; background-color: #0f172a; text-align: center; }
        .footer-brand { color: #ffffff; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
        .footer-tagline { color: #22C55E; font-size: 13px; font-weight: 500; margin-bottom: 24px; letter-spacing: 0.5px; }
        .footer-text { color: #64748b; font-size: 12px; line-height: 1.5; margin: 0; }
        .divider { height: 1px; background-color: #1e293b; margin: 24px 0; }
        @media only screen and (max-width: 620px) {
          .wrapper { padding: 20px 10px; }
          .header, .content, .footer { padding: 24px 20px; }
          .info-grid td { display: block; width: 100%; border-bottom: none; padding: 4px 0; }
          .info-label { margin-top: 12px; padding-bottom: 2px; }
          .info-value { padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="main">
          <!-- Header -->
          <div class="header">
            <h1>New Customer Enquiry</h1>
            <p>A new enquiry has been submitted through the GreenLeaf Data Center website.</p>
          </div>

          <!-- Content -->
          <div class="content">
            <div class="section-title">Customer Information</div>
            <table class="info-grid">
              <tr>
                <td class="info-label">Customer Name</td>
                <td class="info-value">${enquiry.name}</td>
              </tr>
              <tr>
                <td class="info-label">Email Address</td>
                <td class="info-value"><a href="mailto:${enquiry.email}" style="color: #2563eb; text-decoration: none;">${enquiry.email}</a></td>
              </tr>
              <tr>
                <td class="info-label">Mobile Number</td>
                <td class="info-value">${mobile}</td>
              </tr>
              <tr>
                <td class="info-label">Company Name</td>
                <td class="info-value">${company}</td>
              </tr>
              <tr>
                <td class="info-label">Enquiry Type</td>
                <td class="info-value">
                  <span style="background-color: #e2e8f0; padding: 4px 10px; border-radius: 4px; font-size: 13px; font-weight: 600; text-transform: capitalize; color: #475569;">
                    ${enquiry.type}
                  </span>
                </td>
              </tr>
              <tr>
                <td class="info-label">Date & Time</td>
                <td class="info-value">${timestamp}</td>
              </tr>
              <tr>
                <td class="info-label">IP Address</td>
                <td class="info-value" style="font-family: monospace; font-size: 13px; color: #64748b;">${ipAddress}</td>
              </tr>
            </table>

            <div class="section-title">Enquiry Message</div>
            <div class="message-box">
              <p class="message-content">${enquiry.message}</p>
            </div>

            <div class="action-card">
              <p class="action-text">Please review this enquiry from the GreenLeaf Admin Panel.</p>
              <a href="${adminUrl}" class="btn">Open Admin Panel</a>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-brand">GreenLeaf Data Center</div>
            <div class="footer-tagline">Enterprise Cloud &bull; AI Servers &bull; Colocation</div>
            <div class="divider"></div>
            <p class="footer-text">This is an automated notification email generated by the GreenLeaf Data Center platform.</p>
            <p class="footer-text" style="margin-top: 8px;">Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textContent = `
GreenLeaf Data Center | New Customer Enquiry
======================================================
A new enquiry has been submitted through the website.

--- Customer Information ---
Name: ${enquiry.name}
Email: ${enquiry.email}
Mobile: ${mobile}
Company: ${company}
Type: ${enquiry.type}
Date: ${timestamp}
IP Address: ${ipAddress}

--- Enquiry Message ---
${enquiry.message}

------------------------------------------------------
Please review this enquiry from the GreenLeaf Admin Panel:
${adminUrl}

======================================================
GreenLeaf Data Center
Enterprise Cloud • AI Servers • Colocation
This is an automated notification email. Please do not reply.
  `;
  
  return await sendEmail(adminEmail, subject, htmlContent, textContent);
};
