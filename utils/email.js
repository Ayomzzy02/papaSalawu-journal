const nodemailer = require("nodemailer");
const { generateLoginDetailsEmailHTML } = require("./emailTemplate");

const emailSender = async function (options) {
  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  let mailOptions = {
    from: `"UILEDU Journal" <${process.env.EMAIL_USER}>`, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    html: options.body, // html body
  };

  const info = await transporter.sendMail(mailOptions);

  console.log("Message sent %s", info.messageId);
};

const sendLoginDetailsEmail = async function (user) {
  try {
    const body = generateLoginDetailsEmailHTML(
      user.name,
      user.email,
      user.password
    );
    const subject = `Login Information for Your Chief Editor Account`;
    await emailSender({
      email: user.email,
      subject,
      body,
    });
  } catch (error) {
    console.log(error)
    throw new Error("There was an error sending the email. Try again later!");
  }
};

module.exports = { sendLoginDetailsEmail };