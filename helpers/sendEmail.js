const nodemailer = require('nodemailer')

const {META_PASSWORD} = process.env;

const nodemailerConfig = {
  host: 'smtp.meta.ua',
  port: 465,
  secure: true,
  auth: {
    user: 'viktoriazakatsyura@meta.ua',
    pass: META_PASSWORD
  }
}

const transporter = nodemailer.createTransport(nodemailerConfig)

const sendEmail = async (data) => {
  const email = {
    ...data,
    from: 'viktoriazakatsyura@meta.ua',
  }
  await transporter.sendMail(email)
}
module.exports = sendEmail;