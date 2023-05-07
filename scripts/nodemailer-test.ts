const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// dotenv
dotenv.config();

console.log("zoho: ", process.env['zoho_email'])

async function nodeMailerTest() {
  // Set up your Zoho email account credentials
  const zohoAccount = {
    user: process.env['zoho_email'],
    pass: process.env['zoho_pass'],
  };

  // Create a Nodemailer transporter using the Zoho SMTP server
  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: zohoAccount.user,
      pass: zohoAccount.pass,
    },
  });

  // Read the contents of the HTML file
  const htmlFilePath = path.join(__dirname, 'index.html');
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

  console.log(htmlContent)

  // Set up the email options
  const mailOptions = {
    from: zohoAccount.user,
    to: process.env['to_email'],
    subject: 'Hello from Nodemailer 3',
    // text: 'This email was sent using Nodemailer and Zoho SMTP.',
    html: htmlContent,
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error occurred while sending email:', error);
  }
}

nodeMailerTest().catch(console.error);
