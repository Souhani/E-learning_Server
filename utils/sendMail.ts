require("dotenv").config();
import nodemailer, { Transporter } from "nodemailer";
import ejs from "ejs";
import path from "path";

export interface EmailOpionts {
  email: string;
  template: string;
  subject: string;
  data: { [key: string]: any };
}
async function sendMail(options: EmailOpionts): Promise<void> {
  const { email, template, subject, data } = options;

  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMPT_PORT || "587"),
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // path to the ejs template
  const templatePath: string = path.join(__dirname, "../mails", template);
  // html template for the email
  const html: string = await ejs.renderFile(templatePath, data);

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
}

export default sendMail;
