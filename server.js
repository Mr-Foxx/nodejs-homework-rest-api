const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const { sendEmail } = require('./helpers/elasticemail.js');
// const { sendTestEmail } = require('./helpers/nodemailer.js');

dotenv.config();
const { DB_HOST, PORT } = process.env;

mongoose
  .connect(DB_HOST)
  .then(() => {
    // const recipient = 'nibac87354@gienig.com';
    // const subject = 'Hello from your app';
    // const content = '<strong>This is a test email.</strong>';

    // sendEmail(recipient, subject, content);

    // sendTestEmail();

    app.listen(PORT, () => {
      console.log(`Server running. Use our API on port: ${PORT}!!!`);
      console.log('Database connection successful!!!');
    });
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
