export const sendEmail = async (to, subject, htmlContent) => {
  console.log(`\n=========================================`);
  console.log(`[MOCK EMAIL DISPATCH]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`=========================================\n`);
  return true;
};
