const nodemailer = require('nodemailer');
const { UKR_NET_EMAIL, UKR_NET_PASSWORD } = process.env;
const dotenv = require('dotenv');
dotenv.config();

const nodemailerConfig = {
  host: 'smtp.ukr.net',
  port: 465,
  secure: true,
  auth: {
    user: UKR_NET_EMAIL,
    pass: UKR_NET_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = (data) => {
  const email = { ...data, from: UKR_NET_EMAIL };
  return transport.sendMail(email);
};

module.exports = { sendEmail };

// const elasticemail = require('elasticemail');
// const { ELASTICMAIL_API_KEY, ELASTICMAIL_FROM } = process.env;

// const sendEmail = async (data) => {
//   const client = elasticemail.createClient({
//     apiKey: ELASTICMAIL_API_KEY,
//   });

//   const email = {
//     from: ELASTICMAIL_FROM,
//     to: data.to,
//     subject: data.subject,
//     body: data.html,
//   };

//   try {
//     const response = await client.send(email);
//     console.log('Email sent successfully', response);
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw error;
//   }
// };

// module.exports = { sendEmail };
