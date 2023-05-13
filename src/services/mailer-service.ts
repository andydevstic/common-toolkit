import { EmailSender, SendMailOptions } from "../interfaces";

export interface MailServiceConfig {
  adminEmails?: string[];
}

export class MailService {
  protected adminEmails: string[];

  constructor(
    protected transporter: EmailSender,
    protected config: MailServiceConfig
  ) {
    this.adminEmails = config?.adminEmails || [];
  }

  public async sendToAdmin(mailOptions: SendMailOptions) {
    if (this.adminEmails.length === 0) {
      throw new Error("admin email list is empty");
    }

    mailOptions.to = this.adminEmails;

    return this.send(mailOptions);
  }

  public async send(
    mailOptions: SendMailOptions,
    ccOptions = { ccToAdmin: false, bccToAdmin: false }
  ) {
    const message = { from: process.env.SMTP_MAIL_FROM, ...mailOptions };
    const { ccToAdmin, bccToAdmin } = ccOptions;

    if (ccToAdmin && this.adminEmails.length > 0) message.cc = this.adminEmails;
    if (bccToAdmin && this.adminEmails.length > 0)
      message.bcc = this.adminEmails;

    return this.transporter.send(message).catch((e) => {
      console.error("Send mail error", e);
      return false;
    });
  }
}
