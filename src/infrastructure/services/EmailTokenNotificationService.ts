import nodemailer, { Transporter } from 'nodemailer';

import { TokenNotificationService } from '../../domain/services/TokenNotificationService';

export type EmailTokenNotificationConfig = {
  host: string;
  port?: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
};

export class EmailTokenNotificationService implements TokenNotificationService {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: EmailTokenNotificationConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port ?? 587,
      secure: config.secure ?? false,
      auth: config.auth,
    });
    this.from = config.from;
  }

  async notifyPaymentToken(email: string, token: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'Token de confirmación de pago',
        text: `Tu token de confirmación es: ${token}`,
      });
    } catch (error) {
      console.error(`Error sending payment token email: ${(error as Error).message}`);
      throw new Error(`Error sending payment token email: ${(error as Error).message}`);
    }
  }
}
